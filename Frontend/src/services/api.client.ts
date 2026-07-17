import type { ApiClientErrorBody } from "api-contracts";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface RequestOptions<TBody = unknown> extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: TBody;
}

export class ApiClientError<TBody extends ApiClientErrorBody = ApiClientErrorBody> extends Error {
  constructor(readonly status: number, readonly body: TBody, message: string) { super(message); this.name = "ApiClientError"; }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  path: string;
  options: any;
}> = [];

const processQueue = (error: any, success: boolean = false) => {
  failedQueue.forEach((prom) => {
    if (success) {
      prom.resolve(apiRequest(prom.path, prom.options));
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const { params, headers, body, ...restOptions } = options;

  let url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {};

  if (!(body instanceof FormData) && body !== undefined) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    credentials: "include",
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    ...restOptions,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as ApiClientErrorBody;

    if (response.status === 401 && path !== "/accounts/sessions/refresh") {
      if (isRefreshing) {
        return new Promise<TResponse>((resolve, reject) => {
          failedQueue.push({ resolve, reject, path, options });
        });
      }

      isRefreshing = true;

      try {
        await apiRequest("/accounts/sessions/refresh", { method: "POST" });
        isRefreshing = false;
        processQueue(null, true);
        return await apiRequest<TResponse, TBody>(path, options);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, false);
        throw new ApiClientError(response.status, errorData, typeof errorData.message === "string" ? errorData.message : `HTTP error! status: ${response.status}`);
      }
    }

    throw new ApiClientError(response.status, errorData, typeof errorData.message === "string" ? errorData.message : `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}
