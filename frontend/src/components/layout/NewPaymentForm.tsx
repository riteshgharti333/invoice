import { useState } from "react";
import {
  TbCash,
  TbReceipt,
  TbCalendar,
  TbHash,
  TbNotes,
  TbSearch,
  TbLoader,
} from "react-icons/tb";
import { useCreatePayment } from "../../features/hooks/usePayments";
import { useSearchInvoices } from "../../features/hooks/useInvoices";
import { toast } from "../../utils/toast";
import { formatCurrency } from "../../utils/moneyCalc";
import { Button } from "../ui/ButtonProps";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: { name: string };
  total: number;
  totalPaid: number;
  remainingBalance: number;
  status: string;
  dueDate: string;
}

const paymentMethods = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "OTHER", label: "Other" },
];

const initialData = {
  amount: "",
  paymentMethod: "BANK_TRANSFER",
  paymentDate: new Date().toISOString().split("T")[0],
  transactionNumber: "",
  notes: "",
};

interface NewPaymentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  invoiceId?: string;
}

export function NewPaymentForm({
  onSuccess,
  onCancel,
  invoiceId,
}: NewPaymentFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { mutate: createPayment, isPending } = useCreatePayment();

  const { data: invoicesData, isFetching: isSearching } = useSearchInvoices({
    q: invoiceSearch,
  });

  const rawInvoices: any[] = Array.isArray(invoicesData?.data?.data)
    ? invoicesData.data.data
    : Array.isArray(invoicesData?.data)
      ? invoicesData.data
      : [];

  const invoices: Invoice[] = rawInvoices.map((inv) => ({
    ...inv,
    totalPaid: typeof inv.totalPaid === "number" ? inv.totalPaid : 0,
  }));

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceSearch("");
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedInvoice) {
      toast.error("Please select an invoice");
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (amount > selectedInvoice.remainingBalance) {
      newErrors.amount = `Amount cannot exceed remaining balance (${formatCurrency(selectedInvoice.remainingBalance)})`;
      toast.error(
        `Maximum payment allowed: ${formatCurrency(selectedInvoice.remainingBalance)}`,
      );
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }
    if (!formData.paymentDate) {
      newErrors.paymentDate = "Payment date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      invoiceId: selectedInvoice!.id,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod as any,
      paymentDate: formData.paymentDate,
      transactionNumber: formData.transactionNumber || undefined,
      notes: formData.notes || undefined,
    };

    createPayment(submitData, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-5 ">
      {/* Invoice Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
            <TbReceipt size={18} className="text-brand" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">
              Select Invoice
            </h3>
            <p className="text-xs text-text-muted">
              Search and select the invoice for payment
            </p>
          </div>
        </div>

        {selectedInvoice ? (
          <div className="p-5 bg-success-light/50 border border-success/20 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono font-semibold text-success">
                  #{selectedInvoice.invoiceNumber}
                </p>
                <p className="text-xs text-success/70">
                  {selectedInvoice.customer?.name}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-xl text-xs font-medium ${getStatusColor(selectedInvoice.status)}`}
              >
                {selectedInvoice.status.replace("_", " ")}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-text-muted">Total</p>
                <p className="text-sm font-bold font-mono">
                  {formatCurrency(Number(selectedInvoice.total))}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-text-muted">Paid</p>
                <p className="text-sm font-bold font-mono text-success">
                  {formatCurrency(selectedInvoice.totalPaid)}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-text-muted">Balance</p>
                <p className="text-sm font-bold font-mono text-danger">
                  {formatCurrency(selectedInvoice.remainingBalance)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedInvoice(null)}
              className="text-xs text-success hover:underline font-medium"
            >
              Change Invoice
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                placeholder="Search by customer name or invoice number..."
                className="w-full pl-11 pr-10 py-3 bg-white border-2 border-border rounded-2xl text-sm text-text-primary placeholder:text-text-muted focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <TbLoader size={18} className="text-brand animate-spin" />
                </div>
              )}
            </div>

            {/* Results dropdown — fixed height with scroll */}
            {invoiceSearch && invoices.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-border rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-4 py-2.5 bg-surface-hover border-b border-border">
                  <p className="text-xs font-semibold text-text-secondary">
                    {invoices.length} invoice{invoices.length > 1 ? "s" : ""}{" "}
                    found
                  </p>
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-border">
                  {invoices.map((inv) => (
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => handleInvoiceSelect(inv)}
                      className="w-full px-5 py-3.5 text-left hover:bg-surface-hover transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-mono font-bold text-text-primary">
                          #{inv.invoiceNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold ${getStatusColor(inv.status)}`}
                        >
                          {inv.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-text-secondary">
                          {inv.customer?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-text-secondary">
                          Balance:{" "}
                          <span className="font-semibold text-danger">
                            {formatCurrency(inv.remainingBalance)}
                          </span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {invoiceSearch && !isSearching && invoices.length === 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-border rounded-2xl shadow-2xl p-6 text-center">
                <div className="w-10 h-10 bg-surface-hover rounded-xl flex items-center justify-center mx-auto mb-2">
                  <TbSearch size={18} className="text-text-muted" />
                </div>
                <p className="text-sm font-semibold text-text-primary">
                  No invoices found
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Try a different search term
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Details */}
      {selectedInvoice && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
              <TbCash size={18} className="text-brand" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">
                Payment Details
              </h3>
              <p className="text-xs text-text-muted">
                Required fields marked with *
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Amount <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <TbCash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="Enter payment amount"
                  min="0"
                  step="0.01"
                  className={`w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                    errors.amount
                      ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                      : formData.amount &&
                          parseFloat(formData.amount) >
                            selectedInvoice.remainingBalance
                        ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                        : "border-transparent focus:border-brand/30"
                  }`}
                />
              </div>

              {/* Real-time Messages */}
              {!formData.amount ? (
                <p className="text-text-muted text-xs mt-1.5">
                  Remaining balance:{" "}
                  <span className="font-semibold text-text-primary">
                    {formatCurrency(selectedInvoice.remainingBalance)}
                  </span>
                </p>
              ) : parseFloat(formData.amount) <= 0 ? (
                <p className="text-danger text-xs mt-1.5 font-medium">
                  Amount must be greater than 0
                </p>
              ) : parseFloat(formData.amount) >
                selectedInvoice.remainingBalance ? (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse" />
                  <p className="text-danger text-xs font-medium">
                    Amount exceeds remaining balance by{" "}
                    <span className="font-bold">
                      {formatCurrency(
                        parseFloat(formData.amount) -
                          selectedInvoice.remainingBalance,
                      )}
                    </span>
                  </p>
                </div>
              ) : parseFloat(formData.amount) ===
                selectedInvoice.remainingBalance ? (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 bg-success rounded-full" />
                  <p className="text-success text-xs font-medium">
                    Full payment — remaining will be ₹0.00
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 bg-brand rounded-full" />
                  <p className="text-text-secondary text-xs">
                    Remaining after payment:{" "}
                    <span className="font-semibold text-text-primary">
                      {formatCurrency(
                        selectedInvoice.remainingBalance -
                          parseFloat(formData.amount),
                      )}
                    </span>
                  </p>
                </div>
              )}

              {/* Validation error from submit */}
              {errors.amount && (
                <p className="text-danger text-xs mt-1 font-medium">
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Payment Method <span className="text-danger">*</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value)}
                className={`w-full px-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all appearance-none ${
                  errors.paymentMethod
                    ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                    : "border-transparent focus:border-brand/30"
                }`}
              >
                {paymentMethods.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              {errors.paymentMethod && (
                <p className="text-danger text-xs mt-1.5 font-medium">
                  {errors.paymentMethod}
                </p>
              )}
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Payment Date <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <TbCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => handleChange("paymentDate", e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                    errors.paymentDate
                      ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                      : "border-transparent focus:border-brand/30"
                  }`}
                />
              </div>
              {errors.paymentDate && (
                <p className="text-danger text-xs mt-1.5 font-medium">
                  {errors.paymentDate}
                </p>
              )}
            </div>

            {/* Transaction Number */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Transaction Number
              </label>
              <div className="relative">
                <TbHash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={formData.transactionNumber}
                  onChange={(e) =>
                    handleChange("transactionNumber", e.target.value)
                  }
                  placeholder="TXN123456"
                  className="w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Notes
            </label>
            <div className="relative">
              <TbNotes className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
                className="w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {selectedInvoice && (
        <div className="flex items-center justify-end gap-3 py-2 border-t border-border">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={isPending}
            icon={TbCash}
          >
            {isPending ? "Recording..." : "Record Payment"}
          </Button>
        </div>
      )}
    </form>
  );
}
