import "server-only";
import { v2 as cloudinary } from "cloudinary";

type UploadedImage = { public_id: string; version: number };

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

/** Upload a product image to Cloudinary and return an auto-optimized URL. */
export async function uploadProductImage(file: File, slug: string): Promise<string> {
  return uploadImage(file, "niffer/products", slug);
}

/** Upload the public store owner's profile photo to Cloudinary. */
export async function uploadAdminProfileImage(file: File): Promise<string> {
  return uploadImage(file, "niffer/store", "admin-profile");
}

async function uploadImage(file: File, folder: string, publicId: string): Promise<string> {
  configureCloudinary();

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await new Promise<UploadedImage>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          overwrite: true,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else if (!result) reject(new Error("Cloudinary haikurudisha picha."));
          else resolve(result);
        },
      );
      stream.end(buffer);
    },
  );

  return cloudinary.url(uploaded.public_id, {
    secure: true,
    fetch_format: "auto",
    quality: "auto",
    version: uploaded.version,
  });
}
