import { useState } from "react";
import { motion } from "framer-motion";
import {
  TbLayoutDashboard,
  TbFileInvoice,
  TbFileDescription,
  TbUsers,
  TbBriefcase,
  TbSettings,
  TbCash,
} from "react-icons/tb";
import { SidebarItem } from "./SidebarItem";
import { MdCategory } from "react-icons/md";

const navItems = [
  { icon: TbLayoutDashboard, label: "Dashboard", path: "/" },
  { icon: TbFileInvoice, label: "Invoices", path: "/invoices", badge: "12" },
  {
    icon: TbFileDescription,
    label: "Quotations",
    path: "/quotations",
    badge: "5",
  },
  { icon: TbUsers, label: "Customers", path: "/customers" },
  { icon: TbBriefcase, label: "Services", path: "/services" },
  { icon: MdCategory, label: "Categories", path: "/categories" },
  { icon: TbCash, label: "Payments", path: "/payments" },
  { icon: TbSettings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const expanded = isHovered || !isCollapsed;

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? 260 : 72 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="left-0 top-0 h-full bg-brand border-r border-border z-40 flex flex-col py-3 rounded-3xl"
    >
      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-3 flex flex-col justify-center">
        {navItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            badge={item.badge}
            isCollapsed={!expanded}
          />
        ))}
      </nav>
    </motion.aside>
  );
}