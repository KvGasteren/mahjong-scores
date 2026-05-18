import { pgTable, uuid, varchar, timestamp, jsonb, integer, date, boolean, text, primaryKey } from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ── Auth.js tables ────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })]
);

// Named authSessions to avoid collision with the game sessions table below
export const authSessions = pgTable("auth_sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ── Game tables ───────────────────────────────────────────────────────────────

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  // array of player names in seat order (index 0..3)
  players: jsonb("players").$type<string[]>().notNull(),
  // store YYYY-MM-DD as a date (no time) for the play date
  playDate: date("play_date").notNull(),
  finalized: boolean("finalized").notNull().default(false),
  // future fields (kept nullable for later):
  pictureUrl: varchar("picture_url", { length: 2048 }),
  sessionNote: varchar("session_note", { length: 4000 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const hands = pgTable("hands", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  index: integer("index").notNull(), // 0-based order within session

  // Inputs
  baseScores: jsonb("base_scores").$type<Record<string, number>>().notNull(),
  doubles: jsonb("doubles").$type<Record<string, number>>().notNull(),
  winnerName: varchar("winner_name", { length: 255 }).notNull(),
  eastName: varchar("east_name", { length: 255 }).notNull(),
  // computed for fast rendering
  finalScores: jsonb("final_scores").$type<Record<string, number>>().notNull(),
  deltas: jsonb("deltas").$type<Record<string, number>>().notNull(),
  // future:
  handNote: varchar("hand_note", { length: 2000 }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
