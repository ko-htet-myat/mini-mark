import Image from "next/image";

type ShopHeaderProps = {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  currency?: string;
};

export function ShopHeader({
  name,
  description,
  logoUrl,
  bannerUrl,
  currency,
}: ShopHeaderProps) {
  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative h-40 w-full overflow-hidden rounded-b-lg bg-muted sm:h-56 md:h-72">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={`${name} banner`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-r from-muted to-muted/60" />
        )}
      </div>

      {/* Logo + name, overlapping the banner */}
      <div className=" container relative flex items-end gap-4 -mt-3 sm:-mt-6">
        <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-full border-4 border-background bg-background sm:h-24 sm:w-24">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${name} logo`}
              fill
              sizes="(max-width: 640px) 80px, 96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-xl font-semibold text-muted-foreground">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="pb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold sm:text-2xl">{name}</h1>
            {/* {currency && (
              <span className="rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                {currency}
              </span>
            )} */}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
