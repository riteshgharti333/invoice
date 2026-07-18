import React, { type ReactNode } from "react";
import {
  TbChevronDown,
  TbChevronUp,
  TbChevronsDown,
  TbSearch,
  TbFilter,
  TbX,
  TbChevronLeft,
  TbChevronRight,
  TbChevronsLeft,
  TbChevronsRight,
  TbDots,
} from "react-icons/tb";
import { useNavigate } from "react-router-dom";

interface Column<T> {
  accessorKey?: string;
  key?: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  cell?: (info: any) => ReactNode;
  className?: string;
}

interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "date" | "text";
  options?: string[];
  placeholder?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];

  isLoading?: boolean;
  mode?: "normal" | "search" | "filter";
  hasPrevious?: boolean;
  hasNext?: boolean;
  currentPage?: number;
  searchTerm?: string;
  filters?: Record<string, string>;

  onNextPage?: () => void;
  onPrevPage?: () => void;
  onApplyFilters?: (filters: Record<string, string>) => void;
  onClearFilters?: () => void;
  onSearchChange?: (term: string) => void;

  path?: string;
  searchConfig?: {
    placeholder?: string;
  };
  filtersConfig?: FilterConfig[];
  filterLabels?: Record<string, string>;
  emptyMessage?: string;
  skeletonRows?: number;
}

export function Table<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  mode = "normal",
  hasPrevious = false,
  hasNext = false,
  currentPage = 0,
  searchTerm = "",
  filters = {},
  onNextPage,
  onPrevPage,
  onApplyFilters,
  onClearFilters,
  onSearchChange,
  path,
  searchConfig = {},
  filtersConfig = [],
  filterLabels = {},
  emptyMessage = "No data found",
  skeletonRows = 5,
}: TableProps<T>) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "asc",
  );
  const [showFilter, setShowFilter] = React.useState(false);
  const [localFilters, setLocalFilters] =
    React.useState<Record<string, string>>(filters);
  const [filtersChanged, setFiltersChanged] = React.useState(false);
  const [debouncedTerm, setDebouncedTerm] = React.useState(searchTerm);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedTerm.length >= 2 || debouncedTerm.length === 0) {
        onSearchChange?.(debouncedTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedTerm]);

  React.useEffect(() => {
    setLocalFilters(filters);
    setFiltersChanged(false);
  }, [filters]);

  React.useEffect(() => {
    if (searchTerm !== debouncedTerm) {
      setDebouncedTerm(searchTerm);
    }
  }, [searchTerm]);

  const handleLocalFilterChange = (key: string, value: string) => {
    setLocalFilters((prev) => {
      const newFilters = { ...prev };
      if (value === "" || value === "All") {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
    setFiltersChanged(true);
  };

  const handleApplyLocalFilters = () => {
    const cleanedFilters = { ...localFilters };
    Object.keys(cleanedFilters).forEach((key) => {
      if (cleanedFilters[key] === "" || cleanedFilters[key] === "All") {
        delete cleanedFilters[key];
      }
    });
    onApplyFilters?.(cleanedFilters);
    setShowFilter(false);
    setFiltersChanged(false);
  };

  const handleClearAllFilters = () => {
    setLocalFilters({});
    setFiltersChanged(true);
    onClearFilters?.();
    setShowFilter(false);
  };

  const handleCancelFilters = () => {
    setLocalFilters(filters);
    setShowFilter(false);
    setFiltersChanged(false);
  };

  const activeFilters = Object.entries(filters).filter(
    ([_, value]) => value !== "" && value !== "All" && value != null,
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleRowClick = (row: T) => {
    if (path) {
      navigate(`/${path}/${row.id}`);
    }
  };

  const sortedData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const comparison = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  const getCellValue = (row: T, col: Column<T>): ReactNode => {
    const accessorKey = col.accessorKey || col.key;
    if (col.cell) {
      const result = col.cell({
        getValue: () =>
          accessorKey
            ? (row as Record<string, unknown>)[accessorKey]
            : undefined,
        row: { original: row },
      });
      return result as ReactNode;
    }
    if (col.render) return col.render(row);
    if (accessorKey)
      return (row as Record<string, unknown>)[accessorKey] as ReactNode;
    return null;
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {columns.map((col) => (
        <td key={col.key || col.accessorKey} className="px-6 py-4">
          <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="w-full space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder={searchConfig.placeholder || "Search..."}
            value={debouncedTerm}
            onChange={(e) => setDebouncedTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-brand focus:bg-white transition-all border border-transparent focus:border-brand"
          />
        </div>

        {/* Filter + Active Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-light text-brand text-xs font-medium rounded-xl"
            >
              {filterLabels[key] || key}: {value}
              <button
                onClick={() => {
                  const newFilters = { ...filters };
                  delete newFilters[key];
                  onApplyFilters?.(newFilters);
                }}
                className="ml-0.5 hover:bg-brand/10 rounded-full p-0.5 transition-colors"
              >
                <TbX size={12} />
              </button>
            </span>
          ))}

          {filtersConfig.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-2xl transition-all duration-200 ${
                  activeFilters.length > 0
                    ? "bg-brand text-white shadow-md shadow-brand/20"
                    : "bg-surface-hover text-brand hover:bg-surface-hover/80 border border-brand"
                }`}
              >
                <TbFilter size={16} />
                Filter
                {activeFilters.length > 0 && (
                  <span className="bg-white/20 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {activeFilters.length}
                  </span>
                )}
              </button>

              {showFilter && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowFilter(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-xl border border-border p-5 z-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-text-primary">
                        Filters
                      </h3>
                      {activeFilters.length > 0 && (
                        <button
                          onClick={handleClearAllFilters}
                          className="text-xs text-danger hover:underline font-medium"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {filtersConfig.map((filter) => (
                        <div key={filter.key}>
                          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                            {filter.label}
                          </label>
                          {filter.type === "select" ? (
                            <select
                              className="w-full border border-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 bg-surface-hover"
                              value={localFilters[filter.key] || ""}
                              onChange={(e) =>
                                handleLocalFilterChange(
                                  filter.key,
                                  e.target.value,
                                )
                              }
                            >
                              <option value="">All</option>
                              {filter.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : filter.type === "date" ? (
                            <input
                              type="date"
                              className="w-full border border-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 bg-surface-hover"
                              value={localFilters[filter.key] || ""}
                              onChange={(e) =>
                                handleLocalFilterChange(
                                  filter.key,
                                  e.target.value,
                                )
                              }
                            />
                          ) : (
                            <input
                              type="text"
                              placeholder={filter.placeholder || ""}
                              className="w-full border border-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 bg-surface-hover"
                              value={localFilters[filter.key] || ""}
                              onChange={(e) =>
                                handleLocalFilterChange(
                                  filter.key,
                                  e.target.value,
                                )
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
                      <button
                        onClick={handleCancelFilters}
                        className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApplyLocalFilters}
                        disabled={!filtersChanged}
                        className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${
                          filtersChanged
                            ? "bg-brand text-white hover:shadow-md hover:shadow-brand/20"
                            : "bg-surface-hover text-text-muted cursor-not-allowed"
                        }`}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <th
                    key={col.key || col.accessorKey}
                    className={`px-6 py-4 first:pl-0 text-left text-xs font-bold text-text-muted uppercase tracking-wider ${
                      col.sortable
                        ? "cursor-pointer select-none hover:text-text-primary transition-colors"
                        : ""
                    } ${col.className || ""}`}
                    onClick={() =>
                      col.sortable && handleSort(col.key || col.accessorKey!)
                    }
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable && (
                        <span className="text-text-muted/50">
                          {sortKey === (col.key || col.accessorKey) ? (
                            sortDirection === "asc" ? (
                              <TbChevronUp size={14} />
                            ) : (
                              <TbChevronDown size={14} />
                            )
                          ) : (
                            <TbChevronsDown size={12} className="opacity-30" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: skeletonRows }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-24 text-center"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-surface-hover rounded-3xl flex items-center justify-center">
                        <TbSearch size={28} className="text-text-muted" />
                      </div>
                      <div>
                        <p className="text-text-primary font-semibold text-sm">
                          {emptyMessage}
                        </p>
                        <p className="text-text-muted text-xs mt-1">
                          Try adjusting your search or filter
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    className="group hover:bg-surface-hover transition-colors duration-150 cursor-pointer"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key || col.accessorKey}
                        className={`px-6 py-4 first:pl-0  text-sm text-text-primary ${col.className || ""}`}
                      >
                        {getCellValue(row, col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && sortedData.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between">
            <p className="text-xs text-text-muted font-medium">
              Page {currentPage + 1} · {sortedData.length} results
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={onPrevPage}
                disabled={!hasPrevious}
                className="p-2 rounded-xl hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <TbChevronLeft size={16} className="text-text-secondary" />
              </button>
              <button
                onClick={onNextPage}
                disabled={!hasNext}
                className="p-2 rounded-xl hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <TbChevronRight size={16} className="text-text-secondary" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
