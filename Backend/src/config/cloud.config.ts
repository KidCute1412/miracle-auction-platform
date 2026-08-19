import { createComponentLogger } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("cloud.config");

import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary.v2;

export interface CloudinaryUploadOptions extends Record<string, unknown> {
  folder?: string;
  eager?: Array<Record<string, unknown>>;
  eager_async?: boolean;
  transformation?: Array<Record<string, unknown>>;
}

export async function uploadToCloudinary(
  filePath: string,
  folderOrOptions: string | CloudinaryUploadOptions,
) {
  try {
    const options: Record<string, unknown> =
      typeof folderOrOptions === "string"
        ? {
            folder: folderOrOptions,
            resource_type: "image",
            quality: "auto",
            fetch_format: "auto",
          }
        : {
            resource_type: "image",
            quality: "auto",
            fetch_format: "auto",
            ...folderOrOptions,
          };

    // Provide default eager transformations for product images and avatars if not explicitly passed
    if (!options.eager && options.folder === "product_images") {
      options.eager = [
        { width: 800, crop: "limit", format: "webp", quality: "auto" },
        { width: 400, crop: "limit", format: "webp", quality: "auto" },
      ];
      options.eager_async = true;
    } else if (!options.eager && options.folder === "avatar") {
      options.eager = [
        { width: 250, height: 250, crop: "fill", gravity: "face", format: "webp", quality: "auto" },
      ];
      options.eager_async = true;
    }

    const result = await cloudinary.v2.uploader.upload(filePath, options);
    return result;
  } catch (e) {
    log.error("Cloudinary upload error: ", e);
    throw e;
  }
}

// export async function deleteFromCloudinary (publicId: string) {
//     try {
//         const result = await cloudinary.v2.uploader.destroy(publicId);
//         return result;
//     } catch (e) {
//         log.error("Cloudinary deletion error: ", e);
//         throw e;
//     }
// }
