export interface ProductAttributeGroup {
  id: string;
  name: string;
  slug: string;
  values: { id: string; value: string }[];
}

export interface ProductVariantItem {
  id: string;
  sku: string | null;
  price: number | null;
  compareAtPrice: number | null;
  stock: number;
  status: string;
  imageUrl: string | null;
  attributeValueIds: string[];
}

export interface ProductPromotion {
  id: string;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  slug: string;
}

export interface ProductAddonGroup {
  groupName: string;
  minSelect: number;
  maxSelect: number;
  options: ProductAddonOption[];
}

export interface ProductAddonOption {
  name: string;
  /** Extra price on top of the base product price */
  price: number;
}

export interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  youtubeUrl: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  images: string[];
  isActive: boolean;
  hasVariants: boolean;
  stock: number;
  createdAt: string;

  brand: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
    parent: { id: string; name: string; slug: string } | null;
  } | null;

  attributeGroups: ProductAttributeGroup[];
  variants: ProductVariantItem[];
  promotions: ProductPromotion[];

  /** Key-value technical specs (ELECTRONICS, AUTOMOTIVE, HOME_GARDEN, BEAUTY) */
  specifications: Record<string, string> | null;

  /** Restaurant add-on / modifier groups (RESTAURANT) */
  addons: ProductAddonGroup[] | null;

  rating?: {
    average: number;
    count: number;
  };
}
