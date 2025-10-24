// lib/calculateDeltas.ts
import { type SeatIndex, type Vec4, recToVec, vecToRec } from './playerOrder'

type Args = {
  players: string[],
  scores: Record<string, number>;   // per-player base score (already entered)
  doubles: Record<string, number>;  // per-player doubles exponent
  winnerSeatIndex: SeatIndex;
  eastSeatIndex: SeatIndex;
}

export function calculateDeltas({
  players, scores, doubles, winnerSeatIndex, eastSeatIndex
}: Args): Record<string, number> {
  // 1) normalize to vectors in PLAYERS order
  const base: Vec4 = recToVec(scores, players)
  const dbls: Vec4 = recToVec(doubles, players)

  // 2) compute per-player final score = base * 2^doubles
  const pow2 = (e: number) => Math.pow(2, Math.max(0, Math.floor(e)))
  const finalScores: Vec4 = base.map((b, i) => b * pow2(dbls[i])) as Vec4

  // 3) settlement (winner-only as per your rule)
  const deltas: Vec4 = [0, 0, 0, 0]
  for (let i = 0 as SeatIndex; i < 4; i = (i + 1) as SeatIndex) {
    if (i === winnerSeatIndex && i === eastSeatIndex) {
      deltas[i] += (finalScores[i] * 6)
    } else if (i === winnerSeatIndex) {
      deltas[i] += (finalScores[i] * 4)
    } else if (i === eastSeatIndex) {
      deltas[i] += (finalScores[i] * 4)
      // pay everyone twice
      deltas[i] -= finalScores.reduce((p, c, j) => j === i ? p : p + c, 0) * 2
    } else if (winnerSeatIndex !== eastSeatIndex) {
      deltas[i] += finalScores[i] * 3
      // pay all players except yourself
      deltas[i] -= finalScores.reduce((p, c, j) => j === i ? p : p + c, 0) 
      // pay east double
      deltas[i] -= finalScores[eastSeatIndex]
    } else {
      // you are not the winner and not east, but east is the winner
      deltas[i] += finalScores[i] * 2
      // pay all players except yourself
      deltas[i] -= finalScores.reduce((p, c, j) => j === i ? p : p + c, 0)
      // pay east double
      deltas[i] -= finalScores[eastSeatIndex]
    }
  }

  // 4) back to Record keyed by player name
  return vecToRec(deltas, players)
}
