export const setLocaleCookie = (locale: string) => {
  if (typeof document !== "undefined") {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000;`;
  }
};
