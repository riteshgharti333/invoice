import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TbArrowLeft, TbFolder, TbFileText, TbLoader } from "react-icons/tb";
import type { UpdateCategoryDto } from "@invoice/shared/types";
import { useCategory, useUpdateCategory } from "../../features/hooks/useCategories";
import { updateCategorySchema } from "@invoice/shared";
import { Button } from "../../components/ui/ButtonProps";

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
      {/* Back Button */}
      <button
        onClick={() => navigate("/categories")}
        className="p-2 hover:bg-surface-hover rounded-xl transition-colors mb-6 group"
      >
        <TbArrowLeft size={20} className="text-text-secondary group-hover:text-text-primary transition-colors" />
      </button>

      {/* Form Card */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-card">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-brand to-blue-700 px-8 py-7">
          <h2 className="text-xl font-bold text-white">Update Category</h2>
          <p className="text-white/70 text-sm mt-1">Edit category information</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          {formFields.map((field) => {
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
                        value={formData[field.name] || ""}
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
          })}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => navigate("/categories")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isPending} icon={TbFolder}>
              {isPending ? "Updating..." : "Update Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}