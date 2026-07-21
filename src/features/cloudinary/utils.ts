/**
 * Your Prisma models (Product.images, Shop.logoUrl, Shop.bannerUrl, Brand.logoUrl,
 * Category.imageUrl) store the full Cloudinary `secure_url`, not the `public_id`.
 * Deleting an asset requires the `public_id`, so we recover it from the URL.
 *
 * Example URL:
 *   https://res.cloudinary.com/demo/image/upload/v1699999999/shops/logos/abc123.png
 * Extracted public_id:
 *   shops/logos/abc123
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url) return null;

  try {
    const match = url.match(
      /\/upload\/(?:[a-z]+_[^/]+\/)*(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+(?:\?.*)?$/,
    );
    if (!match?.[1]) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}
