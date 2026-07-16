// src/pages/Customers.tsx
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { TbPlus, TbMail, TbPhone } from "react-icons/tb";
import { formatDate } from "../../libs/utils";
import { ActiveBadge } from "../../components/ui/ActiveBadge";
import { useTableController } from "../../features/hooks/useTableController";
import { useCustomers, useFilterCustomers, useSearchCustomers } from "../../features/hooks/useCustomers";
import { Table } from "../../components/ui/Table";

const filterLabels: Record<string, string> = {
  createdAtFrom: "From Date",
  createdAtTo: "To Date",
};

export default function Customers() {
  const controller = useTableController({
    normalDataHook: useCustomers,
    searchDataHook: useSearchCustomers,
    filterDataHook: useFilterCustomers,
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Customer",
        cell: (info: any) => (
          <div>
            <p className="font-medium text-text-primary text-sm">{info.getValue()}</p>
            <p className="text-xs text-text-muted mt-0.5 font-mono">
              {info.row.original.customerCode}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Contact",
        cell: (info: any) => (
          <div className="space-y-0.5">
            {info.row.original.email && (
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <TbMail size={12} />
                <span>{info.row.original.email}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <TbPhone size={12} />
              <span>{info.row.original.phone}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "gstNumber",
        header: "GST",
        cell: (info: any) => (
          <span className="text-text-secondary text-xs font-mono">
            {info.getValue() || "—"}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: (info: any) => <ActiveBadge isActive={info.getValue()} />,
      },
      {
        accessorKey: "createdAt",
        header: "Added On",
        cell: (info: any) => (
          <span className="text-text-secondary text-xs">
            {formatDate(info.getValue())}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customers</h1>
          <p className="text-text-secondary text-sm mt-1">Manage all your customers</p>
        </div>
        <Link
          to="/new-customer"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-brand/25"
        >
          <TbPlus size={18} />
          Add Customer
        </Link>
      </div>

      <Table
        {...controller}
        columns={columns}
        path="customer"
        searchConfig={{
          placeholder: "Search by name, customer code and phone...",
        }}
        filtersConfig={[
          {
            key: "createdAtFrom",
            label: "From Date",
            type: "date",
          },
          {
            key: "createdAtTo",
            label: "To Date",
            type: "date",
          },
        ]}
        filterLabels={filterLabels}
      />
    </div>
  );
}