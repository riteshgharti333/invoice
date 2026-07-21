import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TbFileText,
  TbUser,
  TbCalendar,
  TbCalculator,
  TbLoader,
} from "react-icons/tb";
import {
  updateQuotationSchema,
  updateQuotationStatusSchema,
} from "@invoice/shared";
import type { UpdateQuotationDto } from "@invoice/shared/types";
import {
  useQuotation,
  useUpdateQuotation,
  useUpdateQuotationStatus,
} from "../../features/hooks/useQuotations";
import {
  useServices,
  useSearchServices,
} from "../../features/hooks/useServices";
import {
  calcItemTotal,
  calcTotals,
  formatCurrency,
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
  status: string;
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

const statusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    SENT: "bg-brand-light text-brand",
    APPROVED: "bg-success-light text-success",
    REJECTED: "bg-danger-light text-danger",
    EXPIRED: "bg-amber-100 text-amber-700",
  };
  return colors[status] || colors.DRAFT;
};

export default function UpdateQuotation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    customerId: "",
    issueDate: "",
    expiryDate: "",
    discount: 0,
    tax: 0,
    notes: "",
    termsConditions: "",
    status: "DRAFT",
    items: [emptyItem()],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serviceSearch, setServiceSearch] = useState<Record<string, string>>(
    {},
  );

  const { data: quotation, isLoading } = useQuotation(id!);
  const { mutate: updateQuotation, isPending } = useUpdateQuotation();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateQuotationStatus();

  const { data: servicesData } = useServices({ cursor: "" });
  const { data: searchedServices, isFetching: isSearchingServices } =
    useSearchServices({
      q: serviceSearch.global || "",
    });
  const services = extractListData<Service>(
    serviceSearch.global ? searchedServices : servicesData,
  );

  // Populate form
  useEffect(() => {
    if (quotation?.data) {
      const q = quotation.data;
      setFormData({
        customerId: q.customerId,
        issueDate: q.issueDate?.split("T")[0] || "",
        expiryDate: q.expiryDate?.split("T")[0] || "",
        discount: Number(q.discount) || 0,
        tax: Number(q.tax) || 0,
        notes: q.notes || "",
        termsConditions: q.termsConditions || "",
        status: q.status,
        items: q.items?.map((item) => ({
          id: crypto.randomUUID(),
          serviceId: item.serviceId,
          description: item.description || "",
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          taxRate: Number(item.taxRate) || 0,
          discount: Number(item.discount) || 0,
          total: calcItemTotal({
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            taxRate: Number(item.taxRate) || 0,
            discount: Number(item.discount) || 0,
          }),
        })) || [emptyItem()],
      });
    }
  }, [quotation]);

  const totals = calcTotals(formData.items);

  // ─── Items ────────────────────────────────────
  const addItem = () =>
    setFormData((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));

  const removeItem = (itemId: string) => {
    if (formData.items.length === 1) {
      toast.error("At least one service item is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const updateItem = (
    itemId: string,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== itemId) return item;
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
    if (field === "serviceId")
      setServiceSearch((prev) => ({ ...prev, [itemId]: "" }));
  };

  const handleServiceSelect = (itemId: string, serviceId: string) =>
    updateItem(itemId, "serviceId", serviceId);

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

  // ─── Status ───────────────────────────────────
  const handleStatusChange = (newStatus: string) => {
    const result = updateQuotationStatusSchema.shape.body.safeParse({
      status: newStatus,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors["status"] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    updateStatus(
      { id: id!, status: newStatus },
      {
        onSuccess: () =>
          setFormData((prev) => ({ ...prev, status: newStatus })),
      },
    );
  };

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
      status: formData.status,
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

    const result = updateQuotationSchema.shape.body.safeParse(dataToValidate);
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

    const submitData: UpdateQuotationDto = {
      customerId: formData.customerId,
      issueDate: formData.issueDate || undefined,
      expiryDate: formData.expiryDate || undefined,
      discount: Number(formData.discount) || 0,
      tax: Number(formData.tax) || 0,
      notes: formData.notes || undefined,
      termsConditions: formData.termsConditions || undefined,
      status: formData.status as any,
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

    updateQuotation({ id: id!, data: submitData });
  };

  // ─── Loading ──────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <TbLoader
            size={40}
            className="text-brand animate-spin mx-auto mb-4"
          />
          <p className="text-text-secondary">Loading quotation details...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      <FormLayout
        title={`Update Quotation #${quotation?.data?.quotationNumber || id}`}
        subtitle="Edit quotation details"
        icon={TbFileText}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/quotations")}
        isPending={isPending}
        submitLabel="Update Quotation"
      >
        {/* Status Selector */}
        <div className="flex items-center gap-3 p-4 bg-surface-hover rounded-2xl">
          <span className="text-sm font-semibold text-text-primary">
            Status:
          </span>
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-medium ${getStatusColor(formData.status)}`}
          >
            {formData.status}
          </span>
          <select
            value={formData.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdatingStatus}
            className="px-3 py-1.5 bg-white border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all disabled:opacity-50"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {isUpdatingStatus && (
            <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          )}
        </div>

        {/* Quotation Details */}
        <FormSection
          icon={TbUser}
          title="Quotation Details"
          subtitle="Customer and validity dates"
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
          isSearchingServices={isSearchingServices}
          onServiceSearchChange={(itemId, value) =>
            setServiceSearch((prev) => ({ ...prev, [itemId]: value }))
          }
          onServiceSelect={handleServiceSelect}
          onUpdateItem={updateItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          subtitle="Services included in quotation"
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
