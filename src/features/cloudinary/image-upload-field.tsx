"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  Upload04Icon,
  Image02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CldImage } from "next-cloudinary";
import {
  useCloudinaryUpload,
  UploadedAsset,
} from "@/features/cloudinary/use-cloudinary";

interface ImageUploadFieldProps {
  label: string;
  folder: string;
  value: string | undefined | null;
  onUploaded: (asset: UploadedAsset) => void;
  onRemoved: () => void;
  shape?: "square" | "wide";
}

export function ImageUploadField({
  label,
  folder,
  value,
  onUploaded,
  onRemoved,
  shape = "square",
}: ImageUploadFieldProps) {
  const te = useTranslations("Error");
  const tc = useTranslations("Cloudinary");
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const { replace, remove, isUploading, isDeleting, progress, error } =
    useCloudinaryUpload({
      folder,
      onSuccess: (asset) => {
        onUploaded(asset);
        setLocalPreview(null);
      },
      onError: () => setLocalPreview(null),
    });

  const displayUrl = localPreview || value || null;
  const busy = isUploading || isDeleting;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    await replace(file, value || null);

    URL.revokeObjectURL(objectUrl);
  }

  async function handleRemove() {
    if (!value) return;
    const ok = await remove(value);
    if (ok) {
      onRemoved();
    } else {
      toast.error(error ?? te("something_went_wrong"));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div
        className={
          shape === "square"
            ? "relative h-24 w-24 overflow-hidden rounded-md border bg-muted"
            : "relative h-24 w-full overflow-hidden rounded-md border bg-muted sm:w-56"
        }
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt={label}
            className="h-full w-full object-cover"
          />
        ) : value ? (
          <CldImage
            src={value}
            alt={label}
            fill
            sizes={shape === "square" ? "96px" : "224px"}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <HugeiconsIcon icon={Image02Icon} size={28} />
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/80 text-xs font-medium">
            <span>{isUploading ? `${progress}%` : tc("removing")}</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={busy}
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <HugeiconsIcon icon={Upload04Icon} size={16} className="mr-1" />
          {value ? tc("replace") : tc("upload")}
        </Button>

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={handleRemove}
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} className="mr-1" />
            {tc("remove")}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
