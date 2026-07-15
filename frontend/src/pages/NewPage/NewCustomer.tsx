import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbArrowLeft, TbUserPlus, TbMail, TbPhone, TbMapPin, TbBuilding, TbCheck } from 'react-icons/tb';
import { createCustomerSchema } from '@invoice/shared';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea';
  placeholder: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  required?: boolean;
  maxLength?: number;
  uppercase?: boolean;
  rows?: number;
}

const formFields: Field[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Enter customer name',
    icon: TbUserPlus,
    required: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'customer@example.com',
    icon: TbMail,
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'text',
    placeholder: '+91 98765 43210',
    icon: TbPhone,
    required: true,
  },
  {
    name: 'address',
    label: 'Address',
    type: 'textarea',
    placeholder: 'Enter complete address',
    icon: TbMapPin,
    rows: 3,
  },
  {
    name: 'gstNumber',
    label: 'GST Number',
    type: 'text',
    placeholder: '27AABCT1234C1Z5',
    icon: TbBuilding,
    maxLength: 15,
    uppercase: true,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Any additional notes...',
    icon: TbMapPin,
    rows: 3,
  },
];

const initialData: Record<string, string> = {
  name: '',
  email: '',
  phone: '',
  address: '',
  gstNumber: '',
  notes: '',
};

export default function NewCustomer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = (): boolean => {
    const result = createCustomerSchema.shape.body.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[err.path.length - 1] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleChange = (name: string, value: string) => {
    const field = formFields.find((f) => f.name === name);
    const finalValue = field?.uppercase ? value.toUpperCase() : value;
    
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        navigate('/customers');
      }, 1500);
    }, 800);
  };

  const basicFields = formFields.filter((f) => ['name', 'email', 'phone'].includes(f.name));
  const additionalFields = formFields.filter((f) => ['address', 'gstNumber', 'notes'].includes(f.name));

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
          {field.type !== 'textarea' && (
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
                maxLength={field.maxLength}
                className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none ${
                  hasError ? 'border-danger' : 'border-border'
                }`}
              />
            </>
          ) : (
            <input
              type={field.type}
              value={formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                field.name === 'gstNumber' ? 'font-mono' : ''
              } ${hasError ? 'border-danger' : 'border-border'}`}
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
          <h2 className="text-2xl font-bold text-text-primary mb-2">Customer Added!</h2>
          <p className="text-text-secondary">Redirecting to customers page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
        >
          <TbArrowLeft size={20} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">New Customer</h1>
          <p className="text-text-secondary text-sm mt-1">Add a new customer to your system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-border-light">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
              <TbUserPlus size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Basic Information</h2>
              <p className="text-xs text-text-muted">Required fields are marked with *</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {basicFields.map(renderField)}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-border-light">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <TbBuilding size={20} className="text-text-secondary" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Additional Details</h2>
              <p className="text-xs text-text-muted">Optional information</p>
            </div>
          </div>
          <div className="space-y-4">
            {additionalFields.map(renderField)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/customers')}
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
                Saving...
              </>
            ) : (
              <>
                <TbUserPlus size={18} />
                Add Customer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}