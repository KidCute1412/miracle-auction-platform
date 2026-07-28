// src/hooks/useCategory.ts
import { useEffect, useState } from "react";
import { categoryService } from "@/services/category.service.ts";

export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  cat_image?: string;
  children: CategoryNode[];
}

export interface FlatOption {
  id: number;
  label: string;
}

type CategoryItem = {
  id: number;
  name: string;
  status: "active" | "inactive";
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
};

export type CategoryEditItem = {
  id: number;
  name: string;
  status: "active" | "inactive";
  parent_id: number | null;
  description: string;
};

export function useBuildTree() {
  const [tree, setTree] = useState<CategoryNode[] | null>(null);
  useEffect(() => {
    categoryService.buildTree()
      .then((treeData) => {
        if (treeData && treeData.length !== 0) {
          setTree(treeData);
        } else {
          setTree(null);
        }
      })
      .catch(() => {
        setTree(null);
      });
  }, []);
  return { tree };
}

export function useCategories() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoryService.list()
      .then((data) => {
        setItems(data.list);
        setIsLoading(false);
      })
      .catch(() => {
        setItems([]);
        setIsLoading(false);
      });
  }, []);

  return { items, isLoading };
}

export function useCategoryWithID(id: number) {
  const [item, setItem] = useState<CategoryEditItem | null>(null);

  useEffect(() => {
    if (!id) return;

    categoryService.getById(id)
      .then((editItem) => {
        setItem(editItem);
      })
      .catch(() => setItem(null));
  }, [id]);

  return { item };
}

