import { eq } from "drizzle-orm";

import { db } from "../postgres";
import { user } from "../postgres/schema";

export type User = typeof user.$inferSelect;

export class UserModel {
  async findById(id: string): Promise<User | null> {
    const [row] = await db.select().from(user).where(eq(user.id, id)).limit(1);
    return row ?? null;
  }
}
