import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hands } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, canAccessSession } from "@/lib/apiAuth";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string; handId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: sessionId, handId } = await context.params;

  if (!await canAccessSession(user, sessionId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(hands).where(eq(hands.id, handId));
  return NextResponse.json({ ok: true });
}
