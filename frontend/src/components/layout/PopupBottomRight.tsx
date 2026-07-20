import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TbX } from "react-icons/tb";

interface PopupBottomRightProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
}

export function PopupBottomRight({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "max-w-lg",
}: PopupBottomRightProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Popup Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: 60, y: 60 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: 60, y: 60 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={`fixed bottom-6 right-6 z-50 w-full ${width} bg-white rounded-3xl shadow-2xl border border-border overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
              <div>
                <h2 className="text-lg font-bold text-text-primary">{title}</h2>
                {subtitle && (
                  <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
              >
                <TbX size={20} className="text-text-secondary" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="max-h-[70vh] overflow-y-auto p-6 ov">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}