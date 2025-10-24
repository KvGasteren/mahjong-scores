import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, hands } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { computeFinalScores } from "@/lib/scoreHelpers";
import { calculateDeltas } from "@/lib/calculateDeltas";
import { SeatIndex } from "@/lib/playerOrder";


export async function POST(
  req: Request,
  context : { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await context.params
  const body = await req.json();
  const { baseScores, doubles, winnerName, eastName } = body as {
    baseScores: Record<string, number>;
    doubles: Record<string, number>;
    winnerName: string;
    eastName: string;
  };

  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  // map names -> seat indices using players[] order
  const players: string[] = session.players;
  const winnerSeatIndex = players.indexOf(winnerName)
  const eastSeatIndex = players.indexOf(eastName)
  if (winnerSeatIndex < 0 || eastSeatIndex < 0) {
    return NextResponse.json({ error: "Winner/East must be one of session players" }, { status: 400 });
  }

  const finalScores = computeFinalScores(baseScores, doubles);
  // calculateDeltas expects per-seat order – build records by name in the same key set
  const deltas = calculateDeltas({
    players,
    scores: finalScores,
    doubles,
    winnerSeatIndex: winnerSeatIndex as SeatIndex,
    eastSeatIndex: eastSeatIndex as SeatIndex,
  });

  // next index
  const [last] = await db.select({ index: hands.index })
    .from(hands)
    .where(eq(hands.sessionId, sessionId))
    .orderBy(desc(hands.index))
    .limit(1);

  const nextIndex = (last?.index ?? -1) + 1;

  const [row] = await db.insert(hands).values({
    sessionId,
    index: nextIndex,
    baseScores,
    doubles,
    winnerName,
    eastName,
    finalScores,
    deltas,
  }).returning();

  return NextResponse.json(row, { status: 201 });
}
