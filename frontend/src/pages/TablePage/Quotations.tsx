import {
  TbPlus,
  TbEye,
  TbDownload,
  TbDotsVertical,
  TbFileText,
} from "react-icons/tb";
import type { Quotation } from "../../types";
import { formatCurrency, formatDate } from "../../libs/utils";
import { QuotationStatusBadge } from "../../components/ui/QuotationStatusBadge";
import { Table } from "../../components/ui/Table";
import { Link } from "react-router-dom";

const quotations: Quotation[] = [
  {
    id: "1",
    quotationNumber: "QTN-2024-001",
    customerId: "cust1",
    customer: { id: "cust1", name: "Acme Corp", email: "billing@acme.com" },
    issueDate: "2024-10-01",
    expiryDate: "2024-11-01",
    subtotal: 45000,
    discount: 0,
    tax: 8100,
    total: 53100,
    status: "SENT",
    createdAt: "2024-10-01",
    updatedAt: "2024-10-01",
  },
  {
    id: "2",
    quotationNumber: "QTN-2024-002",
    customerId: "cust2",
    customer: { id: "cust2", name: "Globex Inc", email: "accounts@globex.com" },
    issueDate: "2024-10-10",
    expiryDate: "2024-11-10",
    subtotal: 25000,
    discount: 2500,
    tax: 4050,
    total: 26550,
    status: "APPROVED",
    createdAt: "2024-10-10",
    updatedAt: "2024-10-15",
  },
  {
    id: "3",
    quotationNumber: "QTN-2024-003",
    customerId: "cust3",
    customer: {
      id: "cust3",
      name: "Initech Ltd",
      email: "finance@initech.com",
    },
    issueDate: "2024-09-15",
    expiryDate: "2024-10-15",
    subtotal: 15000,
    discount: 0,
    tax: 2700,
    total: 17700,
    status: "EXPIRED",
    createdAt: "2024-09-15",
    updatedAt: "2024-10-16",
  },
  {
    id: "4",
    quotationNumber: "QTN-2024-004",
    customerId: "cust4",
    customer: { id: "cust4", name: "Umbrella Corp", email: "ap@umbrella.com" },
    issueDate: "2024-10-20",
    expiryDate: "2024-11-20",
    subtotal: 80000,
    discount: 8000,
    tax: 12960,
    total: 84960,
    status: "DRAFT",
    createdAt: "2024-10-20",
    updatedAt: "2024-10-20",
  },
  {
    id: "5",
    quotationNumber: "QTN-2024-005",
    customerId: "cust5",
    customer: {
      id: "cust5",
      name: "Stark Industries",
      email: "pepper@stark.com",
    },
    issueDate: "2024-08-01",
    expiryDate: "2024-09-01",
    subtotal: 60000,
    discount: 0,
    tax: 10800,
    total: 70800,
    status: "REJECTED",
    createdAt: "2024-08-01",
    updatedAt: "2024-08-10",
  },
];

export default function Quotations() {
  const columns = [
    {
      key: "quotationNumber",
      header: "Quotation",
      sortable: true,
      render: (row: Quotation) => (
        <div>
          <p className="font-medium font-mono text-xs">
            #{row.quotationNumber}
          </p>
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
      render: (row: Quotation) => (
        <span className="text-text-secondary text-xs">
          {formatDate(row.issueDate)}
        </span>
      ),
    },
    {
      key: "expiryDate",
      header: "Expiry Date",
      sortable: true,
      className: "hidden lg:table-cell",
      render: (row: Quotation) => (
        <span className="text-text-secondary text-xs">
          {row.expiryDate ? formatDate(row.expiryDate) : "—"}
        </span>
      ),
    },
    {
      key: "total",
      header: "Amount",
      sortable: true,
      className: "text-right",
      render: (row: Quotation) => (
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
      render: (row: Quotation) => <QuotationStatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (_row: Quotation) => (
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
          <h1 className="text-2xl font-bold text-text-primary">Quotations</h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage all your quotations
          </p>
        </div>
        <Link
          to="/quotation/new-quotation"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-brand/25"
        >
          <TbPlus size={18} />
          New Quotation
        </Link>
      </div>

      <Table
        columns={columns}
        data={quotations}
        searchable
        searchPlaceholder="Search quotations by number or customer..."
        onRowClick={(row) => console.log("Clicked:", row.quotationNumber)}
        emptyMessage="No quotations found"
      />
    </div>
  );
}
