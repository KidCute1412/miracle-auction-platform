CREATE TABLE "visitor_events" (
    "id" BIGSERIAL NOT NULL,
    "visitor_id" UUID NOT NULL,
    "user_id" INTEGER,
    "event_type" VARCHAR(32) NOT NULL DEFAULT 'page_view',
    "path" VARCHAR(2048) NOT NULL,
    "page_title" VARCHAR(500),
    "referrer" VARCHAR(2048),
    "ip_address" VARCHAR(45) NOT NULL,
    "country_code" VARCHAR(8),
    "country_name" VARCHAR(100),
    "region" VARCHAR(100),
    "city" VARCHAR(100),
    "timezone" VARCHAR(100),
    "language" VARCHAR(50),
    "user_agent" VARCHAR(1000),
    "screen_width" INTEGER,
    "screen_height" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "visitor_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "visitor_events_screen_width_check" CHECK ("screen_width" IS NULL OR "screen_width" BETWEEN 1 AND 20000),
    CONSTRAINT "visitor_events_screen_height_check" CHECK ("screen_height" IS NULL OR "screen_height" BETWEEN 1 AND 20000)
);

ALTER TABLE "visitor_events"
ADD CONSTRAINT "visitor_events_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

CREATE INDEX "visitor_events_created_idx" ON "visitor_events"("created_at", "id");
CREATE INDEX "visitor_events_visitor_idx" ON "visitor_events"("visitor_id", "created_at");
CREATE INDEX "visitor_events_user_idx" ON "visitor_events"("user_id", "created_at");
CREATE INDEX "visitor_events_country_idx" ON "visitor_events"("country_code", "created_at");
