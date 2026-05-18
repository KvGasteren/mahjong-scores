import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groupMembers, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/apiAuth";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await context.params;

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
