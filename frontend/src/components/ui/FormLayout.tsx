import { type ReactNode } from "react";
import { type IconType } from "react-icons";
import { Button } from "./ButtonProps";
import { TbArrowLeft } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

interface FormLayoutProps {
  title: string;
  subtitle?: string;
  icon?: IconType;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  isPending?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  extraAction?: () => void;
  extraLabel?: string;
}

export function FormLayout({
  title,
  subtitle,
  icon: Icon,
  children,
  onSubmit,
  onCancel,
  isPending = false,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  extraAction,
  extraLabel,
}: FormLayoutProps) {
  const navigate = useNavigate();
  return (
    <form onSubmit={onSubmit}>
      <div className="bg-white rounded-3xl overflow-hidden shadow-card">
        {/* Gradient Header */}

        <div className="bg-gradient-to-r from-brand to-blue-700 px-8 py-7">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0"
            >
              <TbArrowLeft size={20} className="text-white" />
            </button>

            {/* Icon */}
            {Icon && (
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={20} className="text-white" />
              </div>
            )}

            {/* Title + Subtitle */}
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              {subtitle && (
                <p className="text-white/70 text-sm mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-7 space-y-6">{children}</div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between px-8 py-5 bg-surface-hover border-t border-border">
        
          <div />
          <div className="flex items-center gap-3">
            {onCancel && (
              <Button variant="secondary" type="button" onClick={onCancel}>
                {cancelLabel}
              </Button>
            )}
            <Button variant="primary" type="submit" loading={isPending}>
              {isPending ? "Saving..." : submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
