

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TbFileInvoice,
  TbUser,
  TbCalendar,
  TbCalculator,
  TbLoader,
  TbCash,
  TbLock,
} from "react-icons/tb";
import { updateInvoiceSchema, updateInvoiceStatusSchema } from "@invoice/shared";
import type { UpdateInvoiceDto } from "@invoice/shared/types";
import {
  useInvoice,
  useUpdateInvoice,
  useUpdateInvoiceStatus,
} from "../../features/hooks/useInvoices";
import { useServices, useSearchServices } from "../../features/hooks/useServices";
import { calcItemTotal, calcTotals, formatCurrency } from "../../utils/moneyCalc";
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

interface Payment {
  id: string;
  paymentNumber: string;
  amount: string;
  paymentMethod: string;
  paymentDate: string;
  transactionNumber?: string;
  notes?: string;
  status: string;
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
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    SENT: "bg-brand-light text-brand",
    PARTIALLY_PAID: "bg-amber-100 text-amber-700",
    PAID: "bg-success-light text-success",
    OVERDUE: "bg-danger-light text-danger",
    CANCELLED: "bg-slate-100 text-text-muted",
  };
  return colors[status] || colors.DRAFT;
};

const getPaymentMethodLabel = (method: string) => {
  const methods: Record<string, string> = {
    BANK_TRANSFER: "Bank Transfer",
    CASH: "Cash",
    CHEQUE: "Cheque",
    UPI: "UPI",
    CARD: "Card",
  };
  return methods[method] || method;
};

export default function UpdateInvoice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    customerId: "",
    quotationId: "",
    issueDate: "",
    dueDate: "",
    discount: 0,
    tax: 0,
    notes: "",
    termsConditions: "",
    status: "DRAFT",
    items: [emptyItem()],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serviceSearch, setServiceSearch] = useState<Record<string, string>>({});

  const { data: invoice, isLoading } = useInvoice(id!);
  const isFromQuotation = Boolean(invoice?.data?.isFromQuotation);

  const { mutate: updateInvoice, isPending } = useUpdateInvoice();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateInvoiceStatus();

  const { data: servicesData } = useServices({ cursor: "" });
  const { data: searchedServices } = useSearchServices({ q: serviceSearch.global || "" });
  const services = extractListData<Service>(serviceSearch.global ? searchedServices : servicesData);

  // Populate form
  useEffect(() => {
    if (invoice?.data) {
      setFormData({
        customerId: invoice.data.customerId,
        quotationId: invoice.data.quotationId || "",
        issueDate: invoice.data.issueDate?.split("T")[0] || "",
        dueDate: invoice.data.dueDate?.split("T")[0] || "",
        discount: Number(invoice.data.discount) || 0,
        tax: Number(invoice.data.tax) || 0,
        notes: invoice.data.notes || "",
        termsConditions: invoice.data.termsConditions || "",
        status: invoice.data.status,
        items: invoice.data.items?.map((item) => ({
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
  }, [invoice]);

  const totals = calcTotals(formData.items);
  const payments = (invoice as any)?.data?.payments || [];
  const totalPaid = (invoice as any)?.data?.totalPaid || 0;
  const remainingBalance = (invoice as any)?.data?.remainingBalance || totals.grandTotal;

  // ─── Items ────────────────────────────────────
  const addItem = () => {
    if (isFromQuotation) return;
    setFormData((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  };

  const removeItem = (itemId: string) => {
    if (isFromQuotation) return;
    if (formData.items.length === 1) { toast.error("At least one service item is required"); return; }
    setFormData((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== itemId) }));
  };

  const updateItem = (itemId: string, field: keyof LineItem, value: string | number) => {
    if (isFromQuotation) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== itemId) return item;
        const updated = { ...item, [field]: value };

        if (field === "serviceId" && typeof value === "string" && value) {
          const service = services.find((s) => s.id === value);
          if (service) { updated.unitPrice = service.price; updated.taxRate = service.taxRate; }
        }

        updated.total = calcItemTotal(updated);
        return updated;
      }),
    }));
    if (field === "serviceId") setServiceSearch((prev) => ({ ...prev, [itemId]: "" }));
  };

  const handleServiceSelect = (itemId: string, serviceId: string) => updateItem(itemId, "serviceId", serviceId);

  // ─── Fields ───────────────────────────────────
  const updateField = (field: keyof FormData, value: string | number) => {
    if (isFromQuotation && field !== "status") return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const { [field]: _, ...rest } = prev; return rest; });
  };

  const selectCustomer = (customerId: string) => {
    if (isFromQuotation) return;
    setFormData((prev) => ({ ...prev, customerId }));
    if (errors.customerId) setErrors((prev) => { const { customerId: _, ...rest } = prev; return rest; });
  };

  const clearCustomer = () => {
    if (isFromQuotation) return;
    setFormData((prev) => ({ ...prev, customerId: "" }));
  };

  // ─── Status ───────────────────────────────────
  const handleStatusChange = (newStatus: string) => {
    const result = updateInvoiceStatusSchema.shape.body.safeParse({ status: newStatus });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { fieldErrors["status"] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    updateStatus({ id: id!, status: newStatus }, {
      onSuccess: () => setFormData((prev) => ({ ...prev, status: newStatus })),
    });
  };

  // ─── Validate & Submit ────────────────────────
  const validate = (): boolean => {
    if (isFromQuotation) { setErrors({}); return true; }

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
      status: formData.status,
      items: formData.items.filter((item) => item.serviceId).map((item) => ({
        serviceId: item.serviceId,
        description: item.description || undefined,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate) || undefined,
        discount: Number(item.discount) || undefined,
      })),
    };

    const result = updateInvoiceSchema.shape.body.safeParse(dataToValidate);
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

    const submitData: UpdateInvoiceDto = { status: formData.status as any };

    if (!isFromQuotation) {
      submitData.customerId = formData.customerId;
      submitData.issueDate = formData.issueDate || undefined;
      submitData.dueDate = formData.dueDate || undefined;
      submitData.discount = Number(formData.discount) || 0;
      submitData.tax = Number(formData.tax) || 0;
      submitData.notes = formData.notes || undefined;
      submitData.termsConditions = formData.termsConditions || undefined;
      submitData.items = formData.items.filter((item) => item.serviceId).map((item) => ({
        serviceId: item.serviceId,
        description: item.description || undefined,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate) || undefined,
        discount: Number(item.discount) || undefined,
      }));
    }

  updateInvoice({ id: id!, data: submitData });
  };

  // ─── Loading ──────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <TbLoader size={40} className="text-brand animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      {/* Quotation Lock Notice */}
      {isFromQuotation && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <TbLock size={20} className="text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Quotation Invoice</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Linked to Quotation #{invoice?.data?.quotation?.quotationNumber || "N/A"}. Only status can be modified.
            </p>
          </div>
        </div>
      )}

      <FormLayout
        title={`Update Invoice #${invoice?.data?.invoiceNumber}`}
        subtitle={isFromQuotation ? "Quotation invoice — limited editing" : "Edit invoice details"}
        icon={TbFileInvoice}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/invoices")}
        isPending={isPending}
        submitLabel={isFromQuotation ? "Update Status" : "Update Invoice"}
        extraAction={() => {}}
      >
        {/* Status Selector */}
        <div className="flex items-center gap-3 p-4 bg-surface-hover rounded-2xl">
          <span className="text-sm font-semibold text-text-primary">Status:</span>
          <span className={`px-3 py-1.5 rounded-xl text-xs font-medium ${getStatusColor(formData.status)}`}>
            {formData.status.replace("_", " ")}
          </span>
          <select
            value={formData.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdatingStatus}
            className="px-3 py-1.5 bg-white border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all disabled:opacity-50"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {isUpdatingStatus && (
            <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          )}
        </div>

        {/* Invoice Details */}
        <FormSection
          icon={TbUser}
          title="Invoice Details"
          subtitle={isFromQuotation ? "Customer and dates (locked)" : "Customer and dates"}
          variant={isFromQuotation ? "muted" : "brand"}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField label="Customer" required error={errors.customerId}>
                <CustomerSelector
                  selectedId={formData.customerId}
                  onSelect={selectCustomer}
                  onClear={clearCustomer}
                  error={errors.customerId}
                  readOnly={isFromQuotation}
                />
              </FormField>
            </div>

            <FormField label="Issue Date" icon={TbCalendar}>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => updateField("issueDate", e.target.value)}
                disabled={isFromQuotation}
                className="w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </FormField>

            <FormField label="Due Date" icon={TbCalendar}>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => updateField("dueDate", e.target.value)}
                disabled={isFromQuotation}
                className="w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </FormField>
          </div>
        </FormSection>

        {/* Line Items */}
        <LineItemsSection
          items={formData.items}
          services={services}
          serviceSearch={serviceSearch}
          onServiceSearchChange={(itemId, value) => setServiceSearch((prev) => ({ ...prev, [itemId]: value }))}
          onServiceSelect={handleServiceSelect}
          onUpdateItem={updateItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          subtitle={isFromQuotation ? "Services (locked)" : "Services included in invoice"}
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
            {totalPaid > 0 && (
              <>
                <SummaryRow label="Total Paid" value={formatCurrency(totalPaid)} valueClassName="text-success" />
                <SummaryRow
                  label="Remaining Balance"
                  value={formatCurrency(remainingBalance)}
                  className="pt-3 border-t border-border text-base font-bold"
                  labelClassName="text-text-primary"
                  valueClassName={remainingBalance > 0 ? "text-danger" : "text-success"}
                />
              </>
            )}
          </div>
        </FormSection>

        {/* Payments */}
        {payments.length > 0 && (
          <FormSection icon={TbCash} title="Payments" subtitle={`${payments.length} payment(s) received`} variant="muted">
            <div className="space-y-3">
              {payments.map((payment: Payment) => (
                <div key={payment.id} className="p-4 bg-surface-hover rounded-2xl border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-medium text-text-primary">#{payment.paymentNumber}</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">
                        {payment.status}
                      </span>
                    </div>
                    <span className="text-sm font-bold font-mono text-success">{formatCurrency(Number(payment.amount))}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span>{getPaymentMethodLabel(payment.paymentMethod)}</span>
                    <span>{new Date(payment.paymentDate).toLocaleDateString("en-IN")}</span>
                    {payment.transactionNumber && <span>TXN: {payment.transactionNumber}</span>}
                  </div>
                  {payment.notes && <p className="text-xs text-text-muted">{payment.notes}</p>}
                </div>
              ))}
            </div>
          </FormSection>
        )}

        {/* Additional Info */}
        <FormSection
          icon={TbFileInvoice}
          title="Additional Info"
          subtitle={isFromQuotation ? "Notes (locked)" : "Additional information"}
          variant={isFromQuotation ? "muted" : "brand"}
        >
          <div className="space-y-4">
            <FormField label="Notes">
              <textarea
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Any notes for the customer..."
                rows={2}
                disabled={isFromQuotation}
                className="w-full px-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </FormField>
            <FormField label="Terms & Conditions">
              <textarea
                value={formData.termsConditions}
                onChange={(e) => updateField("termsConditions", e.target.value)}
                placeholder="Terms and conditions..."
                rows={2}
                disabled={isFromQuotation}
                className="w-full px-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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