"use client";

import { useFormContext } from "react-hook-form";
import type { CreateProductInput } from "../../validations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/features/cloudinary/image-upload-field";

interface BaseInfoStepProps {
  shopSlug: string;
  categories: { id: string; name: string; parent?: { name: string } | null }[];
  brands: { id: string; name: string }[];
}

export function BaseInfoStep({
  shopSlug,
  categories,
  brands,
}: BaseInfoStepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateProductInput>();

  const imageUrl = watch("basicInfo.imageUrl") ?? "";

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(
      "basicInfo.slug",
      e.target.value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"),
    );
  }

  return (
    <section className=" grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
      <div className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Product name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. Cotton T-Shirt"
            {...register("basicInfo.name", { onChange: handleNameChange })}
          />
          {errors.basicInfo?.name && (
            <p className="text-sm text-destructive">
              {errors.basicInfo.name.message}
            </p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            placeholder="cotton-t-shirt"
            {...register("basicInfo.slug")}
          />
          {errors.basicInfo?.slug && (
            <p className="text-sm text-destructive">
              {errors.basicInfo.slug.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            {...register("basicInfo.description")}
            className=" resize-none"
          />
          {errors.basicInfo?.description && (
            <p className="text-sm text-destructive">
              {errors.basicInfo.description.message}
            </p>
          )}
        </div>
        {/* Category + Brand */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={watch("basicInfo.categoryId") || "__none__"}
              onValueChange={(value) =>
                setValue(
                  "basicInfo.categoryId",
                  value === "__none__" ? "" : value,
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.parent ? `${c.parent.name} > ` : ""}
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Brand</Label>
            <Select
              value={watch("basicInfo.brandId") || "__none__"}
              onValueChange={(value) =>
                setValue("basicInfo.brandId", value === "__none__" ? "" : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Product image */}
        <div className="space-y-1.5">
          <Label>Product image</Label>
          {imageUrl ? (
            <div className="relative w-40 aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Product"
                className="w-full h-full object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={() => setValue("basicInfo.imageUrl", "")}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ) : (
            <ImageUploadField
              label="Upload image"
              folder={`${shopSlug}/products/images`}
              value=""
              onUploaded={(asset) => setValue("basicInfo.imageUrl", asset.url)}
              onRemoved={() => setValue("basicInfo.imageUrl", "")}
            />
          )}
          {errors.basicInfo?.imageUrl && (
            <p className="text-sm text-destructive">
              {errors.basicInfo.imageUrl.message}
            </p>
          )}
        </div>

        {/* YouTube URL */}
        <div className="space-y-1.5">
          <Label htmlFor="youtubeUrl">YouTube URL</Label>
          <Input
            id="youtubeUrl"
            placeholder="https://youtube.com/watch?v=..."
            {...register("basicInfo.youtubeUrl")}
          />
          {errors.basicInfo?.youtubeUrl && (
            <p className="text-sm text-destructive">
              {errors.basicInfo.youtubeUrl.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
