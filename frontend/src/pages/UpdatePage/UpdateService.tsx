import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { IconType } from "react-icons";
import {
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
import { FormLayout } from "../../components/ui/FormLayout";
import { FormSection } from "../../components/ui/FormSection";
import { FormField } from "../../components/ui/FormField";

interface Field {
  name: keyof UpdateServiceDto;
  label: string;
  type: "text" | "number" | "textarea" | "select";
  placeholder: string;
  icon: IconType;
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

  const { data: service, isLoading } = useService(id!);
  const { mutate: updateService, isPending } = useUpdateService();

  const { data: categoriesData } = useCategories({ cursor: "" });
  const categories = categoriesData?.data || [];

  useEffect(() => {
    if (service?.data) {
      const s = service.data;
      setFormData({
        name: s.name,
        categoryId: s.categoryId || "",
        description: s.description || "",
        unit: s.unit || "",
        price: s.price,
        taxRate: s.taxRate,
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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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

    updateService({ id: id!, data: submitData });
  };

  const renderField = (field: Field) => {
    const Icon = field.icon;
    const hasError = !!errors[field.name];

    return (
      <FormField
        key={field.name}
        label={field.label}
        required={field.required}
        error={errors[field.name]}
        icon={field.type !== "textarea" && field.type !== "select" ? Icon : undefined}
      >
        {field.type === "textarea" ? (
          <textarea
            value={formData[field.name] as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            className={`w-full px-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none ${
              hasError ? "border-danger/50 focus:border-danger focus:ring-danger/20" : "border-transparent focus:border-brand/30"
            }`}
          />
        ) : field.type === "select" ? (
          <select
            value={formData[field.name] as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`w-full px-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all appearance-none ${
              hasError ? "border-danger/50 focus:border-danger focus:ring-danger/20" : "border-transparent focus:border-brand/30"
            } ${!formData[field.name] ? "text-text-muted" : ""}`}
          >
            <option value="">{field.placeholder}</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
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
              hasError ? "border-danger/50 focus:border-danger focus:ring-danger/20" : "border-transparent focus:border-brand/30"
            }`}
          />
        )}
      </FormField>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <TbLoader size={40} className="text-brand animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading service details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <FormLayout
        title="Update Service"
        subtitle="Edit service information"
        icon={TbPackage}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/services")}
        isPending={isPending}
        submitLabel="Update Service"
      >
        <FormSection
          icon={TbPackage}
          title="Service Details"
          subtitle="Update the service information"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.slice(0, 2).map(renderField)}
          </div>
          <div className="space-y-4 mt-4">
            {formFields.slice(2).map(renderField)}
          </div>
        </FormSection>
      </FormLayout>
    </div>
  );
}