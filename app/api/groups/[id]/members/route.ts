import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groupMembers, groupMemberships, users } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/apiAuth";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await context.params;

  if (!user.isSuperAdmin) {
    const [membership] = await db
      .select()
      .from(groupMemberships)
      .where(and(eq(groupMemberships.userId, user.id), eq(groupMemberships.groupId, groupId)));
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db
    .select({
      seatIndex: groupMembers.seatIndex,
      name: groupMembers.name,
      userId: groupMembers.userId,
      userImage: users.image,
    })
    .from(groupMembers)
    .leftJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(groupMembers.seatIndex);

  return NextResponse.json(rows);
}
