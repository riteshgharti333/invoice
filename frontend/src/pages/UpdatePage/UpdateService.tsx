import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TbArrowLeft,
  TbPackage,
  TbFileText,
  TbCalculator,
  TbCash,
  TbLoader,
} from "react-icons/tb";
import type { UpdateServiceDto } from "@invoice/shared/types";
import { useService, useUpdateService } from "../../features/hooks/useServices";
import { useCategories } from "../../features/hooks/useCategories";
import { updateServiceSchema } from "@invoice/shared";

interface Field {
  name: keyof UpdateServiceDto;
  label: string;
  type: "text" | "number" | "textarea" | "select";
  placeholder: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  required?: boolean;
  rows?: number;
  step?: string;
  min?: number;
  max?: number;
}

const formFields: Field[] = [
  {
    name: "name",
    label: "Service Name",
    type: "text",
    placeholder: "Enter service name",
    icon: TbPackage,
    required: true,
  },
  {
    name: "categoryId",
    label: "Category",
    type: "select",
    placeholder: "Select category",
    icon: TbFileText,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter service description",
    icon: TbFileText,
    rows: 3,
  },
  {
    name: "unit",
    label: "Unit",
    type: "text",
    placeholder: "e.g., hour, project, piece",
    icon: TbPackage,
  },
  {
    name: "price",
    label: "Price",
    type: "number",
    placeholder: "0.00",
    icon: TbCash,
    required: true,
    step: "0.01",
    min: 0,
  },
  {
    name: "taxRate",
    label: "Tax Rate (%)",
    type: "number",
    placeholder: "18",
    icon: TbCalculator,
    step: "0.01",
    min: 0,
    max: 100,
  },
];

export default function UpdateService() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UpdateServiceDto>({
    name: "",
    categoryId: "",
    description: "",
    unit: "",
    price: "" as any,
    taxRate: "" as any,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch service data
  const { data: service, isLoading } = useService(id!);

  // Update mutation
  const { mutate: updateService, isPending } = useUpdateService();

  // Fetch categories for dropdown
  const { data: categoriesData } = useCategories({ cursor: "" });
  const categories = categoriesData?.data || [];

  // Populate form when service data is loaded
  useEffect(() => {
    if (service?.data) {
      const serviceData = service.data;
      setFormData({
        name: serviceData.name,
        categoryId: serviceData.categoryId || "",
        description: serviceData.description || "",
        unit: serviceData.unit || "",
        price: serviceData.price,
        taxRate: serviceData.taxRate,
      });
    }
  }, [service]);

  const validate = (): boolean => {
    const dataToValidate = {
      name: formData.name || undefined,
      categoryId: formData.categoryId || undefined,
      description: formData.description || undefined,
      unit: formData.unit || undefined,
      price: formData.price ? Number(formData.price) : undefined,
      taxRate: formData.taxRate ? Number(formData.taxRate) : undefined,
    };

    const result = updateServiceSchema.shape.body.safeParse(dataToValidate);

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

  const handleChange = (name: keyof UpdateServiceDto, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: UpdateServiceDto = {
      name: formData.name || "",
      description: formData.description || "",
      categoryId: formData.categoryId || "",
      unit: formData.unit || "",
      price: formData.price ? Number(formData.price) : 0,
      taxRate: formData.taxRate ? Number(formData.taxRate) : 0,
    };

    updateService(
      {
        id: id!,
        data: submitData,
      },
    );
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
          {field.type !== "textarea" && field.type !== "select" && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          )}

          {field.type === "textarea" ? (
            <textarea
              value={formData[field.name] as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 3}
              className={`w-full px-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none ${
                hasError ? "border-danger" : "border-border"
              }`}
            />
          ) : field.type === "select" ? (
            <select
              value={formData[field.name] as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`w-full px-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all appearance-none ${
                hasError ? "border-danger" : "border-border"
              } ${!formData[field.name] ? "text-text-muted" : ""}`}
            >
              <option value="">{field.placeholder}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              step={field.step}
              min={field.min}
              max={field.max}
              className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                hasError ? "border-danger" : "border-border"
              }`}
            />
          )}
        </div>

        {hasError && (
          <p className="text-danger text-xs mt-1">{errors[field.name]}</p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <TbLoader
            size={40}
            className="text-brand animate-spin mx-auto mb-4"
          />
          <p className="text-text-secondary">Loading service details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/services")}
          className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
        >
          <TbArrowLeft size={20} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Update Service
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Edit service information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-border-light">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
              <TbPackage size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">
                Service Details
              </h2>
              <p className="text-xs text-text-muted">
                Update the service information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formFields.slice(0, 2).map(renderField)}
            </div>
            {formFields.slice(2).map(renderField)}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/services")}
            className="px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <TbPackage size={18} />
                Update Service
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
