export const PLAYERS = [
  'Sara',
  'Jozefien',
  'Bep',
  'Koen',
] as const
export type PlayerName = typeof PLAYERS[number]