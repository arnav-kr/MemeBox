import { v2 as cloudinary } from "cloudinary";
import { env } from "@/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export async function uploadAsset(
  file: string,
  folder = "memes"
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",
      transformation: [
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.log("failed to upload: ", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
}

export type DestroyResult = { result: string };

export async function deleteAsset(publicId: string): Promise<DestroyResult> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await cloudinary.uploader.destroy(publicId);
    return result as DestroyResult;
  } catch (error) {
    console.error("failed to delete: ", error);
    throw new Error("Failed to delete file from Cloudinary");
  }
}

export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    quality: options.quality ?? "auto",
    fetch_format: options.format ?? "auto",
    width: options.width,
    height: options.height,
    crop: options.crop ?? "fill",
  });
}

export default cloudinary;
