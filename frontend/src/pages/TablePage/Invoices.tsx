import { TbPlus, TbEye, TbDownload, TbDotsVertical } from "react-icons/tb";
import type { Invoice } from "../../types";
import { formatCurrency, formatDate } from "../../libs/utils";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Table } from "../../components/ui/Table";
import { Link } from "react-router-dom";

// Mock data

const invoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    customerId: "cust1",
    customer: { id: "cust1", name: "Acme Corp", email: "billing@acme.com" },
    issueDate: "2024-10-15",
    dueDate: "2024-11-15",
    subtotal: 10000,
    discount: 0,
    tax: 1800,
    total: 11800,
    status: "PAID",
    createdAt: "2024-10-15",
    updatedAt: "2024-10-15",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    customerId: "cust2",
    customer: { id: "cust2", name: "Globex Inc", email: "accounts@globex.com" },
    issueDate: "2024-10-20",
    dueDate: "2024-11-20",
    subtotal: 25000,
    discount: 0,
    tax: 4500,
    total: 29500,
    status: "SENT",
    createdAt: "2024-10-20",
    updatedAt: "2024-10-20",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    customerId: "cust3",
    customer: {
      id: "cust3",
      name: "Initech Ltd",
      email: "finance@initech.com",
    },
    issueDate: "2024-09-01",
    dueDate: "2024-10-01",
    subtotal: 5000,
    discount: 500,
    tax: 810,
    total: 5310,
    status: "OVERDUE",
    createdAt: "2024-09-01",
    updatedAt: "2024-09-01",
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    customerId: "cust4",
    customer: { id: "cust4", name: "Umbrella Corp", email: "ap@umbrella.com" },
    issueDate: "2024-10-25",
    dueDate: "2024-11-25",
    subtotal: 50000,
    discount: 5000,
    tax: 8100,
    total: 53100,
    status: "DRAFT",
    createdAt: "2024-10-25",
    updatedAt: "2024-10-25",
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-005",
    customerId: "cust5",
    customer: {
      id: "cust5",
      name: "Stark Industries",
      email: "pepper@stark.com",
    },
    issueDate: "2024-08-15",
    dueDate: "2024-09-15",
    subtotal: 75000,
    discount: 0,
    tax: 13500,
    total: 88500,
    status: "PARTIALLY_PAID",
    createdAt: "2024-08-15",
    updatedAt: "2024-08-15",
  },
];

export default function Invoices() {
  const columns = [
    {
      key: "invoiceNumber",
      header: "Invoice",
      sortable: true,
      render: (row: Invoice) => (
        <div>
          <p className="font-medium font-mono text-xs">#{row.invoiceNumber}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {row.customer?.name || "Unknown"}
          </p>
        </div>
      ),
    },
    {
      key: "issueDate",
      header: "Issue Date",
      sortable: true,
      className: "hidden md:table-cell",
      render: (row: Invoice) => (
        <span className="text-text-secondary text-xs">
          {formatDate(row.issueDate)}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      className: "hidden lg:table-cell",
      render: (row: Invoice) => (
        <span className="text-text-secondary text-xs">
          {row.dueDate ? formatDate(row.dueDate) : "—"}
        </span>
      ),
    },
    {
      key: "total",
      header: "Amount",
      sortable: true,
      className: "text-right",
      render: (row: Invoice) => (
        <span className="font-semibold font-mono text-sm">
          {formatCurrency(row.total)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      className: "hidden sm:table-cell",
      render: (row: Invoice) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (_row: Invoice) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors">
            <TbEye size={16} className="text-text-secondary" />
          </button>
          <button className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors">
            <TbDownload size={16} className="text-text-secondary" />
          </button>
          <button className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors">
            <TbDotsVertical size={16} className="text-text-secondary" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Invoices</h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage all your invoices
          </p>
        </div>
        <Link
          to="/invoice/new-invoice"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-brand/25"
        >
          <TbPlus size={18} />
          New Invoice
        </Link>
      </div>

      <Table
        columns={columns}
        data={invoices}
        searchable
        searchPlaceholder="Search invoices by number or customer..."
        onRowClick={(row) => console.log("Clicked:", row.invoiceNumber)}
        emptyMessage="No invoices found"
      />
    </div>
  );
}
