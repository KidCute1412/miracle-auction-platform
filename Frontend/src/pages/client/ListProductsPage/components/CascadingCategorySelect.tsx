import React from "react";
import SelectComponent from "@/components/common/Select";
import type { CategoryNode } from "@/hooks/useCategory";

type CascadingCategorySelectProps = {
  categoryTree: CategoryNode[];
  activeCat1Id: string;
  activeCat2Id: string;
  onSelectCategory: (cat1Id: string, cat2Id: string) => void;
};

export const CascadingCategorySelect: React.FC<CascadingCategorySelectProps> = ({
  categoryTree,
  activeCat1Id,
  activeCat2Id,
  onSelectCategory,
}) => {
  const selectedParentNode = activeCat1Id
    ? categoryTree.find((c) => String(c.id) === String(activeCat1Id))
    : undefined;

  const availableSubcategories = selectedParentNode
    ? selectedParentNode.children || []
    : categoryTree.flatMap((c) => c.children || []);

  const cat1SelectItems = [
    { value: "all", content: "All Categories" },
    ...categoryTree.map((c) => ({ value: String(c.id), content: c.name })),
  ];

  const cat2SelectItems = [
    { value: "all", content: "All Subcategories" },
    ...availableSubcategories.map((sc) => ({ value: String(sc.id), content: sc.name })),
  ];

  const handleCat1Change = (val: string) => {
    const newCat1 = val === "all" ? "" : val;
    onSelectCategory(newCat1, "");
  };

  const handleCat2Change = (val: string) => {
    const newCat2 = val === "all" ? "" : val;
    onSelectCategory(activeCat1Id, newCat2);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Level 1 Parent Category Selector */}
      <div className="w-44 sm:w-48">
        <SelectComponent
          items={cat1SelectItems}
          placeholder="Select Category"
          value={activeCat1Id || "all"}
          setState={handleCat1Change}
        />
      </div>

      {/* Level 2 Subcategory Selector */}
      <div className="w-44 sm:w-48">
        <SelectComponent
          items={cat2SelectItems}
          placeholder="Select Subcategory"
          value={activeCat2Id || "all"}
          setState={handleCat2Change}
        />
      </div>
    </div>
  );
};
