"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const gallery = images.length > 0 ? images : ["/placeholder-product.png"];
  const activeImage = gallery[activeIndex];

  return (
    <div className="flex gap-4">
      {/* Thumbnail rail */}
      <div className="flex flex-col gap-3">
        {gallery.map((image, index) => (
          <button
            key={image + index}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show image ${index + 1} of ${productName}`}
            aria-current={index === activeIndex}
            className={cn(
              "relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-lg border bg-muted transition-colors",
              index === activeIndex
                ? "border-foreground"
                : "border-border hover:border-foreground/30",
            )}
          >
            <Image
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              fill
              sizes="120px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted">
        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          sizes="(min-width: 1024px) 520px, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
