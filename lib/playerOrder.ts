import { PLAYERS, type PlayerName } from '@/constants/players'

export type SeatIndex = 0 | 1 | 2 | 3 
export type Vec4 = [number, number, number, number]

// Convert a per-player Record to a [E, N, W, S]-ordered vector (PLAYERS order).
export const recToVec = (rec: Record<PlayerName, number>): Vec4 =>
  PLAYERS.map(p => rec[p]) as Vec4

// Convert back to a Record<PlayerName, number> using PLAYERS order.
export const vecToRec = (vec: Vec4): Record<PlayerName, number> =>
  Object.fromEntries(PLAYERS.map((p, i) => [p, vec[i]])) as Record<PlayerName, number>