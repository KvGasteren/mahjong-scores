export type ScoringItem = {
  id: string
  label: string
  points: number // positive for bonuses, negative for penalties if you use them
}

export const SCORING_TABLE: ScoringItem[] = [
  { id: 'mahjong', label: 'Mahjong (win)', points: 20 },
  { id: 'self-draw', label: 'Self-draw bonus', points: 2 },
  { id: 'discard-payer', label: 'Discard pays winner (optional rule)', points: 0 },
  { id: 'all-pungs', label: 'All Pungs', points: 6 },
  { id: 'pure-hand', label: 'Pure One Suit', points: 24 },
  { id: 'mixed-hand', label: 'Half Flush', points: 12 },
  { id: 'seat-wind-pung', label: 'Pung of Seat Wind', points: 2 },
  { id: 'round-wind-pung', label: 'Pung of Round Wind', points: 2 },
  { id: 'dragon-pung', label: 'Pung of Dragons', points: 2 },
  // 👉 Replace values with your Dutch house rules; these are placeholders.
]