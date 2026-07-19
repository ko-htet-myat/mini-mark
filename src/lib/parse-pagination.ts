export function parsePagination(params: { page?: string; pageSize?: string }) {
  const ALLOWED_PAGE_SIZES = [10, 20, 30, 50];
  const DEFAULT_PAGE_SIZE = 10;

  const page = Math.max(0, parseInt(params.page ?? "0", 10) || 0);
  const rawSize = parseInt(params.pageSize ?? String(DEFAULT_PAGE_SIZE), 10);
  const pageSize = ALLOWED_PAGE_SIZES.includes(rawSize)
    ? rawSize
    : DEFAULT_PAGE_SIZE;

  return { page, pageSize };
}
