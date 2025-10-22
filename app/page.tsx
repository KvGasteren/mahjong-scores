import Link from 'next/link'

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mahjong Scorekeeper</h1>
      <p className="text-sm text-neutral-600">Prototype for Dutch house rules. Works offline; data in your browser.</p>
      <div className="grid gap-3">
        <Link href="/sessions" className="rounded-2xl border p-4">View Sessions</Link>
        <Link href="/rules" className="rounded-2xl border p-4">View Scoring Table</Link>
      </div>
    </div>
  )
}