import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  TbArrowLeft,
  TbCash,
  TbReceipt,
  TbCalendar,
  TbCreditCard,
  TbHash,
  TbNotes,
  TbSearch,
  TbLoader,
} from 'react-icons/tb';
import { useCreatePayment } from '../../features/hooks/usePayments';
import { useSearchInvoices } from '../../features/hooks/useInvoices';
import { toast } from '../../utils/toast';
import { formatCurrency } from '../../utils/moneyCalc';

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
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'OTHER', label: 'Other' },
];

const initialData = {
  amount: '',
  paymentMethod: 'BANK_TRANSFER',
  paymentDate: new Date().toISOString().split('T')[0],
  transactionNumber: '',
  notes: '',
};

export default function NewPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceIdFromUrl = searchParams.get('invoiceId');

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { mutate: createPayment, isPending } = useCreatePayment();

  // Search invoices by customer name
  const { data: invoicesData, isFetching: isSearching } = useSearchInvoices({
    q: invoiceSearch,
  });

  const rawInvoices: any[] = Array.isArray(invoicesData?.data?.data)
    ? invoicesData.data.data
    : Array.isArray(invoicesData?.data)
    ? invoicesData.data
    : [];

  // Normalize invoices to ensure required fields (like totalPaid) have correct types
  const invoices: Invoice[] = rawInvoices.map(inv => ({
    ...inv,
    totalPaid: typeof inv.totalPaid === 'number' ? inv.totalPaid : 0,
  }));

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceSearch('');
  };

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

    if (!selectedInvoice) {
      toast.error('Please select an invoice');
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (amount > selectedInvoice.remainingBalance) {
      newErrors.amount = `Amount cannot exceed remaining balance (${formatCurrency(selectedInvoice.remainingBalance)})`;
      toast.error(`Maximum payment allowed: ${formatCurrency(selectedInvoice.remainingBalance)}`);
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
      invoiceId: selectedInvoice!.id,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod as any,
      paymentDate: formData.paymentDate,
      transactionNumber: formData.transactionNumber || undefined,
      notes: formData.notes || undefined,
    };

    createPayment(submitData, {
      onSuccess: (data) => {
        toast.success(`Payment recorded successfully`);
        navigate(`/invoice/${selectedInvoice!.id}`);
      },
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-700',
      SENT: 'bg-brand-light text-brand',
      PARTIALLY_PAID: 'bg-amber-100 text-amber-700',
      PAID: 'bg-success-light text-success',
      OVERDUE: 'bg-danger-light text-danger',
      CANCELLED: 'bg-slate-100 text-text-muted',
    };
    return colors[status] || colors.DRAFT;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-hover rounded-xl transition-colors">
          <TbArrowLeft size={20} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Record Payment</h1>
          <p className="text-text-secondary text-sm mt-1">Record a new payment for an invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Selection */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border-light">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
              <TbReceipt size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Select Invoice</h2>
              <p className="text-xs text-text-muted">Search and select the invoice for payment</p>
            </div>
          </div>

          {selectedInvoice ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-mono font-medium text-green-800">#{selectedInvoice.invoiceNumber}</p>
                  <p className="text-xs text-green-600">{selectedInvoice.customer?.name}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(selectedInvoice.status)}`}>
                  {selectedInvoice.status.replace('_', ' ')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-text-muted">Total</p>
                  <p className="text-sm font-bold font-mono">{formatCurrency(Number(selectedInvoice.total))}</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-text-muted">Paid</p>
                  <p className="text-sm font-bold font-mono text-success">{formatCurrency(selectedInvoice.totalPaid)}</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-text-muted">Balance</p>
                  <p className="text-sm font-bold font-mono text-danger">{formatCurrency(selectedInvoice.remainingBalance)}</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedInvoice(null)} className="text-xs text-green-700 hover:underline">
                Change Invoice
              </button>
            </div>
          ) : (
            <div className="relative">
              <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={invoiceSearch}
                onChange={e => setInvoiceSearch(e.target.value)}
                placeholder="Search by customer name or invoice number..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <TbLoader size={16} className="text-brand animate-spin" />
                </div>
              )}
              {invoiceSearch && invoices.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {invoices.map((inv) => (
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => handleInvoiceSelect(inv)}
                      className="w-full px-4 py-3 text-left hover:bg-surface-hover transition-colors border-b border-border-light last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono font-medium">#{inv.invoiceNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(inv.status)}`}>
                          {inv.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-text-muted">{inv.customer?.name || 'Unknown'}</p>
                        <p className="text-xs text-text-muted">
                          Balance: <span className="font-medium text-danger">{formatCurrency(inv.remainingBalance)}</span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {invoiceSearch && !isSearching && invoices.length === 0 && (
                <p className="text-text-muted text-sm text-center mt-3">No invoices found</p>
              )}
            </div>
          )}
        </div>

        {/* Payment Details */}
        {selectedInvoice && (
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
                    max={selectedInvoice.remainingBalance}
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                      errors.amount ? 'border-danger' : 'border-border'
                    }`}
                  />
                </div>
                {errors.amount && <p className="text-danger text-xs mt-1">{errors.amount}</p>}
                <p className="text-text-muted text-xs mt-1">
                  Remaining Balance: <span className="font-medium text-danger">{formatCurrency(selectedInvoice.remainingBalance)}</span>
                </p>
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
        )}

        {/* Actions */}
        {selectedInvoice && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand/25 disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending ? (
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
        )}
      </form>
    </div>
  );
}