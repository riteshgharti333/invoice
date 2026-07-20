import { TbPlus, TbTrash, TbSearch } from "react-icons/tb";
import { Button } from "../ui/ButtonProps";
import { FormSection } from "../ui/FormSection";
import { FormField } from "../ui/FormField";
import { formatCurrency } from "../../utils/moneyCalc";
import type { CalcItem } from "../../utils/moneyCalc";

interface Service {
  id: string;
  name: string;
  price: number;
  taxRate: number;
}

interface LineItem extends CalcItem {
  id: string;
  serviceId: string;
  description: string;
  total: number;
}

interface LineItemsSectionProps {
  items: LineItem[];
  services: Service[];
  serviceSearch: Record<string, string>;
  onServiceSearchChange: (itemId: string, value: string) => void;
  onServiceSelect: (itemId: string, serviceId: string) => void;
  onUpdateItem: (
    id: string,
    field: keyof LineItem,
    value: string | number,
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  subtitle?: string;
}

export function LineItemsSection({
  items,
  services,
  serviceSearch,
  onServiceSearchChange,
  onServiceSelect,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  subtitle,
}: LineItemsSectionProps) {
  return (
    <FormSection
      icon={TbPlus}
      title="Line Items"
      subtitle={subtitle || "Add services to invoice"}
      action={
        <Button size="sm" icon={TbPlus} onClick={onAddItem} type="button">
          Add Item
        </Button>
      }
    >
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="p-5 bg-surface-hover rounded-2xl border border-border space-y-3"
          >
            {/* Item Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Item #{index + 1}
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1.5 hover:bg-danger-light rounded-lg transition-colors"
                >
                  <TbTrash size={14} className="text-danger" />
                </button>
              )}
            </div>

            {/* Item Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Service Selection */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Service *
                </label>
                {item.serviceId ? (
                  <div className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border-2 border-transparent">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {services.find((s) => s.id === item.serviceId)?.name ||
                          "Loading..."}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatCurrency(
                          services.find((s) => s.id === item.serviceId)
                            ?.price || 0,
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateItem(item.id, "serviceId", "")}
                      className="text-xs text-brand hover:underline font-medium"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <input
                      type="text"
                      value={serviceSearch[item.id] || ""}
                      onChange={(e) =>
                        onServiceSearchChange(item.id, e.target.value)
                      }
                      placeholder="Search services..."
                      className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                    {serviceSearch[item.id] && services.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-border rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-border">
                        {services.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => onServiceSelect(item.id, s.id)}
                            className="w-full px-5 py-3 text-left hover:bg-surface-hover transition-colors flex items-center justify-between"
                          >
                            <span className="text-sm font-medium text-text-primary">
                              {s.name}
                            </span>
                            <span className="text-xs text-text-muted">
                              {formatCurrency(s.price)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <FormField label="Quantity">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateItem(item.id, "quantity", Number(e.target.value))
                  }
                  min="1"
                  className="w-full px-4 py-3 bg-white rounded-2xl text-sm text-center text-text-primary border-2 border-transparent focus:border-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </FormField>

              {/* Unit Price */}
              <FormField label="Unit Price">
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) =>
                    onUpdateItem(item.id, "unitPrice", Number(e.target.value))
                  }
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white rounded-2xl text-sm text-right font-mono text-text-primary border-2 border-transparent focus:border-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </FormField>

              {/* Tax Rate */}
              <FormField label="Tax Rate (%)">
                <input
                  type="number"
                  value={item.taxRate}
                  onChange={(e) =>
                    onUpdateItem(item.id, "taxRate", Number(e.target.value))
                  }
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 bg-white rounded-2xl text-sm text-center text-text-primary border-2 border-transparent focus:border-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </FormField>

              {/* Discount */}
              <FormField label="Discount (%)">
                <input
                  type="number"
                  value={item.discount}
                  onChange={(e) =>
                    onUpdateItem(item.id, "discount", Number(e.target.value))
                  }
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 bg-white rounded-2xl text-sm text-center text-text-primary border-2 border-transparent focus:border-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </FormField>
            </div>

            {/* Item Total */}
            <div className="text-right pt-3 border-t border-border">
              <span className="text-xs text-text-muted">Item Total: </span>
              <span className="text-sm font-bold font-mono text-text-primary">
                {formatCurrency(item.total)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </FormSection>
  );
}
