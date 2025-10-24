'use client'
import { useSessionStore, computeTotals } from '@/lib/sessionStore'
import Link from 'next/link'

export default function SessionsPage() {
  const { sessions, createSession, deleteSession } = useSessionStore()
  // I believe I need to update this to use the api call, or should I use the sessionstore to acces the api?

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sessions</h1>
        <Link href="/sessions/new" className="rounded-2xl bg-black text-white px-4 py-2">New</Link>
      </div>

      {sessions.length === 0 && (
        <p className="text-sm text-neutral-600">No sessions yet. Tap <b>New</b> to start.</p>
      )}

      <div className="space-y-3">
        {sessions.map(s => {
          const totals = computeTotals(s)
          return (
            <div key={s.id} className="rounded-2xl border bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link href={`/sessions/${s.id}`} className="font-medium">{s.title}</Link>
                  <div className="text-xs text-neutral-500">{new Date(s.createdAt).toLocaleString()}</div>
                </div>
                <button onClick={()=>deleteSession(s.id)} className="text-xs text-red-600">Delete</button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {Object.entries(totals).map(([name, score]) => (
                  <div key={name} className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2">
                    <span>{name}</span>
                    <span className="font-mono">{score>0?'+':''}{score}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}