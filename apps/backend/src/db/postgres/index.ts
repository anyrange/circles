import { drizzle } from "drizzle-orm/node-postgres";

import { config } from "../../config";
import { relations } from "./relations";
import * as schema from "./schema";

export const db = drizzle(config.database.url, { schema, relations });
export type Database = typeof db;
