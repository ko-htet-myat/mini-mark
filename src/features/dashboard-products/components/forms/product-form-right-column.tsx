import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUploadField } from "@/features/cloudinary/image-upload-field";
import { ProductFormFieldsProps } from "./product-form-types";

export function ProductFormRightColumn(props: ProductFormFieldsProps) {
  const { register, watch, setValue, errors, shopSlug, tc, tp } = props;
  const imageUrl = watch("imageUrl") ?? "";

  function setImage(url: string) {
    setValue("imageUrl", url || "", { shouldDirty: true });
  }

  function removeImage() {
    setValue("imageUrl", "", { shouldDirty: true });
  }

  const youtubeErr = errors.youtubeUrl?.message;
  const imagesErr = errors.imageUrl?.message;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {tp("section_media")}
        </h3>
        <div className="flex flex-col gap-3">
          <Label>{tc("image")}</Label>
          {imageUrl ? (
            <div className="relative w-full aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ) : (
            <ImageUploadField
              label={tp("add_image")}
              folder={`${shopSlug}/products/images`}
              value=""
              onUploaded={(asset) => setImage(asset.url)}
              onRemoved={() => {}}
            />
          )}
          {imagesErr && (
            <p className="text-sm text-destructive">{tp("images_invalid")}</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {tp("youtube_url")}
        </h3>
        <Input id="youtubeUrl" {...register("youtubeUrl")} />
        {youtubeErr && <p className="text-sm text-destructive">{youtubeErr}</p>}
      </section>

      <section className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="isActive">{tp("is_active")}</Label>
          <p className="text-sm text-muted-foreground">
            {tp("is_active_description")}
          </p>
        </div>
        <Switch
          id="isActive"
          checked={watch("isActive")}
          onCheckedChange={(checked) =>
            setValue("isActive", checked, { shouldDirty: true })
          }
        />
      </section>
    </div>
  );
}
