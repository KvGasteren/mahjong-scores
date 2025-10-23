import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, hands } from "@/drizzle/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const [session] = await db.select().from(sessions).where(eq(sessions.id, params.id));
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const handRows = await db.select().from(hands)
    .where(eq(hands.sessionId, params.id))
    .orderBy(asc(hands.index));

  return NextResponse.json({ session, hands: handRows });
}
