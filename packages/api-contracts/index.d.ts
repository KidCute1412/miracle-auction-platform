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
  max_price: string;
  /** @deprecated Kept for clients released before max_price became canonical. */
  bid_price?: string;
}
export interface BuyNowRequest { product_id: number; buy_price: string; }
export interface BidHistoryQuery { product_id: number; }
export interface BanBidderRequest { product_id: number; banned_user_id: number; reason: string; }
export interface CancelAuctionRequest { reason?: string; }

export interface BidHistoryItem {
  bidding_id: number;
  user_id: number;
  product_id: number;
  max_price: string;
  product_price: string;
  price_owner_id: number;
  created_at: string;
  username: string;
  price_owner_username: string;
}
export interface AuctionMutationData {
  event_id: string;
  product_id: string;
  current_price: string;
  leader_id: string | null;
  end_time_ms: string;
  sequence: string;
  version: string;
  order_id: string | null;
}
export interface BidSuccessResponse extends LegacyStatusSuccess { data?: AuctionMutationData; }
export interface BuyNowSuccessResponse extends LegacyStatusSuccess {
  order_id?: string;
  end_time?: string;
  data?: AuctionMutationData;
}
export interface BidHistoryResponse extends LegacyStatusSuccess { data: BidHistoryItem[]; isSeller: boolean; }
export interface BanBidderResponse extends LegacyStatusSuccess { data: unknown; }
export interface CancelAuctionResponse extends LegacyStatusSuccess { data: unknown; }
export type AuctionSocketStatus = "PENDING" | "ACTIVE" | "SOLD" | "ENDED" | "CANCELLED";
export interface BidSocketEvent {
  eventId: string;
  productId: string;
  currentPriceVnd: string;
  leaderId: string | null;
  endTimeMs: string;
  sequence: string;
  version: string;
  orderId: string | null;
  status: AuctionSocketStatus;
}

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
export interface DashboardMetrics {
  completedOrderGmvVnd: number;
  activeBidders: number;
  enabledAccounts: number;
  activeAuctions: number;
  pendingOrders: number;
  finishedOrders: number;
  rejectedOrders: number;
  pendingSellerVerifications: number;
  sellThroughRate: number;
}
export interface DashboardComparison {
  completedOrderGmvVnd: number | null;
  activeBidders: number | null;
  finishedOrders: number | null;
}
export interface DashboardChartPoint {
  label: string;
  bucketStart: string;
  completedOrderGmvVnd: number;
  bids: number;
  auctions: number;
}
export interface DashboardCategoryPoint { category: string; auctions: number; share: number; }
export interface DashboardHeatmapPoint { day: number; hour: number; bids: number; }
export interface DashboardActivity {
  createdAt: string;
  actor: string;
  action: string;
  resource: string;
  value: string | number | null;
}
export interface DashboardSnapshotMetadata {
  version: number;
  updatedAt: string;
  freshnessMs: number;
  state: "fresh" | "stale";
  refreshDurationMs: number | null;
  sourceEventCount: number;
  reason: string | null;
}
export interface DashboardSummary {
  range: DashboardRange;
  metrics: DashboardMetrics;
  comparison: DashboardComparison;
  series: DashboardChartPoint[];
  categoryDistribution: DashboardCategoryPoint[];
  bidHeatmap: DashboardHeatmapPoint[];
  recentActivity: DashboardActivity[];
  metadata: DashboardSnapshotMetadata;
}
export interface ApiSuccess<T> { success: true; data: T; }
export interface DashboardSummaryResponse extends ApiSuccess<DashboardSummary> {}
export interface DashboardSyncRequest {
  eventId: string;
  baselineVersion: number;
  requestedAt: string;
}
export interface DashboardSyncResponse extends ApiSuccess<DashboardSyncRequest> {}
export interface DependencyHealth {
  available: boolean;
  latencyMs: number | null;
  detail?: string;
}
export interface DashboardOperations {
  postgres: DependencyHealth;
  redis: DependencyHealth;
  kafka: DependencyHealth;
  workers: {
    auctionWorker: { available: boolean; ageMs: number | null };
    outboxRelay: { available: boolean; ageMs: number | null };
    asyncWorker: { available: boolean; ageMs: number | null };
  };
  /** @deprecated Compatibility alias for asyncWorker. */
  workerHeartbeat: { available: boolean; ageMs: number | null };
  refreshAgeMs: number | null;
  outboxPending: number;
  outboxRetrying: number;
  outboxTerminal: number;
  oldestOutboxAgeMs: number | null;
  projectionLag: number | null;
  emailPending: number;
  emailRetrying: number;
  emailTerminal: number;
  consumerLag: number | null;
  dlqCount: number;
  adminSocketCount: number;
}
export interface DashboardOperationsResponse extends ApiSuccess<DashboardOperations> {}
export interface DashboardUpdatedEvent {
  version: number;
  updatedAt: string;
  reason: string | null;
  correlationId: string;
}
export interface AuditLog {
  id: string;
  actorId: number | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  result: "success" | "failed" | "denied";
  errorCode: string | null;
  correlationId: string;
  createdAt: string;
}
export interface PaginationMeta { page: number; limit: number; total: number; totalPages: number; }
export interface AuditLogResponse extends ApiSuccess<AuditLog[]> { meta: PaginationMeta; }
export interface DashboardDlqItem {
  eventId: string;
  eventType: string;
  attempts: number;
  lastError: string | null;
  correlationId: string;
  terminalAt: string | null;
}
export interface DashboardDlqResponse extends ApiSuccess<DashboardDlqItem[]> { meta: PaginationMeta; }

// Products and orders: legacy HTTP envelopes retained while their backend modules move to Prisma.
export interface ProductListQuery { cat2_id?: number; page?: number; price?: "asc" | "desc"; time?: "asc" | "desc"; search?: string; }
export interface ProductSearchQuery { query?: string | null; page?: number; }
export interface ProductQuestionQuery { page?: number; limit?: number; }
export interface ProductLoveRequest { love_status: boolean; }
export interface ProductQuestionRequest { content: string; question_parent_id?: number | null; }
export interface ProductDescriptionRequest { description: string; }
export interface ProductRecord { product_id: number | string; product_name?: string; product_images?: string[]; current_price?: string; [key: string]: unknown; }
export interface ProductListResponse { message?: string; status?: "success"; data: ProductRecord[]; numberOfPages?: number; quantity?: number; }
export interface ProductDetailResponse extends LegacyStatusSuccess { data: ProductRecord; }
export interface ProductStatusResponse extends LegacyStatusSuccess { message?: string; }

export interface CreateOrderRequest { public_order_id: string; shipping_address?: string; phone_number?: string; }
export interface OrderQuery { product_id: number; }
export type OrderStatus = "pending" | "finished" | "rejected";
export interface OrderRecord {
  order_id: number | string;
  public_order_id: string;
  product_id: number | string;
  order_status?: OrderStatus;
  product_name?: string;
  product_images?: string[];
  buy_now_price?: string;
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
  buy_now_price: string;
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

// Profiles, settings and users.
export interface ProfileRecord {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  rating: number | null;
  rating_count: number | null;
  address: string | null;
  date_of_birth: string | null;
  avatar: string | null;
  [key: string]: unknown;
}
export interface ProfileMeResponse { data: ProfileRecord; }
export interface ProfileDetailQuery { user_id: number; username: string; }
export interface ProfileDetailResponse { status: LegacySuccessStatus | LegacyErrorStatus; data?: ProfileRecord; is_owner?: boolean; message?: string; }
export interface ProfileUpdateResponse extends LegacyStatusSuccess { message: string; data: ProfileRecord; }
export interface AutoExtendTimeSetting { extend_time_minutes: number; threshold_minutes: number; }
export interface AutoExtendTimeResponse { status: LegacySuccessStatus | LegacyErrorStatus; data?: AutoExtendTimeSetting | null; message?: string; }
export interface SellerRegistrationRequest { reason: string; }
export interface UserRatingRequest { user_id: number; score: number; comment: string; }
export interface UserRatingQuery { user_id: number; username: string; page?: number; limit?: number; }
export interface LegacyUserStatusResponse { status: LegacySuccessStatus | LegacyErrorStatus; message: string; }
