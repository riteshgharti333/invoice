import { useState } from "react";
import { TbUserPlus, TbMail, TbPhone, TbMapPin, TbBuilding, TbFileText } from "react-icons/tb";
import { createCustomerSchema } from "@invoice/shared";
import { useCreateCustomer } from "../../features/hooks/useCustomers";
import type { CreateCustomerDto } from "@invoice/shared/types";
import { Button } from "../ui/ButtonProps";

interface Field {
  name: keyof CreateCustomerDto;
  label: string;
  type: "text" | "email" | "textarea";
  placeholder: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  required?: boolean;
  maxLength?: number;
  uppercase?: boolean;
  rows?: number;
}

const formFields: Field[] = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    placeholder: "Enter customer name",
    icon: TbUserPlus,
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "customer@example.com",
    icon: TbMail,
  },
  {
    name: "phone",
    label: "Phone",
    type: "text",
    placeholder: "+91 98765 43210",
    icon: TbPhone,
    required: true,
  },
  {
    name: "address",
    label: "Address",
    type: "textarea",
    placeholder: "Enter complete address",
    icon: TbMapPin,
    rows: 3,
  },
  {
    name: "gstNumber",
    label: "GST Number",
    type: "text",
    placeholder: "27AABCT1234C1Z5",
    icon: TbBuilding,
    maxLength: 15,
    uppercase: true,
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Any additional notes...",
    icon: TbFileText,
    rows: 3,
  },
];

interface NewCustomerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NewCustomerForm({ onSuccess, onCancel }: NewCustomerFormProps) {
  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: createCustomer, isPending } = useCreateCustomer();

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

  const handleChange = (name: keyof CreateCustomerDto, value: string) => {
    const field = formFields.find((f) => f.name === name);
    const finalValue = field?.uppercase ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createCustomer(formData, {
      onSuccess: () => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          gstNumber: "",
          notes: "",
        });
        setErrors({});
        onSuccess?.();
      },
    });
  };

  const basicFields = formFields.filter((f) =>
    ["name", "email", "phone"].includes(f.name),
  );
  const additionalFields = formFields.filter((f) =>
    ["address", "gstNumber", "notes"].includes(f.name),
  );

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
          {field.type !== "textarea" && (
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          )}

          {field.type === "textarea" ? (
            <>
              <Icon className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
              <textarea
                value={formData[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows || 3}
                maxLength={field.maxLength}
                className={`w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none ${
                  hasError
                    ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                    : "border-transparent focus:border-brand/30"
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
              className={`w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all ${
                field.name === "gstNumber" ? "font-mono tracking-wide" : ""
              } ${
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
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
            <TbUserPlus size={18} className="text-brand" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Basic Information</h3>
            <p className="text-xs text-text-muted">Required fields marked with *</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {basicFields.map(renderField)}
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="w-9 h-9 bg-surface-hover rounded-xl flex items-center justify-center">
            <TbBuilding size={18} className="text-text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Additional Details</h3>
            <p className="text-xs text-text-muted">Optional information</p>
          </div>
        </div>
        <div className="space-y-4">{additionalFields.map(renderField)}</div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={isPending} icon={TbUserPlus}>
          {isPending ? "Creating..." : "Add Customer"}
        </Button>
      </div>
    </form>
  );
}