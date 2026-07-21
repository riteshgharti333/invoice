import { useState } from "react";
import { TbSearch, TbQuote, TbLoader } from "react-icons/tb";
import { useSearchQuotations } from "../../features/hooks/useQuotations";
import { formatCurrency } from "../../utils/moneyCalc";
import { FormSection } from "../ui/FormSection";

interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customer?: { id: string; name: string; phone: string };
  issueDate: string;
  expiryDate?: string;
  discount: number;
  tax: number;
  notes?: string;
  termsConditions?: string;
  items?: {
    serviceId: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    discount?: number;
  }[];
}

function extractListData<T>(response: any): T[] {
  if (!response?.data) return [];
  if (Array.isArray(response.data)) return response.data;
  if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
  return [];
}

interface QuotationSelectorProps {
  selected: Quotation | null;
  onSelect: (quotation: Quotation) => void;
  onClear: () => void;
}

export function QuotationSelector({ selected, onSelect, onClear }: QuotationSelectorProps) {
  const [search, setSearch] = useState("");

  const { data: quotationsData, isFetching: isSearching } = useSearchQuotations({
    q: search,
    status: "APPROVED",
  });
  const quotations = extractListData<Quotation>(quotationsData);

  if (selected) {
    return (
      <div className="bg-success-light/50 border border-success/20 rounded-2xl p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
            <TbQuote size={20} className="text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-success">
              Quotation #{selected.quotationNumber}
            </p>
            <p className="text-xs text-success/70">
              {selected.customer?.name} ·{" "}
              {formatCurrency(
                selected.items?.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) || 0
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-success hover:underline font-medium"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-border p-6 mb-6 shadow-card">
      <FormSection
        icon={TbQuote}
        title="Select Approved Quotation"
        subtitle="Search and select an approved quotation to create invoice"
      >
        <div>
          {/* Input + Spinner Container */}
          <div className="relative">
            <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name or quotation number..."
              className="w-full pl-11 pr-10 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
            />

            {/* 🔵 Loading Spinner — Right Side */}
            {isSearching && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <TbLoader size={16} className="text-brand animate-spin" />
              </div>
            )}
          </div>

          {/* Results */}
          {search && quotations.length > 0 && (
            <div className="mt-2 bg-white border border-border rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-border">
              {quotations.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    onSelect(q);
                    setSearch("");
                  }}
                  className="w-full px-5 py-3.5 text-left hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-mono font-bold text-text-primary">
                      #{q.quotationNumber}
                    </span>
                    <span className="text-xs text-text-muted">
                      {q.issueDate?.split("T")[0]}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {q.customer?.name || "Unknown"}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {search && !isSearching && quotations.length === 0 && (
            <div className="mt-2 bg-white border border-border rounded-2xl shadow-xl p-6 text-center">
              <div className="w-10 h-10 bg-surface-hover rounded-xl flex items-center justify-center mx-auto mb-2">
                <TbSearch size={18} className="text-text-muted" />
              </div>
              <p className="text-sm font-semibold text-text-primary">No quotations found</p>
              <p className="text-xs text-text-muted mt-0.5">Try a different search term</p>
            </div>
          )}
        </div>
      </FormSection>
    </div>
  );
}