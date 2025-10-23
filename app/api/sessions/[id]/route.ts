import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, hands } from "@/drizzle/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: sessionId} = await context.params
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const handRows = await db.select().from(hands)
    .where(eq(hands.sessionId, sessionId))
    .orderBy(asc(hands.index));

  return NextResponse.json({ session, hands: handRows });
}
