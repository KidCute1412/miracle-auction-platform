import { apiRequest } from "./api.client.ts";
import type {
  OrderDetailResponse,
  OrderQuery,
  SellerOrderRecord,
  OrderStatusResponse,
} from "api-contracts";

export const orderService = {
  createOrder: async (body: FormData): Promise<OrderStatusResponse> => {
    return apiRequest(`/orders`, {
      method: "POST",
      body,
    });
  },

  getOrderDetail: async (params: OrderQuery): Promise<OrderDetailResponse> => {
    return apiRequest(`/orders`, { params: { ...params } });
  },

  getSellerOrderView: async (params: OrderQuery): Promise<OrderDetailResponse<SellerOrderRecord>> => {
    return apiRequest(`/orders/seller`, { params: { ...params } });
  },

  rejectOrder: async (order_id: string, body: { reason?: string }): Promise<OrderStatusResponse> => {
    return apiRequest(`/orders/${order_id}/rejection`, {
      method: "PATCH",
      body,
    });
  },

  approveOrder: async (order_id: string, body: FormData): Promise<OrderStatusResponse> => {
    return apiRequest(`/orders/${order_id}/approval`, {
      method: "PATCH",
      body,
    });
  },
};
