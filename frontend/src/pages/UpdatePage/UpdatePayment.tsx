import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TbCash,
  TbReceipt,
  TbCalendar,
  TbHash,
  TbNotes,
  TbUser,
  TbLoader,
} from "react-icons/tb";
import { usePayment, useUpdatePayment } from "../../features/hooks/usePayments";
import { formatCurrency } from "../../utils/moneyCalc";
import { FormLayout } from "../../components/ui/FormLayout";
import { FormSection } from "../../components/ui/FormSection";
import { FormField } from "../../components/ui/FormField";

const paymentMethods = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "OTHER", label: "Other" },
];

const paymentStatuses = [
  { value: "COMPLETED", label: "Completed" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

export default function UpdatePayment() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "BANK_TRANSFER",
    paymentDate: "",
    status: "COMPLETED",
    transactionNumber: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: payment, isLoading } = usePayment(id!);
  const { mutate: updatePayment, isPending } = useUpdatePayment();

  useEffect(() => {
    if (payment?.data) {
      const p = payment.data;
      setFormData({
        amount: p.amount?.toString() || "",
        paymentMethod: p.paymentMethod || "BANK_TRANSFER",
        paymentDate: p.paymentDate?.split("T")[0] || "",
        status: p.status || "COMPLETED",
        transactionNumber: p.transactionNumber || "",
        notes: p.notes || "",
      });
    }
  }, [payment]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const { [name]: _, ...rest } = prev; return rest; });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = "Amount must be greater than 0";
    if (!formData.paymentMethod) newErrors.paymentMethod = "Payment method is required";
    if (!formData.paymentDate) newErrors.paymentDate = "Payment date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    updatePayment({
      id: id!,
      data: {
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod as any,
        paymentDate: formData.paymentDate,
        status: formData.status as any,
        transactionNumber: formData.transactionNumber || undefined,
        notes: formData.notes || undefined,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <TbLoader size={40} className="text-brand animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const p = payment?.data;

  return (
    <div className="max-w-3xl mx-auto">
      <FormLayout
        title="Update Payment"
        subtitle="Edit payment details"
        icon={TbCash}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        isPending={isPending}
        submitLabel="Update Payment"
      >
        {/* Invoice & Customer Info */}
        {p && (
          <FormSection icon={TbReceipt} title="Invoice & Customer" subtitle="Payment linked to">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-hover rounded-2xl">
                <p className="text-xs text-text-muted mb-1">Payment Number</p>
                <p className="text-sm font-mono font-semibold text-text-primary">{p.paymentNumber}</p>
              </div>
              <div className="p-4 bg-surface-hover rounded-2xl">
                <p className="text-xs text-text-muted mb-1">Invoice</p>
                <p className="text-sm font-mono font-semibold text-text-primary">
                  {p.invoice?.invoiceNumber || "N/A"}
                </p>
              </div>
              {p.invoice?.customer && (
                <div className="p-4 bg-surface-hover rounded-2xl md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <TbUser size={14} className="text-text-muted" />
                    <p className="text-xs text-text-muted">Customer</p>
                  </div>
                  <p className="text-sm font-medium text-text-primary">{p.invoice.customer.name}</p>
                </div>
              )}
            </div>
          </FormSection>
        )}

        {/* Payment Information */}
        <FormSection icon={TbCash} title="Payment Information" subtitle="Required fields marked with *">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Amount" required error={errors.amount} icon={TbCash}>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="Enter payment amount"
                min="0"
                step="0.01"
                className={`w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                  errors.amount ? "border-danger/50 focus:border-danger focus:ring-danger/20" : "border-transparent focus:border-brand/30"
                }`}
              />
            </FormField>

            <FormField label="Payment Method" required error={errors.paymentMethod}>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value)}
                className={`w-full px-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all appearance-none ${
                  errors.paymentMethod ? "border-danger/50 focus:border-danger focus:ring-danger/20" : "border-transparent focus:border-brand/30"
                }`}
              >
                {paymentMethods.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Payment Date" required error={errors.paymentDate} icon={TbCalendar}>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleChange("paymentDate", e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                  errors.paymentDate ? "border-danger/50 focus:border-danger focus:ring-danger/20" : "border-transparent focus:border-brand/30"
                }`}
              />
            </FormField>

            <FormField label="Status">
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all appearance-none"
              >
                {paymentStatuses.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Transaction Number" icon={TbHash}>
              <input
                type="text"
                value={formData.transactionNumber}
                onChange={(e) => handleChange("transactionNumber", e.target.value)}
                placeholder="TXN123456"
                className="w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </FormField>
          </div>

          <FormField label="Notes" icon={TbNotes}>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all resize-none"
            />
          </FormField>
        </FormSection>
      </FormLayout>
    </div>
  );
}