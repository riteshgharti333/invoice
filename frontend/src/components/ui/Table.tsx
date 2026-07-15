import React, { type ReactNode } from 'react';
import { TbChevronDown, TbChevronUp, TbChevronsDown, TbSearch } from 'react-icons/tb';

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  skeletonRows?: number;
}

export function Table<T extends { id: string }>({
  columns,
  data,
  searchable = false,
  searchPlaceholder = 'Search...',
  onRowClick,
  emptyMessage = 'No data found',
  loading = false,
  skeletonRows = 5,
}: TableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((row) =>
      Object.values(row as Record<string, unknown>).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  const sortedData = React.useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {columns.map((col) => (
        <td key={col.key} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded-full w-3/4"></div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="w-full">
      {searchable && (
        <div className="mb-4 relative">
          <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
          />
        </div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider ${
                      col.sortable ? 'cursor-pointer select-none hover:text-text-primary transition-colors' : ''
                    } ${col.className || ''}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      {col.header}
                      {col.sortable && (
                        <span className="text-text-muted">
                          {sortKey === col.key ? (
                            sortDirection === 'asc' ? (
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
              {loading ? (
                Array.from({ length: skeletonRows }).map((_, i) => <SkeletonRow key={i} />)
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
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
                    onClick={() => onRowClick?.(row)}
                    className={`group hover:bg-surface/50 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-6 py-4 text-sm text-text-primary ${col.className || ''}`}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && sortedData.length > 0 && (
          <div className="px-6 py-3 border-t border-border bg-surface/30">
            <p className="text-xs text-text-muted">
              Showing {sortedData.length} of {data.length} results
            </p>
          </div>
        )}
      </div>
    </div>
  );
}