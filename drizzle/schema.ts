import { pgTable, uuid, varchar, timestamp, jsonb, integer, date } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  // array of player names in seat order (index 0..3)
  players: jsonb("players").$type<string[]>().notNull(),
  // store YYYY-MM-DD as a date (no time) for the play date
  playDate: date("play_date").notNull(),
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
