import type { SeatIndex } from '@/lib/playerOrder'; // if you have this helper

export type Hand = {
  id: string;
  deltas: Record<string, number>;                 // computed, zero-sum
  scores: Record<string, number>;                 // NEW: final scores per player (base × 2^doubles)
  winnerSeatIndex: SeatIndex;                         // NEW
  eastSeatIndex: SeatIndex;                           // NEW
  note?: string;
  usedRules?: string[];
  createdAt: number;
};

export type Session = {
  id: string
  title: string
  createdAt: number
  hands: Hand[]
}
