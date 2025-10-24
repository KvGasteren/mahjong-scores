'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, Fragment } from 'react'
import NumberInput from '@/components/NumberInput'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCompass as faCompassRegular,
  faStar as faStarRegular,
} from '@fortawesome/free-regular-svg-icons'
import {
  faCompass as faCompassSolid,
  faStar as faStarSolid,
} from '@fortawesome/free-solid-svg-icons'
import { STARTING_POINTS } from '@/constants/scoring'

type HandRow = {
  id: string
  index: number
  baseScores: Record<string, number>
  doubles: Record<string, number>
  winnerName: string
  eastName: string
  finalScores: Record<string, number>
  deltas: Record<string, number>
  handNote?: string | null
}

type SessionDTO = {
  session: {
    id: string
    title: string
    players: string[] // seat order
    playDate: string // YYYY-MM-DD
    finalized: boolean
  }
  hands: HandRow[]
}

export default function SessionDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'

  const [data, setData] = useState<SessionDTO | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Local input state keyed by player name
  const [scores, setScores] = useState<Record<string, number>>({})
  const [doubles, setDoubles] = useState<Record<string, number>>({})

  const [winnerName, setWinnerName] = useState<string | null>(null)
  const [eastName, setEastName] = useState<string | null>(null)

  useEffect(() => {
    if (isNew) router.replace('/sessions/new')
  }, [isNew, router])

  // Load session + hands from API
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch(`/api/sessions/${id}`)
      if (!res.ok) {
        setData(null)
        return
      }
      const dto: SessionDTO = await res.json()
      if (cancelled) return
      setData(dto)

      // init input maps
      const init = Object.fromEntries(dto.session.players.map((p) => [p, 0]))
      setScores(init as Record<string, number>)
      setDoubles(init as Record<string, number>)
      setWinnerName(null)
      setEastName(null)
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!data) return
    setIsEditing(!data.session.finalized)
  }, [data])

  const toggleFinalized = async (next: boolean) => {
    if (!data) return
    const res = await fetch(`/api/sessions/${data.session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finalized: next }),
    })
    if (!res.ok) {
      //show toast or inline message
      return
    }
    const updated = await res.json()
    setData((prev) =>
      prev
        ? {
            ...prev,
            session: {
              ...prev.session,
              finalized: updated.finalized,
              updatedAt: updated.updatedAt,
            },
          }
        : prev
    )
    setIsEditing(!updated.finalized)
  }

  const players = useMemo<string[]>(
    () => data?.session.players ?? [], // use [] only once, memoized
    [data?.session.players] // re-run only if the players array itself changes
  )

  const totals: Record<string, number> = useMemo(() => {
    if (!data) return {}
    const init = Object.fromEntries(
      players.map((p) => [p, STARTING_POINTS])
    ) as Record<string, number>
    return (data.hands ?? []).reduce((acc, h) => {
      for (const p of players) {
        acc[p] = (acc[p] ?? STARTING_POINTS) + (h.deltas[p] ?? 0)
      }
      return acc
    }, init)
  }, [data, players])

  async function onAddHand() {
    if (!winnerName || !eastName || !data) return
    const payload = { baseScores: scores, doubles, winnerName, eastName }
    const res = await fetch(`/api/sessions/${data.session.id}/hands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      alert('Failed to add hand')
      return
    }
    const newHand: HandRow = await res.json()
    setData((prev) =>
      prev ? { ...prev, hands: [...prev.hands, newHand] } : prev
    )

    const init = Object.fromEntries(players.map((p) => [p, 0])) as Record<
      string,
      number
    >
    setScores(init)
    setDoubles(init)
    setWinnerName(null)
    setEastName(null)
  }

  async function onDeleteHand(handId: string) {
    if (!data) return
    const res = await fetch(
      `/api/sessions/${data.session.id}/hands/${handId}`,
      {
        method: 'DELETE',
      }
    )
    if (res.ok) {
      setData((prev) =>
        prev
          ? { ...prev, hands: prev.hands.filter((h) => h.id !== handId) }
          : prev
      )
    }
  }

  if (!data) {
    return <div className="p-4">Loading session…</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">
          {data?.session.title ?? 'Session'}
        </h1>
        <div className="flex items-center gap-2">
          {data?.session.finalized && (
            <button
              className={`rounded-xl border px-3 py-1 text-sm ${
                isEditing ? 'bg-neutral-800 text-white' : 'bg-white'
              }`}
              onClick={() => setIsEditing((v) => !v)}
              title={isEditing ? 'Stop editing' : 'Edit'}
            >
              {isEditing ? 'Done' : 'Edit'}
            </button>
          )}

          <button
            className={`rounded-xl px-3 py-1 text-sm ${
              data?.session.finalized
                ? 'bg-amber-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
            onClick={() => toggleFinalized(!data?.session.finalized)}
          >
            {data?.session.finalized ? 'Unfinalize' : 'Finalize session'}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="rounded-2xl border bg-white p-3">
          <div className="grid gap-3">
            <div className="grid grid-cols-8 items-center gap-3">
              <div className="col-start-3 col-end-5">Score</div>
              <div className="col-span-2">x Double</div>
              <div>Win</div>
              <div>East</div>
            </div>

            {players.map((p) => {
              const isWinner = winnerName === p
              const isEast = eastName === p
              return (
                <div key={p} className="grid grid-cols-8 items-center gap-3">
                  <div className="text-sm col-span-2">{p}</div>
                  <div className="col-span-2 text-base md:text-sm">
                    <NumberInput
                      value={scores[p] ?? ''}
                      onChange={(v) =>
                        setScores((prev) => ({ ...prev, [p]: v }))
                      }
                    />
                  </div>
                  <div className="col-span-2 text-base md:text-sm">
                    <NumberInput
                      value={doubles[p] ?? ''}
                      onChange={(v) =>
                        setDoubles((prev) => ({ ...prev, [p]: v }))
                      }
                    />
                  </div>
                  {/* Winner selector: star */}
                  <button
                    type="button"
                    aria-label={
                      isWinner ? `${p} is winner` : `Set ${p} as winner`
                    }
                    onClick={() => setWinnerName(isWinner ? null : p)}
                    className={`justify-self-center p-2`}
                  >
                    <FontAwesomeIcon
                      icon={isWinner ? faStarSolid : faStarRegular}
                      className={isWinner ? 'opacity-100' : 'opacity-60'}
                    />
                  </button>
                  {/* East selector: compass */}
                  <button
                    type="button"
                    aria-label={isEast ? `${p} is East` : `Set ${p} as East`}
                    onClick={() => setEastName(isEast ? null : p)}
                    className={`justify-self-center p-2`}
                  >
                    <FontAwesomeIcon
                      icon={isEast ? faCompassSolid : faCompassRegular}
                      className={isEast ? 'opacity-100' : 'opacity-60'}
                    />
                  </button>
                </div>
              )
            })}
            <button
              className="w-full rounded-2xl bg-black text-white py-3 disabled:opacity-50"
              disabled={!winnerName || !eastName}
              onClick={onAddHand}
            >
              Add Hand
            </button>
            <p className="text-xs text-neutral-500 -mt-2">
              Pick exactly one <b>winner</b> (
              {<FontAwesomeIcon icon={faStarSolid} />}) and one <b>east</b> (
              {<FontAwesomeIcon icon={faCompassSolid} />}) each hand. Icons turn
              solid when selected.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-2 text-sm italic text-neutral-500">
          This session is finalized. Click{' '}
          <span className="font-medium">Edit</span> to make changes.
        </div>
      )}

      {/* === MOBILE CARDS (<md) === */}
      <div className="md:hidden space-y-3">
        <div className="rounded-2xl border bg-white p-3">
          <div className="text-xs text-neutral-500 mb-2">Totals</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(totals).map(([name, total]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2"
              >
                <span>{name}</span>
                <span className="font-mono">
                  {total > 0 ? '+' : ''}
                  {total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {data.hands.toReversed().map((h, idx) => (
          <div key={h.id} className="rounded-2xl border bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-500">
                Hand #{data.hands.length - idx}
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800">
                  Winner: {h.winnerName}
                </span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-sky-100 text-sky-800">
                  East: {h.eastName}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              {players.map((p) => (
                <div
                  key={p}
                  className="grid grid-cols-3 items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2"
                >
                  <span className="truncate">{p}</span>
                  <span className="font-mono text-right">
                    {h.finalScores?.[p] ?? 0}
                  </span>
                  <span
                    className={`font-mono text-right text-xs ${
                      (h.deltas[p] ?? 0) >= 0
                        ? 'text-green-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {(h.deltas[p] ?? 0) > 0 ? '+' : ''}
                    {h.deltas[p] ?? 0}
                  </span>
                </div>
              ))}
            </div>

            {h.handNote && (
              <div className="mt-2 text-xs text-neutral-600">{h.handNote}</div>
            )}
            {isEditing && (
              <div className="mt-2 flex justify-end">
                <button
                  className="text-xs text-red-600"
                  onClick={() => onDeleteHand(h.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* === DESKTOP TABLE (≥md) === */}
      <div className="hidden md:block rounded-2xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="border-b">
              <th className="p-2 text-left align-bottom" rowSpan={2}>
                #
              </th>
              {players.map((p) => (
                <th key={p} className="p-2 text-center" colSpan={2}>
                  {p}
                </th>
              ))}
              <th className="p-2 text-left align-bottom" rowSpan={2}>
                Winner
              </th>
              <th className="p-2 text-left align-bottom" rowSpan={2}>
                East
              </th>
              <th className="p-2" rowSpan={2}></th>
            </tr>
            <tr className="border-b">
              {players.map((p) => (
                <Fragment key={p}>
                  <th className="p-1 text-right font-normal col-span-2">
                    Score
                  </th>
                  <th className="p-1 text-right font-normal">Δ</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.hands.map((h, idx) => (
              <tr key={h.id} className="border-b last:border-0">
                <td className="p-2 align-top">{idx + 1}</td>
                {players.map((p) => (
                  <Fragment key={p}>
                    <td className="p-2 text-right font-mono align-top">
                      {h.finalScores?.[p] ?? 0}
                    </td>
                    <td
                      className={`p-2 text-right font-mono align-top text-xs ${
                        (h.deltas[p] ?? 0) >= 0
                          ? 'text-green-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {(h.deltas[p] ?? 0) > 0 ? '+' : ''}
                      {h.deltas[p] ?? 0}
                    </td>
                  </Fragment>
                ))}
                <td className="p-2 align-top">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800">
                    {h.winnerName}
                  </span>
                </td>
                <td className="p-2 align-top">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-sky-100 text-sky-800">
                    {h.eastName}
                  </span>
                </td>
                <td className="p-2 align-top">
                  {isEditing && (
                    <button
                      className="text-xs text-red-600"
                      onClick={() => onDeleteHand(h.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-50 font-medium">
              <td className="p-2">Totals</td>
              {players.map((p) => (
                <Fragment key={p}>
                  {/* empty score cell in totals */}
                  <td className="p-2"></td>
                  <td
                    className={`p-2 text-right font-mono ${
                      (totals[p] ?? 0) < 0 ? 'text-rose-700' : 'text-green-700'
                    }`}
                  >
                    {totals[p] ?? 0}
                  </td>
                </Fragment>
              ))}
              <td className="p-2"></td>
              <td className="p-2"></td>
              <td className="p-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
