// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RegisterFn = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WatchFn = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SetValueFn = (...args: any[]) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Control = any;

export interface CategoryOption {
  id: string;
  name: string;
  parent?: { name: string } | null;
}

export interface BrandOption {
  id: string;
  name: string;
}

export interface AttributeValueOption {
  id: string;
  value: string;
}

export interface AttributeOption {
  id: string;
  name: string;
  values: AttributeValueOption[];
}

export interface PromotionOption {
  id: string;
  name: string;
  discountType: string;
  discountValue: number | string | { toString(): string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Errors = Record<string, any>;

export interface ProductFormFieldsProps {
  register: RegisterFn;
  watch: WatchFn;
  setValue: SetValueFn;
  control: Control;
  errors: Errors;
  isPending: boolean;
  serverError?: string;
  categories: CategoryOption[];
  brands: BrandOption[];
  attributes: AttributeOption[];
  promotions: PromotionOption[];
  shopSlug: string;
  currency: string;
  tc: (key: string, values?: Record<string, unknown>) => string;
  tp: (key: string, values?: Record<string, unknown>) => string;
  submitLabel: string;
  autoSlug?: boolean;
  onCancel: () => void;
}
