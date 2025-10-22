"use client";
import { useParams } from "next/navigation";
import { useSessionStore } from "@/lib/sessionStore";
import { PlayerName, PLAYERS } from "@/constants/players";
import NumberInput from "@/components/NumberInput";
import { useMemo, useState, Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCompass as faCompassRegular,
  faStar as faStarRegular,
} from "@fortawesome/free-regular-svg-icons";
import {
  faCompass as faCompassSolid,
  faStar as faStarSolid,
} from "@fortawesome/free-solid-svg-icons";
import { calculateDeltas } from "@/lib/calculateDeltas";
import { SeatIndex } from "@/lib/playerOrder";

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { sessions, addHand, deleteHand } = useSessionStore();
  const session = sessions.find((s) => s.id === id);
  const [scores, setScores] = useState<
    Record<(typeof PLAYERS)[number], number>
  >(
    Object.fromEntries(PLAYERS.map((p) => [p, 0])) as Record<PlayerName, number>
  );
  const [doubles, setDoubles] = useState<
    Record<(typeof PLAYERS)[number], number>
  >(
    Object.fromEntries(PLAYERS.map((p) => [p, 0])) as Record<PlayerName, number>
  );
  const [note, setNote] = useState("");

  // NEW: single-selection winner & east per hand
  const [winnerSeatIndex, setWinnerSeatIndex] = useState<SeatIndex | null>(
    null
  );
  const [eastSeatIndex, setEastSeatIndex] = useState<SeatIndex | null>(null);

  const pow2 = (e: number) => Math.pow(2, Math.max(0, Math.floor(e)));
  const computeFinalScores = (
    scores: Record<PlayerName, number>,
    doubles: Record<PlayerName, number>
  ): Record<PlayerName, number> =>
    Object.fromEntries(
      PLAYERS.map((p) => [p, (scores[p] ?? 0) * pow2(doubles[p] ?? 0)])
    ) as Record<PlayerName, number>;

  // const isSeat = (x: number | null): x is SeatIndex =>
  //   x === 0 || x === 1 || x === 2 || x === 3;

  const onAddHand = () => {
    if (winnerSeatIndex !== null && eastSeatIndex !== null) {
      const finalScores = computeFinalScores(scores, doubles);
      const deltas = calculateDeltas({
        scores: finalScores, // we can pass final scores directly
        doubles, // (optional to keep)
        winnerSeatIndex,
        eastSeatIndex,
      });

      addHand(session!.id, {
        deltas,
        scores: finalScores, // <- store the scores for the log
        winnerSeatIndex,
        eastSeatIndex,
        note,
        usedRules: [],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setScores(Object.fromEntries(PLAYERS.map((p) => [p, 0])) as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDoubles(Object.fromEntries(PLAYERS.map((p) => [p, 0])) as any);
      setNote("");
      setWinnerSeatIndex(null);
      setEastSeatIndex(null);
    }
  };

  const totals:Record<PlayerName, number> = useMemo(() => {
    if (!session) return Object.fromEntries(PLAYERS.map((p) => [p, 2000])) as Record<PlayerName, number>;
    return session.hands.reduce((acc, h) => {
      for (const p of PLAYERS) acc[p] = (acc[p] || 2000) + (h.deltas[p] || 2000);
      return acc;
    }, Object.fromEntries(PLAYERS.map((p) => [p, 2000])) as Record<PlayerName, number>);
  }, [session]);

  if (!session) return <div>Session not found.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{session.title}</h1>

      <div className="rounded-2xl border bg-white p-3">
        <div className="grid gap-3">
          <div className="grid grid-cols-8 items-center gap-3">
            <div className="col-start-3 col-end-5">Score</div>
            <div className="col-span-2">x Double</div>
            <div>Win</div>
            <div>East</div>
          </div>
          {PLAYERS.map((p, idx) => {
            const isWinner = winnerSeatIndex === idx;
            const isEast = eastSeatIndex === idx;
            return (
              <div key={p} className="grid grid-cols-8 items-center gap-3">
                <div className="text-sm col-span-2">{p}</div>
                <div className="col-span-2 text-base md:text-sm">
                  <NumberInput
                    value={scores[p] || ""}
                    onChange={(v) => setScores((prev) => ({ ...prev, [p]: v }))}
                  />
                </div>
                <div className="col-span-2 text-base md:text-sm">
                  <NumberInput
                    value={doubles[p] || ""}
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
                  onClick={() =>
                    setWinnerSeatIndex(isWinner ? null : (idx as SeatIndex))
                  }
                  className={`justify-self-center p-2`}
                >
                  <FontAwesomeIcon
                    icon={isWinner ? faStarSolid : faStarRegular}
                    className={isWinner ? "opacity-100" : "opacity-60"}
                  />
                </button>
                {/* East selector: compass */}
                <button
                  type="button"
                  aria-label={isEast ? `${p} is East` : `Set ${p} as East`}
                  onClick={() =>
                    setEastSeatIndex(isEast ? null : (idx as SeatIndex))
                  }
                  className={`justify-self-center p-2`}
                >
                  <FontAwesomeIcon
                    icon={isEast ? faCompassSolid : faCompassRegular}
                    className={isEast ? "opacity-100" : "opacity-60"}
                  />
                </button>
              </div>
            );
          })}
          <input
            className="w-full border rounded-2xl px-3 py-2 text-base md:text-sm"
            placeholder="Note (optional): e.g., Self-draw All Pungs"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            className="w-full rounded-2xl bg-black text-white py-3 disabled:opacity-50"
            disabled={winnerSeatIndex === null || eastSeatIndex === null}
            onClick={onAddHand}
          >
            Add Hand
          </button>
          <p className="text-xs text-neutral-500 -mt-2">
            Pick exactly one <b>winner</b> ({" "}
            {<FontAwesomeIcon icon={faStarSolid} />}) and one <b>east</b> ({" "}
            {<FontAwesomeIcon icon={faCompassSolid} />}) each hand. Icons turn
            solid when selected.
          </p>
        </div>
      </div>

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
                  {total > 0 ? "+" : ""}
                  {total}
                </span>
              </div>
            ))}
          </div>
        </div>
        {session.hands.toReversed().map((h, idx) => (
          <div key={h.id} className="rounded-2xl border bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-500">Hand #{session.hands.length - idx}</div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800">
                  Winner: {PLAYERS[h.winnerSeatIndex]}
                </span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-sky-100 text-sky-800">
                  East: {PLAYERS[h.eastSeatIndex]}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              {PLAYERS.map((p) => (
                <div
                  key={p}
                  className="grid grid-cols-3 items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2"
                >
                  <span className="truncate">{p}</span>
                  <span className="font-mono text-right">
                    {h.scores?.[p] ?? 0}
                  </span>
                  <span
                    className={`font-mono text-right text-xs ${
                      (h.deltas[p] ?? 0) >= 0
                        ? "text-green-700"
                        : "text-rose-700"
                    }`}
                  >
                    {(h.deltas[p] ?? 0) > 0 ? "+" : ""}
                    {h.deltas[p] ?? 0}
                  </span>
                </div>
              ))}
            </div>

            {h.note && (
              <div className="mt-2 text-xs text-neutral-600">{h.note}</div>
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
              {PLAYERS.map((p) => (
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
              {PLAYERS.map((p) => (
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
            {session.hands.map((h, idx) => (
              <tr key={h.id} className="border-b last:border-0">
                <td className="p-2 align-top">{idx + 1}</td>
                {PLAYERS.map((p) => (
                  <Fragment key={p}>
                    <td className="p-2 text-right font-mono align-top">
                      {h.scores?.[p] ?? 0}
                    </td>
                    <td
                      className={`p-2 text-right font-mono align-top text-xs ${
                        (h.deltas[p] ?? 0) >= 0
                          ? "text-green-700"
                          : "text-rose-700"
                      }`}
                    >
                      {(h.deltas[p] ?? 0) > 0 ? "+" : ""}
                      {h.deltas[p] ?? 0}
                    </td>
                  </Fragment>
                ))}
                <td className="p-2 align-top">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800">
                    {PLAYERS[h.winnerSeatIndex]}
                  </span>
                </td>
                <td className="p-2 align-top">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-sky-100 text-sky-800">
                    {PLAYERS[h.eastSeatIndex]}
                  </span>
                </td>
                <td className="p-2 align-top">
                  <button
                    className="text-xs text-red-600"
                    onClick={() => deleteHand(session.id, h.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-50 font-medium">
              <td className="p-2">Totals</td>
              {PLAYERS.map((p) => (
                <Fragment key={p}>
                  {/* empty score cell in totals */}
                  <td className="p-2"></td>
                  <td
                    className={`p-2 text-right font-mono ${
                      totals[p] < 0 ? "text-rose-700" : "text-green-700"
                    }`}
                  >
                    {totals[p]}
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
      {/* <div className="rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="p-2 text-left">#</th>
              {PLAYERS.map((p) => (
                <th key={p} className="p-2 text-right">
                  {p}
                </th>
              ))}
              <th className="p-2 text-left">Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {session.hands.map((h, idx) => (
              <tr key={h.id} className="border-b last:border-0">
                <td className="p-2 align-top">{idx + 1}</td>
                {PLAYERS.map((p) => (
                  <td key={p} className="p-2 text-right font-mono align-top">
                    {h.deltas[p] > 0 ? "+" : ""}
                    {h.deltas[p]}
                  </td>
                ))}
                <td className="p-2 align-top text-neutral-600">{h.note}</td>
                <td className="p-2 align-top">
                  <button
                    className="text-xs text-red-600"
                    onClick={() => deleteHand(session.id, h.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-50 font-medium">
              <td className="p-2">Totals</td>
              {PLAYERS.map((p) => (
                <td key={p} className="p-2 text-right font-mono">
                  {totals[p] > 0 ? "+" : ""}
                  {totals[p]}
                </td>
              ))}
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div> */}
    </div>
  );
}
