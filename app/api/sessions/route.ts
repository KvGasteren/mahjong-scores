import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, sessionPlayers, groupMembers } from "@/drizzle/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { getCurrentUser, getUserGroupIds } from "@/lib/apiAuth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.isSuperAdmin) {
    const rows = await db.select().from(sessions).orderBy(desc(sessions.createdAt));
    return NextResponse.json(rows);
  }

  const groupIds = await getUserGroupIds(user.id);
  if (groupIds.length === 0) return NextResponse.json([]);

  const rows = await db
    .select()
    .from(sessions)
    .where(inArray(sessions.groupId, groupIds))
    .orderBy(desc(sessions.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const groupIds = await getUserGroupIds(user.id);
  if (!user.isSuperAdmin && groupIds.length === 0) {
    return NextResponse.json({ error: "You must be in a group to create a session" }, { status: 403 });
  }

  const body = await req.json();
  const { title, playDate, groupId: bodyGroupId } = body as {
    title: string;
    playDate: string;        // "YYYY-MM-DD"
    groupId?: string | null; // required when user is in multiple groups
  };

  if (!title || !playDate) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const groupId = bodyGroupId ?? groupIds[0] ?? null;
  if (!groupId) {
    return NextResponse.json({ error: "Could not determine group for session" }, { status: 400 });
  }

  // Derive players from the group's 4 fixed seats
  const seats = await db
    .select()
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(groupMembers.seatIndex);

  if (seats.length !== 4) {
    return NextResponse.json({ error: "Group must have exactly 4 members" }, { status: 400 });
  }

  const players = seats.map((s) => s.name);

  const [row] = await db.insert(sessions).values({
    title,
    players,
    playDate,
    groupId,
    createdBy: user.id,
  }).returning();

  // Create sessionPlayers rows from the group seats
  await db.insert(sessionPlayers).values(
    seats.map((s) => ({
      sessionId: row.id,
      userId: s.userId ?? null,
      seatIndex: s.seatIndex,
    }))
  );

  return NextResponse.json(row, { status: 201 });
}
