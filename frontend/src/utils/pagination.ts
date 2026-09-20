export interface PaginationResult<T> {
  currentItems: T[];
  totalPages: number;
  pageNumbers: number[];
  hasNext: boolean;
  hasPrev: boolean;
}

export function paginate<T>(
  items: T[],
  currentPage: number,
  pageSize: number,
): PaginationResult<T> {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  //slice 메서드가 마지막 지정 숫자의 바로 앞 요소까지만 가져오기 때문엔
  const endIndex = startIndex + pageSize;

  const currentItems = items.slice(startIndex, endIndex);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  return {
    currentItems,
    totalPages,
    pageNumbers,
    hasNext: safeCurrentPage < totalPages,
    hasPrev: safeCurrentPage > totalPages,
  };
}
