# Frontend-consumed route contracts

This registry records the compatibility boundary. Existing URLs and legacy
response envelopes are intentional and must not be standardized without a
versioned API change.

| Method | Path | Auth | Request/query | Success response | Expected failures |
| --- | --- | --- | --- | --- | --- |
| POST | `/bids` | authenticated | `BidRequest` (`bid_price` accepted but deprecated) | `{ status: "success" }` | 400, 401, 403, 500 `{ status: "error", message }` |
| GET | `/bids?product_id=` | authenticated | `BidHistoryQuery` | `{ status: "success", data, isSeller }` | 400, 401, 500 |
| POST | `/bids/purchase` | authenticated | `BuyNowRequest` | `{ status: "success", order_id, end_time }` | 400, 401, 403, 500 |
| POST | `/bids/bans` | authenticated | `BanBidderRequest` | `{ status: "success", data }` | 400, 401, 500 |

The remaining frontend service URLs retain their current envelopes until their
module-specific refactor phase. Add each route here before changing its client.
