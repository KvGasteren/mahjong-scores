import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, hands } from "@/drizzle/schema";
import { desc, eq, asc } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { STARTING_POINTS } from "@/constants/scoring";

type SessionRow = InferSelectModel<typeof sessions>;
type HandRow = InferSelectModel<typeof hands>;

export async function GET() {
  const rows: SessionRow[] = await db
    .select()
    .from(sessions)
    .orderBy(desc(sessions.playDate));

  // Preload hands for finalized sessions only
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

    // Sum deltas to get final totals for the session
    const totals: Record<string, number> = {};
    for (const h of hs) {
      const d = h.deltas as Record<string, number>;
      for (const name of Object.keys(d)) {
        totals[name] = (totals[name] ?? 0) + (d[name] ?? 0);
      }
    }

    // Add starting points
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
      totals, // Record<PlayerName, number>
    });
  }

  return NextResponse.json(out);
}
