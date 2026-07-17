import type { BanBidderRequest, BanBidderResponse, BidHistoryQuery, BidHistoryResponse, BidRequest, BidSuccessResponse, BuyNowRequest, BuyNowSuccessResponse } from "api-contracts";
import { apiRequest } from "./api.client.ts";

export const bidService = {
  play: async (body: BidRequest): Promise<BidSuccessResponse> => {
    return apiRequest<BidSuccessResponse, BidRequest>(`/bids`, {
      method: "POST",
      body,
    });
  },

  getHistory: async (params: BidHistoryQuery): Promise<BidHistoryResponse> => {
    return apiRequest<BidHistoryResponse>(`/bids`, { params: { product_id: params.product_id } });
  },

  buyNow: async (body: BuyNowRequest): Promise<BuyNowSuccessResponse> => {
    return apiRequest<BuyNowSuccessResponse, BuyNowRequest>(`/bids/purchase`, {
      method: "POST",
      body,
    });
  },

  banBidder: async (body: BanBidderRequest): Promise<BanBidderResponse> => {
    return apiRequest<BanBidderResponse, BanBidderRequest>(`/bids/bans`, {
      method: "POST",
      body,
    });
  },
};
