import { createComponentLogger } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("cloud.config");

import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary.v2;

export async function uploadToCloudinary(filePath: string, folder: string) {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath, { folder: folder });
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
