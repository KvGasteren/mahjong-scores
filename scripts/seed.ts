// dotenv must be configured before any other import that reads process.env.
// Static imports are hoisted and evaluated before code runs, so we use
// dynamic imports for the db and schema modules below.
import { config } from 'dotenv'
config({ path: '.env.local' })

/**
 * One-time seed script. Run after all group members have logged in at least once.
 * Safe to re-run — all operations are idempotent.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * What it does:
 *   1. Marks SUPERADMIN_EMAIL as superadmin
 *   2. Creates the group if it doesn't exist
 *   3. Adds the superadmin to the group as admin
 *   4. Seeds group_members rows (4 fixed seats) for the initial group
 *   5. Backfills groupId and createdBy on all existing sessions
 *   6. Backfills sessionPlayers rows for all sessions
 *
 * After running:
 *   - Other group members can be added via the group management UI (Phase 4)
 *   - Players can claim their session seats via the claiming UI (Phase 4)
 */

const GROUP_NAME = 'Mahjong Group'
const SUPERADMIN_EMAIL = 'gasteren@gmail.com'

async function seed() {
  // Dynamic imports so these modules load after dotenv has populated process.env
  const { db } = await import('../lib/db')
  const { groups, groupMemberships, groupMembers, sessions, sessionPlayers, users } = await import('../drizzle/schema')
  const { eq, isNull } = await import('drizzle-orm')

  // The 4 fixed player names for the initial group, in seat order
  // Seat index matches the order in sessions.players for historical sessions
  const GROUP_SEATS: { seatIndex: number; name: string; email: string | null }[] = [
    { seatIndex: 0, name: 'Sara',      email: null },
    { seatIndex: 1, name: 'Jozefien', email: null },
    { seatIndex: 2, name: 'Bep',       email: null },
    { seatIndex: 3, name: 'Koen',      email: SUPERADMIN_EMAIL },
  ]

  console.log('Starting seed...\n')

  // ── Step 1: Find the superadmin user ────────────────────────────────────────
  // The user must have logged in at least once for their row to exist.
  const [superadmin] = await db.select().from(users).where(eq(users.email, SUPERADMIN_EMAIL))
  if (!superadmin) {
    console.error(`No user found with email "${SUPERADMIN_EMAIL}".`)
    console.error('Log in to the app at least once first, then re-run this script.')
    process.exit(1)
  }
  console.log(`Found user: ${superadmin.name} (${superadmin.email})`)

  // ── Step 2: Set isSuperAdmin ─────────────────────────────────────────────────
  await db.update(users).set({ isSuperAdmin: true }).where(eq(users.id, superadmin.id))
  console.log(`✓ Marked ${superadmin.name} as superadmin`)

  // ── Step 3: Create the group (idempotent) ────────────────────────────────────
  const existing = await db.select().from(groups).where(eq(groups.name, GROUP_NAME))
  let group = existing[0]
  if (!group) {
    ;[group] = await db.insert(groups).values({ name: GROUP_NAME }).returning()
    console.log(`✓ Created group "${GROUP_NAME}"`)
  } else {
    console.log(`✓ Group "${GROUP_NAME}" already exists`)
  }

  // ── Step 4: Add superadmin to the group as admin ─────────────────────────────
  await db
    .insert(groupMemberships)
    .values({ userId: superadmin.id, groupId: group.id, role: 'admin' })
    .onConflictDoNothing()
  console.log(`✓ Added ${superadmin.name} to group as admin`)

  // ── Step 5: Seed group_members (4 fixed seats) ───────────────────────────────
  for (const seat of GROUP_SEATS) {
    const linkedUser = seat.email
      ? (await db.select().from(users).where(eq(users.email, seat.email)))[0] ?? null
      : null
    await db
      .insert(groupMembers)
      .values({ groupId: group.id, seatIndex: seat.seatIndex, name: seat.name, userId: linkedUser?.id ?? null })
      .onConflictDoNothing()
  }
  console.log(`✓ Seeded group_members (4 seats)`)

  // ── Step 6: Backfill groupId and createdBy on all sessions without one ──────
  await db.update(sessions)
    .set({ groupId: group.id, createdBy: superadmin.id })
    .where(isNull(sessions.groupId))
  console.log(`✓ Backfilled groupId and createdBy on existing sessions`)

  // ── Step 7: Backfill sessionPlayers for all sessions ─────────────────────────
  // Creates one row per seat (0–3) per session, with userId = null.
  // Players can claim their seats later via the UI.
  const allSessions = await db.select({ id: sessions.id, players: sessions.players }).from(sessions)
  let rowsAdded = 0
  for (const session of allSessions) {
    for (let seatIndex = 0; seatIndex < session.players.length; seatIndex++) {
      await db
        .insert(sessionPlayers)
        .values({ sessionId: session.id, userId: null, seatIndex })
        .onConflictDoNothing()
      rowsAdded++
    }
  }
  console.log(`✓ Backfilled ${rowsAdded} sessionPlayers rows (all unclaimed)`)

  console.log('\nSeed completed successfully.')
  console.log('\nNext steps:')
  console.log('  - Add other group members via the group management UI (coming in Phase 4)')
  console.log('  - Players can claim their session seats via the claiming UI (coming in Phase 4)')
}

seed().catch((err) => {
  console.error('\nSeed failed:', err)
  process.exit(1)
})
