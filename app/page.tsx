import Link from 'next/link'

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mahjong Scores</h1>
      <div className="grid gap-3">
        <Link href="/sessions" className="rounded-2xl border p-4">View Sessions</Link>
        <Link href="/rules" className="rounded-2xl border p-4">View Scoring Table</Link>
      </div>
    </div>
  )
}