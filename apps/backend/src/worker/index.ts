import { logger } from "../library/logger";
import { hatchet } from "./client";
import { generateWeeklyPlaylists } from "./workflows/generate-weekly-playlists";
import { hydrateArtist } from "./workflows/hydrate-artist";
import { importBatch } from "./workflows/import-batch";
import { processImport } from "./workflows/process-import";
import { refreshTokens } from "./workflows/refresh-tokens";
import { syncAllUsers } from "./workflows/sync-all-users";
import { syncHistory } from "./workflows/sync-history";

async function main() {
  const worker = await hatchet.worker("circles-worker", {
    workflows: [
      syncHistory,
      refreshTokens,
      syncAllUsers,
      generateWeeklyPlaylists,
      processImport,
      importBatch,
      hydrateArtist,
    ],
  });

  logger.worker.info("starting worker");
  await worker.start();
}

main().catch((err) => logger.worker.error({ err }, "failed to start worker"));
