import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TbArrowLeft,
  TbFileInvoice,
  TbPlus,
  TbTrash,
  TbUser,
  TbCalendar,
  TbCalculator,
  TbSearch,
  TbLoader,
  TbCash,
  TbLock,
} from "react-icons/tb";
import {
  updateInvoiceSchema,
  updateInvoiceStatusSchema,
} from "@invoice/shared";
import type { UpdateInvoiceDto } from "@invoice/shared/types";
import {
  useInvoice,
  useUpdateInvoice,
  useUpdateInvoiceStatus,
} from "../../features/hooks/useInvoices";
import {
  useCustomers,
  useSearchCustomers,
} from "../../features/hooks/useCustomers";
import {
  useServices,
  useSearchServices,
} from "../../features/hooks/useServices";
import {
  calcItemTotal,
  calcTotals,
  formatCurrency,
} from "../../utils/moneyCalc";
import { toast } from "../../utils/toast";
import type { CalcItem } from "../../utils/moneyCalc";

// Types
interface Customer {
  id: string;
  name: string;
  phone: string;
}

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

// Helper to extract data from API responses
function extractListData<T>(response: any): T[] {
  if (!response?.data) return [];
  if (Array.isArray(response.data)) return response.data;
  if (response.data.data && Array.isArray(response.data.data))
    return response.data.data;
  return [];
}

// Constants
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
  const [customerSearch, setCustomerSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState<Record<string, string>>(
    {},
  );

  // Fetch invoice data
  const { data: invoice, isLoading } = useInvoice(id!);

  // Check if invoice is from quotation
  const isFromQuotation = Boolean(invoice?.data?.isFromQuotation);

  // Mutations
  const { mutate: updateInvoice, isPending } = useUpdateInvoice();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateInvoiceStatus();

  // Fetch customers
  const { data: customersData } = useCustomers({ cursor: "" });
  const { data: searchedCustomers } = useSearchCustomers({ q: customerSearch });
  const customers = extractListData<Customer>(
    customerSearch ? searchedCustomers : customersData,
  );

  // Fetch services
  const { data: servicesData } = useServices({ cursor: "" });
  const { data: searchedServices } = useSearchServices({
    q: serviceSearch.global || "",
  });
  const services = extractListData<Service>(
    serviceSearch.global ? searchedServices : servicesData,
  );

  // Populate form when invoice data is loaded
  useEffect(() => {
    if (invoice?.data) {
      setFormData({
        customerId: invoice.data.customerId,
        quotationId: invoice.data.quotationId || "",
        issueDate: invoice.data.issueDate?.split("T")[0] || "",
        dueDate: invoice.data.dueDate?.split("T")[0] || "",
        discount: invoice.data.discount || 0,
        tax: invoice.data.tax || 0,
        notes: invoice.data.notes || "",
        termsConditions: invoice.data.termsConditions || "",
        status: invoice.data.status,
        items: invoice.data.items?.map((item) => ({
          id: crypto.randomUUID(),
          serviceId: item.serviceId,
          description: item.description || "",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 0,
          discount: item.discount || 0,
          total: calcItemTotal({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate || 0,
            discount: item.discount || 0,
          }),
        })) || [emptyItem()],
      });
    }
  }, [invoice]);

  // Calculations
  const totals = calcTotals(formData.items);
  const payments = (invoice as any)?.data?.payments || [];
  const totalPaid = (invoice as any)?.data?.totalPaid || 0;
  const remainingBalance =
    (invoice as any)?.data?.remainingBalance || totals.grandTotal;

  // Handlers
  const addItem = () => {
    if (isFromQuotation) return;
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, emptyItem()],
    }));
  };

  const removeItem = (itemId: string) => {
    if (isFromQuotation) return;
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
    if (isFromQuotation) return;
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

    if (field === "serviceId") {
      setServiceSearch((prev) => ({ ...prev, [itemId]: "" }));
    }
  };

  const updateField = (field: keyof FormData, value: string | number) => {
    if (isFromQuotation && field !== "status") return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const selectCustomer = (customerId: string) => {
    if (isFromQuotation) return;
    setFormData((prev) => ({ ...prev, customerId }));
    setCustomerSearch("");
    if (errors.customerId) {
      setErrors((prev) => {
        const { customerId: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const clearCustomer = () => {
    if (isFromQuotation) return;
    setFormData((prev) => ({ ...prev, customerId: "" }));
    setCustomerSearch("");
  };

  const handleServiceSelect = (itemId: string, serviceId: string) => {
    if (isFromQuotation) return;
    updateItem(itemId, "serviceId", serviceId);
  };

  const handleStatusChange = (newStatus: string) => {
    const result = updateInvoiceStatusSchema.shape.body.safeParse({
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
        onSuccess: () => {
          setFormData((prev) => ({ ...prev, status: newStatus }));
        },
      },
    );
  };

  const validate = (): boolean => {
    if (isFromQuotation) {
      setErrors({});
      return true;
    }

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
      quotationId: formData.quotationId || undefined,
      issueDate: formData.issueDate || undefined,
      dueDate: formData.dueDate || undefined,
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

    const result = updateInvoiceSchema.shape.body.safeParse(dataToValidate);

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

    const submitData: UpdateInvoiceDto = {
      status: formData.status as any,
    };

    // Only include editable fields if not from quotation
    if (!isFromQuotation) {
      submitData.customerId = formData.customerId;
      submitData.issueDate = formData.issueDate || undefined;
      submitData.dueDate = formData.dueDate || undefined;
      submitData.discount = Number(formData.discount) || 0;
      submitData.tax = Number(formData.tax) || 0;
      submitData.notes = formData.notes || undefined;
      submitData.termsConditions = formData.termsConditions || undefined;
      submitData.items = formData.items
        .filter((item) => item.serviceId)
        .map((item) => ({
          serviceId: item.serviceId,
          description: item.description || undefined,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          taxRate: Number(item.taxRate) || undefined,
          discount: Number(item.discount) || undefined,
        }));
    }

    updateInvoice(
      { id: id!, data: submitData },
      {
        onSuccess: () => {
          navigate(`/invoices/${id}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <TbLoader
            size={40}
            className="text-brand animate-spin mx-auto mb-4"
          />
          <p className="text-text-secondary">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/invoices")}
          className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
        >
          <TbArrowLeft size={20} className="text-text-secondary" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">
              Update Invoice
            </h1>
            {isFromQuotation && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                Q
              </span>
            )}
          </div>
          <p className="text-text-secondary text-sm mt-1">Edit invoice #{id}</p>
        </div>

        {/* Status Selector - Always Enabled */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-medium ${getStatusColor(formData.status)}`}
          >
            {formData.status.replace("_", " ")}
          </span>
          <select
            value={formData.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdatingStatus}
            className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all disabled:opacity-50"
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
      </div>

      {/* Quotation Lock Notice */}
      {isFromQuotation && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <TbLock size={20} className="text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Quotation Invoice
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              This invoice is linked to Quotation #
              {invoice?.data?.quotation?.quotationNumber || "N/A"}. Only status
              can be modified. All other fields are locked.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Dates Section */}
        <div
          className={`bg-white rounded-2xl border p-6 space-y-4 ${isFromQuotation ? "border-amber-200 bg-amber-50/30" : "border-border"}`}
        >
          <div className="flex items-center gap-3 pb-4 border-b border-border-light">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
              <TbUser size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">
                Invoice Details
              </h2>
              <p className="text-xs text-text-muted">
                {isFromQuotation
                  ? "Customer and dates (locked)"
                  : "Customer and dates"}
              </p>
            </div>
            {isFromQuotation && (
              <TbLock size={16} className="text-amber-500 ml-auto" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Search/Select */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Customer <span className="text-danger">*</span>
              </label>

              {formData.customerId ? (
                <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {customers.find((c) => c.id === formData.customerId)
                        ?.name || "Loading..."}
                    </p>
                    <p className="text-xs text-text-muted">
                      {customers.find((c) => c.id === formData.customerId)
                        ?.phone || ""}
                    </p>
                  </div>
                  {!isFromQuotation && (
                    <button
                      type="button"
                      onClick={clearCustomer}
                      className="text-xs text-brand hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>
              ) : (
                !isFromQuotation && (
                  <div className="relative">
                    <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Search customers..."
                      className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                    {customerSearch && customers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {customers.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => selectCustomer(c.id)}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-hover transition-colors flex items-center justify-between"
                          >
                            <span className="font-medium">{c.name}</span>
                            <span className="text-text-muted text-xs">
                              {c.phone}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
              {errors.customerId && (
                <p className="text-danger text-xs mt-1">{errors.customerId}</p>
              )}
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Issue Date
              </label>
              <div className="relative">
                <TbCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => updateField("issueDate", e.target.value)}
                  disabled={isFromQuotation}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Due Date
              </label>
              <div className="relative">
                <TbCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => updateField("dueDate", e.target.value)}
                  disabled={isFromQuotation}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Section */}
        <div
          className={`bg-white rounded-2xl border p-6 space-y-4 ${isFromQuotation ? "border-amber-200 bg-amber-50/30" : "border-border"}`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-border-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                <TbFileInvoice size={20} className="text-brand" />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary">Line Items</h2>
                <p className="text-xs text-text-muted">
                  {isFromQuotation
                    ? "Services (locked)"
                    : "Services included in invoice"}
                </p>
              </div>
            </div>
            {!isFromQuotation && (
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-3 py-2 bg-brand text-white rounded-xl text-xs font-medium hover:opacity-90 transition-all"
              >
                <TbPlus size={14} /> Add Item
              </button>
            )}
            {isFromQuotation && <TbLock size={16} className="text-amber-500" />}
          </div>

          {formData.items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 bg-surface rounded-xl border border-border-light space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">
                  Item #{index + 1}
                </span>
                {formData.items.length > 1 && !isFromQuotation && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 hover:bg-danger-light rounded-lg transition-colors"
                  >
                    <TbTrash size={14} className="text-danger" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs text-text-secondary mb-1">
                    Service *
                  </label>
                  {item.serviceId ? (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-border">
                      <div>
                        <p className="text-sm font-medium">
                          {services.find((s) => s.id === item.serviceId)
                            ?.name || "Loading..."}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatCurrency(
                            services.find((s) => s.id === item.serviceId)
                              ?.price || 0,
                          )}
                        </p>
                      </div>
                      {!isFromQuotation && (
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, "serviceId", "")}
                          className="text-xs text-brand hover:underline"
                        >
                          Change
                        </button>
                      )}
                    </div>
                  ) : (
                    !isFromQuotation && (
                      <div className="relative">
                        <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="text"
                          value={serviceSearch[item.id] || ""}
                          onChange={(e) =>
                            setServiceSearch((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          placeholder="Search services..."
                          className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                        />
                        {serviceSearch[item.id] && services.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {services.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() =>
                                  handleServiceSelect(item.id, s.id)
                                }
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-hover transition-colors flex items-center justify-between"
                              >
                                <span className="font-medium">{s.name}</span>
                                <span className="text-text-muted text-xs">
                                  {formatCurrency(s.price)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                <div>
                  <label className="block text-xs text-text-secondary mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, "quantity", Number(e.target.value))
                    }
                    min="1"
                    disabled={isFromQuotation}
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(item.id, "unitPrice", Number(e.target.value))
                    }
                    min="0"
                    step="0.01"
                    disabled={isFromQuotation}
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={item.taxRate}
                    onChange={(e) =>
                      updateItem(item.id, "taxRate", Number(e.target.value))
                    }
                    min="0"
                    max="100"
                    disabled={isFromQuotation}
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={item.discount}
                    onChange={(e) =>
                      updateItem(item.id, "discount", Number(e.target.value))
                    }
                    min="0"
                    max="100"
                    disabled={isFromQuotation}
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="text-right pt-2 border-t border-border-light">
                <span className="text-xs text-text-muted">Item Total: </span>
                <span className="text-sm font-semibold font-mono text-text-primary">
                  {formatCurrency(item.total)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border-light">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <TbCalculator size={20} className="text-text-secondary" />
            </div>
            <h2 className="font-semibold text-text-primary">Summary</h2>
          </div>

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
              className="pt-3 border-t border-border-light text-base font-bold"
              labelClassName="text-text-primary"
              valueClassName="text-brand"
            />
            {totalPaid > 0 && (
              <>
                <SummaryRow
                  label="Total Paid"
                  value={formatCurrency(totalPaid)}
                  valueClassName="text-success"
                />
                <SummaryRow
                  label="Remaining Balance"
                  value={formatCurrency(remainingBalance)}
                  className="pt-3 border-t border-border-light text-base font-bold"
                  labelClassName="text-text-primary"
                  valueClassName={
                    remainingBalance > 0 ? "text-danger" : "text-success"
                  }
                />
              </>
            )}
          </div>
        </div>

        {/* Payments Section */}
        {payments.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-border-light">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <TbCash size={20} className="text-success" />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary">Payments</h2>
                <p className="text-xs text-text-muted">
                  {payments.length} payment(s) received
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {payments.map((payment: Payment) => (
                <div
                  key={payment.id}
                  className="p-4 bg-surface rounded-xl border border-border-light space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-medium text-text-primary">
                        #{payment.paymentNumber}
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">
                        {payment.status}
                      </span>
                    </div>
                    <span className="text-sm font-bold font-mono text-success">
                      {formatCurrency(Number(payment.amount))}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span>{getPaymentMethodLabel(payment.paymentMethod)}</span>
                    <span>
                      {new Date(payment.paymentDate).toLocaleDateString(
                        "en-IN",
                      )}
                    </span>
                    {payment.transactionNumber && (
                      <span>TXN: {payment.transactionNumber}</span>
                    )}
                  </div>
                  {payment.notes && (
                    <p className="text-xs text-text-muted">{payment.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div
          className={`bg-white rounded-2xl border p-6 space-y-4 ${isFromQuotation ? "border-amber-200 bg-amber-50/30" : "border-border"}`}
        >
          <div className="flex items-center gap-3 pb-4 border-b border-border-light">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <TbFileInvoice size={20} className="text-text-secondary" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">
                Additional Info
              </h2>
              <p className="text-xs text-text-muted">
                {isFromQuotation ? "Notes (locked)" : "Additional information"}
              </p>
            </div>
            {isFromQuotation && (
              <TbLock size={16} className="text-amber-500 ml-auto" />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Any notes for the customer..."
                rows={2}
                disabled={isFromQuotation}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Terms & Conditions
              </label>
              <textarea
                value={formData.termsConditions}
                onChange={(e) => updateField("termsConditions", e.target.value)}
                placeholder="Terms and conditions..."
                rows={2}
                disabled={isFromQuotation}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/invoices")}
            className="px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || isUpdatingStatus}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <TbFileInvoice size={18} />
                {isFromQuotation ? "Update Status" : "Update Invoice"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

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
