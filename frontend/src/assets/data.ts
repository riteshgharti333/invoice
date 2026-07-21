import {
  TbLayoutDashboard,
  TbFileInvoice,
  TbFileText,
  TbUsers,
  TbPackage,
  TbFolder,
  TbCash,
  TbSettings,
  TbUser,
} from "react-icons/tb";

export interface SearchItem {
  type: "Page" | "Create";
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const searchItems: SearchItem[] = [
  // Main Pages
  { type: "Page", label: "Dashboard", path: "/", icon: TbLayoutDashboard },
  { type: "Page", label: "Invoices", path: "/invoices", icon: TbFileInvoice },
  { type: "Page", label: "Quotations", path: "/quotations", icon: TbFileText },
  { type: "Page", label: "Customers", path: "/customers", icon: TbUsers },
  { type: "Page", label: "Services", path: "/services", icon: TbPackage },
  { type: "Page", label: "Categories", path: "/categories", icon: TbFolder },
  { type: "Page", label: "Payments", path: "/payments", icon: TbCash },
  { type: "Page", label: "Settings", path: "/settings", icon: TbSettings },
  { type: "Page", label: "Profile", path: "/profile", icon: TbUser },

  // Create Pages
  {
    type: "Create",
    label: "New Invoice",
    path: "/invoice/new-invoice",
    icon: TbFileInvoice,
  },
  {
    type: "Create",
    label: "New Quotation",
    path: "/quotation/new-quotation",
    icon: TbFileText,
  },
];
