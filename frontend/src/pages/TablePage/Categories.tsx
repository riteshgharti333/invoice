import { TbPlus, TbEdit, TbDotsVertical, TbFolder } from "react-icons/tb";
import { Table } from "../../components/ui/Table";
import type { Category } from "../../types";
import { formatDate } from "../../libs/utils";
import { Link } from "react-router-dom";

const categories: Category[] = [
  {
    id: "1",
    name: "Web Development",
    description: "All web development related services",
    createdAt: "2024-01-10",
    updatedAt: "2024-10-15",
  },
  {
    id: "2",
    name: "Design",
    description: "UI/UX and graphic design services",
    createdAt: "2024-02-15",
    updatedAt: "2024-10-18",
  },
  {
    id: "3",
    name: "Marketing",
    description: "Digital marketing and SEO services",
    createdAt: "2024-03-20",
    updatedAt: "2024-10-20",
  },
  {
    id: "4",
    name: "Content",
    description: null,
    createdAt: "2024-05-01",
    updatedAt: "2024-10-22",
  },
  {
    id: "5",
    name: "Maintenance",
    description: "Server and website maintenance",
    createdAt: "2024-06-10",
    updatedAt: "2024-10-25",
  },
];

export default function Categories() {
  const columns = [
    {
      key: "name",
      header: "Category",
      sortable: true,
      render: (row: Category) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand/10 rounded-lg flex items-center justify-center shrink-0">
            <TbFolder size={18} className="text-brand" />
          </div>
          <div>
            <p className="font-medium text-text-primary text-sm">{row.name}</p>
            {row.description && (
              <p className="text-xs text-text-muted mt-0.5 truncate max-w-[300px]">
                {row.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      className: "hidden md:table-cell",
      render: (row: Category) => (
        <span className="text-text-secondary text-xs">
          {row.description || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Added On",
      sortable: true,
      className: "hidden lg:table-cell",
      render: (row: Category) => (
        <span className="text-text-secondary text-xs">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      sortable: true,
      className: "hidden lg:table-cell",
      render: (row: Category) => (
        <span className="text-text-secondary text-xs">
          {formatDate(row.updatedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (_row: Category) => (
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
        columns={columns}
        data={categories}
        searchable
        searchPlaceholder="Search categories by name..."
        onRowClick={(row) => console.log("Clicked:", row.name)}
        emptyMessage="No categories found"
      />
    </div>
  );
}
