/**
 * Image optimization utilities for responsive, fast, and resilient media delivery.
 */

export interface OptimizeImageOptions {
  width?: number;
  height?: number;
  quality?: "auto" | "eco" | "good" | "best" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  crop?: "limit" | "fill" | "scale" | "thumb" | "crop";
  gravity?: "face" | "center" | "auto";
}

export const IMAGE_PRESETS = {
  thumbnail: { width: 200, height: 200, crop: "fill" as const },
  card: { width: 500, crop: "limit" as const },
  detail: { width: 1000, crop: "limit" as const },
  avatar: { width: 250, height: 250, crop: "fill" as const, gravity: "face" as const },
};

/**
 * Injects on-the-fly transformation parameters into Cloudinary, Unsplash, or CDN URLs.
 */
export function optimizeImageUrl(url?: string | null, options: OptimizeImageOptions | number = {}): string {
  if (!url || typeof url !== "string") return "";

  const opts: OptimizeImageOptions = typeof options === "number" ? { width: options } : options;
  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "limit",
    gravity,
  } = opts;

  // 1. Cloudinary URLs
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const transformParts: string[] = [];

    if (format) transformParts.push(`f_${format}`);
    if (quality) transformParts.push(`q_${quality}`);
    if (width) transformParts.push(`w_${width}`);
    if (height) transformParts.push(`h_${height}`);
    if (crop) transformParts.push(`c_${crop}`);
    if (gravity) transformParts.push(`g_${gravity}`);

    if (transformParts.length === 0) return url;

    const transformationStr = transformParts.join(",");

    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex !== -1) {
      const prefix = url.substring(0, uploadIndex + 8);
      const rest = url.substring(uploadIndex + 8);

      if (rest.startsWith("f_") || rest.startsWith("w_") || rest.startsWith("q_")) {
        const nextSlash = rest.indexOf("/");
        if (nextSlash !== -1) {
          return `${prefix}${transformationStr}/${rest.substring(nextSlash + 1)}`;
        }
      }

      return `${prefix}${transformationStr}/${rest}`;
    }
  }

  // 2. Unsplash URLs
  if (url.includes("images.unsplash.com")) {
    try {
      const parsedUrl = new URL(url);
      if (width) parsedUrl.searchParams.set("w", width.toString());
      if (height) parsedUrl.searchParams.set("h", height.toString());
      parsedUrl.searchParams.set("auto", "format");
      parsedUrl.searchParams.set("fit", crop === "fill" ? "crop" : "max");
      return parsedUrl.toString();
    } catch {
      return url;
    }
  }

  return url;
}

/**
 * Shortcut for creating avatar image URLs with smart face detection.
 */
export function getAvatarUrl(url?: string | null, size: number = 200): string {
  if (!url) return "";
  return optimizeImageUrl(url, {
    width: size,
    height: size,
    crop: "fill",
    gravity: "face",
    quality: "auto",
    format: "auto",
  });
}
