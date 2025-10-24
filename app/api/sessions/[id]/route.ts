import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, hands } from "@/drizzle/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await context.params
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const handRows = await db.select().from(hands)
    .where(eq(hands.sessionId, sessionId))
    .orderBy(asc(hands.index));

  return NextResponse.json({ session, hands: handRows });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  await db.delete(sessions).where(eq(sessions.id, id))
  return new NextResponse(null, { status: 204 })
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { finalized } = (await req.json()) as { finalized: boolean };

  const [row] = await db
    .update(sessions)
    .set({ finalized, updatedAt: new Date() })
    .where(eq(sessions.id, id))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}