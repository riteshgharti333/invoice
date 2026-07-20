import { useState } from "react";
import { TbPackage, TbFileText, TbCalculator, TbCash } from "react-icons/tb";
import type { CreateServiceDto } from "@invoice/shared/types";
import { useCreateService } from "../../features/hooks/useServices";
import { useCategories } from "../../features/hooks/useCategories";
import { createServiceSchema } from "@invoice/shared";
import { Button } from "../ui/ButtonProps";

interface Field {
  name: keyof CreateServiceDto;
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

interface NewServiceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NewServiceForm({ onSuccess, onCancel }: NewServiceFormProps) {
  const [formData, setFormData] = useState<CreateServiceDto>({
    name: "",
    categoryId: "",
    description: "",
    unit: "",
    price: "" as any,
    taxRate: "" as any,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: createService, isPending } = useCreateService();
  const { data: categoriesData } = useCategories({ cursor: "" });
  const categories = categoriesData?.data || [];

  const validate = (): boolean => {
    const dataToValidate = {
      name: formData.name,
      description: formData.description || undefined,
      categoryId: formData.categoryId || undefined,
      unit: formData.unit || undefined,
      price: formData.price ? Number(formData.price) : undefined,
      taxRate: formData.taxRate ? Number(formData.taxRate) : undefined,
    };

    const result = createServiceSchema.shape.body.safeParse(dataToValidate);

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

  const handleChange = (name: keyof CreateServiceDto, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: CreateServiceDto = {
      name: formData.name,
      description: formData.description || "",
      categoryId: formData.categoryId || "",
      unit: formData.unit || "",
      price: Number(formData.price),
      taxRate: formData.taxRate ? Number(formData.taxRate) : 0,
    };

    createService(submitData, {
      onSuccess: () => {
        setFormData({
          name: "",
          categoryId: "",
          description: "",
          unit: "",
          price: "" as any,
          taxRate: "" as any,
        });
        setErrors({});
        onSuccess?.();
      },
    });
  };

  const renderField = (field: Field) => {
    const Icon = field.icon;
    const hasError = !!errors[field.name];

    return (
      <div key={field.name}>
        <label className="block text-sm font-semibold text-text-primary mb-1.5">
          {field.label}
          {field.required && <span className="text-danger ml-1">*</span>}
        </label>

        <div className="relative">
          {field.type !== "textarea" && field.type !== "select" && (
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          )}

          {field.type === "textarea" ? (
            <textarea
              value={formData[field.name] as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 3}
              className={`w-full px-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none ${
                hasError
                  ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                  : "border-transparent focus:border-brand/30"
              }`}
            />
          ) : field.type === "select" ? (
            <select
              value={formData[field.name] as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`w-full px-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all appearance-none ${
                hasError
                  ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                  : "border-transparent focus:border-brand/30"
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
              value={formData[field.name] as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              step={field.step}
              min={field.min}
              max={field.max}
              className={`w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                hasError
                  ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                  : "border-transparent focus:border-brand/30"
              }`}
            />
          )}
        </div>

        {hasError && (
          <p className="text-danger text-xs mt-1.5 font-medium">{errors[field.name]}</p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Service Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
            <TbPackage size={18} className="text-brand" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Service Details</h3>
            <p className="text-xs text-text-muted">Fill in the service information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formFields.slice(0, 2).map(renderField)}
        </div>
        {formFields.slice(2).map(renderField)}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={isPending} icon={TbPackage}>
          {isPending ? "Saving..." : "Add Service"}
        </Button>
      </div>
    </form>
  );
}