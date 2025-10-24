export type SeatIndex = 0 | 1 | 2 | 3 
export type Vec4 = [number, number, number, number]

export const recToVec = (rec: Record<string, number>, players: string[]): Vec4 =>
  players.map(p => rec[p]) as Vec4

export const vecToRec = (vec: Vec4, players: string[]): Record<string, number> =>
  Object.fromEntries(players.map((p, i) => [p, vec[i]]))