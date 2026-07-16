import { useState, useEffect, useCallback } from "react";

interface UseTableControllerProps {
  normalDataHook: (params?: any) => any;
  searchDataHook: (params: any) => any;
  filterDataHook: (params: any) => any;
}

export function useTableController({
  normalDataHook,
  searchDataHook,
  filterDataHook,
}: UseTableControllerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<"normal" | "search" | "filter">("normal");
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([]);

  // Determine mode
  useEffect(() => {
    let newMode: "normal" | "search" | "filter" = "normal";

    if (searchTerm && searchTerm.length >= 2) {
      newMode = "search";
    } else if (Object.keys(filters).length > 0) {
      newMode = "filter";
    }

    if (newMode !== mode) {
      setMode(newMode);
      setCursor(null);
      setCursorHistory([]);
    }
  }, [searchTerm, filters, mode]);

  // Only call active hook
  const normalData = normalDataHook(
    mode === "normal" ? { cursor } : undefined
  );

  const searchData = searchDataHook(
    mode === "search" ? { q: searchTerm, cursor } : { q: "", cursor: undefined }
  );

  const filterData = filterDataHook(
    mode === "filter" ? { ...filters, cursor } : { cursor: undefined }
  );

  // Select active dataset
  const getCurrentData = () => {
    switch (mode) {
      case "search":
        return searchData?.data;
      case "filter":
        return filterData?.data;
      default:
        return normalData?.data;
    }
  };

  const response = getCurrentData();
  const currentData = response?.data || [];
  const pagination = response?.pagination || {};
  const hasMore = response?.hasMore || pagination?.hasMore || false;
  const nextCursor = response?.nextCursor || pagination?.nextCursor || null;

  const isLoading =
    (mode === "normal" && normalData?.isLoading) ||
    (mode === "search" && searchData?.isLoading) ||
    (mode === "filter" && filterData?.isLoading);

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    if (nextCursor && hasMore) {
      setCursorHistory((prev) => [...prev, cursor]);
      setCursor(nextCursor);
    }
  }, [nextCursor, hasMore, cursor]);

  const handlePrevPage = useCallback(() => {
    setCursorHistory((prev) => {
      if (prev.length === 0) return prev;
      const previousCursor = prev[prev.length - 1];
      setCursor(previousCursor);
      return prev.slice(0, -1);
    });
  }, []);

  // Filter handlers
  const handleApplyFilters = useCallback((newFilters: Record<string, string>) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
  }, []);

  // Search handler
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return {
    data: currentData,
    isLoading,
    mode,
    hasPrevious: cursorHistory.length > 0,
    hasNext: hasMore,
    currentPage: cursorHistory.length,
    searchTerm,
    filters,
    onNextPage: handleNextPage,
    onPrevPage: handlePrevPage,
    onApplyFilters: handleApplyFilters,
    onClearFilters: handleClearFilters,
    onSearchChange: handleSearchChange,
  };
}