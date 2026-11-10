import React from "react";
import type { PaginationProps } from "../utils/pagination";

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1.5 py-4 select-none">
      {/* 이전 페이지 (<) 버튼 */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="page-nav-btn"
      >
        &lt;
      </button>

      {/* 페이지 번호 버튼들 */}
      {pageNumbers.map((num) => {
        // const isActive = num === currentPage;
        return (
          <button
            key={num}
            type="button"
            onClick={() => onPageChange(num)}
            className={`page-num-btn ${currentPage === num ? "active" : ""}`}
          >
            {num}
          </button>
        );
      })}

      {/* 다음 페이지 (>) 버튼 */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="page-nav-btn"
      >
        &gt;
      </button>
    </div>
  );
};
