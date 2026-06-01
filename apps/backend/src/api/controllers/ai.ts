import Anthropic from "@anthropic-ai/sdk";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";

import { config } from "../../config";
import { db as drizzleDb } from "../../db/postgres";
import { aiCache } from "../../db/postgres/schema";
import { buildListeningContext } from "../../library/ai-context";
import { logger } from "../../library/logger";
import type { AuthVariables } from "../middleware/auth";
import { authMiddleware } from "../middleware/auth";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TasteDNA {
  archetype: string;
  tagline: string;
  traits: string[];
  top_moods: string[];
  persona: string;
  discovery_score: number;
  underground_score: number;
}

export interface Roast {
  roast: string;
  verdict: string;
  guilty_pleasure: string;
  award: string;
  rating: number;
  defense: string;
}

export interface SceneReport {
  scene_name: string;
  description: string;
  vibe_words: string[];
  anthem: string;
  kindred_artists: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isoWeekBucket(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function createClient() {
  return new Anthropic({ apiKey: config.anthropic.apiKey });
}

async function getCachedOrGenerate<T>(
  userId: string,
  type: string,
  generate: () => Promise<T>,
): Promise<{ data: T; cached: boolean }> {
  const bucket = isoWeekBucket();

  const [cached] = await drizzleDb
    .select({ response: aiCache.response })
    .from(aiCache)
    .where(and(eq(aiCache.userId, userId), eq(aiCache.type, type), eq(aiCache.bucket, bucket)))
    .limit(1);

  if (cached) {
    return { data: cached.response as T, cached: true };
  }

  const data = await generate();

  await drizzleDb
    .insert(aiCache)
    .values({ userId, type, bucket, response: data })
    .onConflictDoNothing();

  return { data, cached: false };
}

async function callWithTool<T>(
  prompt: string,
  toolName: string,
  toolDescription: string,
  toolSchema: Anthropic.Tool["input_schema"],
): Promise<T> {
  const client = createClient();

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1500,
    tools: [
      {
        name: toolName,
        description: toolDescription,
        input_schema: toolSchema,
      },
    ],
    tool_choice: { type: "tool", name: toolName },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");

  if (!toolUse) throw new Error("No tool use in response");

  return toolUse.input as T;
}

// ─── Controller ──────────────────────────────────────────────────────────────

export const aiController = new Hono<{ Variables: AuthVariables }>()
  .use(authMiddleware)
  .post("/me/ai/taste-dna", async (ctx) => {
    const userId = ctx.get("userId");

    try {
      const result = await getCachedOrGenerate<TasteDNA>(userId, "taste-dna", async () => {
        const context = await buildListeningContext(userId);

        return callWithTool<TasteDNA>(
          `You are an expert music analyst. Based on this listener's data, build their Taste DNA — a precise, insightful profile that captures who they are through music.\n\nListening data:\n${context}`,
          "build_taste_dna",
          "Build the listener's music Taste DNA profile",
          {
            type: "object" as const,
            properties: {
              archetype: {
                type: "string",
                description: "2–4 word archetype title, e.g. 'The Intensity Seeker'",
              },
              tagline: {
                type: "string",
                description: "One punchy sentence that captures their listening identity",
              },
              traits: {
                type: "array",
                items: { type: "string" },
                description:
                  "5–7 short trait labels like 'High Energy', 'Nocturnal', 'Genre Agnostic'",
              },
              top_moods: {
                type: "array",
                items: { type: "string" },
                description: "4–6 mood words that define their listening vibe",
              },
              persona: {
                type: "string",
                description: "2–3 sentence poetic description of this listener",
              },
              discovery_score: {
                type: "number",
                description:
                  "0–100 score for how much they explore new music vs stick to known artists",
              },
              underground_score: {
                type: "number",
                description:
                  "0–100 score for how underground/mainstream their taste is (100 = deep underground)",
              },
            },
            required: [
              "archetype",
              "tagline",
              "traits",
              "top_moods",
              "persona",
              "discovery_score",
              "underground_score",
            ],
            additionalProperties: false,
          },
        );
      });

      return ctx.json(result);
    } catch (err) {
      logger.api.error({ err, userId }, "taste-dna failed");
      return ctx.json({ error: "Failed to generate" }, 500);
    }
  })
  .post("/me/ai/roast", async (ctx) => {
    const userId = ctx.get("userId");

    try {
      const result = await getCachedOrGenerate<Roast>(userId, "roast", async () => {
        const context = await buildListeningContext(userId);

        return callWithTool<Roast>(
          `You are a sardonic music critic with devastating wit and sharp comedic timing. Roast this person's listening habits mercilessly but entertainingly. Find the most hilarious contradictions, guilty pleasures, and absurdities in their taste.\n\nListening data:\n${context}`,
          "deliver_roast",
          "Deliver the listener's music roast",
          {
            type: "object" as const,
            properties: {
              roast: {
                type: "string",
                description: "2–3 paragraph roast, witty and biting",
              },
              verdict: {
                type: "string",
                description:
                  "3–5 word verdict label, e.g. 'Certified Chaotic', 'Suspiciously Mainstream'",
              },
              guilty_pleasure: {
                type: "string",
                description: "One-liner calling out their most embarrassing listening pattern",
              },
              award: {
                type: "string",
                description: "Fake award title, e.g. 'Most Likely to Clear a Room'",
              },
              rating: {
                type: "number",
                description: "1–5 taste rating (be harsh but fair)",
              },
              defense: {
                type: "string",
                description: "One generous thing you can say in their defense",
              },
            },
            required: ["roast", "verdict", "guilty_pleasure", "award", "rating", "defense"],
            additionalProperties: false,
          },
        );
      });

      return ctx.json(result);
    } catch (err) {
      logger.api.error({ err, userId }, "roast failed");
      return ctx.json({ error: "Failed to generate" }, 500);
    }
  })
  .post("/me/ai/scene-report", async (ctx) => {
    const userId = ctx.get("userId");

    try {
      const result = await getCachedOrGenerate<SceneReport>(userId, "scene-report", async () => {
        const context = await buildListeningContext(userId);

        return callWithTool<SceneReport>(
          `You are a cultural music analyst who understands subcultures, scenes, and movements. Based on this listener's taste, identify which music scene or cultural world they belong to — or have created for themselves.\n\nListening data:\n${context}`,
          "build_scene_report",
          "Build the listener's music scene report",
          {
            type: "object" as const,
            properties: {
              scene_name: {
                type: "string",
                description: "Name of the scene or world, e.g. 'Industrial Techno Underground'",
              },
              description: {
                type: "string",
                description: "2–3 sentences describing this scene and what it means to be in it",
              },
              vibe_words: {
                type: "array",
                items: { type: "string" },
                description: "5–8 words that capture the scene's aesthetic and energy",
              },
              anthem: {
                type: "string",
                description:
                  "One sentence about the unofficial anthem or defining track of this listener",
              },
              kindred_artists: {
                type: "array",
                items: { type: "string" },
                description:
                  "3–5 artist names that epitomize this scene (can include artists not in their library)",
              },
            },
            required: ["scene_name", "description", "vibe_words", "anthem", "kindred_artists"],
            additionalProperties: false,
          },
        );
      });

      return ctx.json(result);
    } catch (err) {
      logger.api.error({ err, userId }, "scene-report failed");
      return ctx.json({ error: "Failed to generate" }, 500);
    }
  });
