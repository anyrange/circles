import { unzipSync } from "fflate";

import { isValidEntry, type SpotifyExportEntry } from "./spotify-export";
import { isZip } from "./zip";

export const MAX_IMPORT_BYTES = 50 * 1024 * 1024;
export const MAX_UNZIPPED_BYTES = 150 * 1024 * 1024;
export const MAX_IMPORT_ENTRIES = 250_000;

export function parseSpotifyImport(bodyBytes: Uint8Array): SpotifyExportEntry[] {
  if (bodyBytes.byteLength > MAX_IMPORT_BYTES) {
    throw new Error("Import file is too large");
  }

  const entries = isZip(bodyBytes) ? parseZipImport(bodyBytes) : parseJsonEntries(bodyBytes);
  const valid = entries.filter(isValidEntry);

  if (valid.length > MAX_IMPORT_ENTRIES) {
    throw new Error("Import contains too many tracks");
  }

  return valid;
}

export function splitIntoBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += batchSize) {
    batches.push(items.slice(index, index + batchSize));
  }
  return batches;
}

function parseZipImport(bodyBytes: Uint8Array): SpotifyExportEntry[] {
  const decompressed = unzipSync(bodyBytes);
  const entries: SpotifyExportEntry[] = [];
  let unzippedBytes = 0;

  for (const [filename, data] of Object.entries(decompressed)) {
    unzippedBytes += data.byteLength;
    if (unzippedBytes > MAX_UNZIPPED_BYTES) {
      throw new Error("Import archive is too large after extraction");
    }

    if (!filename.endsWith(".json")) {
      continue;
    }
    const parsed = parseJsonEntries(data);
    for (const entry of parsed) {
      entries.push(entry);
    }
    if (entries.length > MAX_IMPORT_ENTRIES) {
      throw new Error("Import contains too many tracks");
    }
  }

  return entries;
}

function parseJsonEntries(data: Uint8Array): SpotifyExportEntry[] {
  const parsed = JSON.parse(new TextDecoder().decode(data));
  if (!Array.isArray(parsed)) {
    throw new Error("Import JSON must contain an array");
  }
  return parsed;
}
