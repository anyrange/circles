import { drizzle } from "drizzle-orm/node-postgres";

import { config } from "../../config";
import { relations } from "./relations";

export const db = drizzle(config.database.url, { relations });
