CREATE EXTENSION IF NOT EXISTS pg_trgm;

DROP INDEX IF EXISTS products_fts;

ALTER TABLE products
  DROP COLUMN fts,
  ADD COLUMN fts tsvector GENERATED ALWAYS AS (
    setweight(
      to_tsvector('simple'::regconfig, remove_accents(COALESCE(product_name, ''))),
      'A'
    )
    ||
    setweight(
      to_tsvector('simple'::regconfig, remove_accents(COALESCE(description, ''))),
      'B'
    )
  ) STORED;

CREATE INDEX products_fts
  ON products
  USING gin (fts);

CREATE INDEX products_name_trgm
  ON products
  USING gin (remove_accents(COALESCE(product_name, '')) gin_trgm_ops)
  WHERE is_removed = false;
