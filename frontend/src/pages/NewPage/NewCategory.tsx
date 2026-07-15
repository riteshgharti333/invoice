import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbArrowLeft, TbFolder, TbFileText, TbCheck } from 'react-icons/tb';
import { createCategorySchema } from '@invoice/shared';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  required?: boolean;
  rows?: number;
}

const formFields: Field[] = [
  {
    name: 'name',
    label: 'Category Name',
    type: 'text',
    placeholder: 'Enter category name',
    icon: TbFolder,
    required: true,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter category description (optional)',
    icon: TbFileText,
    rows: 3,
  },
];

const initialData: Record<string, string> = {
  name: '',
  description: '',
};

export default function NewCategory() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = (): boolean => {
    const result = createCategorySchema.shape.body.safeParse(formData);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        navigate('/categories');
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
          {field.type === 'textarea' ? (
            <textarea
              value={formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 3}
              className={`w-full px-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none ${
                hasError ? 'border-danger' : 'border-border'
              }`}
            />
          ) : (
            <>
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={formData[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                  hasError ? 'border-danger' : 'border-border'
                }`}
              />
            </>
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
          <h2 className="text-2xl font-bold text-text-primary mb-2">Category Added!</h2>
          <p className="text-text-secondary">Redirecting to categories page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/categories')}
          className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
        >
          <TbArrowLeft size={20} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">New Category</h1>
          <p className="text-text-secondary text-sm mt-1">Add a new service category</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border-light">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
              <TbFolder size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Category Details</h2>
              <p className="text-xs text-text-muted">Required fields are marked with *</p>
            </div>
          </div>

          {formFields.map(renderField)}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/categories')}
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
                <TbFolder size={18} />
                Add Category
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}