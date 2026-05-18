CREATE TABLE "group_members" (
	"group_id" uuid NOT NULL,
	"seat_index" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"user_id" text,
	CONSTRAINT "group_members_group_id_seat_index_pk" PRIMARY KEY("group_id","seat_index")
);
--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;