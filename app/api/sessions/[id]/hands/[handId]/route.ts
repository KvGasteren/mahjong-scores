import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hands } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string; handId: string }> }
) {
  const { handId } = await context.params
  await db.delete(hands).where(eq(hands.id, handId));
  return NextResponse.json({ ok: true });
}
