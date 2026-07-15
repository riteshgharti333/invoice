import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TbLayoutDashboard, 
  TbFileInvoice, 
  TbFileText, 
  TbUsers, 
  TbBriefcase, 
  TbSettings, 
  TbChevronLeft, 
  TbChevronRight, 
  TbSparkles 
} from 'react-icons/tb';
import { SidebarItem } from './SidebarItem';
import { MdCategory } from 'react-icons/md';


const navItems = [
  { icon: TbLayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: TbFileInvoice, label: 'Invoices', path: '/invoices', badge: '12' },
  { icon: TbFileText, label: 'Quotations', path: '/quotations', badge: '5' },
  { icon: TbUsers, label: 'Customers', path: '/customers' },
  { icon: TbBriefcase, label: 'Services', path: '/services' },
  { icon: MdCategory, label: 'Categories', path: '/categories' },

  { icon: TbSettings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-full bg-white border-r border-border z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-border">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/25">
                <TbSparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-text-primary">
                Invoicely
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors"
        >
          {isCollapsed ? <TbChevronRight size={18} /> : <TbChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            badge={item.badge}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0">
            JD
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">John Doe</p>
              <p className="text-xs text-text-muted truncate">john@example.com</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}