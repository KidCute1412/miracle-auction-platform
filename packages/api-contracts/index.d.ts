/**
 * Public API types only.  Keep this package free of Express, Joi and database
 * imports so browser code can consume it without pulling server dependencies.
 */
export type LegacySuccessStatus = "success";
export type LegacyErrorStatus = "error";

export interface LegacyStatusSuccess { status: LegacySuccessStatus; }
export interface LegacyStatusError { status: LegacyErrorStatus; message: string; }
export interface LegacyMessageError { message: string; }

export interface BidRequest {
  product_id: number;
  max_price: number;
  /** @deprecated Kept for clients released before max_price became canonical. */
  bid_price?: number;
}
export interface BuyNowRequest { product_id: number; buy_price: number; }
export interface BidHistoryQuery { product_id: number; }
export interface BanBidderRequest { product_id: number; banned_user_id: number; reason: string; }

export interface BidHistoryItem {
  bidding_id: number;
  user_id: number;
  product_id: number;
  max_price: number;
  product_price: number;
  price_owner_id: number;
  created_at: string;
  username: string;
  price_owner_username: string;
}
export interface BidSuccessResponse extends LegacyStatusSuccess {}
export interface BuyNowSuccessResponse extends LegacyStatusSuccess { order_id: number | string; end_time: string; }
export interface BidHistoryResponse extends LegacyStatusSuccess { data: BidHistoryItem[]; isSeller: boolean; }
export interface BanBidderResponse extends LegacyStatusSuccess { data: unknown; }
export type BidSocketEvent = { data: unknown };

export interface PaginationQuery { page?: number; limit?: number; }
export interface ApiClientErrorBody { message?: string; status?: LegacyErrorStatus; code?: string; [key: string]: unknown; }
