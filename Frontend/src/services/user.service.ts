import { apiRequest } from "./api.client.ts";

import { ADMIN_PATH } from "@/lib/admin-path";

export const userService = {
  registerSeller: async (body: any): Promise<any> => {
    return apiRequest(`/users/seller-registrations`, {
      method: "POST",
      body,
    });
  },

  rateUser: async (body: any): Promise<any> => {
    return apiRequest(`/users/ratings`, {
      method: "POST",
      body,
    });
  },

  getRatingCount: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/users/ratings/count`, { params });
  },

  getRatingHistory: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/users/ratings`, { params });
  },

  adminList: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/users`, {
      method: "GET",
      params,
    });
  },

  adminGetTotal: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/users/count`, {
      method: "GET",
      params,
    });
  },

  adminDetail: async (id: number): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/users/${id}`);
  },

  adminEditRole: async (id: number, body: any): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/users/${id}/role`, {
      method: "PATCH",
      body,
    });
  },

  adminResetPassword: async (id: number, body: any): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/users/${id}/password`, {
      method: "PATCH",
      body,
    });
  },

  adminListApplications: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/seller-registrations`, { params });
  },

  adminGetApplicationDetail: async (id: number): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/seller-registrations/${id}`);
  },

  adminEditApplication: async (id: number, body: any): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/seller-registrations/${id}`, {
      method: "PATCH",
      body,
    });
  },

  adminGetApplicationsTotal: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/seller-registrations/count`, {
      method: "GET",
      params,
    });
  },

  adminSetApplicationStatus: async (id: number, body: any): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/seller-registrations/${id}/status`, {
      method: "PATCH",
      body,
    });
  },

  adminGetFormsTotal: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/seller-registrations/count`, { params });
  },
};
