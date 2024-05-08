import { createPostgresClient } from "./postgres";
import { env } from "@/config";

export const controllers = createPostgresClient(env.POSTGRES_URL);
