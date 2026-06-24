import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groupMembers, groupMemberships, users } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/apiAuth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string; seatIndex: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId, seatIndex: seatIndexStr } = await context.params;
  const seatIndex = parseInt(seatIndexStr);

  if (!user.isSuperAdmin) {
    const [membership] = await db
      .select()
      .from(groupMemberships)
      .where(and(eq(groupMemberships.userId, user.id), eq(groupMemberships.groupId, groupId)));
    if (!membership || membership.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const body = (await req.json()) as { name?: string; userId?: string | null };
  const updates: { name?: string; userId?: string | null } = {};

  if ("name" in body && typeof body.name === "string") {
    updates.name = body.name.trim();
  }

  if ("userId" in body) {
    updates.userId = body.userId ?? null;
    if (body.userId) {
      const [linkedUser] = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, body.userId));
      if (linkedUser) {
        updates.name = linkedUser.name ?? linkedUser.email ?? updates.name;
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  await db
    .update(groupMembers)
    .set(updates)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.seatIndex, seatIndex)));

  // When linking a user, ensure they have a groupMembership so they can see the group
  if (body.userId) {
    const [existing] = await db
      .select()
      .from(groupMemberships)
      .where(and(eq(groupMemberships.userId, body.userId), eq(groupMemberships.groupId, groupId)));
    if (!existing) {
      await db.insert(groupMemberships).values({ userId: body.userId, groupId, role: "member" });
    }
  }

  return NextResponse.json({ ok: true });
}
