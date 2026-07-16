import { TbPlus } from "react-icons/tb";
import { Table } from "../../components/ui/Table";
import { formatCurrency, formatDate } from "../../libs/utils";
import { Link } from "react-router-dom";
import { useTableController } from "../../features/hooks/useTableController";
import {
  useFilterServices,
  useSearchServices,
  useServices,
} from "../../features/hooks/useServices";
import { useCategories } from "../../features/hooks/useCategories";

const filterLabels: Record<string, string> = {
  categoryName: "Category",
  createdAtFrom: "From Date",
  createdAtTo: "To Date",
};

export default function Services() {
  const { data: categoriesData } = useCategories({ cursor: undefined });
  const categories = categoriesData?.data || [];

  const controller = useTableController({
    normalDataHook: useServices,
    searchDataHook: useSearchServices,
    filterDataHook: useFilterServices,
  });

  const columns = [
    {
      accessorKey: "name",
      header: "Service",
      sortable: true,
      cell: (info: any) => (
        <div>
          <p className="font-medium text-text-primary text-sm">
            {info.getValue()}
          </p>
          {info.row.original.description && (
            <p className="text-xs text-text-muted mt-0.5 truncate max-w-[250px]">
              {info.row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "serviceCode",
      header: "Code",
      sortable: true,
      cell: (info: any) => (
        <span className="text-text-secondary text-xs font-mono">
          {info.getValue() || "—"}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      sortable: true,
      cell: (info: any) => (
        <span className="font-mono text-sm text-text-primary font-medium">
          {formatCurrency(Number(info.getValue()))}
        </span>
      ),
    },
    {
      accessorKey: "taxRate",
      header: "Tax",
      sortable: true,
      cell: (info: any) => (
        <span className="text-text-secondary text-sm">{info.getValue()}%</span>
      ),
    },
    {
      accessorKey: "unit",
      header: "Unit",
      sortable: true,
      cell: (info: any) => (
        <span className="text-text-secondary text-sm">{info.getValue()}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Added On",
      sortable: true,
      cell: (info: any) => (
        <span className="text-text-secondary text-xs">
          {formatDate(info.getValue())}
        </span>
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
        {...controller}
        columns={columns}
        path="service"
        searchConfig={{
          placeholder: "Search by name or service code...",
        }}
        filtersConfig={[
          {
            key: "categoryName",
            label: "Category",
            type: "select",
            options: categories.map((cat: any) => cat.name),
          },
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