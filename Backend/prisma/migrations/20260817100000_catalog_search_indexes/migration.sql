-- The public catalog always excludes removed products.  These partial indexes
-- match its category filters and supported sort orders without indexing rows
-- that can never be returned.
CREATE INDEX products_catalog_end_time_idx
  ON products (end_time ASC)
  WHERE is_removed = false;

CREATE INDEX products_catalog_category_end_time_idx
  ON products (cat2_id, end_time ASC)
  WHERE is_removed = false;

CREATE INDEX products_catalog_current_price_idx
  ON products (current_price ASC)
  WHERE is_removed = false;

CREATE INDEX products_catalog_category_current_price_idx
  ON products (cat2_id, current_price ASC)
  WHERE is_removed = false;

CREATE INDEX products_catalog_created_at_idx
  ON products (created_at DESC)
  WHERE is_removed = false;

CREATE INDEX products_catalog_bid_turns_idx
  ON products ((COALESCE(bid_turns, 0)) DESC)
  WHERE is_removed = false;
