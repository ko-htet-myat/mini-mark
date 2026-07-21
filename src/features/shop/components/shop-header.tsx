import Image from "next/image";

type ShopHeaderProps = {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
};

export function ShopHeader({
  name,
  description,
  logoUrl,
  bannerUrl,
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
          <div className="h-full w-full bg-gradient-to-r from-muted to-muted/60" />
        )}
      </div>

      {/* Logo + name, overlapping the banner */}
      <div className="relative flex items-end gap-4 px-6 -mt-5 sm:-mt-6">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-background bg-background sm:h-24 sm:w-24">
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
          <h1 className="text-xl font-semibold sm:text-2xl">{name}</h1>
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
