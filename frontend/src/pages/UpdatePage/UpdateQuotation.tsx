import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TbArrowLeft, TbFileText, TbPlus, TbTrash, TbUser, TbCalendar, TbCalculator, TbCheck, TbLoader } from 'react-icons/tb';
import { updateQuotationSchema, updateQuotationStatusSchema } from '@invoice/shared';

interface LineItem {
  id: string;
  serviceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
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

const customers = [
  { id: '1', name: 'Acme Corp' },
  { id: '2', name: 'Globex Inc' },
  { id: '3', name: 'Initech Ltd' },
  { id: '4', name: 'Umbrella Corp' },
  { id: '5', name: 'Stark Industries' },
];

const services = [
  { id: '1', name: 'Web Development', price: 50000, taxRate: 18 },
  { id: '2', name: 'UI/UX Design', price: 35000, taxRate: 18 },
  { id: '3', name: 'SEO Optimization', price: 15000, taxRate: 18 },
  { id: '4', name: 'Content Writing', price: 8000, taxRate: 12 },
  { id: '5', name: 'Server Maintenance', price: 25000, taxRate: 18 },
];

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'EXPIRED', label: 'Expired' },
];

const emptyItem: Omit<LineItem, 'id'> = {
  serviceId: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
  discount: 0,
  total: 0,
};

const initialData: FormData = {
  customerId: '',
  issueDate: '',
  expiryDate: '',
  discount: 0,
  tax: 0,
  notes: '',
  termsConditions: '',
  status: 'DRAFT',
  items: [{ ...emptyItem, id: crypto.randomUUID() }],
};

const mockQuotation = {
  id: '1',
  customerId: '1',
  issueDate: '2024-10-01',
  expiryDate: '2024-11-01',
  discount: 0,
  tax: 0,
  notes: 'Please review and approve',
  termsConditions: 'Valid for 30 days',
  status: 'SENT',
  items: [
    { id: '1', serviceId: '1', description: '', quantity: 1, unitPrice: 50000, taxRate: 18, discount: 0, total: 59000 },
    { id: '2', serviceId: '2', description: '', quantity: 1, unitPrice: 35000, taxRate: 18, discount: 0, total: 41300 },
  ],
};

export default function UpdateQuotation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFormData({
        customerId: mockQuotation.customerId,
        issueDate: mockQuotation.issueDate,
        expiryDate: mockQuotation.expiryDate,
        discount: mockQuotation.discount,
        tax: mockQuotation.tax,
        notes: mockQuotation.notes,
        termsConditions: mockQuotation.termsConditions,
        status: mockQuotation.status,
        items: mockQuotation.items,
      });
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [id]);

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { ...emptyItem, id: crypto.randomUUID() }],
    }));
  };

  const removeItem = (itemId: string) => {
    if (formData.items.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const updateItem = (itemId: string, field: keyof LineItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== itemId) return item;

        const updated = { ...item, [field]: value };

        if (field === 'serviceId' && typeof value === 'string') {
          const service = services.find((s) => s.id === value);
          if (service) {
            updated.unitPrice = service.price;
            updated.taxRate = service.taxRate;
          }
        }

        const qty = updated.quantity || 0;
        const price = updated.unitPrice || 0;
        const itemTax = updated.taxRate || 0;
        const itemDiscount = updated.discount || 0;
        updated.total = qty * price + (qty * price * itemTax) / 100 - (qty * price * itemDiscount) / 100;

        return updated;
      }),
    }));
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalTax = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate) / 100, 0);
  const totalDiscount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.discount) / 100, 0);
  const grandTotal = subtotal + totalTax - totalDiscount;

  const handleFormChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleStatusChange = (newStatus: string) => {
    const result = updateQuotationStatusSchema.shape.body.safeParse({ status: newStatus });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors['status'] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsUpdatingStatus(true);
    setFormData((prev) => ({ ...prev, status: newStatus }));

    setTimeout(() => {
      setIsUpdatingStatus(false);
    }, 500);
  };

  const validate = (): boolean => {
    const dataToValidate = {
      ...formData,
      discount: Number(formData.discount),
      tax: Number(formData.tax),
      expiryDate: formData.expiryDate || null,
      notes: formData.notes || null,
      termsConditions: formData.termsConditions || null,
      items: formData.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate),
        discount: Number(item.discount),
      })),
    };

    const result = updateQuotationSchema.shape.body.safeParse(dataToValidate);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path.join('.');
        fieldErrors[field] = err.message;
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

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        navigate('/quotations');
      }, 1500);
    }, 800);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-700',
      SENT: 'bg-brand-light text-brand',
      APPROVED: 'bg-success-light text-success',
      REJECTED: 'bg-danger-light text-danger',
      EXPIRED: 'bg-amber-100 text-amber-700',
    };
    return colors[status] || colors.DRAFT;
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <TbLoader size={40} className="text-brand animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading quotation details...</p>
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
          <h2 className="text-2xl font-bold text-text-primary mb-2">Quotation Updated!</h2>
          <p className="text-text-secondary">Redirecting to quotations page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/quotations')}
          className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
        >
          <TbArrowLeft size={20} className="text-text-secondary" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">Update Quotation</h1>
          <p className="text-text-secondary text-sm mt-1">Edit quotation #{id}</p>
        </div>

        {/* Status Selector */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-medium ${getStatusColor(formData.status)}`}>
            {formData.status}
          </span>
          <select
            value={formData.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {isUpdatingStatus && (
            <TbLoader size={14} className="text-brand animate-spin" />
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Dates */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border-light">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
              <TbUser size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Quotation Details</h2>
              <p className="text-xs text-text-muted">Customer and validity dates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">Customer</label>
              <select
                value={formData.customerId}
                onChange={(e) => handleFormChange('customerId', e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Issue Date</label>
              <div className="relative">
                <TbCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => handleFormChange('issueDate', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Expiry Date</label>
              <div className="relative">
                <TbCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-border-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                <TbFileText size={20} className="text-brand" />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary">Line Items</h2>
                <p className="text-xs text-text-muted">Services included in quotation</p>
              </div>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-2 bg-brand text-white rounded-xl text-xs font-medium hover:opacity-90 transition-all"
            >
              <TbPlus size={14} />
              Add Item
            </button>
          </div>

          {formData.items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 bg-surface rounded-xl border border-border-light space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">Item #{index + 1}</span>
                {formData.items.length > 1 && (
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
                  <label className="block text-xs text-text-secondary mb-1">Service</label>
                  <select
                    value={item.serviceId}
                    onChange={(e) => updateItem(item.id, 'serviceId', e.target.value)}
                    className="w-full px-3 py-2 bg-white border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  >
                    <option value="">Select service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-text-secondary mb-1">Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs text-text-secondary mb-1">Unit Price</label>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs text-text-secondary mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={item.taxRate}
                    onChange={(e) => updateItem(item.id, 'taxRate', Number(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs text-text-secondary mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={item.discount}
                    onChange={(e) => updateItem(item.id, 'discount', Number(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </div>
              </div>

              <div className="text-right pt-2 border-t border-border-light">
                <span className="text-xs text-text-muted">Item Total: </span>
                <span className="text-sm font-semibold font-mono text-text-primary">
                  ₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border-light">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <TbCalculator size={20} className="text-text-secondary" />
            </div>
            <h2 className="font-semibold text-text-primary">Summary</h2>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span className="font-mono">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Tax</span>
              <span className="font-mono">₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Discount</span>
              <span className="font-mono text-danger">-₹{totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-border-light text-base font-bold">
              <span className="text-text-primary">Grand Total</span>
              <span className="font-mono text-brand">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border-light">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <TbFileText size={20} className="text-text-secondary" />
            </div>
            <h2 className="font-semibold text-text-primary">Additional Info</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Any notes for the customer..."
                rows={2}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Terms & Conditions</label>
              <textarea
                value={formData.termsConditions}
                onChange={(e) => handleFormChange('termsConditions', e.target.value)}
                placeholder="Terms and conditions..."
                rows={2}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/quotations')}
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
                <TbFileText size={18} />
                Update Quotation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}