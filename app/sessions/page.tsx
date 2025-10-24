'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type SessionRow = {
  id: string
  title: string
  players: string[] // seat order
  playDate: string // YYYY-MM-DD
  createdAt: string // ISO
  updatedAt: string // ISO
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  // load sessions from API
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/sessions', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const rows: SessionRow[] = await res.json()
        if (!cancelled) setSessions(rows)
      } catch (e: unknown) {
        if (!cancelled) {
          const message =
            e instanceof Error ? e.message : 'Failed to load sessions'
          setErr(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const empty = useMemo(
    () => !loading && sessions.length === 0,
    [loading, sessions.length]
  )

  async function onDelete(id: string) {
    if (!confirm('Delete this session? This cannot be undone.')) return
    const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      alert('Failed to delete session')
      return
    }
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sessions</h1>
        <Link
          href="/sessions/new"
          className="rounded-2xl bg-black text-white px-4 py-2"
        >
          New
        </Link>
      </div>

      {loading && <p className="text-sm text-neutral-600">Loading…</p>}
      {err && <p className="text-sm text-rose-700">Error: {err}</p>}
      {empty && (
        <p className="text-sm text-neutral-600">
          No sessions yet. Tap <b>New</b> to start.
        </p>
      )}

      <div className="space-y-3">
        {sessions.map((s) => (
          <div key={s.id} className="rounded-2xl border bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={`/sessions/${s.id}`} className="font-medium">
                  {s.title}
                </Link>
                <div className="text-xs text-neutral-500">
                  {new Date(s.createdAt).toLocaleString()}
                </div>
                <div className="text-xs text-neutral-500">
                  {s.players.join(' · ')}
                </div>
              </div>
              <button
                onClick={() => onDelete(s.id)}
                className="text-xs text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
