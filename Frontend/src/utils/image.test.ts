import { describe, expect, it } from "vitest";
import { optimizeImageUrl, getAvatarUrl, IMAGE_PRESETS } from "./image";

describe("image utility", () => {
  it("returns empty string when url is null, undefined, or empty", () => {
    expect(optimizeImageUrl(null)).toBe("");
    expect(optimizeImageUrl(undefined)).toBe("");
    expect(optimizeImageUrl("")).toBe("");
  });

  it("injects Cloudinary transformation parameters correctly", () => {
    const rawCloudinaryUrl =
      "https://res.cloudinary.com/mycloud/image/upload/v1234567890/products/watch.jpg";
    const optimized = optimizeImageUrl(rawCloudinaryUrl, { width: 500 });
    expect(optimized).toBe(
      "https://res.cloudinary.com/mycloud/image/upload/f_auto,q_auto,w_500,c_limit/v1234567890/products/watch.jpg"
    );
  });

  it("handles Cloudinary transformation when passing width as a number directly", () => {
    const rawCloudinaryUrl =
      "https://res.cloudinary.com/mycloud/image/upload/v1234567890/products/watch.jpg";
    const optimized = optimizeImageUrl(rawCloudinaryUrl, 400);
    expect(optimized).toBe(
      "https://res.cloudinary.com/mycloud/image/upload/f_auto,q_auto,w_400,c_limit/v1234567890/products/watch.jpg"
    );
  });

  it("injects Unsplash query parameters correctly", () => {
    const rawUnsplashUrl = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d";
    const optimized = optimizeImageUrl(rawUnsplashUrl, { width: 500, crop: "fill" });
    expect(optimized).toContain("w=500");
    expect(optimized).toContain("auto=format");
    expect(optimized).toContain("fit=crop");
  });

  it("returns non-transformable URLs unchanged", () => {
    const tikiUrl = "https://salt.tikicdn.com/cache/280x280/ts/product/abc.jpg";
    expect(optimizeImageUrl(tikiUrl, 500)).toBe(tikiUrl);
  });

  it("generates avatar url with face gravity and fill crop", () => {
    const rawAvatar = "https://res.cloudinary.com/mycloud/image/upload/avatar.jpg";
    const optimizedAvatar = getAvatarUrl(rawAvatar, 150);
    expect(optimizedAvatar).toBe(
      "https://res.cloudinary.com/mycloud/image/upload/f_auto,q_auto,w_150,h_150,c_fill,g_face/avatar.jpg"
    );
  });

  it("provides standard responsive presets", () => {
    expect(IMAGE_PRESETS.thumbnail.width).toBe(200);
    expect(IMAGE_PRESETS.card.width).toBe(500);
    expect(IMAGE_PRESETS.detail.width).toBe(1000);
    expect(IMAGE_PRESETS.avatar.gravity).toBe("face");
  });
});
