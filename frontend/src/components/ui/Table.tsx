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

  // Controller props
  isLoading?: boolean;
  mode?: "normal" | "search" | "filter";
  hasPrevious?: boolean;
  hasNext?: boolean;
  currentPage?: number;
  searchTerm?: string;
  filters?: Record<string, string>;

  // Actions
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onApplyFilters?: (filters: Record<string, string>) => void;
  onClearFilters?: () => void;
  onSearchChange?: (term: string) => void;

  // UI Config
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

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedTerm.length >= 2 || debouncedTerm.length === 0) {
        onSearchChange?.(debouncedTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedTerm]);

  // Sync external filters
  React.useEffect(() => {
    setLocalFilters(filters);
    setFiltersChanged(false);
  }, [filters]);

  // Sync external search
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
    const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortDirection === 'asc' ? comparison : -comparison;
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

    if (col.render) {
      return col.render(row);
    }

    if (accessorKey) {
      const value = (row as Record<string, unknown>)[accessorKey];
      return value as ReactNode;
    }

    return null;
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {columns.map((col) => (
        <td key={col.key || col.accessorKey} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded-full w-3/4"></div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="w-full">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder={searchConfig.placeholder || "Search..."}
            value={debouncedTerm}
            onChange={(e) => setDebouncedTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {activeFilters.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {filterLabels[key] || key}: {value}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters };
                      delete newFilters[key];
                      onApplyFilters?.(newFilters);
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <TbX size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {filtersConfig.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-surface-hover transition-all ${
                  activeFilters.length > 0
                    ? "text-brand bg-brand/5 border-brand/30"
                    : "text-text-secondary"
                }`}
              >
                <TbFilter size={16} />
                Filter
                {activeFilters.length > 0 && (
                  <span className="bg-brand text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </button>

              {showFilter && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-xl shadow-xl p-4 z-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-text-primary">
                      Filter Options
                    </h3>
                    {activeFilters.length > 0 && (
                      <button
                        onClick={handleClearAllFilters}
                        className="text-xs text-danger hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {filtersConfig.map((filter) => (
                    <div key={filter.key} className="mb-3">
                      <label className="block text-xs text-text-secondary mb-1">
                        {filter.label}
                      </label>
                      {filter.type === "select" ? (
                        <select
                          className="w-full border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20"
                          value={localFilters[filter.key] || ""}
                          onChange={(e) =>
                            handleLocalFilterChange(filter.key, e.target.value)
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
                          className="w-full border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20"
                          value={localFilters[filter.key] || ""}
                          onChange={(e) =>
                            handleLocalFilterChange(filter.key, e.target.value)
                          }
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={filter.placeholder || ""}
                          className="w-full border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20"
                          value={localFilters[filter.key] || ""}
                          onChange={(e) =>
                            handleLocalFilterChange(filter.key, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={handleCancelFilters}
                      className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyLocalFilters}
                      disabled={!filtersChanged}
                      className={`px-4 py-1.5 text-sm text-white rounded-lg ${
                        filtersChanged
                          ? "bg-brand hover:opacity-90"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                {columns.map((col) => (
                  <th
                    key={col.key || col.accessorKey}
                    className={`px-6 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider ${
                      col.sortable
                        ? "cursor-pointer select-none hover:text-text-primary transition-colors"
                        : ""
                    } ${col.className || ""}`}
                    onClick={() =>
                      col.sortable && handleSort(col.key || col.accessorKey!)
                    }
                  >
                    <div className="flex items-center gap-2">
                      {col.header}
                      {col.sortable && (
                        <span className="text-text-muted">
                          {sortKey === (col.key || col.accessorKey) ? (
                            sortDirection === "asc" ? (
                              <TbChevronUp size={16} />
                            ) : (
                              <TbChevronDown size={16} />
                            )
                          ) : (
                            <TbChevronsDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading ? (
                Array.from({ length: skeletonRows }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <TbSearch size={40} className="text-text-muted" />
                      <p className="text-text-muted text-sm">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    className="group hover:bg-surface/50 transition-colors cursor-pointer"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key || col.accessorKey}
                        className={`px-6 py-4 text-sm text-text-primary ${col.className || ""}`}
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
          <div className="px-6 py-3 flex items-center justify-between border-t border-border bg-surface/30">
            <p className="text-xs text-text-muted">
              Showing {sortedData.length} results
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={onPrevPage}
                disabled={!hasPrevious}
                className="p-1.5 rounded-lg hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <TbChevronLeft size={16} className="text-text-secondary" />
              </button>
              <span className="text-sm text-text-secondary px-2">
                Page {currentPage + 1}
              </span>
              <button
                onClick={onNextPage}
                disabled={!hasNext}
                className="p-1.5 rounded-lg hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <TbChevronRight size={16} className="text-text-secondary" />
              </button>
            </div>
          </div>
        )}

        {/* Mode indicator */}
        {(mode === "search" || mode === "filter") && sortedData.length > 0 && (
          <div className="px-6 py-2 border-t border-border bg-blue-50">
            <p className="text-xs text-blue-700">
              {mode === "search" ? "Search" : "Filter"} results:{" "}
              {sortedData.length} records found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
