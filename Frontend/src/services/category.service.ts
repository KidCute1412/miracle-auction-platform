import { apiRequest } from "./api.client.ts";
import type { CategoryNode, CategoryEditItem } from "@/hooks/useCategory.ts";

const ADMIN_PATH = import.meta.env.VITE_PATH_ADMIN;
type TreeResponse = { tree: CategoryNode[] };
type CreatorsResponse = { list: string[] };
type CategoryResponse = { item: { id: number; name: string; status: CategoryEditItem["status"]; parent_id?: number | null; description?: string | null } };

export const categoryService = {
  buildTree: async (): Promise<CategoryNode[]> => {
    const data = await apiRequest<TreeResponse>(`/${ADMIN_PATH}/categories/tree`);
    return data.tree;
  },

  list: async (params?: Record<string, any>, body?: any): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/categories`, {
      method: "GET",
      params,
    });
  },

  getTotal: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/categories/count`, {
      method: "GET",
      params,
    });
  },

  getCreators: async (): Promise<string[]> => {
    const data = await apiRequest<CreatorsResponse>(`/${ADMIN_PATH}/categories/creators`);
    return data.list;
  },

  getById: async (id: number): Promise<CategoryEditItem> => {
    const data = await apiRequest<CategoryResponse>(`/${ADMIN_PATH}/categories/${id}`);
    const it = data.item;
    return {
      id: it.id,
      name: it.name,
      status: it.status,
      parent_id: it.parent_id ?? null,
      description: it.description ?? "",
    };
  },

  create: async (body: any): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/categories`, {
      method: "POST",
      body,
    });
  },

  update: async (id: number, body: any): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/categories/${id}`, {
      method: "PATCH",
      body,
    });
  },

  delete: async (id: number): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/categories/${id}/status`, {
      method: "PATCH",
    });
  },

  restore: async (id: number): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/categories/${id}/restoration`, {
      method: "PATCH",
    });
  },

  destroy: async (id: number): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/categories/${id}`, {
      method: "DELETE",
    });
  },

  getAllClient: async (): Promise<any> => {
    return apiRequest(`/categories`);
  },

  getClientCat2: async (cat2_id: number): Promise<any> => {
    return apiRequest(`/categories/level/2/${cat2_id}`);
  },

  getLevel1: async (): Promise<any> => {
    return apiRequest(`/categories/level/1`);
  },

  getLevel2NoSlug: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/categories/level/2`, { params: { ...params, slug: false } });
  },

  getLevel2: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/categories/level/2`, { params });
  },
};
