import { type ReactNode } from "react";
import { type IconType } from "react-icons";
import { TbLoader } from "react-icons/tb";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: IconType;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-sm",
  };

  const variantStyles = {
    primary:
      "bg-brand text-white border-2 border-brand hover:bg-white hover:text-brand hover:shadow-lg hover:shadow-brand/15",
    secondary:
      "bg-surface-hover text-text-secondary border-2 border-transparent hover:bg-surface hover:text-text-primary hover:border-border",
    danger:
      "bg-danger text-white border-2 border-danger hover:bg-white hover:text-danger hover:border-danger hover:shadow-lg hover:shadow-danger/15",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <TbLoader
          size={size === "sm" ? 14 : 16}
          className="animate-spin shrink-0"
        />
      ) : Icon ? (
        <Icon
          size={size === "sm" ? 14 : 18}
          className="shrink-0 transition-transform duration-500 group-hover:rotate-180"
        />
      ) : null}
      {children}
    </button>
  );
}