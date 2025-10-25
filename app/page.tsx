// app/page.tsx
import { db } from "@/lib/db";
import { sessions, hands } from "@/drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { STARTING_POINTS } from "@/constants/scoring";
import WinsPie from "@/components/dashboard/WinsPie";

// Strongly-typed Drizzle row types
export type SessionRow = typeof sessions.$inferSelect;
export type HandRow = typeof hands.$inferSelect;

type PieDatum = { name: string; value: number };
type TotalDatum = { name: string; score: number };

type DashboardData = {
  winsData: PieDatum[];
  totalsData: TotalDatum[];
};

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function isDeltasRecord(v: unknown): v is Record<string, number> {
  return (
    v !== null &&
    typeof v === "object" &&
    Object.values(v as Record<string, unknown>).every((n) => typeof n === "number")
  );
}

// Helper to compute final per-session totals from hands.deltas and add STARTING_POINTS once per player per session
async function getDashboardData(): Promise<DashboardData> {
  // 1) Load finalized sessions
  const finalizedSessions: SessionRow[] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.finalized, true));

  // 2) Load all hands for those sessions (single query if there are any)
  const sessionIds = finalizedSessions.map((s) => s.id);
  const allHands: HandRow[] = sessionIds.length
    ? await db.select().from(hands).where(inArray(hands.sessionId, sessionIds))
    : [];

  // Group hands by sessionId for faster access
  const handsBySession = allHands.reduce<Record<string, HandRow[]>>((acc, h) => {
    const sid = String(h.sessionId);
    (acc[sid] ||= []).push(h);
    return acc;
  }, {});

  // 3) Compute per-session final totals & winners
  const wins: Record<string, number> = {}; // player -> #wins
  const runningTotals: Record<string, number> = {}; // player -> cumulative total across sessions

  for (const s of finalizedSessions) {
    const players: string[] = isStringArray((s as SessionRow).players) ? (s.players as string[]) : [];
    const sid = String(s.id);
    const hs = handsBySession[sid] ?? [];

    // Sum deltas per player
    const totals: Record<string, number> = {};
    for (const h of hs) {
      const d = h.deltas;
      if (!isDeltasRecord(d)) continue;
      for (const [name, val] of Object.entries(d)) {
        totals[name] = (totals[name] ?? 0) + (val ?? 0);
      }
    }

    // Add STARTING_POINTS once per player who participated in the session
    const add = typeof STARTING_POINTS === "number" ? STARTING_POINTS : 0;
    for (const p of players) {
      totals[p] = (totals[p] ?? 0) + add;
    }

    // Determine winner (highest score). If tie, count all top players as a win.
    const maxScore = players.reduce((m, p) => Math.max(m, totals[p] ?? 0), -Infinity);
    for (const p of players) {
      if ((totals[p] ?? 0) === maxScore) {
        wins[p] = (wins[p] ?? 0) + 1;
      }
    }

    // Add to runningTotals
    for (const p of players) {
      runningTotals[p] = (runningTotals[p] ?? 0) + (totals[p] ?? 0);
    }
  }

  // Convert to arrays for UI
  const winsData: PieDatum[] = Object.entries(wins)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalsData: TotalDatum[] = Object.entries(runningTotals)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  return { winsData, totalsData };
}

export default async function DashboardPage() {
  const { winsData, totalsData } = await getDashboardData();

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <h2 className="mb-3 text-lg font-medium">Session wins per player</h2>
          <WinsPie data={winsData} />
        </div>

        <div className="rounded-2xl border p-4">
          <h2 className="mb-3 text-lg font-medium">Running totals</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-600">
                  <th className="px-2 py-1">#</th>
                  <th className="px-2 py-1">Player</th>
                  <th className="px-2 py-1 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {totalsData.map((row, idx) => (
                  <tr key={row.name} className="border-t">
                    <td className="px-2 py-2">{idx + 1}</td>
                    <td className="px-2 py-2">{row.name}</td>
                    <td className="px-2 py-2 text-right font-mono">{row.score}</td>
                  </tr>
                ))}
                {totalsData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-2 py-6 text-center text-neutral-500">
                      No finalized sessions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
