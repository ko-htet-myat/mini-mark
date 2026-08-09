import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight } from "@hugeicons/core-free-icons";
import Image from "next/image";
import { ShopCategoryType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

function getImageByCategory(category: ShopCategoryType | string): string {
  switch (category) {
    case "RESTAURANT":
      return "/img/menu.png";
    case "LIQUOR_STORE":
      return "/img/liquor.png";
    default:
      return "/img/shopping.png";
  }
}

export function FashionHero({
  shopSlug,
  shopCategory,
}: {
  shopSlug: string;
  shopCategory: ShopCategoryType;
}) {
  return (
    <section className="mt-8 mb-12 rounded-2xl bg-[#fafafaf2] px-5 sm:px-8 py-5 lg:px-16 overflow-hidden relative border border-gray-100">
      <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
        <div className="max-w-xl">
          <h2 className=" text-lg sm:text-2xl md:text-4xl font-bold tracking-tight text-gray-900">
            {shopCategory === "RESTAURANT" ? (
              <>Browse Our Menu Paradise!</>
            ) : (
              <>Browse Our Product Paradise!</>
            )}
          </h2>
          <p className="text-gray-500 text-base md:text-lg my-4 lg:my-8 leading-relaxed">
            Step into a world of style and explore our diverse collection of
            clothing categories.
          </p>
          <Button
            asChild
            className={cn(
              " bg-primary text-white hover:bg-[#1E293B] h-10 sm:h-12 px-4 sm:px-8 rounded-lg ",
              {
                "bg-orange-600 hover:bg-orange-700":
                  shopCategory === "RESTAURANT",
              },
            )}
          >
            <Link href={`/${shopSlug}/products`}>
              Start Browsing
              <HugeiconsIcon icon={ArrowRight} />
            </Link>
          </Button>
        </div>

        <div className=" hidden relative w-full md:flex justify-end">
          {/* We will use a placeholder or image component here. Since we don't have the exact image file, we will use a generic placeholder or an unsplash image that matches the poncho */}
          <div className="relative w-full h-full max-w-sm ml-auto flex items-center justify-center">
            <Image
              src={getImageByCategory(shopCategory)}
              alt="Fashion Collection"
              width={512}
              height={512}
              className="object-contain max-h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
