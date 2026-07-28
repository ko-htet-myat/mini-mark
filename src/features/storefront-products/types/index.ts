export interface ProductAttributeGroup {
  id: string;
  name: string; // e.g. "Color", "Size"
  slug: string;
  values: { id: string; value: string }[];
}

export interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  images: string[];
  isActive: boolean;
  hasVariants: boolean;
  stock: number;

  brand: { id: string; name: string; slug: string } | null;
  category: {
    id: string;
    name: string;
    slug: string;
    parent: { id: string; name: string; slug: string } | null;
  } | null;

  attributeGroups: ProductAttributeGroup[];

  rating?: {
    average: number;
    count: number;
  };
}
