export const BENCHMARK_START_PRICE = 100_000n;
export const BENCHMARK_STEP_PRICE = 10_000n;
export const BENCHMARK_SELLER_ID = 900000n;

export function benchmarkAuctionResetData(now: Date) {
  return {
    seller_id: BENCHMARK_SELLER_ID,
    start_price: BENCHMARK_START_PRICE,
    current_price: BENCHMARK_START_PRICE,
    step_price: BENCHMARK_STEP_PRICE,
    buy_now_price: null,
    price_owner_id: null,
    bid_turns: 0n,
    start_time: new Date(now.getTime() - 60_000),
    end_time: new Date(now.getTime() + 60 * 60_000),
    cat2_id: null,
    description: null,
    product_images: [],
    is_removed: false,
    auto_extended: false,
    edited_at: null,
    auction_status: "ACTIVE",
    auction_version: 0n,
    auction_sequence: 0n,
    auction_end_email_sent: false,
    auction_notification_enqueued_at: null,
  };
}
