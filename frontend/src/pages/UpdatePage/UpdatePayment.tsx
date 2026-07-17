import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TbArrowLeft,
  TbCash,
  TbReceipt,
  TbCalendar,
  TbCreditCard,
  TbHash,
  TbNotes,
  TbUser,
  TbLoader,
} from 'react-icons/tb';
import { usePayment, useUpdatePayment } from '../../features/hooks/usePayments';
import { toast } from '../../utils/toast';
import { formatCurrency } from '../../utils/moneyCalc';

const paymentMethods = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'OTHER', label: 'Other' },
];

const paymentStatuses = [
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
];

export default function UpdatePayment() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    paymentDate: '',
    status: 'COMPLETED',
    transactionNumber: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: payment, isLoading } = usePayment(id!);
  const { mutate: updatePayment, isPending } = useUpdatePayment();

  useEffect(() => {
    if (payment?.data) {
      const p = payment.data;
      setFormData({
        amount: p.amount?.toString() || '',
        paymentMethod: p.paymentMethod || 'BANK_TRANSFER',
        paymentDate: p.paymentDate?.split('T')[0] || '',
        status: p.status || 'COMPLETED',
        transactionNumber: p.transactionNumber || '',
        notes: p.notes || '',
      });
    }
  }, [payment]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }
    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod as any,
      paymentDate: formData.paymentDate,
      status: formData.status as any,
      transactionNumber: formData.transactionNumber || undefined,
      notes: formData.notes || undefined,
    };

    updatePayment(
      { id: id!, data: submitData },
      {
        onSuccess: () => {
          navigate(`/invoice/${payment?.data?.invoiceId}`);
        },
      }
    );
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
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-hover rounded-xl transition-colors">
          <TbArrowLeft size={20} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Update Payment</h1>
          <p className="text-text-secondary text-sm mt-1">Edit payment details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice & Customer Info */}
        {p && (
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border-light">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                <TbReceipt size={20} className="text-brand" />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary">Invoice & Customer</h2>
                <p className="text-xs text-text-muted">Payment linked to</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-surface rounded-xl">
                <p className="text-xs text-text-muted mb-1">Payment Number</p>
                <p className="text-sm font-mono text-text-primary">{p.paymentNumber}</p>
              </div>
              <div className="p-3 bg-surface rounded-xl">
                <p className="text-xs text-text-muted mb-1">Invoice</p>
                <p className="text-sm font-mono text-text-primary">
                  {p.invoice?.invoiceNumber || 'N/A'}
                </p>
              </div>
              {p.invoice?.customer && (
                <div className="p-3 bg-surface rounded-xl md:col-span-2">
                  <div className="flex items-center gap-2">
                    <TbUser size={16} className="text-text-muted" />
                    <p className="text-xs text-text-muted">Customer</p>
                  </div>
                  <p className="text-sm font-medium text-text-primary mt-1">{p.invoice.customer.name}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-border-light">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
              <TbCash size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Payment Information</h2>
              <p className="text-xs text-text-muted">Required fields are marked with *</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Amount <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <TbCash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => handleChange('amount', e.target.value)}
                  placeholder="Enter payment amount"
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                    errors.amount ? 'border-danger' : 'border-border'
                  }`}
                />
              </div>
              {errors.amount && <p className="text-danger text-xs mt-1">{errors.amount}</p>}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Payment Method <span className="text-danger">*</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={e => handleChange('paymentMethod', e.target.value)}
                className={`w-full px-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                  errors.paymentMethod ? 'border-danger' : 'border-border'
                }`}
              >
                {paymentMethods.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              {errors.paymentMethod && <p className="text-danger text-xs mt-1">{errors.paymentMethod}</p>}
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Payment Date <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <TbCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={e => handleChange('paymentDate', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                    errors.paymentDate ? 'border-danger' : 'border-border'
                  }`}
                />
              </div>
              {errors.paymentDate && <p className="text-danger text-xs mt-1">{errors.paymentDate}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={e => handleChange('status', e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"
              >
                {paymentStatuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Transaction Number */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Transaction Number</label>
              <div className="relative">
                <TbHash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={formData.transactionNumber}
                  onChange={e => handleChange('transactionNumber', e.target.value)}
                  placeholder="TXN123456"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Notes</label>
            <div className="relative">
              <TbNotes className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
              <textarea
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand/25 disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <TbCash size={18} />
                Update Payment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}