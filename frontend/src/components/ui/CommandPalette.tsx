import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { TbSearch } from "react-icons/tb";
import { searchItems, type SearchItem } from "../../assets/data";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // Close on Escape
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onClose]);

  const filtered = query
    ? searchItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : searchItems;

  const handleSelect = (item: SearchItem) => {
    navigate(item.path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          >
            <Command className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-border overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <TbSearch size={18} className="text-text-muted shrink-0" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search pages and actions..."
                  className="w-full text-sm text-text-primary placeholder:text-text-muted bg-transparent outline-none"
                />
              </div>

              <Command.List className="max-h-72 overflow-y-auto p-2">
                <Command.Empty className="px-5 py-8 text-center text-sm text-text-muted">
                  No results found
                </Command.Empty>

                {filtered.length > 0 && (
                  <Command.Group heading="Pages & Actions" className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 py-2">
                    {filtered.map((item) => (
                      <Command.Item
                        key={item.path + item.label}
                        value={item.label}
                        onSelect={() => handleSelect(item)}
                        className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm text-text-primary cursor-pointer hover:bg-surface-hover transition-colors aria-selected:bg-brand/10 aria-selected:text-brand"
                      >
                        <div className="w-8 h-8 bg-surface-hover rounded-xl flex items-center justify-center shrink-0">
                          <item.icon size={16} className="text-text-secondary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.label}</p>
                        </div>
                        <span className="text-xs text-text-muted bg-surface-hover px-2 py-0.5 rounded-lg">
                          {item.type}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>

              <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>↑↓ Navigate</span>
                <span>↵ Open</span>
                <span>Esc Close</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}