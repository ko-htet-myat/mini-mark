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

  const imageUrl = watch("imageUrl") ?? "";

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(
      "slug",
      e.target.value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"),
    );
  }

  return (
    <section className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Product name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g. Cotton T-Shirt"
          {...register("name", { onChange: handleNameChange })}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" placeholder="cotton-t-shirt" {...register("slug")} />
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} {...register("description")} />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Price + Compare-at */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">
            Base price <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("price")}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="compareAtPrice">Compare-at price</Label>
          <Input
            id="compareAtPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("compareAtPrice")}
          />
          {errors.compareAtPrice && (
            <p className="text-sm text-destructive">
              {errors.compareAtPrice.message}
            </p>
          )}
        </div>
      </div>

      {/* Category + Brand */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={watch("categoryId") || "__none__"}
            onValueChange={(value) =>
              setValue("categoryId", value === "__none__" ? "" : value)
            }
          >
            <SelectTrigger>
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
            value={watch("brandId") || "__none__"}
            onValueChange={(value) =>
              setValue("brandId", value === "__none__" ? "" : value)
            }
          >
            <SelectTrigger>
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
              onClick={() => setValue("imageUrl", "")}
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
            onUploaded={(asset) => setValue("imageUrl", asset.url)}
            onRemoved={() => setValue("imageUrl", "")}
          />
        )}
        {errors.imageUrl && (
          <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* YouTube URL */}
      <div className="space-y-1.5">
        <Label htmlFor="youtubeUrl">YouTube URL</Label>
        <Input
          id="youtubeUrl"
          placeholder="https://youtube.com/watch?v=..."
          {...register("youtubeUrl")}
        />
        {errors.youtubeUrl && (
          <p className="text-sm text-destructive">
            {errors.youtubeUrl.message}
          </p>
        )}
      </div>
    </section>
  );
}
