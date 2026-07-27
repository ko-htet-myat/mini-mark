import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { ProductFormFieldsProps } from "./product-form-types";

export function ProductFormGeneralTab({
  register,
  watch,
  setValue,
  errors,
  categories,
  brands,
  tc,
  tp,
  autoSlug,
}: ProductFormFieldsProps) {
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!autoSlug) return;
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

  const nameErr = errors.name?.message;
  const slugErr = errors.slug?.message;
  const descErr = errors.description?.message;
  const priceErr = errors.price?.message;
  const compareErr = errors.compareAtPrice?.message;

  return (
    <TabsContent value="general" className="flex flex-col gap-5 pt-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{tc("name")}</Label>
        <Input
          id="name"
          {...register("name", { onChange: handleNameChange })}
        />
        {nameErr && <p className="text-sm text-destructive">{nameErr}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">{tc("slug")}</Label>
        <Input id="slug" {...register("slug")} />
        {slugErr && <p className="text-sm text-destructive">{slugErr}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">{tc("description")}</Label>
        <Textarea id="description" rows={4} {...register("description")} />
        {descErr && <p className="text-sm text-destructive">{descErr}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="price">{tp("price")}</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register("price")}
          />
          {priceErr && <p className="text-sm text-destructive">{priceErr}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="compareAtPrice">{tp("compare_at_price")}</Label>
          <Input
            id="compareAtPrice"
            type="number"
            step="0.01"
            min="0"
            {...register("compareAtPrice")}
          />
          {compareErr && (
            <p className="text-sm text-destructive">{compareErr}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="categoryId">{tp("category")}</Label>
          <Select
            value={watch("categoryId") || undefined}
            onValueChange={(value) =>
              setValue("categoryId", value === "__none__" ? "" : value, {
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger id="categoryId" className="w-full">
              <SelectValue placeholder={tp("select_category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{tp("none")}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.parent ? `${category.parent.name} > ` : ""}
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="brandId">{tp("brand")}</Label>
          <Select
            value={watch("brandId") || undefined}
            onValueChange={(value) =>
              setValue("brandId", value === "__none__" ? "" : value, {
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger id="brandId" className="w-full">
              <SelectValue placeholder={tp("select_brand")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{tp("none")}</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </TabsContent>
  );
}
