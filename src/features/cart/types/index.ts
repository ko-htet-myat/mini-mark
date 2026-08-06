export type CartItem = {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  variantLabel: string | null;
  price: number; // unit price snapshot at add-time
  imageUrl: string | null;
  quantity: number;
  maxStock: number; // clamp against variant/product stock
};

export type CartState = {
  shopSlug: string | null;
  items: CartItem[];
};
