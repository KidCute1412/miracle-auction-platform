-- Additive analytics pipeline migration. Nullable business columns preserve
-- compatibility with the previous backend during a rolling deployment.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS amount_vnd bigint,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

UPDATE orders o
SET amount_vnd = p.current_price
FROM products p
WHERE o.product_id = p.product_id AND o.amount_vnd IS NULL;

UPDATE orders
SET completed_at = created_at
WHERE order_status = 'finished' AND completed_at IS NULL;

ALTER TABLE auction_outbox
  ADD COLUMN IF NOT EXISTS topic varchar(100) NOT NULL DEFAULT 'bidding_events',
  ADD COLUMN IF NOT EXISTS correlation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS causation_id uuid,
  ADD COLUMN IF NOT EXISTS occurred_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE dashboard_stats
  ADD COLUMN IF NOT EXISTS version bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refresh_duration_ms integer,
  ADD COLUMN IF NOT EXISTS source_event_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reason varchar(100);

ALTER TABLE dashboard_stats
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

CREATE TABLE IF NOT EXISTS dashboard_event_receipts (
  event_id uuid PRIMARY KEY,
  topic varchar(100) NOT NULL,
  event_type varchar(100) NOT NULL,
  event_version integer NOT NULL,
  aggregate_id varchar(64) NOT NULL,
  correlation_id uuid NOT NULL,
  payload jsonb NOT NULL,
  status varchar(20) NOT NULL CHECK (status IN ('retrying', 'processed', 'terminal')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  partition integer,
  "offset" varchar(32),
  processed_at timestamptz,
  terminal_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dashboard_event_receipts_status_idx
  ON dashboard_event_receipts(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id bigserial PRIMARY KEY,
  actor_id integer REFERENCES users(user_id) ON DELETE SET NULL,
  action varchar(100) NOT NULL,
  resource_type varchar(100) NOT NULL,
  resource_id varchar(100),
  result varchar(20) NOT NULL CHECK (result IN ('success', 'failed', 'denied')),
  error_code varchar(100),
  correlation_id uuid NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_audit_logs_created_idx
  ON admin_audit_logs(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS admin_audit_logs_filter_idx
  ON admin_audit_logs(actor_id, action, result);

CREATE INDEX IF NOT EXISTS auction_outbox_topic_pending_idx
  ON auction_outbox(topic, available_at, id) WHERE delivered_at IS NULL;
