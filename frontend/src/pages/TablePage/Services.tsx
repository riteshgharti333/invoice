import { TbPlus, TbEdit, TbDotsVertical } from "react-icons/tb";
import { Table } from "../../components/ui/Table";
import type { Service } from "../../types";
import { ServiceStatusBadge } from "../../components/ui/ServiceStatusBadge";
import { formatCurrency, formatDate } from "../../libs/utils";
import { Link } from "react-router-dom";

const services: Service[] = [
  {
    id: "1",
    name: "Web Development",
    description: "Full-stack web application development",
    hsnCode: "998313",
    unitPrice: 50000,
    taxRate: 18,
    isActive: true,
    createdAt: "2024-01-10",
    updatedAt: "2024-10-15",
  },
  {
    id: "2",
    name: "UI/UX Design",
    description: "User interface and experience design",
    hsnCode: "998314",
    unitPrice: 35000,
    taxRate: 18,
    isActive: true,
    createdAt: "2024-02-20",
    updatedAt: "2024-10-18",
  },
  {
    id: "3",
    name: "SEO Optimization",
    description: "Search engine optimization service",
    hsnCode: "998315",
    unitPrice: 15000,
    taxRate: 18,
    isActive: false,
    createdAt: "2024-03-15",
    updatedAt: "2024-09-10",
  },
  {
    id: "4",
    name: "Content Writing",
    description: "Professional content writing services",
    hsnCode: null,
    unitPrice: 8000,
    taxRate: 12,
    isActive: true,
    createdAt: "2024-05-01",
    updatedAt: "2024-10-20",
  },
  {
    id: "5",
    name: "Server Maintenance",
    description: null,
    hsnCode: "998316",
    unitPrice: 25000,
    taxRate: 18,
    isActive: true,
    createdAt: "2024-06-10",
    updatedAt: "2024-10-22",
  },
];

export default function Services() {
  const columns = [
    {
      key: "name",
      header: "Service",
      sortable: true,
      render: (row: Service) => (
        <div>
          <p className="font-medium text-text-primary text-sm">{row.name}</p>
          {row.description && (
            <p className="text-xs text-text-muted mt-0.5 truncate max-w-[250px]">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "hsnCode",
      header: "HSN Code",
      sortable: true,
      className: "hidden md:table-cell",
      render: (row: Service) => (
        <span className="text-text-secondary text-xs font-mono">
          {row.hsnCode || "—"}
        </span>
      ),
    },
    {
      key: "unitPrice",
      header: "Unit Price",
      sortable: true,
      className: "text-right hidden sm:table-cell",
      render: (row: Service) => (
        <span className="font-mono text-sm text-text-primary font-medium">
          {formatCurrency(row.unitPrice)}
        </span>
      ),
    },
    {
      key: "taxRate",
      header: "Tax Rate",
      sortable: true,
      className: "text-center hidden lg:table-cell",
      render: (row: Service) => (
        <span className="text-text-secondary text-sm">{row.taxRate}%</span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      className: "hidden sm:table-cell",
      render: (row: Service) => <ServiceStatusBadge isActive={row.isActive} />,
    },
    {
      key: "createdAt",
      header: "Added On",
      sortable: true,
      className: "hidden lg:table-cell",
      render: (row: Service) => (
        <span className="text-text-secondary text-xs">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (_row: Service) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors">
            <TbEdit size={16} className="text-text-secondary" />
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
          <h1 className="text-2xl font-bold text-text-primary">Services</h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage your services and pricing
          </p>
        </div>
        <Link
          to="new-service"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-brand/25"
        >
          <TbPlus size={18} />
          Add Service
        </Link>
      </div>

      <Table
        columns={columns}
        data={services}
        searchable
        searchPlaceholder="Search services by name or HSN code..."
        onRowClick={(row) => console.log("Clicked:", row.name)}
        emptyMessage="No services found"
      />
    </div>
  );
}
