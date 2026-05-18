import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, hands } from "@/drizzle/schema";
import { desc, eq, asc, inArray } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { STARTING_POINTS } from "@/constants/scoring";
import { getCurrentUser, getUserGroupIds } from "@/lib/apiAuth";

type SessionRow = InferSelectModel<typeof sessions>;
type HandRow = InferSelectModel<typeof hands>;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let rows: SessionRow[];

  if (user.isSuperAdmin) {
    rows = await db.select().from(sessions).orderBy(desc(sessions.playDate));
  } else {
    const groupIds = await getUserGroupIds(user.id);
    if (groupIds.length === 0) return NextResponse.json([]);
    rows = await db
      .select()
      .from(sessions)
      .where(inArray(sessions.groupId, groupIds))
      .orderBy(desc(sessions.playDate));
  }

  const out = [];
  for (const s of rows) {
    if (!s.finalized) {
      out.push({
        id: s.id,
        title: s.title,
        players: s.players,
        playDate: s.playDate,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        finalized: s.finalized,
        status: "in-progress" as const,
      });
      continue;
    }

    const hs: HandRow[] = await db
      .select()
      .from(hands)
      .where(eq(hands.sessionId, s.id))
      .orderBy(asc(hands.index));

    const totals: Record<string, number> = {};
    for (const h of hs) {
      const d = h.deltas as Record<string, number>;
      for (const name of Object.keys(d)) {
        totals[name] = (totals[name] ?? 0) + (d[name] ?? 0);
      }
    }

    for (const player of s.players) {
      totals[player] = (totals[player] ?? 0) + STARTING_POINTS;
    }

    out.push({
      id: s.id,
      title: s.title,
      players: s.players,
      playDate: s.playDate,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      finalized: s.finalized,
      status: "finalized" as const,
      totals,
    });
  }

  return NextResponse.json(out);
}
