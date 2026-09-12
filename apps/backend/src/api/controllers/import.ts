import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
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

    const [job] = await drizzleDb
      .insert(importJobs)
      .values({ userId, s3Key: "", status: "pending_upload" })
      .returning();

    const s3Key = `imports/${userId}/${job!.id}.bin`;

    await drizzleDb.update(importJobs).set({ s3Key }).where(eq(importJobs.id, job!.id));

    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: config.s3.bucket,
        Key: s3Key,
      }),
      { expiresIn: 3600 },
    );

    return ctx.json({ uploadUrl: url, jobId: job!.id });
  })
  .post("/me/import/process", zValidator("json", z.object({ jobId: z.string() })), async (ctx) => {
    const userId = ctx.get("userId");
    const { jobId } = ctx.req.valid("json");

    const [job] = await drizzleDb
      .select()
      .from(importJobs)
      .where(and(eq(importJobs.id, jobId), eq(importJobs.userId, userId)))
      .limit(1);

    if (!job) {
      throw new HTTPException(404, { message: "Import job not found" });
    }

    if (job.status !== "pending_upload") {
      throw new HTTPException(409, { message: "Import job already processing" });
    }

    const [claimedJob] = await drizzleDb
      .update(importJobs)
      .set({ status: "pending" })
      .where(and(eq(importJobs.id, job.id), eq(importJobs.status, "pending_upload")))
      .returning();

    if (!claimedJob) {
      throw new HTTPException(409, { message: "Import job already processing" });
    }

    await processImport.runNoWait({ userId, jobId: job.id, s3Key: job.s3Key });

    return ctx.json({ jobId: job.id }, 201);
  })
  .get("/me/import/status", async (ctx) => {
    const userId = ctx.get("userId");

    const [job] = await drizzleDb
      .select()
      .from(importJobs)
      .where(eq(importJobs.userId, userId))
      .orderBy(desc(importJobs.createdAt))
      .limit(1);

    if (!job) {
      return ctx.json(null);
    }

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
