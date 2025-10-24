CREATE TABLE IF NOT EXISTS "hands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"index" integer NOT NULL,
	"base_scores" jsonb NOT NULL,
	"doubles" jsonb NOT NULL,
	"winner_name" varchar(255) NOT NULL,
	"east_name" varchar(255) NOT NULL,
	"final_scores" jsonb NOT NULL,
	"deltas" jsonb NOT NULL,
	"hand_note" varchar(2000),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"players" jsonb NOT NULL,
	"play_date" date NOT NULL,
	"picture_url" varchar(2048),
	"session_note" varchar(4000),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.conname = 'hands_session_id_sessions_id_fk'
      AND n.nspname = 'public'         -- schema of the table
  ) THEN
    ALTER TABLE public.hands
      ADD CONSTRAINT hands_session_id_sessions_id_fk
      FOREIGN KEY (session_id)
      REFERENCES public.sessions(id)
      ON DELETE CASCADE
      ON UPDATE NO ACTION;
  END IF;
END $$;
