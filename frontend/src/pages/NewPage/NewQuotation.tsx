import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TbFileText, TbUser, TbCalendar, TbCalculator } from "react-icons/tb";
import { useCreateQuotation } from "../../features/hooks/useQuotations";
import {
  useServices,
  useSearchServices,
} from "../../features/hooks/useServices";
import { createQuotationSchema } from "@invoice/shared";
import type { CreateQuotationDto } from "@invoice/shared/types";
import {
  calcItemTotal,
  calcTotals,
  formatCurrency,
  getTodayDate,
} from "../../utils/moneyCalc";
import { extractListData } from "../../utils/apiHelpers";
import { toast } from "../../utils/toast";
import type { CalcItem } from "../../utils/moneyCalc";
import { FormLayout } from "../../components/ui/FormLayout";
import { FormSection } from "../../components/ui/FormSection";
import { FormField } from "../../components/ui/FormField";
import { CustomerSelector } from "../../components/layout/CustomerSelector";
import { LineItemsSection } from "../../components/layout/LineItemsSection";

// Types
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

interface FormData {
  customerId: string;
  issueDate: string;
  expiryDate: string;
  discount: number;
  tax: number;
  notes: string;
  termsConditions: string;
  items: LineItem[];
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
  issueDate: getTodayDate(),
  expiryDate: "",
  discount: 0,
  tax: 0,
  notes: "",
  termsConditions: "",
  items: [emptyItem()],
});

export default function NewQuotation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serviceSearch, setServiceSearch] = useState<Record<string, string>>(
    {},
  );

  const { mutate: createQuotation, isPending } = useCreateQuotation();

  // Fetch services
  const { data: servicesData } = useServices({ cursor: "" });
  const { data: searchedServices } = useSearchServices({
    q: serviceSearch.global || "",
  });
  const services = extractListData<Service>(
    serviceSearch.global ? searchedServices : servicesData,
  );

  const totals = calcTotals(formData.items);

  // ─── Items ────────────────────────────────────
  const addItem = () =>
    setFormData((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));

  const removeItem = (id: string) => {
    if (formData.items.length === 1) {
      toast.error("At least one service item is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const updateItem = (
    id: string,
    field: keyof LineItem,
    value: string | number,
  ) => {
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
    if (errors[field])
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
  };

  const selectCustomer = (customerId: string) => {
    setFormData((prev) => ({ ...prev, customerId }));
    if (errors.customerId)
      setErrors((prev) => {
        const { customerId: _, ...rest } = prev;
        return rest;
      });
  };

  const clearCustomer = () =>
    setFormData((prev) => ({ ...prev, customerId: "" }));

  // ─── Validate & Submit ────────────────────────
  const validate = (): boolean => {
    const hasValidService = formData.items.some((item) => item.serviceId);
    if (!hasValidService) {
      toast.error("Please select at least one service");
      return false;
    }

    const itemsWithService = formData.items.filter((item) => item.serviceId);
    for (const item of itemsWithService) {
      if (!item.quantity || item.quantity < 1) {
        toast.error("All items must have a quantity of at least 1");
        return false;
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        toast.error("All items must have a price greater than 0");
        return false;
      }
    }

    const dataToValidate = {
      customerId: formData.customerId,
      issueDate: formData.issueDate || undefined,
      expiryDate: formData.expiryDate || undefined,
      discount: Number(formData.discount) || 0,
      tax: Number(formData.tax) || 0,
      notes: formData.notes || undefined,
      termsConditions: formData.termsConditions || undefined,
      items: formData.items
        .filter((item) => item.serviceId)
        .map((item) => ({
          serviceId: item.serviceId,
          description: item.description || undefined,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          taxRate: Number(item.taxRate) || undefined,
          discount: Number(item.discount) || undefined,
        })),
    };

    const result = createQuotationSchema.shape.body.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path.join(".")] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: CreateQuotationDto = {
      customerId: formData.customerId,
      issueDate: formData.issueDate || undefined,
      expiryDate: formData.expiryDate || undefined,
      discount: Number(formData.discount) || 0,
      tax: Number(formData.tax) || 0,
      notes: formData.notes || undefined,
      termsConditions: formData.termsConditions || undefined,
      items: formData.items
        .filter((item) => item.serviceId)
        .map((item) => ({
          serviceId: item.serviceId,
          description: item.description || undefined,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          taxRate: Number(item.taxRate) || undefined,
          discount: Number(item.discount) || undefined,
        })),
    };

    createQuotation(submitData, {
      onSuccess: (data) => navigate(`/quotation/${data.data.id}`),
    });
  };

  // ─── Loading ──────────────────────────────────
  if (isPending) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Creating quotation...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      <FormLayout
        title="New Quotation"
        subtitle="Create a new quotation for your customer"
        icon={TbFileText}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/quotations")}
        isPending={isPending}
        submitLabel="Create Quotation"
      >
        {/* Quotation Details */}
        <FormSection
          icon={TbUser}
          title="Quotation Details"
          subtitle="Select customer and validity dates"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField label="Customer" required error={errors.customerId}>
                <CustomerSelector
                  selectedId={formData.customerId}
                  onSelect={selectCustomer}
                  onClear={clearCustomer}
                  error={errors.customerId}
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

            <FormField label="Expiry Date" icon={TbCalendar}>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => updateField("expiryDate", e.target.value)}
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
          subtitle="Add services to quotation"
        />

        {/* Summary */}
        <FormSection icon={TbCalculator} title="Summary" variant="muted">
          <div className="space-y-2 text-sm">
            <SummaryRow
              label="Subtotal"
              value={formatCurrency(totals.subtotal)}
            />
            <SummaryRow label="Tax" value={formatCurrency(totals.totalTax)} />
            <SummaryRow
              label="Discount"
              value={`-${formatCurrency(totals.totalDiscount)}`}
              valueClassName="text-danger"
            />
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
