import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(sessions).orderBy(desc(sessions.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, players, playDate } = body as {
    title: string;
    players: string[]; // 4 names in seat order
    playDate: string;  // "YYYY-MM-DD"
  };

  if (!title || !Array.isArray(players) || players.length !== 4 || !playDate) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const [row] = await db.insert(sessions).values({
    title,
    players,
    playDate, // DATE column
  }).returning();

  return NextResponse.json(row, { status: 201 });
}
