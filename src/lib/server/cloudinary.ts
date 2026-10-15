import "server-only";
import { v2 as cloudinary } from "cloudinary";

type UploadedImage = { public_id: string; version: number; bytes: number; format: string };

function configureCloudinary() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials hazijawekwa.");
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  return { cloudName, apiKey, apiSecret };
}

/** Issue a signed browser upload restricted to the single store profile asset. */
export function signAdminProfileUpload() {
  const { cloudName, apiKey, apiSecret } = configureCloudinary();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    timestamp,
    folder: "niffer/store",
    public_id: "admin-profile",
    overwrite: true,
  };
  return {
    cloudName,
    apiKey,
    timestamp,
    signature: cloudinary.utils.api_sign_request(params, apiSecret),
    folder: params.folder,
    publicId: params.public_id,
    overwrite: params.overwrite,
  };
}

/** Sign a direct browser upload to one fixed Cloudinary public ID for this product. */
export function signAdminProductUpload(slug: string) {
  const { cloudName, apiKey, apiSecret } = configureCloudinary();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    timestamp,
    folder: "niffer/products",
    public_id: slug,
    overwrite: true,
  };
  return {
    cloudName,
    apiKey,
    timestamp,
    signature: cloudinary.utils.api_sign_request(params, apiSecret),
    folder: params.folder,
    publicId: params.public_id,
    overwrite: params.overwrite,
  };
}

/** Resolve and validate the signed upload before publishing its URL in Neon. */
export async function getAdminProductImage(slug: string): Promise<{ image: string; bytes: number }> {
  configureCloudinary();
  const asset = await cloudinary.api.resource(`niffer/products/${slug}`, {
    resource_type: "image",
    type: "upload",
  }) as UploadedImage;
  if (asset.bytes > 12 * 1024 * 1024) throw new Error("The uploaded image exceeds 12 MB.");
  if (!["jpg", "jpeg", "png", "webp", "avif"].includes(asset.format.toLowerCase())) {
    throw new Error("Unsupported image format.");
  }
  return {
    image: cloudinary.url(asset.public_id, {
      secure: true,
      fetch_format: "auto",
      quality: "auto",
      version: asset.version,
    }),
    bytes: asset.bytes,
  };
}

/** Resolve the canonical, optimized delivery URL for the fixed profile asset. */
export async function getAdminProfileImageUrl(): Promise<string> {
  configureCloudinary();
  const asset = await cloudinary.api.resource("niffer/store/admin-profile", {
    resource_type: "image",
    type: "upload",
  }) as UploadedImage;
  return cloudinary.url(asset.public_id, {
    secure: true,
    fetch_format: "auto",
    quality: "auto",
    version: asset.version,
  });
}

/** Keep Cloudinary delivery URLs on automatic format and quality. */
export function optimizeCloudinaryUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.hostname !== "res.cloudinary.com") return value;
    const path = url.pathname.split("/");
    const uploadIndex = path.indexOf("upload");
    if (uploadIndex < 0) return value;
    const transformIndex = uploadIndex + 1;
    const current = path[transformIndex] ?? "";
    const hasFormat = current.includes("f_auto");
    const hasQuality = current.includes("q_auto");
    if (hasFormat && hasQuality) return value;
    if (hasFormat || hasQuality) {
      const missing = [!hasFormat && "f_auto", !hasQuality && "q_auto"].filter(Boolean);
      path[transformIndex] = [current, ...missing].join(",");
    } else {
      path.splice(transformIndex, 0, "f_auto,q_auto");
    }
    url.pathname = path.join("/");
    return url.toString();
  } catch {
    return value;
  }
}
