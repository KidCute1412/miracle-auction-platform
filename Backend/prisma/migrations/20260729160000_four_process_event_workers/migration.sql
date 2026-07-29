-- Additive four-process event worker migration. Legacy columns and tables are
-- intentionally retained so the previous backend can be restored safely.
ALTER TABLE auction_outbox
  ADD COLUMN IF NOT EXISTS terminal_at timestamptz;

CREATE INDEX IF NOT EXISTS auction_outbox_relay_pending_idx
  ON auction_outbox(available_at, id)
  WHERE delivered_at IS NULL AND terminal_at IS NULL;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS auction_notification_enqueued_at timestamptz;

CREATE TABLE IF NOT EXISTS notification_event_receipts (
  event_id uuid PRIMARY KEY,
  topic varchar(100) NOT NULL,
  event_type varchar(100) NOT NULL,
  event_version integer NOT NULL CHECK (event_version > 0),
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

CREATE INDEX IF NOT EXISTS notification_event_receipts_status_idx
  ON notification_event_receipts(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS email_deliveries (
  id bigserial PRIMARY KEY,
  source_event_id uuid NOT NULL,
  recipient_key varchar(160) NOT NULL,
  recipient_email varchar(320) NOT NULL,
  template_key varchar(100) NOT NULL,
  subject varchar(500) NOT NULL,
  html_body text NOT NULL,
  text_body text NOT NULL,
  message_id varchar(255) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'leased', 'sent', 'terminal')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  available_at timestamptz NOT NULL DEFAULT now(),
  lease_until timestamptz,
  last_error text,
  sent_at timestamptz,
  terminal_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_deliveries_event_recipient_template_unique
    UNIQUE (source_event_id, recipient_key, template_key),
  CONSTRAINT email_deliveries_message_id_unique UNIQUE (message_id)
);

CREATE INDEX IF NOT EXISTS email_deliveries_pending_idx
  ON email_deliveries(available_at, lease_until, id)
  WHERE status IN ('pending', 'leased');
