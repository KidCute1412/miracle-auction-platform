import { apiRequest } from "./api.client.ts";
import type { ChangePasswordRequest, EmailRequest, GoogleLoginRequest, LegacyCodeResponse, LoginRequest, OtpRequest, RegisterAccountRequest, ResetPasswordRequest } from "api-contracts";

export const accountService = {
  register: async (body: RegisterAccountRequest): Promise<LegacyCodeResponse> => {
    return apiRequest(`/accounts`, {
      method: "POST",
      body,
    });
  },

  verifyAccount: async (params: EmailRequest): Promise<LegacyCodeResponse> => {
    return apiRequest(`/accounts/verification`, { params: { ...params } });
  },

  verifyRegister: async (body: OtpRequest): Promise<LegacyCodeResponse> => {
    return apiRequest(`/accounts/registration/verification`, {
      method: "POST",
      body,
    });
  },

  verifyForgotPassword: async (body: OtpRequest): Promise<LegacyCodeResponse> => {
    return apiRequest(`/accounts/password/recovery/verification`, {
      method: "PATCH",
      body,
    });
  },

  forgotPassword: async (body: EmailRequest): Promise<LegacyCodeResponse> => {
    return apiRequest(`/accounts/password/recovery`, {
      method: "POST",
      body,
    });
  },

  resetPassword: async (body: ResetPasswordRequest): Promise<LegacyCodeResponse> => {
    return apiRequest(`/accounts/password`, {
      method: "PUT",
      body,
    });
  },

  changePassword: async (body: ChangePasswordRequest): Promise<LegacyCodeResponse> => {
    return apiRequest(`/accounts/password`, {
      method: "PATCH",
      body,
    });
  },

  verifyChangePassword: async (body: OtpRequest): Promise<LegacyCodeResponse> => {
    return apiRequest(`/accounts/password/verification`, {
      method: "POST",
      body,
    });
  },

  login: async (body: LoginRequest): Promise<LegacyCodeResponse> => {
    return apiRequest(`/accounts/sessions`, {
      method: "POST",
      body,
    });
  },

  googleLogin: async (body: GoogleLoginRequest): Promise<LegacyCodeResponse> => {
    return apiRequest(`/accounts/sessions/google`, {
      method: "POST",
      body,
    });
  },

  refreshSession: async (): Promise<LegacyCodeResponse> => {
    return apiRequest(`/accounts/sessions/refresh`, {
      method: "POST",
    });
  },

  logout: async (): Promise<LegacyCodeResponse> => {
    return apiRequest(`/accounts/sessions`, {
      method: "DELETE",
    });
  },
};
