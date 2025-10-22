'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, Hand } from './types'
import { uid } from './util'
import { PLAYERS } from '@/constants/players'

interface SessionState {
  sessions: Session[]
  createSession: (title?: string) => string // returns id
  addHand: (sessionId: string, hand: Omit<Hand, 'id' | 'createdAt'>) => void
  deleteHand: (sessionId: string, handId: string) => void
  deleteSession: (sessionId: string) => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      createSession: (title = new Date().toLocaleString()) => {
        const id = uid()
        const session: Session = { id, title, createdAt: Date.now(), hands: [] }
        set({ sessions: [session, ...get().sessions] })
        return id
      },
      addHand: (sessionId, handPartial) => {
        set(state => ({
          sessions: state.sessions.map(s => s.id === sessionId
            ? { ...s, hands: [...s.hands, { id: uid(), createdAt: Date.now(), ...handPartial }] }
            : s)
        }))
      },
      deleteHand: (sessionId, handId) => {
        set(state => ({
          sessions: state.sessions.map(s => s.id === sessionId
            ? { ...s, hands: s.hands.filter(h => h.id !== handId) }
            : s)
        }))
      },
      deleteSession: (sessionId) => {
        set(state => ({ sessions: state.sessions.filter(s => s.id !== sessionId) }))
      },
    }),
    { name: 'mahjong-sessions' }
  )
)

export const computeTotals = (session: Session) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totals: Record<(typeof PLAYERS)[number], number> = Object.fromEntries(PLAYERS.map(p => [p, 0])) as any
  for (const h of session.hands) {
    for (const p of PLAYERS) totals[p] += h.deltas[p] ?? 0
  }
  return totals
}
