ALTER TABLE "session_players" DROP CONSTRAINT "session_players_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "session_players" DROP CONSTRAINT "session_players_session_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "session_players" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "session_players" ADD CONSTRAINT "session_players_session_id_seat_index_pk" PRIMARY KEY("session_id","seat_index");--> statement-breakpoint
ALTER TABLE "session_players" ADD CONSTRAINT "session_players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;