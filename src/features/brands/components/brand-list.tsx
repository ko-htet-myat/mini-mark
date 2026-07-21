import Link from "next/link";
import Image from "next/image";

type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  _count: { products: number };
};

export function BrandList({
  shopSlug,
  brands,
}: {
  shopSlug: string;
  brands: Brand[];
}) {
  if (brands.length === 0) return null;

  return (
    <section className="px-6 py-6">
      <h2 className="mb-3 text-lg font-semibold">Brands</h2>
      <div className=" grid gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/${shopSlug}/products?brand=${brand.slug}`}
            className="flex w-24 shrink-0 flex-col items-center gap-2 text-center"
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-background">
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
                  {brand.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-xs font-medium leading-tight">
              {brand.name}
            </span>
            {/* <span className="text-[10px] text-muted-foreground">
              {brand._count.products}
            </span> */}
          </Link>
        ))}
      </div>
    </section>
  );
}
