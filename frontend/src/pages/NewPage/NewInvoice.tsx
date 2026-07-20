import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TbFileInvoice,
  TbUser,
  TbCalendar,
  TbFileText,
  TbCalculator,
  TbQuote,
} from "react-icons/tb";
import { createInvoiceSchema } from "@invoice/shared";
import type { CreateInvoiceDto } from "@invoice/shared/types";
import { useCreateInvoice } from "../../features/hooks/useInvoices";
import {
  useServices,
  useSearchServices,
} from "../../features/hooks/useServices";
import {
  calcItemTotal,
  calcTotals,
  formatCurrency,
  getTodayDate,
} from "../../utils/moneyCalc";
import { toast } from "../../utils/toast";
import type { CalcItem } from "../../utils/moneyCalc";
import { FormLayout } from "../../components/ui/FormLayout";
import { FormSection } from "../../components/ui/FormSection";
import { FormField } from "../../components/ui/FormField";

import { QuotationSelector } from "../../components/layout/QuotationSelector";
import { CustomerSelector } from "../../components/layout/CustomerSelector";
import { LineItemsSection } from "../../components/layout/LineItemsSection";


// Types
interface Service {
  id: string;
  name: string;
  price: number;
  taxRate: number;
}

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

interface LineItem extends CalcItem {
  id: string;
  serviceId: string;
  description: string;
  total: number;
}

interface FormData {
  customerId: string;
  quotationId: string;
  issueDate: string;
  dueDate: string;
  discount: number;
  tax: number;
  notes: string;
  termsConditions: string;
  items: LineItem[];
}

function extractListData<T>(response: any): T[] {
  if (!response?.data) return [];
  if (Array.isArray(response.data)) return response.data;
  if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
  return [];
}

const emptyItem = (): LineItem => ({
  id: crypto.randomUUID(),
  serviceId: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
  discount: 0,
  total: 0,
});

const initialFormData = (): FormData => ({
  customerId: "",
  quotationId: "",
  issueDate: getTodayDate(),
  dueDate: "",
  discount: 0,
  tax: 0,
  notes: "",
  termsConditions: "",
  items: [emptyItem()],
});

type InvoiceMode = "new" | "quotation";

export default function NewInvoice() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<InvoiceMode>("new");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serviceSearch, setServiceSearch] = useState<Record<string, string>>({});
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const { mutate: createInvoice, isPending } = useCreateInvoice();

  // Fetch services
  const { data: servicesData } = useServices({ cursor: "" });
  const { data: searchedServices } = useSearchServices({ q: serviceSearch.global || "" });
  const services = extractListData<Service>(serviceSearch.global ? searchedServices : servicesData);

  // Auto-fill form when quotation is selected
useEffect(() => {
  if (selectedQuotation) {
    setFormData({
      customerId: selectedQuotation.customerId,
      quotationId: selectedQuotation.id,
      issueDate: getTodayDate(),
      dueDate: selectedQuotation.expiryDate?.split('T')[0] || '',
      discount: selectedQuotation.discount || 0,
      tax: selectedQuotation.tax || 0,
      notes: selectedQuotation.notes || '',
      termsConditions: selectedQuotation.termsConditions || '',
      
      // ⬇️ THIS IS WHERE YOU FIX IT ⬇️
      items: selectedQuotation.items?.map(item => ({
        id: crypto.randomUUID(),
        serviceId: item.serviceId,
        description: item.description || '',
        quantity: Number(item.quantity),        // Add Number()
        unitPrice: Number(item.unitPrice),      // Add Number()
        taxRate: Number(item.taxRate) || 0,      // Add Number()
        discount: Number(item.discount) || 0,    // Add Number()
        total: calcItemTotal({
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          taxRate: Number(item.taxRate) || 0,
          discount: Number(item.discount) || 0,
        }),
      })) || [emptyItem()],
    });
  }
}, [selectedQuotation]);

  const totals = calcTotals(formData.items);

  // ─── Mode ──────────────────────────────────────
  const switchMode = (newMode: InvoiceMode) => {
    setMode(newMode);
    setFormData(initialFormData());
    setErrors({});
    setSelectedQuotation(null);
  };

  // ─── Quotation ────────────────────────────────
  const selectQuotation = (quotation: Quotation) => setSelectedQuotation(quotation);
  const clearQuotation = () => {
    setSelectedQuotation(null);
    setFormData(initialFormData());
  };

  // ─── Items ────────────────────────────────────
  const addItem = () => setFormData((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));

  const removeItem = (id: string) => {
    if (formData.items.length === 1) {
      toast.error("At least one service item is required");
      return;
    }
    setFormData((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };

        if (field === "serviceId" && typeof value === "string" && value) {
          const service = services.find((s) => s.id === value);
          if (service) {
            updated.unitPrice = service.price;
            updated.taxRate = service.taxRate;
          }
        }

        updated.total = calcItemTotal(updated);
        return updated;
      }),
    }));

    if (field === "serviceId") {
      setServiceSearch((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleServiceSelect = (itemId: string, serviceId: string) => {
    updateItem(itemId, "serviceId", serviceId);
  };

  // ─── Fields ───────────────────────────────────
  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const { [field]: _, ...rest } = prev; return rest; });
  };

  const selectCustomer = (customerId: string) => {
    setFormData((prev) => ({ ...prev, customerId }));
    if (errors.customerId) setErrors((prev) => { const { customerId: _, ...rest } = prev; return rest; });
  };

  const clearCustomer = () => setFormData((prev) => ({ ...prev, customerId: "" }));

  // ─── Validate & Submit ────────────────────────
  const validate = (): boolean => {
    const hasValidService = formData.items.some((item) => item.serviceId);
    if (!hasValidService) { toast.error("Please select at least one service"); return false; }

    const itemsWithService = formData.items.filter((item) => item.serviceId);
    for (const item of itemsWithService) {
      if (!item.quantity || item.quantity < 1) { toast.error("All items must have a quantity of at least 1"); return false; }
      if (!item.unitPrice || item.unitPrice <= 0) { toast.error("All items must have a price greater than 0"); return false; }
    }

    const dataToValidate = {
      customerId: formData.customerId,
      quotationId: formData.quotationId || undefined,
      issueDate: formData.issueDate || undefined,
      dueDate: formData.dueDate || undefined,
      discount: Number(formData.discount) || 0,
      tax: Number(formData.tax) || 0,
      notes: formData.notes || undefined,
      termsConditions: formData.termsConditions || undefined,
      items: formData.items.filter((item) => item.serviceId).map((item) => ({
        serviceId: item.serviceId,
        description: item.description || undefined,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate) || undefined,
        discount: Number(item.discount) || undefined,
      })),
    };

      // 🔍 LOG BEFORE ZOD
  console.log("=== DATA TO VALIDATE ===");
  console.log(JSON.stringify(dataToValidate, null, 2));


    const result = createInvoiceSchema.shape.body.safeParse(dataToValidate);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { fieldErrors[err.path.join(".")] = err.message; });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: CreateInvoiceDto = {
      customerId: formData.customerId,
      quotationId: formData.quotationId || undefined,
      issueDate: formData.issueDate || undefined,
      dueDate: formData.dueDate || undefined,
      discount: Number(formData.discount) || 0,
      tax: Number(formData.tax) || 0,
      notes: formData.notes || undefined,
      termsConditions: formData.termsConditions || undefined,
      items: formData.items.filter((item) => item.serviceId).map((item) => ({
        serviceId: item.serviceId,
        description: item.description || undefined,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate) || undefined,
        discount: Number(item.discount) || undefined,
      })),
    };

    createInvoice(submitData, { onSuccess: (data) => navigate(`/invoice/${data.data.id}`) });
  };

  // ─── Loading ──────────────────────────────────
  if (isPending) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Creating invoice...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      {/* Mode Tabs */}
      <div className="bg-white rounded-2xl border border-border p-1.5 flex gap-1 mb-6">
        <button
          type="button"
          onClick={() => switchMode("new")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === "new" ? "bg-brand text-white shadow-md" : "text-text-secondary hover:bg-surface-hover"
          }`}
        >
          <TbFileInvoice size={18} /> New Invoice
        </button>
        <button
          type="button"
          onClick={() => switchMode("quotation")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === "quotation" ? "bg-brand text-white shadow-md" : "text-text-secondary hover:bg-surface-hover"
          }`}
        >
          <TbQuote size={18} /> From Quotation
        </button>
      </div>

      {/* Quotation Selector */}
      {mode === "quotation" && (
        <QuotationSelector
          selected={selectedQuotation}
          onSelect={selectQuotation}
          onClear={clearQuotation}
        />
      )}

      {/* Main Form */}
      {(mode === "new" || selectedQuotation) && (
        <FormLayout
          title="New Invoice"
          subtitle={mode === "quotation" ? "Creating invoice from approved quotation" : "Fill in the invoice details below"}
          icon={TbFileInvoice}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/invoices")}
          isPending={isPending}
          submitLabel="Create Invoice"
        >
          {/* Invoice Details */}
          <FormSection
            icon={TbUser}
            title="Invoice Details"
            subtitle={mode === "quotation" ? "Auto-filled from quotation" : "Select customer and dates"}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField label="Customer" required error={errors.customerId}>
                  <CustomerSelector
                    selectedId={formData.customerId}
                    onSelect={selectCustomer}
                    onClear={clearCustomer}
                    error={errors.customerId}
                    readOnly={mode === "quotation"}
                  />
                </FormField>
              </div>

              <FormField label="Issue Date" icon={TbCalendar}>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => updateField("issueDate", e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </FormField>

              <FormField label="Due Date" icon={TbCalendar}>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => updateField("dueDate", e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </FormField>
            </div>
          </FormSection>

          {/* Line Items */}
          <LineItemsSection
            items={formData.items}
            services={services}
            serviceSearch={serviceSearch}
            onServiceSearchChange={(itemId, value) =>
              setServiceSearch((prev) => ({ ...prev, [itemId]: value }))
            }
            onServiceSelect={handleServiceSelect}
            onUpdateItem={updateItem}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            subtitle={mode === "quotation" ? "Items from quotation (editable)" : "Add services to invoice"}
          />

          {/* Summary */}
          <FormSection icon={TbCalculator} title="Summary" variant="muted">
            <div className="space-y-2 text-sm">
              <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
              <SummaryRow label="Tax" value={formatCurrency(totals.totalTax)} />
              <SummaryRow label="Discount" value={`-${formatCurrency(totals.totalDiscount)}`} valueClassName="text-danger" />
              <SummaryRow
                label="Grand Total"
                value={formatCurrency(totals.grandTotal)}
                className="pt-3 border-t border-border text-base font-bold"
                labelClassName="text-text-primary"
                valueClassName="text-brand"
              />
            </div>
          </FormSection>

          {/* Additional Info */}
          <FormSection icon={TbFileText} title="Additional Info" variant="muted">
            <div className="space-y-4">
              <FormField label="Notes">
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Any notes for the customer..."
                  rows={2}
                  className="w-full px-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all resize-none"
                />
              </FormField>
              <FormField label="Terms & Conditions">
                <textarea
                  value={formData.termsConditions}
                  onChange={(e) => updateField("termsConditions", e.target.value)}
                  placeholder="Terms and conditions..."
                  rows={2}
                  className="w-full px-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all resize-none"
                />
              </FormField>
            </div>
          </FormSection>
        </FormLayout>
      )}
    </div>
  );
}

// ─── Summary Row ──────────────────────────────
function SummaryRow({
  label,
  value,
  className = "",
  labelClassName = "text-text-secondary",
  valueClassName = "",
}: {
  label: string;
  value: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span className={labelClassName}>{label}</span>
      <span className={`font-mono ${valueClassName}`}>{value}</span>
    </div>
  );
}
