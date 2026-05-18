import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users, groupMemberships, sessions } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

export type CurrentUser = InferSelectModel<typeof users>;

/** Returns the authenticated user from the DB, or null if not logged in. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
  return user ?? null;
}

/** Returns the group IDs the user belongs to. */
export async function getUserGroupIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ groupId: groupMemberships.groupId })
    .from(groupMemberships)
    .where(eq(groupMemberships.userId, userId));
  return rows.map((r) => r.groupId);
}

/** Returns true if the user can access a session (group member or superadmin). */
export async function canAccessSession(user: CurrentUser, sessionId: string): Promise<boolean> {
  if (user.isSuperAdmin) return true;

  const [session] = await db
    .select({ groupId: sessions.groupId })
    .from(sessions)
    .where(eq(sessions.id, sessionId));

  if (!session?.groupId) return false;

  const [membership] = await db
    .select()
    .from(groupMemberships)
    .where(
      and(
        eq(groupMemberships.userId, user.id),
        eq(groupMemberships.groupId, session.groupId)
      )
    );

  return !!membership;
}
