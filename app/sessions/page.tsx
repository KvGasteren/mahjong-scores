'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type SummaryRow =
  | {
      id: string
      title: string
      players: string[]
      playDate: string
      createdAt: string
      updatedAt: string
      finalized: false
      status: 'in-progress'
    }
  | {
      id: string
      title: string
      players: string[]
      playDate: string
      createdAt: string
      updatedAt: string
      finalized: true
      status: 'finalized'
      totals: Record<string, number>
    }

export default function SessionsPage() {
  const [rows, setRows] = useState<SummaryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/sessions/summary', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: SummaryRow[] = await res.json()
        if (!cancelled) setRows(data)
      } catch (e) {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <div className="p-6">Loading…</div>
  if (err) return <div className="p-6 text-red-600">{err}</div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sessions</h1>
        <Link
          className="rounded-xl bg-black text-white px-3 py-2"
          href="/sessions/new"
        >
          New session
        </Link>
      </div>

      <div className="grid gap-3">
        {rows.map((s) => (
          <Link
            key={s.id}
            href={`/sessions/${s.id}`}
            className="block rounded-2xl border p-4 transition hover:bg-neutral-50"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-neutral-500">
                  {new Date(s.playDate).toLocaleDateString('nl-NL')}
                </div>
              </div>
              <span
                className={`text-xs rounded-full px-2 py-1 ${
                  s.finalized
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {s.finalized ? 'Finalized' : 'In progress'}
              </span>
            </div>

            <div className="mt-2 text-sm text-neutral-700">
              {s.finalized ? (
                <div className="flex flex-wrap gap-2">
                  {s.players
                    .slice()
                    .sort(
                      (a, b) =>
                        ((s as Extract<SummaryRow, { finalized: true }>).totals[
                          b
                        ] ?? 0) -
                        ((s as Extract<SummaryRow, { finalized: true }>).totals[
                          a
                        ] ?? 0)
                    )
                    .map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2 py-1"
                      >
                        <span className="font-mono">{p}</span>
                        <span className="font-semibold">
                          {(s as Extract<SummaryRow, { finalized: true }>)
                            .totals[p] ?? 0}
                        </span>
                      </span>
                    ))}
                </div>
              ) : (
                <span className="italic text-neutral-500">in-progress</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
