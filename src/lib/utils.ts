import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CURRENCY_LOCALE_MAP: Record<string, string> = {
  USD: "en-US",
  MMK: "my-MM",
  JPY: "ja-JP",
  KRW: "ko-KR",
  THB: "th-TH",
};

export function getCurrencyFormatter(currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  });
}
