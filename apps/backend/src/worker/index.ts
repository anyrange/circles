import { logger } from "../library/logger";
import { hatchet } from "./client";
import { syncHistory } from "./workflows/sync-history";

async function main() {
  const worker = await hatchet.worker("circles-worker", {
    workflows: [syncHistory],
  });

  logger.worker.info("starting worker");
  await worker.start();
}

main().catch((err) => logger.worker.error({ err }, "failed to start worker"));
