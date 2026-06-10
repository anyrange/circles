import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { config } from "../../config";
import { relations } from "./relations";
import * as schema from "./schema";

export const db: NodePgDatabase<typeof schema> = drizzle(config.database.url, { relations });
export type Database = typeof db;
