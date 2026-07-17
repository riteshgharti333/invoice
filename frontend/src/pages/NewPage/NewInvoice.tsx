import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TbArrowLeft,
  TbFileInvoice,
  TbPlus,
  TbTrash,
  TbUser,
  TbCalendar,
  TbFileText,
  TbCalculator,
  TbSearch,
  TbQuote,
  TbFile,
} from 'react-icons/tb';
import { createInvoiceSchema } from '@invoice/shared';
import type { CreateInvoiceDto } from '@invoice/shared/types';
import { useCreateInvoice } from '../../features/hooks/useInvoices';
import { useCustomers, useSearchCustomers } from '../../features/hooks/useCustomers';
import { useServices, useSearchServices } from '../../features/hooks/useServices';
import { useSearchQuotations } from '../../features/hooks/useQuotations';
import { calcItemTotal, calcTotals, formatCurrency, getTodayDate } from '../../utils/moneyCalc';
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

interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customer?: { id: string; name: string; phone: string };
  issueDate: string;
  expiryDate?: string;
  discount: number;
  tax: number;
  notes?: string;
  termsConditions?: string;
  items?: {
    serviceId: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    discount?: number;
  }[];
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

const initialFormData = (): FormData => ({
  customerId: '',
  quotationId: '',
  issueDate: getTodayDate(),
  dueDate: '',
  discount: 0,
  tax: 0,
  notes: '',
  termsConditions: '',
  items: [emptyItem()],
});

type InvoiceMode = 'new' | 'quotation';

export default function NewInvoice() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<InvoiceMode>('new');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customerSearch, setCustomerSearch] = useState('');
  const [quotationSearch, setQuotationSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState<Record<string, string>>({});
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const { mutate: createInvoice, isPending } = useCreateInvoice();

  // Fetch customers
  const { data: customersData } = useCustomers({ cursor: '' });
  const { data: searchedCustomers } = useSearchCustomers({ q: customerSearch });
  const customers = extractListData<Customer>(customerSearch ? searchedCustomers : customersData);

  // Fetch services
  const { data: servicesData } = useServices({ cursor: '' });
  const { data: searchedServices } = useSearchServices({ q: serviceSearch.global || '' });
  const services = extractListData<Service>(serviceSearch.global ? searchedServices : servicesData);

  // Fetch approved quotations
  const { data: quotationsData } = useSearchQuotations({ 
    q: quotationSearch, 
    status: "APPROVED" 
  });
  const quotations = extractListData<Quotation>(quotationsData);

  // Auto-fill form when quotation is selected
  useEffect(() => {
    if (selectedQuotation) {
      setFormData({
        customerId: selectedQuotation.customerId,
        quotationId: selectedQuotation.id,
        issueDate: getTodayDate(),
        dueDate: selectedQuotation.expiryDate?.split('T')[0] || '',
        discount: selectedQuotation.discount || 0,
        tax: selectedQuotation.tax || 0,
        notes: selectedQuotation.notes || '',
        termsConditions: selectedQuotation.termsConditions || '',
        items: selectedQuotation.items?.map(item => ({
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
  }, [selectedQuotation]);

  // Calculations using utility
  const totals = calcTotals(formData.items);

  // Handlers
  const switchMode = (newMode: InvoiceMode) => {
    setMode(newMode);
    setFormData(initialFormData());
    setErrors({});
    setSelectedQuotation(null);
    setQuotationSearch('');
    setCustomerSearch('');
  };

  const selectQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setQuotationSearch('');
  };

  const clearQuotation = () => {
    setSelectedQuotation(null);
    setFormData(initialFormData());
    setQuotationSearch('');
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, emptyItem()],
    }));
  };

  const removeItem = (id: string) => {
    if (formData.items.length === 1) {
      toast.error('At least one service item is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        if (field === 'serviceId' && typeof value === 'string' && value) {
          const service = services.find(s => s.id === value);
          if (service) {
            updated.unitPrice = service.price;
            updated.taxRate = service.taxRate;
          }
        }

        updated.total = calcItemTotal(updated);
        return updated;
      }),
    }));

    if (field === 'serviceId') {
      setServiceSearch(prev => ({ ...prev, [id]: '' }));
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

  const validate = (): boolean => {
    const hasValidService = formData.items.some(item => item.serviceId);
    if (!hasValidService) {
      toast.error('Please select at least one service');
      return false;
    }

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
      quotationId: formData.quotationId || undefined,
      issueDate: formData.issueDate || undefined,
      dueDate: formData.dueDate || undefined,
      discount: Number(formData.discount) || 0,
      tax: Number(formData.tax) || 0,
      notes: formData.notes || undefined,
      termsConditions: formData.termsConditions || undefined,
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

    const result = createInvoiceSchema.shape.body.safeParse(dataToValidate);

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

    const submitData: CreateInvoiceDto = {
      customerId: formData.customerId,
      quotationId: formData.quotationId || undefined,
      issueDate: formData.issueDate || undefined,
      dueDate: formData.dueDate || undefined,
      discount: Number(formData.discount) || 0,
      tax: Number(formData.tax) || 0,
      notes: formData.notes || undefined,
      termsConditions: formData.termsConditions || undefined,
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

    createInvoice(submitData, {
      onSuccess: (data) => {
        navigate(`/invoice/${data.data.id}`);
      },
    });
  };

  // Loading state
  if (isPending) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Creating invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/invoices')} className="p-2 hover:bg-surface-hover rounded-xl transition-colors">
          <TbArrowLeft size={20} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">New Invoice</h1>
          <p className="text-text-secondary text-sm mt-1">Create a new invoice</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-white rounded-2xl border border-border p-1.5 flex gap-1 mb-6">
        <button
          type="button"
          onClick={() => switchMode('new')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === 'new'
              ? 'bg-brand text-white shadow-md'
              : 'text-text-secondary hover:bg-surface-hover'
          }`}
        >
          <TbFile size={18} />
          New Invoice
        </button>
        <button
          type="button"
          onClick={() => switchMode('quotation')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === 'quotation'
              ? 'bg-brand text-white shadow-md'
              : 'text-text-secondary hover:bg-surface-hover'
          }`}
        >
          <TbQuote size={18} />
          From Quotation
        </button>
      </div>

      {/* Quotation Selection (only in quotation mode) */}
      {mode === 'quotation' && !selectedQuotation && (
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border-light">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
              <TbQuote size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Select Approved Quotation</h2>
              <p className="text-xs text-text-muted">Search and select an approved quotation to create invoice</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="relative">
              <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={quotationSearch}
                onChange={e => setQuotationSearch(e.target.value)}
                placeholder="Search by customer name or quotation number..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
              />
              {quotationSearch && quotations.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {quotations.map((q: Quotation) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => selectQuotation(q)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-surface-hover transition-colors border-b border-border-light last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">#{q.quotationNumber}</span>
                        <span className="text-text-muted text-xs">{q.issueDate?.split('T')[0]}</span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">{q.customer?.name || 'Unknown'}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {quotationSearch && quotations.length === 0 && (
              <p className="text-text-muted text-sm text-center mt-3">No approved quotations found</p>
            )}
          </div>
        </div>
      )}

      {/* Selected Quotation Info */}
      {mode === 'quotation' && selectedQuotation && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TbQuote size={20} className="text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">
                Quotation #{selectedQuotation.quotationNumber}
              </p>
              <p className="text-xs text-green-600">
                {selectedQuotation.customer?.name} • {formatCurrency(selectedQuotation.items?.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0) || 0)}
              </p>
            </div>
          </div>
          <button type="button" onClick={clearQuotation} className="text-xs text-green-700 hover:underline">
            Change
          </button>
        </div>
      )}

      {/* Form - only show when in new mode OR quotation selected */}
      {(mode === 'new' || selectedQuotation) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer & Dates Section */}
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-border-light">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                <TbUser size={20} className="text-brand" />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary">Invoice Details</h2>
                <p className="text-xs text-text-muted">
                  {mode === 'quotation' ? 'Auto-filled from quotation' : 'Select customer and dates'}
                </p>
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
                    {mode === 'new' && (
                      <button type="button" onClick={clearCustomer} className="text-xs text-brand hover:underline">
                        Change
                      </button>
                    )}
                  </div>
                ) : (
                  mode === 'new' && (
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
                  )
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
                <label className="block text-sm font-medium text-text-primary mb-1.5">Due Date</label>
                <div className="relative">
                  <TbCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => updateField('dueDate', e.target.value)}
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
                  <TbFileInvoice size={20} className="text-brand" />
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary">Line Items</h2>
                  <p className="text-xs text-text-muted">
                    {mode === 'quotation' ? 'Items from quotation (editable)' : 'Add services to invoice'}
                  </p>
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
            <button type="button" onClick={() => navigate('/invoices')} className="px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand/25 disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <TbFileInvoice size={18} />
                  Create Invoice
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

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