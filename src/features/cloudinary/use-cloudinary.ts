"use client";

import { useCallback, useState } from "react";
import { extractCloudinaryPublicId } from "./utils";
import { deleteCloudinaryImageAction } from "./action";

type ResourceType = "image" | "video" | "raw";

interface SignedParamsResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder?: string;
}

export interface UploadedAsset {
  url: string;
  publicId: string;
}

export interface UseCloudinaryUploadOptions {
  /** Cloudinary folder to upload into, e.g. "shops/logos" or "products". */
  folder?: string;
  resourceType?: ResourceType;
  /** Reject files larger than this (MB). Default 5MB. */
  maxSizeMb?: number;
  onSuccess?: (asset: UploadedAsset) => void;
  onError?: (message: string) => void;
}

export interface UseCloudinaryUploadReturn {
  /** Upload a single file, returns the new asset (or null on failure). */
  upload: (file: File) => Promise<UploadedAsset | null>;
  /** Upload a new file and, if it succeeds, delete the previous asset. */
  replace: (
    file: File,
    previousUrl?: string | null,
  ) => Promise<UploadedAsset | null>;
  /** Delete an asset from Cloudinary given its stored URL. */
  remove: (url: string) => Promise<boolean>;
  isUploading: boolean;
  isDeleting: boolean;
  /** 0-100 upload progress. */
  progress: number;
  error: string | null;
}

/**
 * Drop-in hook for any Cloudinary image upload in the dashboard: shop
 * logo/banner, brand logo, category image, product images, etc.
 *
 * Usage (as in SettingsForm):
 *   const { replace, isUploading, progress } = useCloudinaryUpload({
 *     folder: "shops/logos",
 *     onSuccess: (asset) => form.setValue("logoUrl", asset.url),
 *   });
 *
 *   <input type="file" onChange={(e) => {
 *     const file = e.target.files?.[0];
 *     if (file) replace(file, form.getValues("logoUrl"));
 *   }} />
 */
export function useCloudinaryUpload(
  options: UseCloudinaryUploadOptions = {},
): UseCloudinaryUploadReturn {
  const {
    folder,
    resourceType = "image",
    maxSizeMb = 5,
    onSuccess,
    onError,
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<UploadedAsset | null> => {
      setError(null);

      if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
        const msg = `File is larger than ${maxSizeMb}MB`;
        setError(msg);
        onError?.(msg);
        return null;
      }

      setIsUploading(true);
      setProgress(0);

      try {
        // 1. Ask our own API for a signature. The Cloudinary API secret stays
        //    on the server; the browser only ever sees a short-lived signature.
        const signRes = await fetch("/api/sign-cloudinary-params", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder }),
        });

        if (!signRes.ok) throw new Error("Could not get upload signature");
        const signed: SignedParamsResponse = await signRes.json();

        // 2. Upload directly to Cloudinary with XHR so we can report progress.
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signed.apiKey);
        formData.append("timestamp", String(signed.timestamp));
        formData.append("signature", signed.signature);
        if (signed.folder) formData.append("folder", signed.folder);

        const result = await new Promise<{
          secure_url: string;
          public_id: string;
        }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(
            "POST",
            `https://api.cloudinary.com/v1_1/${signed.cloudName}/${resourceType}/upload`,
          );

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              setProgress(Math.round((event.loaded / event.total) * 100));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error("Cloudinary upload failed"));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.send(formData);
        });

        const asset: UploadedAsset = {
          url: result.secure_url,
          publicId: result.public_id,
        };
        onSuccess?.(asset);
        return asset;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
        onError?.(msg);
        return null;
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [folder, resourceType, maxSizeMb, onSuccess, onError],
  );

  const remove = useCallback(
    async (url: string): Promise<boolean> => {
      setError(null);
      const publicId = extractCloudinaryPublicId(url);
      if (!publicId) {
        setError("Could not resolve a Cloudinary public_id from that URL");
        return false;
      }

      setIsDeleting(true);
      try {
        const result = await deleteCloudinaryImageAction({
          publicId,
          resourceType,
        });

        if (!result?.data?.success) {
          const msg = result?.serverError ?? "Could not delete image";
          setError(typeof msg === "string" ? msg : "Could not delete image");
          return false;
        }
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Delete failed";
        setError(msg);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [resourceType],
  );

  const replace = useCallback(
    async (
      file: File,
      previousUrl?: string | null,
    ): Promise<UploadedAsset | null> => {
      const asset = await upload(file);
      // Only clean up the old asset once the new one is safely uploaded, and
      // don't let a cleanup failure block the caller from using the new URL.
      if (asset && previousUrl) {
        remove(previousUrl).catch(() => {});
      }
      return asset;
    },
    [upload, remove],
  );

  return { upload, replace, remove, isUploading, isDeleting, progress, error };
}
