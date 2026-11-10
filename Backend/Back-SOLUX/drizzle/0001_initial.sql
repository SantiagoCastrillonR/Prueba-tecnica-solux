CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" "citext" NOT NULL,
	"name" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "chats" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"is_group" boolean DEFAULT false NOT NULL,
	"direct_key" varchar(73),
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chats_direct_key_unique" UNIQUE("direct_key"),
	CONSTRAINT "chats_kind_check" CHECK (("chats"."is_group" and "chats"."direct_key" is null) or (not "chats"."is_group" and "chats"."direct_key" is not null and "chats"."name" is null))
);

CREATE TABLE "chat_participants" (
	"chat_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chat_participants_chat_id_user_id_pk" PRIMARY KEY("chat_id","user_id")
);

CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"chat_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"client_id" varchar(64) NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "messages_sender_client_id_unique" UNIQUE("sender_id","client_id"),
	CONSTRAINT "messages_body_length_check" CHECK (char_length("messages"."body") between 1 and 2000)
);

ALTER TABLE "chats" ADD CONSTRAINT "chats_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_participant_fk" FOREIGN KEY ("chat_id","sender_id") REFERENCES "public"."chat_participants"("chat_id","user_id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "chat_participants_user_id_idx" ON "chat_participants" USING btree ("user_id");
CREATE INDEX "messages_chat_created_idx" ON "messages" USING btree ("chat_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);