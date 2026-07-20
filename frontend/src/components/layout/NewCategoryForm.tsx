import { useState } from "react";
import { TbFolder, TbFileText } from "react-icons/tb";
import type { CreateCategoryDto } from "@invoice/shared/types";
import { useCreateCategory } from "../../features/hooks/useCategories";
import { createCategorySchema } from "@invoice/shared";
import { Button } from "../ui/ButtonProps";

interface Field {
  name: keyof CreateCategoryDto;
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

interface NewCategoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NewCategoryForm({ onSuccess, onCancel }: NewCategoryFormProps) {
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: createCategory, isPending } = useCreateCategory();

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

  const handleChange = (name: keyof CreateCategoryDto, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createCategory(formData, {
      onSuccess: () => {
        setFormData({ name: "", description: "" });
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
            <>
              <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={formData[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                  hasError
                    ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                    : "border-transparent focus:border-brand/30"
                }`}
              />
            </>
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
      {/* Category Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
            <TbFolder size={18} className="text-brand" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Category Details</h3>
            <p className="text-xs text-text-muted">Fill in the category information</p>
          </div>
        </div>

        {formFields.map(renderField)}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={isPending} icon={TbFolder}>
          {isPending ? "Saving..." : "Add Category"}
        </Button>
      </div>
    </form>
  );
}