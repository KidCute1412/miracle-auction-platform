import { apiRequest } from "./api.client.ts";

export const accountService = {
  register: async (body: any): Promise<any> => {
    return apiRequest(`/accounts`, {
      method: "POST",
      body,
    });
  },

  verifyAccount: async (params: { email: string }): Promise<any> => {
    return apiRequest(`/accounts/verification`, { params });
  },

  verifyRegister: async (body: { email?: string; otp: string }): Promise<any> => {
    return apiRequest(`/accounts/registration/verification`, {
      method: "POST",
      body,
    });
  },

  verifyForgotPassword: async (body: { email?: string; otp: string }): Promise<any> => {
    return apiRequest(`/accounts/password/recovery/verification`, {
      method: "PATCH",
      body,
    });
  },

  forgotPassword: async (body: { email: string }): Promise<any> => {
    return apiRequest(`/accounts/password/recovery`, {
      method: "POST",
      body,
    });
  },

  resetPassword: async (body: any): Promise<any> => {
    return apiRequest(`/accounts/password`, {
      method: "PUT",
      body,
    });
  },

  changePassword: async (body: any): Promise<any> => {
    return apiRequest(`/accounts/password`, {
      method: "PATCH",
      body,
    });
  },

  verifyChangePassword: async (body: { email?: string; otp: string }): Promise<any> => {
    return apiRequest(`/accounts/password/verification`, {
      method: "POST",
      body,
    });
  },

  login: async (body: any): Promise<any> => {
    return apiRequest(`/accounts/sessions`, {
      method: "POST",
      body,
    });
  },

  googleLogin: async (body: { credential: string; rememberMe?: boolean }): Promise<any> => {
    return apiRequest(`/accounts/sessions/google`, {
      method: "POST",
      body,
    });
  },

  logout: async (): Promise<any> => {
    return apiRequest(`/accounts/sessions`, {
      method: "DELETE",
    });
  },
};
