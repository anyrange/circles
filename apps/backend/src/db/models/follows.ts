import { and, eq } from "drizzle-orm";

import { db } from "../postgres";
import { follows, user } from "../postgres/schema";

export class FollowsModel {
  async follow(followerId: string, followingId: string) {
    await db.insert(follows).values({ followerId, followingId }).onConflictDoNothing();
  }

  async unfollow(followerId: string, followingId: string) {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async getFollowing(userId: string) {
    return db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
      })
      .from(follows)
      .innerJoin(user, eq(follows.followingId, user.id))
      .where(eq(follows.followerId, userId));
  }

  async getFollowers(userId: string) {
    return db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
      })
      .from(follows)
      .innerJoin(user, eq(follows.followerId, user.id))
      .where(eq(follows.followingId, userId));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [row] = await db
      .select({ followerId: follows.followerId })
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .limit(1);
    return !!row;
  }
}
