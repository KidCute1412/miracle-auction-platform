CREATE TABLE auction_authority_recovery (
  id integer PRIMARY KEY CHECK (id = 1),
  generation uuid NOT NULL,
  recovery_epoch bigint NOT NULL DEFAULT 0,
  state varchar(32) NOT NULL DEFAULT 'READY',
  owner_id varchar(160),
  lease_until timestamptz,
  last_redis_healthy_at timestamptz NOT NULL DEFAULT now(),
  recovery_started_at timestamptz,
  recovery_completed_at timestamptz,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO auction_authority_recovery (id, generation) VALUES (1, gen_random_uuid());

CREATE TABLE auction_authority_recovery_runs (
  run_id uuid PRIMARY KEY,
  recovery_epoch bigint NOT NULL,
  trigger varchar(32) NOT NULL,
  status varchar(32) NOT NULL,
  source varchar(32) NOT NULL DEFAULT 'POSTGRESQL',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  recovered_auctions integer NOT NULL DEFAULT 0,
  extension_seconds integer NOT NULL DEFAULT 0,
  error text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX auction_authority_recovery_runs_epoch_unique
  ON auction_authority_recovery_runs(recovery_epoch);

ALTER TABLE products
  ADD COLUMN last_authority_recovery_epoch bigint NOT NULL DEFAULT 0;
