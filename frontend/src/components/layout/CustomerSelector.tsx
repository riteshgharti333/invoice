import { useState } from "react";
import { TbSearch } from "react-icons/tb";
import { useCustomers, useSearchCustomers } from "../../features/hooks/useCustomers";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

function extractListData<T>(response: any): T[] {
  if (!response?.data) return [];
  if (Array.isArray(response.data)) return response.data;
  if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
  return [];
}

interface CustomerSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
  onClear: () => void;
  error?: string;
  readOnly?: boolean;
}

export function CustomerSelector({
  selectedId,
  onSelect,
  onClear,
  error,
  readOnly = false,
}: CustomerSelectorProps) {
  const [search, setSearch] = useState("");

  const { data: customersData } = useCustomers({ cursor: "" });
  const { data: searchedCustomers } = useSearchCustomers({ q: search });
  const customers = extractListData<Customer>(search ? searchedCustomers : customersData);

  if (selectedId) {
    const customer = customers.find((c) => c.id === selectedId);
    return (
      <div>
        <div className="flex items-center justify-between px-4 py-3 bg-surface-hover rounded-2xl border-2 border-transparent">
          <div>
            <p className="text-sm font-medium text-text-primary">
              {customer?.name || "Loading..."}
            </p>
            <p className="text-xs text-text-muted">{customer?.phone || ""}</p>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-brand hover:underline font-medium"
            >
              Change
            </button>
          )}
        </div>
        {error && <p className="text-danger text-xs mt-1.5 font-medium">{error}</p>}
      </div>
    );
  }

  if (readOnly) return null;

  return (
    <div>
      <div className="relative">
        <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
        />
        {search && customers.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-border rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-border">
            {customers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelect(c.id);
                  setSearch("");
                }}
                className="w-full px-5 py-3 text-left hover:bg-surface-hover transition-colors flex items-center justify-between"
              >
                <span className="text-sm font-medium text-text-primary">{c.name}</span>
                <span className="text-xs text-text-muted">{c.phone}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-danger text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
}