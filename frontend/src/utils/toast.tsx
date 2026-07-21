import * as Toast from "@radix-ui/react-toast";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { TbCheck, TbX, TbInfoCircle } from "react-icons/tb";
import styles from "./toast.module.css";

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let globalShowToast: ToastContextType["showToast"] | null = null;

export const toast = {
  success: (message: string) => globalShowToast?.(message, "success"),
  error: (message: string) => globalShowToast?.(message, "error"),
  info: (message: string) => globalShowToast?.(message, "info"),
};

const icons = {
  success: TbCheck,
  error: TbX,
  info: TbInfoCircle,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "info">("info");

  const showToast = useCallback(
    (msg: string, toastType: "success" | "error" | "info" = "info") => {
      setMessage(msg);
      setType(toastType);
      setOpen(true);
    },
    [],
  );

  useEffect(() => {
    globalShowToast = showToast;
    return () => { globalShowToast = null; };
  }, [showToast]);

  const Icon = icons[type];

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast.Provider swipeDirection="up" duration={4000}>
        <Toast.Root
          className={`${styles.toast} ${styles[type]}`}
          open={open}
          onOpenChange={setOpen}
        >
          <div className={styles.iconBox}>
            <Icon size={16} className={styles.icon} />
          </div>
          <Toast.Title className={styles.title}>{message}</Toast.Title>
          <Toast.Close className={styles.closeBtn} aria-label="Close">
            <TbX size={14} />
          </Toast.Close>
        </Toast.Root>
        <Toast.Viewport className={styles.viewport} />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}