import React, { type SelectHTMLAttributes, useMemo, useState } from "react";
import "../assets/styles/CustomSelect.css";
import { Pagination } from "./Pagination";

interface OptionItem {
  value: string | number;
  label: string;
}

interface CustomSelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> {
  options: OptionItem[];
  placeholderOption?: string;
  // pageSize?: number;
  onChange?: (value: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (newPage: number) => void;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  placeholderOption,
  className = "",
  // pageSize = 5,
  onChange,
  value,
  currentPage,
  totalPages,
  onPageChange,
  ...props
}) => {
  // const [currentPage, setCurrentPage] = useState<number>(1);

  // const totalPages = Math.max(1, Math.ceil(options.length / pageSize));
  // const safeCurrentPage = Math.min(currentPage, totalPages);

  return (
    <div className={`custom-select-container ${className}`}>
      <select
        className={"custom-select-element"}
        value={value}
        {...props}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {placeholderOption && <option value="">{placeholderOption}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {totalPages > 1 && (
        <div className="custom-select-card-bottom">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(newPage) => onPageChange?.(newPage)}
          />
        </div>
      )}
    </div>
  );
};
