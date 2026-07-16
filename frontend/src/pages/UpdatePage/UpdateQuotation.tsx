import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TbArrowLeft,
  TbFileText,
  TbPlus,
  TbTrash,
  TbUser,
  TbCalendar,
  TbCalculator,
  TbSearch,
  TbLoader,
} from 'react-icons/tb';
import { updateQuotationSchema, updateQuotationStatusSchema } from '@invoice/shared';
import type { UpdateQuotationDto } from '@invoice/shared/types';
import { useQuotation, useUpdateQuotation, useUpdateQuotationStatus } from '../../features/hooks/useQuotations';
import { useCustomers, useSearchCustomers } from '../../features/hooks/useCustomers';
import { useServices, useSearchServices } from '../../features/hooks/useServices';
import { calcItemTotal, calcTotals, formatCurrency } from '../../utils/moneyCalc';
import { toast } from '../../utils/toast';
import type { CalcItem } from '../../utils/moneyCalc';

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

// Helper to extract data from API responses
function extractListData<T>(response: any): T[] {
  if (!response?.data) return [];
  if (Array.isArray(response.data)) return response.data;
  if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
  return [];
}

// Constants
const emptyItem = (): LineItem => ({
  id: crypto.randomUUID(),
  serviceId: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
  discount: 0,
  total: 0,
});

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'EXPIRED', label: 'Expired' },
];

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

export default function UpdateQuotation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    customerId: '',
    issueDate: '',
    expiryDate: '',
    discount: 0,
    tax: 0,
    notes: '',
    termsConditions: '',
    status: 'DRAFT',
    items: [emptyItem()],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customerSearch, setCustomerSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState<Record<string, string>>({});

  // Fetch quotation data
  const { data: quotation, isLoading } = useQuotation(id!);
  
  // Mutations
  const { mutate: updateQuotation, isPending } = useUpdateQuotation();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateQuotationStatus();

  // Fetch customers
  const { data: customersData } = useCustomers({ cursor: '' });
  const { data: searchedCustomers } = useSearchCustomers({ q: customerSearch });
  const customers = extractListData<Customer>(customerSearch ? searchedCustomers : customersData);

  // Fetch services
  const { data: servicesData } = useServices({ cursor: '' });
  const { data: searchedServices } = useSearchServices({ q: serviceSearch.global || '' });
  const services = extractListData<Service>(serviceSearch.global ? searchedServices : servicesData);

  // Populate form when quotation data is loaded
  useEffect(() => {
    if (quotation?.data) {
      const quotationData = quotation.data;
      setFormData({
        customerId: quotationData.customerId,
        issueDate: quotationData.issueDate?.split('T')[0] || '',
        expiryDate: quotationData.expiryDate?.split('T')[0] || '',
        discount: quotationData.discount || 0,
        tax: quotationData.tax || 0,
        notes: quotationData.notes || '',
        termsConditions: quotationData.termsConditions || '',
        status: quotationData.status,
        items: quotationData.items?.map(item => ({
          id: crypto.randomUUID(),
          serviceId: item.serviceId,
          description: item.description || '',
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
  }, [quotation]);

  // Calculations using utility
  const totals = calcTotals(formData.items);

  // Handlers
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, emptyItem()],
    }));
  };

  const removeItem = (itemId: string) => {
    if (formData.items.length === 1) {
      toast.error('At least one service item is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };

  const updateItem = (itemId: string, field: keyof LineItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== itemId) return item;

        const updated = { ...item, [field]: value };

        // Auto-fill price and tax when service selected
        if (field === 'serviceId' && typeof value === 'string' && value) {
          const service = services.find(s => s.id === value);
          if (service) {
            updated.unitPrice = service.price;
            updated.taxRate = service.taxRate;
          }
        }

        // Recalculate item total
        updated.total = calcItemTotal(updated);
        return updated;
      }),
    }));

    // Clear search after selection
    if (field === 'serviceId') {
      setServiceSearch(prev => ({ ...prev, [itemId]: '' }));
    }
  };

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const selectCustomer = (customerId: string) => {
    setFormData(prev => ({ ...prev, customerId }));
    setCustomerSearch('');
    if (errors.customerId) {
      setErrors(prev => {
        const { customerId: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const clearCustomer = () => {
    setFormData(prev => ({ ...prev, customerId: '' }));
    setCustomerSearch('');
  };

  const handleServiceSelect = (itemId: string, serviceId: string) => {
    updateItem(itemId, 'serviceId', serviceId);
  };

  const handleStatusChange = (newStatus: string) => {
    const result = updateQuotationStatusSchema.shape.body.safeParse({ status: newStatus });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        fieldErrors['status'] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    updateStatus(
      { id: id!, status: newStatus },
      {
        onSuccess: () => {
          setFormData(prev => ({ ...prev, status: newStatus }));
        },
      }
    );
  };

  const validate = (): boolean => {
    // Check at least one item has a service selected
    const hasValidService = formData.items.some(item => item.serviceId);
    if (!hasValidService) {
      toast.error('Please select at least one service');
      return false;
    }

    // Check all items with service selected have quantity and price
    const itemsWithService = formData.items.filter(item => item.serviceId);
    for (const item of itemsWithService) {
      if (!item.quantity || item.quantity < 1) {
        toast.error('All items must have a quantity of at least 1');
        return false;
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        toast.error('All items must have a price greater than 0');
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
        .filter(item => item.serviceId)
        .map(item => ({
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
      result.error.errors.forEach(err => {
        fieldErrors[err.path.join('.')] = err.message;
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
        .filter(item => item.serviceId)
        .map(item => ({
          serviceId: item.serviceId,
          description: item.description || undefined,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          taxRate: Number(item.taxRate) || undefined,
          discount: Number(item.discount) || undefined,
        })),
    };

    updateQuotation(
      { id: id!, data: submitData },
     
    );
  };

  // Loading state
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/quotations')} className="p-2 hover:bg-surface-hover rounded-xl transition-colors">
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
            onChange={e => handleStatusChange(e.target.value)}
            disabled={isUpdatingStatus}
            className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all disabled:opacity-50"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {isUpdatingStatus && (
            <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Dates Section */}
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
            {/* Customer Search/Select */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Customer <span className="text-danger">*</span>
              </label>

              {formData.customerId ? (
                <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {customers.find(c => c.id === formData.customerId)?.name || 'Loading...'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {customers.find(c => c.id === formData.customerId)?.phone || ''}
                    </p>
                  </div>
                  <button type="button" onClick={clearCustomer} className="text-xs text-brand hover:underline">
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Search customers..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                  {customerSearch && customers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {customers.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => selectCustomer(c.id)}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-hover transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium">{c.name}</span>
                          <span className="text-text-muted text-xs">{c.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {errors.customerId && <p className="text-danger text-xs mt-1">{errors.customerId}</p>}
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Issue Date</label>
              <div className="relative">
                <TbCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={e => updateField('issueDate', e.target.value)}
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
                  onChange={e => updateField('expiryDate', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Section */}
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
            <button type="button" onClick={addItem} className="flex items-center gap-2 px-3 py-2 bg-brand text-white rounded-xl text-xs font-medium hover:opacity-90 transition-all">
              <TbPlus size={14} /> Add Item
            </button>
          </div>

          {formData.items.map((item, index) => (
            <div key={item.id} className="p-4 bg-surface rounded-xl border border-border-light space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">Item #{index + 1}</span>
                {formData.items.length > 1 && (
                  <button type="button" onClick={() => removeItem(item.id)} className="p-1.5 hover:bg-danger-light rounded-lg transition-colors">
                    <TbTrash size={14} className="text-danger" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Service Search/Select */}
                <div className="md:col-span-2">
                  <label className="block text-xs text-text-secondary mb-1">Service *</label>
                  {item.serviceId ? (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-border">
                      <div>
                        <p className="text-sm font-medium">{services.find(s => s.id === item.serviceId)?.name || 'Loading...'}</p>
                        <p className="text-xs text-text-muted">{formatCurrency(services.find(s => s.id === item.serviceId)?.price || 0)}</p>
                      </div>
                      <button type="button" onClick={() => updateItem(item.id, 'serviceId', '')} className="text-xs text-brand hover:underline">
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={serviceSearch[item.id] || ''}
                        onChange={e => setServiceSearch(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="Search services..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                      {serviceSearch[item.id] && services.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {services.map(s => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleServiceSelect(item.id, s.id)}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-hover transition-colors flex items-center justify-between"
                            >
                              <span className="font-medium">{s.name}</span>
                              <span className="text-text-muted text-xs">{formatCurrency(s.price)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Item Fields */}
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Quantity</label>
                  <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} min="1"
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Unit Price</label>
                  <input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))} min="0" step="0.01"
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Tax Rate (%)</label>
                  <input type="number" value={item.taxRate} onChange={e => updateItem(item.id, 'taxRate', Number(e.target.value))} min="0" max="100"
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Discount (%)</label>
                  <input type="number" value={item.discount} onChange={e => updateItem(item.id, 'discount', Number(e.target.value))} min="0" max="100"
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all" />
                </div>
              </div>

              {/* Item Total */}
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
            <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
            <SummaryRow label="Tax" value={formatCurrency(totals.totalTax)} />
            <SummaryRow label="Discount" value={`-${formatCurrency(totals.totalDiscount)}`} valueClassName="text-danger" />
            <SummaryRow
              label="Grand Total"
              value={formatCurrency(totals.grandTotal)}
              className="pt-3 border-t border-border-light text-base font-bold"
              labelClassName="text-text-primary"
              valueClassName="text-brand"
            />
          </div>
        </div>

        {/* Notes Section */}
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
              <textarea value={formData.notes} onChange={e => updateField('notes', e.target.value)} placeholder="Any notes for the customer..." rows={2}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Terms & Conditions</label>
              <textarea value={formData.termsConditions} onChange={e => updateField('termsConditions', e.target.value)} placeholder="Terms and conditions..." rows={2}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate('/quotations')} className="px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending || isUpdatingStatus} className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand/25 disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? (
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

// Helper component for summary rows
function SummaryRow({ label, value, className = '', labelClassName = 'text-text-secondary', valueClassName = '' }: {
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