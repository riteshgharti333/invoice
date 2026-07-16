import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TbArrowLeft, TbCash, TbReceipt, TbCalendar, TbCreditCard, TbHash, TbNotes, TbCheck } from 'react-icons/tb';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'number' | 'textarea';
  placeholder?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
}

const paymentMethods = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
];

const formFields: Field[] = [
  {
    name: 'amount',
    label: 'Amount',
    type: 'number',
    placeholder: 'Enter payment amount',
    icon: TbCash,
    required: true,
  },
  {
    name: 'paymentMethod',
    label: 'Payment Method',
    type: 'select',
    icon: TbCreditCard,
    required: true,
    options: paymentMethods,
  },
  {
    name: 'paymentDate',
    label: 'Payment Date',
    type: 'date',
    icon: TbCalendar,
    required: true,
  },
  {
    name: 'transactionNumber',
    label: 'Transaction Number',
    type: 'text',
    placeholder: 'TXN123456',
    icon: TbHash,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Any additional notes...',
    icon: TbNotes,
    rows: 3,
  },
];

const initialData: Record<string, string> = {
  amount: '',
  paymentMethod: 'BANK_TRANSFER',
  paymentDate: new Date().toISOString().split('T')[0],
  transactionNumber: '',
  notes: '',
};

export default function NewPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const paymentData = {
      invoiceId: invoiceId,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      paymentDate: formData.paymentDate,
      transactionNumber: formData.transactionNumber || undefined,
      notes: formData.notes || undefined,
    };

    console.log('Payment Data:', paymentData);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        navigate('/payments');
      }, 1500);
    }, 800);
  };

  const renderField = (field: Field) => {
    const Icon = field.icon;
    const hasError = !!errors[field.name];

    return (
      <div key={field.name}>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {field.label}
          {field.required && <span className="text-danger ml-1">*</span>}
        </label>

        <div className="relative">
          {field.type !== 'textarea' && field.type !== 'select' && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          )}

          {field.type === 'textarea' ? (
            <>
              <Icon className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
              <textarea
                value={formData[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows || 3}
                className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none ${
                  hasError ? 'border-danger' : 'border-border'
                }`}
              />
            </>
          ) : field.type === 'select' ? (
            <select
              value={formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`w-full pl-4 pr-10 py-2.5 bg-surface border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all appearance-none ${
                hasError ? 'border-danger' : 'border-border'
              }`}
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              min={field.type === 'number' ? '0' : undefined}
              step={field.type === 'number' ? '0.01' : undefined}
              className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                hasError ? 'border-danger' : 'border-border'
              }`}
            />
          )}
        </div>

        {hasError && <p className="text-danger text-xs mt-1">{errors[field.name]}</p>}
      </div>
    );
  };

  if (showSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-success-light rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce">
            <TbCheck size={36} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Payment Recorded!</h2>
          <p className="text-text-secondary">Redirecting to payments page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/payments')}
          className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
        >
          <TbArrowLeft size={20} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">New Payment</h1>
          <p className="text-text-secondary text-sm mt-1">Record a new payment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Info */}
        {invoiceId && (
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border-light">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                <TbReceipt size={20} className="text-brand" />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary">Invoice</h2>
                <p className="text-xs text-text-muted">Payment for invoice</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-surface rounded-xl">
              <p className="text-sm font-mono text-text-primary">{invoiceId}</p>
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
              <h2 className="font-semibold text-text-primary">Payment Details</h2>
              <p className="text-xs text-text-muted">Required fields are marked with *</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.slice(0, 3).map(renderField)}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {formFields.slice(3).map(renderField)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <TbCash size={18} />
                Record Payment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}