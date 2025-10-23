import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hands } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; handId: string } }
) {
  await db.delete(hands).where(eq(hands.id, params.handId));
  return NextResponse.json({ ok: true });
}
