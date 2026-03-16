import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { config } from "../../config";
import { db as drizzleDb } from "../../db/postgres";
import { importJobs } from "../../db/postgres/schema";
import { processImport } from "../../worker/workflows/process-import";
import type { AuthVariables } from "../middleware/auth";
import { authMiddleware } from "../middleware/auth";

export const importController = new Hono<{ Variables: AuthVariables }>()
  .use(authMiddleware)
  .post("/me/import/upload", async (ctx) => {
    const userId = ctx.get("userId");

    const s3 = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
      ...(config.s3.endpoint && { endpoint: config.s3.endpoint, forcePathStyle: true }),
    });

    const s3Key = `imports/${userId}/${Date.now()}.bin`;

    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: config.s3.bucket,
        Key: s3Key,
      }),
      { expiresIn: 3600 },
    );

    return ctx.json({ uploadUrl: url, s3Key });
  })
  .post("/me/import/process", zValidator("json", z.object({ s3Key: z.string() })), async (ctx) => {
    const userId = ctx.get("userId");
    const { s3Key } = ctx.req.valid("json");

    const [job] = await drizzleDb
      .insert(importJobs)
      .values({ userId, s3Key, status: "pending" })
      .returning();

    await processImport.runNoWait({ userId, jobId: job!.id, s3Key });

    return ctx.json({ jobId: job!.id }, 201);
  })
  .get("/me/import/status", async (ctx) => {
    const userId = ctx.get("userId");

    const [job] = await drizzleDb
      .select()
      .from(importJobs)
      .where(eq(importJobs.userId, userId))
      .orderBy(desc(importJobs.createdAt))
      .limit(1);

    if (!job) return ctx.json(null);

    return ctx.json({
      id: job.id,
      status: job.status,
      totalTracks: job.totalTracks,
      importedTracks: job.importedTracks,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    });
  });
