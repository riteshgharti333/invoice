import { type ReactNode } from "react";
import { type IconType } from "react-icons";

interface FormSectionProps {
  icon: IconType;
  title: string;
  subtitle?: string;
  variant?: "brand" | "muted";
  action?: ReactNode;
  children: ReactNode;
}

export function FormSection({
  icon: Icon,
  title,
  subtitle,
  variant = "brand",
  action,
  children,
}: FormSectionProps) {
  const iconBoxStyles = {
    brand: "bg-brand/10 text-brand",
    muted: "bg-surface-hover text-text-secondary",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBoxStyles[variant]}`}>
            <Icon size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">{title}</h3>
            {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}