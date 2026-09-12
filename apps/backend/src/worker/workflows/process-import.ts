import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { JsonObject } from "@hatchet-dev/typescript-sdk";
import { eq } from "drizzle-orm";

import { config } from "../../config";
import { db as drizzleDb } from "../../db/postgres";
import { importJobs } from "../../db/postgres/schema";
import {
  MAX_IMPORT_BYTES,
  parseSpotifyImport,
  splitIntoBatches,
} from "../../library/import-parser";
import { logger } from "../../library/logger";
import { hatchet } from "../client";
import { BATCH_SIZE, importBatch } from "./import-batch";

interface Input extends JsonObject {
  userId: string;
  jobId: string;
  s3Key: string;
}

export const processImport = hatchet.workflow<Input>({
  name: "process-import",
});

processImport.task({
  name: "run",
  executionTimeout: "30m",
  fn: async (input, ctx) => {
    const { userId, jobId, s3Key } = input;

    const updateJob = async (data: Partial<typeof importJobs.$inferInsert>) => {
      await drizzleDb.update(importJobs).set(data).where(eq(importJobs.id, jobId));
    };

    await updateJob({ status: "processing" });

    try {
      const s3 = new S3Client({
        region: config.s3.region,
        credentials: {
          accessKeyId: config.s3.accessKeyId,
          secretAccessKey: config.s3.secretAccessKey,
        },
        ...(config.s3.endpoint && { endpoint: config.s3.endpoint, forcePathStyle: true }),
      });

      const obj = await s3.send(new GetObjectCommand({ Bucket: config.s3.bucket, Key: s3Key }));
      if (obj.ContentLength && obj.ContentLength > MAX_IMPORT_BYTES) {
        throw new Error("Import file is too large");
      }
      if (!obj.Body) {
        throw new Error("Import file is empty");
      }
      const bodyBytes = await obj.Body.transformToByteArray();
      if (bodyBytes.byteLength > MAX_IMPORT_BYTES) {
        throw new Error("Import file is too large");
      }
      const valid = parseSpotifyImport(bodyBytes);

      logger.worker.info({ userId, total: valid.length }, "parsed import, spawning batches");

      await updateJob({ totalTracks: valid.length, importedTracks: 0 });

      const batches = splitIntoBatches(valid, BATCH_SIZE);
      const totalBatches = batches.length;
      const CONCURRENCY = 3;
      const batchKeys: string[] = [];

      for (const [index, batch] of batches.entries()) {
        const batchKey = `${s3Key.replace(/\.bin$/, "")}/batch-${String(index).padStart(5, "0")}.json`;
        await s3.send(
          new PutObjectCommand({
            Bucket: config.s3.bucket,
            Key: batchKey,
            Body: JSON.stringify(batch),
            ContentType: "application/json",
          }),
        );
        batchKeys.push(batchKey);
      }

      for (let i = 0; i < totalBatches; i += CONCURRENCY) {
        const group = batchKeys.slice(i, i + CONCURRENCY).map((batchKey) => ({
          workflow: importBatch,
          input: {
            userId,
            jobId,
            batchKey,
          },
        }));
        await ctx.bulkRunChildren(group);
        logger.worker.info({ userId, jobId, batchGroup: i }, "batch group complete");
      }

      logger.worker.info({ userId, jobId, totalBatches }, "all batches complete");
      await updateJob({ status: "completed", completedAt: new Date() });
    } catch (err) {
      logger.worker.error({ err, userId }, "import failed");
      await updateJob({
        status: "failed",
        errorMessage: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
});
