# Frontend-consumed route contracts

This registry records the compatibility boundary. Existing URLs and legacy
response envelopes are intentional and must not be standardized without a
versioned API change. The inventory below is derived from the mounted
client/admin routers; module tests must add a success and failure scenario for
each entry.

## Bids

| Method | Path | Auth | Request/query | Success response | Expected failures |
| --- | --- | --- | --- | --- | --- |
| POST | `/bids` | authenticated | `BidRequest` (`bid_price` accepted but deprecated) | `{ status: "success" }` | 400, 401, 403, 500 `{ status: "error", message }` |
| GET | `/bids?product_id=` | authenticated | `BidHistoryQuery` | `{ status: "success", data, isSeller }` | 400, 401, 500 |
| POST | `/bids/purchase` | authenticated | `BuyNowRequest` | `{ status: "success", order_id, end_time }` | 400, 401, 403, 500 |
| POST | `/bids/bans` | authenticated | `BanBidderRequest` | `{ status: "success", data }` | 400, 401, 500 |

## Accounts

| Method | Path | Auth | Request/query | Expected failures |
| --- | --- | --- | --- | --- |
| GET | `/accounts/csrf`, `/accounts/verification` | public | cookie/query | 400, 500 |
| POST | `/accounts`, `/accounts/registration/verification` | public | registration/OTP body | 400, 409, 500 |
| POST | `/accounts/sessions`, `/accounts/sessions/google`, `/accounts/sessions/refresh` | public | credentials/OAuth/refresh cookie | 400, 401, 429, 500 |
| DELETE | `/accounts/sessions` | public | refresh cookie | 401, 500 |
| POST | `/accounts/password/recovery`, `/accounts/password/verification` | public/authenticated | email/OTP body | 400, 401, 429, 500 |
| PATCH/PUT | `/accounts/password`, `/accounts/password/recovery/verification` | authenticated/public | password/OTP body | 400, 401, 500 |

## Client modules

| Method | Path family | Auth/role | Expected failures |
| --- | --- | --- | --- |
| GET | `/categories`, `/categories/level/1`, `/categories/level/2`, `/categories/level/2/:id` | public | 400, 404, 500 |
| GET | `/products`, `/products/search`, `/products/featured/*`, `/products/:id`, `/products/:id/questions`, `/products/:id/related` | public | 400, 404, 500 |
| GET | `/products/me`, `/products/:id/winner` | authenticated | 401, 403, 404, 500 |
| POST/PATCH | `/products`, `/products/:id/description` | seller/admin | 400, 401, 403, 404, 415, 500 |
| GET/POST | `/products/:id/likes`, `/products/:id/questions` | public/authenticated | 400, 401, 404, 500 |
| GET/PATCH | `/profiles/me`, `/profiles/:id` | authenticated/public | 400, 401, 404, 415, 500 |
| POST | `/users/seller-registrations`, `/users/ratings` | authenticated | 400, 401, 403, 409, 500 |
| GET | `/users/ratings`, `/users/ratings/count`, `/settings/auto-extend-time` | public | 400, 500 |
| POST/GET/PATCH | `/orders`, `/orders/seller`, `/orders/:id/rejection`, `/orders/:id/approval` | authenticated buyer/seller | 400, 401, 403, 404, 409, 415, 500 |

## Admin modules

All `/admin/*` entries require a valid admin session; tests must cover missing
token (401), non-admin (403), and an admin success response.

| Method | Path family |
| --- | --- |
| GET/POST | `/admin/dashboard`, `/admin/dashboard/sync` |
| GET/POST/PATCH/DELETE | `/admin/categories`, `/admin/categories/tree`, `/admin/categories/count`, `/admin/categories/creators`, `/admin/categories/:id/*` |
| GET/PATCH | `/admin/users`, `/admin/users/count`, `/admin/users/:id`, `/admin/users/:id/role`, `/admin/users/:id/password` |
| GET/PATCH | `/admin/seller-registrations`, `/admin/seller-registrations/count`, `/admin/seller-registrations/:id`, `/admin/seller-registrations/:id/status` |
| GET/PATCH/DELETE | `/admin/products`, `/admin/products/count`, `/admin/products/:id`, `/admin/products/:id/status`, `/admin/products/:id/restoration` |
