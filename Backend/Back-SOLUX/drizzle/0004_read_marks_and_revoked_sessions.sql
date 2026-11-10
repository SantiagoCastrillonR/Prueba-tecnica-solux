CREATE TABLE "revoked_sessions" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE "chat_participants" ADD COLUMN "last_read_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "revoked_sessions_expires_at_idx" ON "revoked_sessions" USING btree ("expires_at");