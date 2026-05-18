import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, hands } from "@/drizzle/schema";
import { eq, asc } from "drizzle-orm";
import { getCurrentUser, canAccessSession } from "@/lib/apiAuth";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: sessionId } = await context.params;

  if (!await canAccessSession(user, sessionId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  if (!await canAccessSession(user, id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(sessions).where(eq(sessions.id, id));
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  if (!await canAccessSession(user, id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { finalized } = (await req.json()) as { finalized: boolean };

  const [row] = await db
    .update(sessions)
    .set({ finalized, updatedAt: new Date() })
    .where(eq(sessions.id, id))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
