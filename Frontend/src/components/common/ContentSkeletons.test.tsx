import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminTableSkeleton, CategoryGridSkeleton, ProductGridSkeleton } from "./ContentSkeletons";

describe("content skeletons", () => {
  it("renders responsive skeletons for data grids", () => {
    render(<><ProductGridSkeleton count={3} /><CategoryGridSkeleton count={2} /><AdminTableSkeleton columns={4} rows={2} /></>);

    expect(screen.getByLabelText("Loading products").children).toHaveLength(3);
    expect(screen.getByLabelText("Loading categories").children).toHaveLength(2);
    expect(screen.getByLabelText("Loading admin records")).toBeDefined();
  });
});
