import { TbPlus, TbEdit, TbDotsVertical, TbFolder } from "react-icons/tb";
import { Table } from "../../components/ui/Table";
import { formatDate } from "../../libs/utils";
import { Link } from "react-router-dom";
import {
  useCategories,
  useFilterCategories,
  useSearchCategories,
} from "../../features/hooks/useCategories";
import { useTableController } from "../../features/hooks/useTableController";

const filterLabels: Record<string, string> = {
  createdAtFrom: "From Date",
  createdAtTo: "To Date",
};

export default function Categories() {
  const controller = useTableController({
    normalDataHook: useCategories,
    searchDataHook: useSearchCategories,
    filterDataHook: useFilterCategories,
  });

  const columns = [
    {
      accessorKey: "name",
      header: "Category",
      sortable: true,
      cell: (info: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand/10 rounded-lg flex items-center justify-center shrink-0">
            <TbFolder size={18} className="text-brand" />
          </div>
          <div>
            <p className="font-medium text-text-primary text-sm">
              {info.getValue()}
            </p>
            {info.row.original.description && (
              <p className="text-xs text-text-muted mt-0.5 truncate max-w-[300px]">
                {info.row.original.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      sortable: true,
      cell: (info: any) => (
        <span className="text-text-secondary text-xs">
          {info.getValue() || "—"}
        </span>
      ),
    },
    {
      accessorKey: "serviceCount",
      header: "Services",
      sortable: true,
      cell: (info: any) => (
        <span className="text-text-secondary text-sm">
          {info.getValue() || 0}
        </span>
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
          <h1 className="text-2xl font-bold text-text-primary">Categories</h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage service categories
          </p>
        </div>
        <Link
          to="/category/new-category"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-brand/25"
        >
          <TbPlus size={18} />
          Add Category
        </Link>
      </div>

      <Table
        {...controller}
        columns={columns}
        path="category"
        searchConfig={{
          placeholder: "Search categories by name...",
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
