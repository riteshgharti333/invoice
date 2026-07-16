import { TbPlus, TbEye, TbDownload } from "react-icons/tb";
import { formatCurrency, formatDate } from "../../libs/utils";
import { QuotationStatusBadge } from "../../components/ui/QuotationStatusBadge";
import { Table } from "../../components/ui/Table";
import { Link } from "react-router-dom";
import { useTableController } from "../../features/hooks/useTableController";
import { useQuotations, useSearchQuotations, useFilterQuotations } from "../../features/hooks/useQuotations";

const filterLabels: Record<string, string> = {
  status: "Status",
  issueDateFrom: "From Date",
  issueDateTo: "To Date",
  totalFrom: "Min Amount",
  totalTo: "Max Amount",
};

export default function Quotations() {
  const controller = useTableController({
    normalDataHook: useQuotations,
    searchDataHook: useSearchQuotations,
    filterDataHook: useFilterQuotations,
  });

  const columns = [
    {
      accessorKey: "quotationNumber",
      header: "Quotation",
      sortable: true,
      cell: (info: any) => (
        <div>
          <p className="font-medium font-mono text-xs">#{info.getValue()}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {info.row.original.customer?.name || "Unknown"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      sortable: true,
      cell: (info: any) => (
        <span className="text-text-secondary text-xs">
          {formatDate(info.getValue())}
        </span>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
      sortable: true,
      cell: (info: any) => (
        <span className="text-text-secondary text-xs">
          {info.getValue() ? formatDate(info.getValue()) : "—"}
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: "Amount",
      sortable: true,
      cell: (info: any) => (
        <span className="font-semibold font-mono text-sm">
          {formatCurrency(Number(info.getValue()))}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      sortable: true,
      cell: (info: any) => <QuotationStatusBadge status={info.getValue()} />,
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
        {...controller}
        columns={columns}
        path="quotation"
        searchConfig={{
          placeholder: "Search by quotation number or customer...",
        }}
        filtersConfig={[
          {
            key: "status",
            label: "Status",
            type: "select",
            options: ["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"],
          },
          {
            key: "issueDateFrom",
            label: "From Date",
            type: "date",
          },
          {
            key: "issueDateTo",
            label: "To Date",
            type: "date",
          },
          {
            key: "totalFrom",
            label: "Min Amount",
            type: "text",
            placeholder: "Min amount",
          },
          {
            key: "totalTo",
            label: "Max Amount",
            type: "text",
            placeholder: "Max amount",
          },
        ]}
        filterLabels={filterLabels}
      />
    </div>
  );
}