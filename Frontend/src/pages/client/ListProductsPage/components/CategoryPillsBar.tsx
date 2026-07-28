import React from "react";
import type { CategoryNode } from "@/hooks/useCategory";
import { Sparkles, Grid, ChevronRight } from "lucide-react";

type CategoryPillsBarProps = {
  categoryTree: CategoryNode[];
  activeCat1Id: string;
  activeCat2Id: string;
  onSelectCategory: (cat1Id: string, cat2Id: string) => void;
};

export const CategoryPillsBar: React.FC<CategoryPillsBarProps> = ({
  categoryTree,
  activeCat1Id,
  activeCat2Id,
  onSelectCategory,
}) => {
  const activeParentNode = activeCat1Id
    ? categoryTree.find((cat) => String(cat.id) === String(activeCat1Id))
    : undefined;

  const subCategories = activeParentNode?.children || [];

  return (
    <div className="space-y-3 transition-all duration-300">
      {/* Level 1 Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* All Categories Reset Pill */}
        <button
          type="button"
          onClick={() => onSelectCategory("", "")}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${
            !activeCat1Id && !activeCat2Id
              ? "bg-accent text-accent-foreground ring-2 ring-accent/40 scale-102"
              : "bg-card text-foreground border border-border hover:border-accent/50 hover:bg-muted/50"
          }`}
        >
          <Grid className="w-3.5 h-3.5 text-accent" />
          All Categories
        </button>

        {categoryTree.map((cat) => {
          const isCatActive = String(cat.id) === String(activeCat1Id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(String(cat.id), "")}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${
                isCatActive
                  ? "bg-accent text-accent-foreground ring-2 ring-accent/40 scale-102"
                  : "bg-card text-foreground border border-border hover:border-accent/50 hover:bg-muted/50"
              }`}
            >
              {cat.cat_image ? (
                <img
                  src={cat.cat_image}
                  alt={cat.name}
                  className="w-4 h-4 object-cover rounded-md"
                />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-accent" />
              )}
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Level 2 Subcategories Sub-Bar (Displays when Parent Category is selected) */}
      {subCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-2 px-3 bg-muted/20 border border-border/60 rounded-xl transition-all animate-fadeIn">
          <span className="text-xs font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
            {activeParentNode?.name}
            <ChevronRight className="w-3 h-3 text-accent" />
          </span>

          {/* All Subcategories Pill */}
          <button
            type="button"
            onClick={() => onSelectCategory(activeCat1Id, "")}
            className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              !activeCat2Id
                ? "bg-accent/20 border border-accent/40 text-accent font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            All {activeParentNode?.name}
          </button>

          {subCategories.map((sub) => {
            const isSubActive = String(sub.id) === String(activeCat2Id);
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectCategory(activeCat1Id, String(sub.id))}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  isSubActive
                    ? "bg-accent/20 border border-accent/40 text-accent font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
