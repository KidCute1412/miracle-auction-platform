-- Manual payment-verification workflow. Existing completed orders used the
-- legacy name "finished" and are preserved as payment_verified.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rejection_reason varchar(500);
UPDATE orders SET order_status = 'pending' WHERE order_status IS NULL;
UPDATE orders SET order_status = 'payment_verified' WHERE order_status = 'finished';
ALTER TABLE orders ALTER COLUMN order_status SET DEFAULT 'pending';
ALTER TABLE orders ALTER COLUMN order_status SET NOT NULL;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_check') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_status_check
      CHECK (order_status IN ('pending', 'payment_verified', 'rejected'));
  END IF;
END $$;
