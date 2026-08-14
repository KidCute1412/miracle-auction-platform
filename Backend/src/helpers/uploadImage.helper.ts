import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import multer from "multer";

// Uploads are temporary before Cloudinary transfer. Keep them in an explicit
// writable location that behaves the same from source and bundled runtimes.
export const uploadDir = path.resolve(process.env.UPLOAD_TMP_DIR ?? path.join(tmpdir(), "online-auction-uploads"));
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${Date.now()}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) callback(null, true);
    else callback(new Error("Only JPG, PNG, and WebP images are accepted"));
  },
});

export default upload;
