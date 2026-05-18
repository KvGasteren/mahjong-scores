import "./globals.css";
import Link from "next/link";
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import Image from "next/image";
import { auth, signOut } from "@/auth";
config.autoAddCss = false

export const metadata = { title: 'Mahjong Scores' }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
          <nav className="container mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image
                src="/navbar.png"
                alt="Mahjong Scores"
                width={48}
                height={48}
                className="rounded-sm"
                priority
              />
              <span>Mahjong Scores</span>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/sessions">Sessions</Link>
              <Link href="/rules">Rules</Link>
              {session?.user && (
                <div className="flex items-center gap-3">
                  {session.user.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  )}
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/login" });
                    }}
                  >
                    <button type="submit" className="text-neutral-500 hover:text-neutral-800">
                      Sign out
                    </button>
                  </form>
                </div>
              )}
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