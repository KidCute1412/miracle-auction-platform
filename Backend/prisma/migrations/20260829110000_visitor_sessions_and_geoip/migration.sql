CREATE TABLE "visitor_sessions" (
    "session_id" UUID NOT NULL,
    "visitor_id" UUID NOT NULL,
    "user_id" INTEGER,
    "ip_address" VARCHAR(45) NOT NULL,
    "first_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "landing_path" VARCHAR(2048) NOT NULL,
    "exit_path" VARCHAR(2048) NOT NULL,
    "referrer" VARCHAR(2048),
    "page_view_count" INTEGER NOT NULL DEFAULT 0,
    "event_count" INTEGER NOT NULL DEFAULT 0,
    "duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "country_code" VARCHAR(8), "country_name" VARCHAR(100),
    "region" VARCHAR(100), "region_code" VARCHAR(20), "city" VARCHAR(100), "postal_code" VARCHAR(32),
    "latitude" DECIMAL(9,6), "longitude" DECIMAL(9,6), "geo_timezone" VARCHAR(100),
    "geo_status" VARCHAR(24) NOT NULL DEFAULT 'pending', "geo_source" VARCHAR(32), "geo_checked_at" TIMESTAMPTZ(6),
    "asn" VARCHAR(32), "isp_name" VARCHAR(200), "isp_domain" VARCHAR(200), "network_type" VARCHAR(40),
    "is_anonymous" BOOLEAN, "is_anycast" BOOLEAN, "is_hosting" BOOLEAN, "is_mobile" BOOLEAN, "is_satellite" BOOLEAN,
    "timezone" VARCHAR(100), "language" VARCHAR(50), "user_agent" VARCHAR(1000),
    "browser" VARCHAR(100), "operating_system" VARCHAR(100), "device_type" VARCHAR(40),
    "screen_width" INTEGER, "screen_height" INTEGER,
    CONSTRAINT "visitor_sessions_pkey" PRIMARY KEY ("session_id"),
    CONSTRAINT "visitor_sessions_counts_check" CHECK ("page_view_count" >= 0 AND "event_count" >= 0 AND "duration_seconds" >= 0),
    CONSTRAINT "visitor_sessions_geo_status_check" CHECK ("geo_status" IN ('pending', 'resolved', 'unavailable', 'private'))
);

ALTER TABLE "visitor_events" ADD COLUMN "session_id" UUID DEFAULT gen_random_uuid();
ALTER TABLE "visitor_events" ADD COLUMN "metadata" JSONB NOT NULL DEFAULT '{}';

INSERT INTO "visitor_sessions" (
    "session_id", "visitor_id", "user_id", "ip_address", "first_seen_at", "last_seen_at",
    "landing_path", "exit_path", "referrer", "page_view_count", "event_count",
    "country_code", "country_name", "region", "city", "timezone", "language", "user_agent",
    "screen_width", "screen_height", "geo_status", "geo_source", "geo_checked_at"
)
SELECT "session_id", "visitor_id", "user_id", "ip_address", "created_at", "created_at",
       "path", "path", "referrer", CASE WHEN "event_type" = 'page_view' THEN 1 ELSE 0 END, 1,
       "country_code", "country_name", "region", "city", "timezone", "language", "user_agent",
       "screen_width", "screen_height",
       CASE WHEN "country_code" IS NULL THEN 'unavailable' ELSE 'resolved' END,
       CASE WHEN "country_code" IS NULL THEN NULL ELSE 'legacy_headers' END, "created_at"
FROM "visitor_events";

ALTER TABLE "visitor_events" ALTER COLUMN "session_id" DROP DEFAULT;
ALTER TABLE "visitor_events" ALTER COLUMN "session_id" SET NOT NULL;
ALTER TABLE "visitor_events" ADD CONSTRAINT "visitor_events_session_id_fkey"
    FOREIGN KEY ("session_id") REFERENCES "visitor_sessions"("session_id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "visitor_sessions" ADD CONSTRAINT "visitor_sessions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

CREATE INDEX "visitor_events_session_idx" ON "visitor_events"("session_id", "created_at", "id");
CREATE INDEX "visitor_sessions_last_seen_idx" ON "visitor_sessions"("last_seen_at", "session_id");
CREATE INDEX "visitor_sessions_visitor_idx" ON "visitor_sessions"("visitor_id", "last_seen_at");
CREATE INDEX "visitor_sessions_user_idx" ON "visitor_sessions"("user_id", "last_seen_at");
CREATE INDEX "visitor_sessions_location_idx" ON "visitor_sessions"("country_code", "region", "city", "last_seen_at");
CREATE INDEX "visitor_sessions_ip_idx" ON "visitor_sessions"("ip_address", "last_seen_at");
