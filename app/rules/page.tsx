import { basePoints, doublesAll, doublesWinner, irregularLimits, notes, regularLimits } from "@/constants/scoring";

export default function RulesPage() {
  // === DATA from NMB NTS booklet (pages 22–23) ===
  

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">NTS Puntentelling — tabellen</h1>
        <p className="text-sm text-neutral-600">Overzicht uit het NMB NTS spelregelboekje (p. 22–23). Taal/namen volgen voorlopig het boekje.</p>
      </header>

      {/* Basispunten */}
      <section className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-4 pt-4">
          <h2 className="text-lg font-medium">Basispunten</h2>
          <p className="text-xs text-neutral-500 mb-2">Pungs/kongs en overige vaste punten</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr className="border-b">
                <th className="p-2 text-left">Combinatie</th>
                <th className="p-2 text-right">Pung (open)</th>
                <th className="p-2 text-right">Pung (dicht)</th>
                <th className="p-2 text-right">Kong (open)</th>
                <th className="p-2 text-right">Kong (dicht)</th>
              </tr>
            </thead>
            <tbody>
              {basePoints.pungKong.map((r) => (
                <tr key={r.combo} className="border-b last:border-0">
                  <td className="p-2">{r.combo}</td>
                  <td className="p-2 text-right font-mono">{r.pungOpen}</td>
                  <td className="p-2 text-right font-mono">{r.pungClosed}</td>
                  <td className="p-2 text-right font-mono">{r.kongOpen}</td>
                  <td className="p-2 text-right font-mono">{r.kongClosed}</td>
                </tr>
              ))}
              {basePoints.singles.map((s) => (
                <tr key={s.label} className="border-b last:border-0">
                  <td className="p-2">{s.label}</td>
                  <td className="p-2 text-right font-mono" colSpan={4}>
                    {s.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Onregelmatige limietspelen */}
      <section className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-4 pt-4">
          <h2 className="text-lg font-medium">Onregelmatige limietspelen</h2>
          <p className="text-xs text-neutral-500 mb-2">Gesloten spelen; wachtend spel = helft van punten.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr className="border-b">
                <th className="p-2 text-left">Benaming</th>
                <th className="p-2 text-left">Omschrijving</th>
                <th className="p-2 text-right">Punten</th>
              </tr>
            </thead>
            <tbody>
              {irregularLimits.map((r) => (
                <tr key={r.name} className="border-b last:border-0">
                  <td className="p-2 align-top">{r.name}</td>
                  <td className="p-2 align-top text-neutral-700">{r.description}</td>
                  <td className="p-2 text-right font-mono align-top">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Regelmatige limietspelen */}
      <section className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-4 pt-4">
          <h2 className="text-lg font-medium">Regelmatige limietspelen</h2>
          <p className="text-xs text-neutral-500 mb-2">Mogen open gespeeld worden; bij andermans mahjong normale telling.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr className="border-b">
                <th className="p-2 text-left">Benaming</th>
                <th className="p-2 text-left">Omschrijving</th>
                <th className="p-2 text-right">Punten</th>
              </tr>
            </thead>
            <tbody>
              {regularLimits.map((r) => (
                <tr key={r.name} className="border-b last:border-0">
                  <td className="p-2 align-top">{r.name}</td>
                  <td className="p-2 align-top text-neutral-700">{r.description}</td>
                  <td className="p-2 text-right font-mono align-top">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Verdubbelingen — winnaar */}
      <section className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-4 pt-4">
          <h2 className="text-lg font-medium">Verdubbelingen — alleen voor de winnaar</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr className="border-b">
                <th className="p-2 text-left">Benaming</th>
                <th className="p-2 text-left">Omschrijving</th>
                <th className="p-2 text-right">×</th>
              </tr>
            </thead>
            <tbody>
              {doublesWinner.map((d) => (
                <tr key={d.name} className="border-b last:border-0">
                  <td className="p-2 align-top">{d.name}</td>
                  <td className="p-2 align-top text-neutral-700">{d.description}</td>
                  <td className="p-2 text-right font-mono align-top">{d.x}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Verdubbelingen — alle spelers */}
      <section className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-4 pt-4">
          <h2 className="text-lg font-medium">Verdubbelingen — voor alle spelers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr className="border-b">
                <th className="p-2 text-left">Benaming</th>
                <th className="p-2 text-right">×</th>
              </tr>
            </thead>
            <tbody>
              {doublesAll.map((d, i) => (
                <tr key={`${d.name}-${i}`} className="border-b last:border-0">
                  <td className="p-2 align-top">{d.name}{d.note ? <sup className="ml-1 text-xs">{d.note}</sup> : null}</td>
                  <td className="p-2 text-right font-mono align-top">{d.x}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4 text-xs text-neutral-500 space-y-1">
          {Object.entries(notes).map(([n, text]) => (
            <div key={n}><sup>{n}</sup> {text}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
