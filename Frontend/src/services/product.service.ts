import { apiRequest } from "./api.client.ts";

const ADMIN_PATH = import.meta.env.VITE_PATH_ADMIN;

export const productService = {
  getPageList: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/products`, { params });
  },

  getDetail: async (id: string | number): Promise<any> => {
    return apiRequest(`/products/${id}`);
  },

  postProduct: async (body: FormData): Promise<any> => {
    return apiRequest(`/products`, {
      method: "POST",
      body,
    });
  },

  updateDescription: async (id: string | number, body: any): Promise<any> => {
    return apiRequest(`/products/${id}/description`, {
      method: "PATCH",
      body,
    });
  },

  getMyProducts: async (): Promise<any> => {
    return apiRequest(`/products/me`);
  },

  search: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/products`, { params });
  },

  getLoveStatus: async (productId: number): Promise<any> => {
    return apiRequest(`/products/${productId}/likes`);
  },

  updateLoveStatus: async (productId: number, body: any): Promise<any> => {
    return apiRequest(`/products/${productId}/likes`, {
      method: "POST",
      body,
    });
  },

  getQuestions: async (productId: number, params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/products/${productId}/questions`, { params });
  },

  postQuestion: async (productId: number, body: any): Promise<any> => {
    return apiRequest(`/products/${productId}/questions`, {
      method: "POST",
      body,
    });
  },

  getEndingSoon: async (): Promise<any> => {
    return apiRequest(`/products`, { params: { sort: "ending_soon" } });
  },

  getHighestPrice: async (): Promise<any> => {
    return apiRequest(`/products`, { params: { sort: "highest_price" } });
  },

  getMostBids: async (): Promise<any> => {
    return apiRequest(`/products`, { params: { sort: "most_bids" } });
  },

  getDetailForWinner: async (id: string | number): Promise<any> => {
    return apiRequest(`/products/${id}/winner`);
  },

  getRelated: async (id: string | number, params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/products/${id}/related`, { params });
  },

  adminList: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/products`, {
      method: "GET",
      params,
    });
  },

  adminGetTotal: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/products/count`, {
      method: "GET",
      params,
    });
  },

  adminDetail: async (id: number): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/products/${id}`);
  },

  adminDelete: async (id: number): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/products/${id}/status`, {
      method: "PATCH",
    });
  },

  adminRestore: async (id: number): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/products/${id}/restoration`, {
      method: "PATCH",
    });
  },

  adminDestroy: async (id: number): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/products/${id}`, {
      method: "DELETE",
    });
  },
};
