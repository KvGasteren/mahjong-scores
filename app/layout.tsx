import "./globals.css";
import Link from "next/link";
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

export const metadata = { title: 'Mahjong Scores' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
          <nav className="container mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold">Mahjong Scores</Link>
            <div className="flex gap-4 text-sm">
              <Link href="/sessions">Sessions</Link>
              <Link href="/rules">Rules</Link>
            </div>
          </nav>
        </header>

        {/* wider container on desktop, mobile still padded */}
        <main className="container mx-auto max-w-2xl px-4 py-4">
          {children}
        </main>
      </body>
    </html>
  )
}