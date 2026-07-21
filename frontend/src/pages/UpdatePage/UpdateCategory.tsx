import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TbFolder, TbFileText, TbLoader } from "react-icons/tb";
import type { UpdateCategoryDto } from "@invoice/shared/types";
import { useCategory, useUpdateCategory } from "../../features/hooks/useCategories";
import { updateCategorySchema } from "@invoice/shared";
import { FormLayout } from "../../components/ui/FormLayout";
import { FormSection } from "../../components/ui/FormSection";
import { FormField } from "../../components/ui/FormField";

interface Field {
  name: keyof UpdateCategoryDto;
  label: string;
  type: "text" | "textarea";
  placeholder: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  required?: boolean;
  rows?: number;
}

const formFields: Field[] = [
  {
    name: "name",
    label: "Category Name",
    type: "text",
    placeholder: "Enter category name",
    icon: TbFolder,
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter category description (optional)",
    icon: TbFileText,
    rows: 3,
  },
];

export default function UpdateCategory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UpdateCategoryDto>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: category, isLoading } = useCategory(id!);
  const { mutate: updateCategory, isPending } = useUpdateCategory();

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.data.name,
        description: category.data.description || "",
      });
    }
  }, [category]);

  const validate = (): boolean => {
    const dataToValidate = {
      ...formData,
      description: formData.description || undefined,
    };
    const result = updateCategorySchema.shape.body.safeParse(dataToValidate);

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

  const handleChange = (name: keyof UpdateCategoryDto, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    updateCategory({ id: id!, data: formData });
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <TbLoader size={40} className="text-brand animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading category details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <FormLayout
        title="Update Category"
        subtitle="Edit category information"
        icon={TbFolder}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/categories")}
        isPending={isPending}
        submitLabel="Update Category"
      >
        <FormSection
          icon={TbFolder}
          title="Category Details"
          subtitle="Required fields marked with *"
        >
          {formFields.map((field) => {
            const Icon = field.icon;
            const hasError = !!errors[field.name];

            return (
              <FormField
                key={field.name}
                label={field.label}
                required={field.required}
                error={errors[field.name]}
                icon={field.type !== "textarea" ? Icon : undefined}
              >
                {field.type === "textarea" ? (
                  <textarea
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    rows={field.rows || 3}
                    className={`w-full px-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none ${
                      hasError
                        ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                        : "border-transparent focus:border-brand/30"
                    }`}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={`w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                      hasError
                        ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                        : "border-transparent focus:border-brand/30"
                    }`}
                  />
                )}
              </FormField>
            );
          })}
        </FormSection>
      </FormLayout>
    </div>
  );
}