import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TbArrowLeft, TbCash, TbReceipt, TbCalendar, TbCreditCard, TbHash, TbNotes, TbCheck, TbUser } from 'react-icons/tb';

interface PaymentData {
  id: string;
  invoiceId: string;
  paymentNumber: string;
  amount: string;
  paymentMethod: string;
  paymentDate: string;
  transactionNumber: string;
  notes: string;
  status: string;
  invoice: {
    invoiceNumber: string;
    customer: {
      name: string;
    };
  };
}

interface Field {
  name: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'number' | 'textarea';
  placeholder?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  disabled?: boolean;
}

const paymentMethods = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
];

const paymentStatuses = [
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
];

export default function UpdatePayment() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [payment, setPayment] = useState<PaymentData | null>(null);

  const formFields: Field[] = [
    {
      name: 'paymentNumber',
      label: 'Payment Number',
      type: 'text',
      icon: TbHash,
      disabled: true,
    },
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
      name: 'status',
      label: 'Status',
      type: 'select',
      icon: TbCheck,
      required: true,
      options: paymentStatuses,
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

  useEffect(() => {
    // Simulate fetching payment data
    const fetchPayment = async () => {
      setIsLoading(true);
      // Replace with actual API call
      setTimeout(() => {
        const mockPayment: PaymentData = {
          id: id || '',
          invoiceId: 'cmrn583m3000tbkglvfht5vhw',
          paymentNumber: 'PAY-2026-1',
          amount: '3225',
          paymentMethod: 'BANK_TRANSFER',
          paymentDate: '2026-07-15',
          transactionNumber: 'TXN123456',
          notes: 'Partial payment',
          status: 'COMPLETED',
          invoice: {
            invoiceNumber: 'INV-2026-3',
            customer: {
              name: 'Suresh Desai',
            },
          },
        };
        setPayment(mockPayment);
        setFormData({
          paymentNumber: mockPayment.paymentNumber,
          amount: mockPayment.amount,
          paymentMethod: mockPayment.paymentMethod,
          paymentDate: mockPayment.paymentDate,
          status: mockPayment.status,
          transactionNumber: mockPayment.transactionNumber,
          notes: mockPayment.notes || '',
        });
        setIsLoading(false);
      }, 500);
    };

    fetchPayment();
  }, [id]);

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
    if (!formData.status) {
      newErrors.status = 'Status is required';
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
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      paymentDate: formData.paymentDate,
      status: formData.status,
      transactionNumber: formData.transactionNumber || undefined,
      notes: formData.notes || undefined,
    };

    console.log('Update Payment Data:', paymentData);

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
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows || 3}
                disabled={field.disabled}
                className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none ${
                  hasError ? 'border-danger' : 'border-border'
                } ${field.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </>
          ) : field.type === 'select' ? (
            <select
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={field.disabled}
              className={`w-full pl-4 pr-10 py-2.5 bg-surface border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all appearance-none ${
                hasError ? 'border-danger' : 'border-border'
              } ${field.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
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
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              min={field.type === 'number' ? '0' : undefined}
              step={field.type === 'number' ? '0.01' : undefined}
              className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                field.name === 'paymentNumber' ? 'font-mono' : ''
              } ${hasError ? 'border-danger' : 'border-border'} ${
                field.disabled ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
          )}
        </div>

        {hasError && <p className="text-danger text-xs mt-1">{errors[field.name]}</p>}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-success-light rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce">
            <TbCheck size={36} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Payment Updated!</h2>
          <p className="text-text-secondary">Redirecting to payments page...</p>
        </div>
      </div>
    );
  }

  const basicFields = formFields.filter((f) => ['paymentNumber', 'amount', 'paymentMethod'].includes(f.name));
  const detailFields = formFields.filter((f) => ['paymentDate', 'status', 'transactionNumber', 'notes'].includes(f.name));

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
          <h1 className="text-2xl font-bold text-text-primary">Update Payment</h1>
          <p className="text-text-secondary text-sm mt-1">Edit payment details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice & Customer Info */}
        {payment && (
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
                <p className="text-xs text-text-muted mb-1">Invoice Number</p>
                <p className="text-sm font-mono text-text-primary">{payment.invoice.invoiceNumber}</p>
              </div>
              <div className="p-3 bg-surface rounded-xl">
                <div className="flex items-center gap-2">
                  <TbUser size={16} className="text-text-muted" />
                  <p className="text-xs text-text-muted">Customer</p>
                </div>
                <p className="text-sm font-medium text-text-primary mt-1">{payment.invoice.customer.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Basic Info */}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {basicFields.map(renderField)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detailFields.map(renderField)}
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
                Updating...
              </>
            ) : (
              <>
                <TbCheck size={18} />
                Update Payment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}