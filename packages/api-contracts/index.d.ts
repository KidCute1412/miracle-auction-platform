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
