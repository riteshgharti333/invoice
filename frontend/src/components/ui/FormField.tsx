import { type ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  helper?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  required = false,
  error,
  icon: Icon,
  helper,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-text-primary mb-1.5">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        )}
        {children}
      </div>

      {error && (
        <p className="text-danger text-xs mt-1.5 font-medium">{error}</p>
      )}

      {helper && !error && (
        <p className="text-text-muted text-xs mt-1.5">{helper}</p>
      )}
    </div>
  );
}
