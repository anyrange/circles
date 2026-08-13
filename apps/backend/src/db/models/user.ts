import { eq } from "drizzle-orm";

import type { Database } from "../postgres";
import { user } from "../postgres/schema";

export type User = typeof user.$inferSelect;

export class UserModel {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db.select().from(user).where(eq(user.id, id)).limit(1);
    return row ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const [row] = await this.db.select().from(user).where(eq(user.username, username)).limit(1);
    return row ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const [deletedUser] = await this.db
      .delete(user)
      .where(eq(user.id, id))
      .returning({ id: user.id });

    return Boolean(deletedUser);
  }
}
