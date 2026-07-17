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

// Accounts: legacy endpoints use `code`, not the Bids `status` envelope.
export type LegacyCode = "success" | "error" | "otp error" | "existedOTP";
export interface LegacyCodeResponse { code: LegacyCode; message: string; data?: null; role?: string; }
export interface RegisterAccountRequest { full_name: string; email: string; address?: string; password: string; agree?: boolean; }
export interface OtpRequest { email?: string; otp: string; }
export interface EmailRequest { email: string; }
export interface ResetPasswordRequest { email: string; password: string; }
export interface ChangePasswordRequest { currentPassword: string; newPassword: string; }
export interface LoginRequest { email: string; password: string; rememberPassword?: boolean; captchaToken: string; }
export interface GoogleLoginRequest { credential: string; rememberMe?: boolean; }

// Categories.
export type CategoryStatus = "active" | "inactive";
export interface CategoryNode { id: number; name: string; slug: string; children: CategoryNode[]; }
export interface CategoryEditItem { id: number; name: string; status: CategoryStatus; parent_id: number | null; description: string; }
export interface CategoryTreeResponse { code: "success"; message: string; tree: CategoryNode[]; }
export interface CategoryCreatorsResponse { code: "success"; message: string; list: string[]; }
export interface CategoryItemResponse { code: "success"; item: CategoryEditItem | null; }

// Dashboard.
export type DashboardRange = "7d" | "30d" | "3m" | "6m" | "1y";
export interface DashboardMetrics { gmv: number; activeUsers: number; activeAuctions: number; pendingVerifications: number; }
export interface DashboardChartPoint { month: string; count: string | number; }
export interface DashboardActivity { created_at: string; username: string; user: string; action: string; item: string; value: string | number; color: string; }
export interface DashboardSummary { metrics: DashboardMetrics; chartData: { overview: DashboardChartPoint[]; revenue: DashboardChartPoint[]; bids: DashboardChartPoint[] }; activities: DashboardActivity[]; }
export interface DashboardSummaryResponse { code: "success"; message: string; data: DashboardSummary; }

// Products and orders: legacy HTTP envelopes retained while their backend modules move to Prisma.
export interface ProductListQuery { cat2_id?: number; page?: number; price?: "asc" | "desc"; time?: "asc" | "desc"; search?: string; }
export interface ProductSearchQuery { query?: string | null; page?: number; }
export interface ProductQuestionQuery { page?: number; limit?: number; }
export interface ProductLoveRequest { love_status: boolean; }
export interface ProductQuestionRequest { content: string; question_parent_id?: number | null; }
export interface ProductDescriptionRequest { description: string; }
export interface ProductRecord { product_id: number | string; product_name?: string; product_images?: string[]; current_price?: number; [key: string]: unknown; }
export interface ProductListResponse { message?: string; status?: "success"; data: ProductRecord[]; numberOfPages?: number; quantity?: number; }
export interface ProductDetailResponse extends LegacyStatusSuccess { data: ProductRecord; }
export interface ProductStatusResponse extends LegacyStatusSuccess { message?: string; }

export interface CreateOrderRequest { product_id: number; shipping_address?: string; phone_number?: string; }
export interface OrderQuery { product_id: number; }
export type OrderStatus = "pending" | "finished" | "rejected";
export interface OrderRecord {
  order_id: number | string;
  product_id: number | string;
  order_status?: OrderStatus;
  product_name?: string;
  product_images?: string[];
  buy_now_price?: number;
  end_time?: string;
  payment_proof_image_url?: string;
  payment_proof_image?: string;
  shipping_label_image_url?: string;
  shipping_label_image?: string;
  phone_number?: string;
  shipping_address?: string;
  winner_id?: number;
  winner_name?: string;
  winner_email?: string;
  winner_avatar?: string;
}
export interface SellerOrderRecord extends OrderRecord {
  order_id: number;
  product_id: number;
  product_name: string;
  product_images: string[];
  buy_now_price: number;
  end_time: string;
  payment_proof_image_url: string;
  phone_number: string;
  shipping_address: string;
  order_status: OrderStatus;
  winner_id: number;
  winner_name: string;
  winner_username: string;
  winner_email: string;
}
export interface OrderDetailResponse<T extends OrderRecord = OrderRecord> { status: LegacySuccessStatus | LegacyErrorStatus; message: string; data: T | null; }
export interface OrderStatusResponse extends LegacyStatusSuccess { message: string; }
