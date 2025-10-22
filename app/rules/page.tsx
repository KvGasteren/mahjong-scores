import { SCORING_TABLE } from '@/constants/scoring'

export default function RulesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">House Rules — Scoring Table</h1>
      <p className="text-sm text-neutral-600">Edit values in <code>constants/scoring.ts</code>. This view is read-only for players.</p>
      <div className="bg-white rounded-2xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="text-left p-3">Item</th>
              <th className="text-right p-3">Points</th>
            </tr>
          </thead>
          <tbody>
            {SCORING_TABLE.map(it => (
              <tr key={it.id} className="border-b last:border-0">
                <td className="p-3">{it.label}</td>
                <td className="p-3 text-right font-mono">{it.points>0?'+':''}{it.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
