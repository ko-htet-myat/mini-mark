"use client";
import Link from "next/link";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import "@/styles/swiper.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  _count: { products: number };
};

export function CategoryList({
  shopSlug,
  categories,
}: {
  shopSlug: string;
  categories: Category[];
}) {
  if (categories.length === 0) return null;

  return (
    <section className=" py-6">
      <h2 className="mb-3 sm:text-lg font-semibold">Browse By Category</h2>
      <Swiper
        slidesPerView={3}
        spaceBetween={30}
        pagination={false}
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        modules={[Pagination, Autoplay, Navigation]}
        breakpoints={{
          640: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 30,
          },
          1280: {
            slidesPerView: 6,
            spaceBetween: 30,
          },
          1536: {
            slidesPerView: 8,
            spaceBetween: 30,
          },
        }}
        className="categorySwiper"
      >
        {categories.map((category) => (
          <SwiperSlide key={category.id}>
            <Link
              href={`/${shopSlug}/products?category=${category.slug}`}
              className="flex w-20 sm:w-24 shrink-0 flex-col items-center gap-2 text-center"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="64px"
                    className="object-contain p-3"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
                    {category.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium leading-tight">
                {category.name}
              </span>
              {/* <span className="text-[10px] text-muted-foreground">
              {category._count.products}
            </span> */}
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
