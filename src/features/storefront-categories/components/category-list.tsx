import Link from "next/link";
import Image from "next/image";

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
      <div className="grid gap-4 grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10">
        {categories.map((category) => (
          <Link
            key={category.id}
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
                  className="object-cover p-2"
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
        ))}
      </div>
    </section>
  );
}
