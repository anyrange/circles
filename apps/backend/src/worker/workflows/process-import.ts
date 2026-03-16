import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { JsonObject } from "@hatchet-dev/typescript-sdk";
import { eq } from "drizzle-orm";
import { unzipSync } from "fflate";

import { config } from "../../config";
import { db as drizzleDb } from "../../db/postgres";
import { importJobs } from "../../db/postgres/schema";
import { logger } from "../../library/logger";
import { hatchet } from "../client";
import type { SpotifyExportEntry } from "./import-batch";
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
      const bodyBytes = await streamToBuffer(obj.Body as NodeJS.ReadableStream);

      let entries: SpotifyExportEntry[] = [];

      if (isZip(bodyBytes)) {
        const decompressed = unzipSync(bodyBytes);
        for (const [filename, data] of Object.entries(decompressed)) {
          if (filename.endsWith(".json")) {
            try {
              const parsed = JSON.parse(new TextDecoder().decode(data));
              if (Array.isArray(parsed)) entries.push(...parsed);
            } catch {
              logger.worker.warn({ filename }, "failed to parse JSON file in zip");
            }
          }
        }
      } else {
        entries = JSON.parse(new TextDecoder().decode(bodyBytes));
      }

      const valid = entries.filter(
        (e) => e.spotify_track_uri && e.ms_played >= 30_000 && e.master_metadata_track_name,
      );

      logger.worker.info({ userId, total: valid.length }, "parsed import, spawning batches");

      const validKey = s3Key.replace(/\.bin$/, "-valid.json");
      await s3.send(
        new PutObjectCommand({
          Bucket: config.s3.bucket,
          Key: validKey,
          Body: JSON.stringify(valid),
          ContentType: "application/json",
        }),
      );

      await updateJob({ totalTracks: valid.length, importedTracks: 0 });

      const totalBatches = Math.ceil(valid.length / BATCH_SIZE);
      const CONCURRENCY = 3;

      for (let i = 0; i < totalBatches; i += CONCURRENCY) {
        const group = Array.from({ length: Math.min(CONCURRENCY, totalBatches - i) }, (_, j) => ({
          workflow: importBatch,
          input: {
            userId,
            jobId,
            validKey,
            offset: (i + j) * BATCH_SIZE,
            limit: BATCH_SIZE,
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

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Uint8Array> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string));
  }
  return Buffer.concat(chunks);
}

function isZip(bytes: Uint8Array): boolean {
  return bytes[0] === 0x50 && bytes[1] === 0x4b;
}
