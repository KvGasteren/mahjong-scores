import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, sessionPlayers } from "@/drizzle/schema";
import { desc, inArray } from "drizzle-orm";
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
  const { title, players, playDate } = body as {
    title: string;
    players: string[]; // 4 names in seat order
    playDate: string;  // "YYYY-MM-DD"
  };

  if (!title || !Array.isArray(players) || players.length !== 4 || !playDate) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const groupId = groupIds[0] ?? null;

  const [row] = await db.insert(sessions).values({
    title,
    players,
    playDate,
    groupId,
  }).returning();

  // Create unclaimed sessionPlayers rows for each seat
  await db.insert(sessionPlayers).values(
    players.map((_, seatIndex) => ({ sessionId: row.id, userId: null, seatIndex }))
  );

  return NextResponse.json(row, { status: 201 });
}
