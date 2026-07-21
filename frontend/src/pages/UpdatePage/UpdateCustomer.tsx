import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TbUserPlus,
  TbMail,
  TbPhone,
  TbMapPin,
  TbBuilding,
  TbCheck,
  TbLoader,
  TbFileText,
} from "react-icons/tb";
import type { CreateCustomerDto } from "@invoice/shared/types";
import {
  useCustomer,
  useUpdateCustomer,
} from "../../features/hooks/useCustomers";
import { updateCustomerSchema } from "@invoice/shared";
import { FormLayout } from "../../components/ui/FormLayout";
import { FormSection } from "../../components/ui/FormSection";
import { FormField } from "../../components/ui/FormField";

interface Field {
  name: keyof CreateCustomerDto | "isActive";
  label: string;
  type: "text" | "email" | "textarea" | "switch";
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
    label: "Email Address",
    type: "email",
    placeholder: "customer@example.com",
    icon: TbMail,
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "text",
    placeholder: "+91 98765 43210",
    icon: TbPhone,
    required: true,
  },
  {
    name: "address",
    label: "Billing Address",
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

interface FormData extends CreateCustomerDto {
  isActive: boolean;
}

const initialData: FormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  gstNumber: "",
  notes: "",
  isActive: true,
};

export default function UpdateCustomer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: customer, isLoading } = useCustomer(id!);
  const { mutate: updateCustomer, isPending } = useUpdateCustomer();

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone,
        address: customer.address || "",
        gstNumber: customer.gstNumber || "",
        notes: customer.notes || "",
        isActive: customer.isActive,
      });
    }
  }, [customer]);

  const validate = (): boolean => {
    const { isActive, ...dataToValidate } = formData;
    const result = updateCustomerSchema.shape.body.safeParse(dataToValidate);

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

  const handleChange = (name: keyof FormData, value: string | boolean) => {
    const field = formFields.find((f) => f.name === name);
    const finalValue =
      field?.uppercase && typeof value === "string"
        ? value.toUpperCase()
        : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const { isActive, ...updateData } = formData;

    updateCustomer({ id: id!, data: { ...updateData, isActive } });
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
      <FormField
        key={field.name}
        label={field.label}
        required={field.required}
        error={errors[field.name]}
        icon={field.type !== "textarea" ? (Icon as any) : undefined}
      >
        {field.type === "textarea" ? (
          <textarea
            value={formData[field.name] as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            maxLength={field.maxLength}
            className={`w-full px-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none ${
              hasError
                ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                : "border-transparent focus:border-brand/30"
            }`}
          />
        ) : (
          <input
            type={field.type}
            value={formData[field.name] as string}
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
      </FormField>
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
          <p className="text-text-secondary">Loading customer details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <FormLayout
        title="Update Customer"
        subtitle="Edit customer information"
        icon={TbUserPlus}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/customers")}
        isPending={isPending}
        submitLabel="Update Customer"
      >
        {/* Basic Information */}
        <FormSection
          icon={TbUserPlus}
          title="Basic Information"
          subtitle="Required fields marked with *"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {basicFields.map(renderField)}
          </div>
        </FormSection>

        {/* Additional Details */}
        <FormSection
          icon={TbBuilding}
          title="Additional Details"
          subtitle="Optional information"
          variant="muted"
        >
          <div className="space-y-4">{additionalFields.map(renderField)}</div>
        </FormSection>
      </FormLayout>
    </div>
  );
}
