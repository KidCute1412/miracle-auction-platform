import type { BanBidderRequest, BanBidderResponse, BidHistoryQuery, BidHistoryResponse, BidRequest, BidSuccessResponse, BuyNowRequest, BuyNowSuccessResponse } from "api-contracts";
import { ApiClientError, apiRequest } from "./api.client.ts";

const DURABILITY_RETRY_DELAYS_MS = [100, 250] as const;
const wait = (milliseconds: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function idempotentMutation<TResponse, TBody>(path: string, body: TBody, idempotencyKey = crypto.randomUUID()): Promise<TResponse> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await apiRequest<TResponse, TBody>(path, {
        method: "POST",
        body,
        headers: { "Idempotency-Key": idempotencyKey },
      });
    } catch (error) {
      const retryDelay = DURABILITY_RETRY_DELAYS_MS[attempt];
      if (!(error instanceof ApiClientError) || error.body.code !== "BID_DURABILITY_UNCONFIRMED" || retryDelay === undefined) {
        throw error;
      }
      await wait(retryDelay);
    }
  }
}

export function isDurabilityUnconfirmed(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError && error.body.code === "BID_DURABILITY_UNCONFIRMED";
}

export const bidService = {
  play: async (body: BidRequest, idempotencyKey?: ReturnType<typeof crypto.randomUUID>): Promise<BidSuccessResponse> => {
    return idempotentMutation<BidSuccessResponse, BidRequest>(`/bids`, body, idempotencyKey);
  },

  getHistory: async (params: BidHistoryQuery): Promise<BidHistoryResponse> => {
    return apiRequest<BidHistoryResponse>(`/bids`, { params: { product_id: params.product_id } });
  },

  buyNow: async (body: BuyNowRequest, idempotencyKey?: ReturnType<typeof crypto.randomUUID>): Promise<BuyNowSuccessResponse> => {
    return idempotentMutation<BuyNowSuccessResponse, BuyNowRequest>(`/bids/purchase`, body, idempotencyKey);
  },

  banBidder: async (body: BanBidderRequest): Promise<BanBidderResponse> => {
    return idempotentMutation<BanBidderResponse, BanBidderRequest>(`/bids/bans`, body);
  },
};
