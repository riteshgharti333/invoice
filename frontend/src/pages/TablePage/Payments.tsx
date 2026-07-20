import { formatCurrency, formatDate } from "../../libs/utils";
import { Table } from "../../components/ui/Table";
import { useTableController } from "../../features/hooks/useTableController";
import {
  usePayments,
  useSearchPayments,
  useFilterPayments,
} from "../../features/hooks/usePayments";
import { Button } from "../../components/ui/ButtonProps";
import { PopupBottomRight } from "../../components/layout/PopupBottomRight";
import { NewPaymentForm } from "../../components/layout/NewPaymentForm";
import { useState } from "react";
import { TbCash } from "react-icons/tb";

const filterLabels: Record<string, string> = {
  status: "Status",
  paymentMethod: "Method",
  paymentDateFrom: "From Date",
  paymentDateTo: "To Date",
  amountFrom: "Min Amount",
  amountTo: "Max Amount",
};

export default function Payments() {
  const controller = useTableController({
    normalDataHook: usePayments,
    searchDataHook: useSearchPayments,
    filterDataHook: useFilterPayments,
  });

  const [showPayment, setShowPayment] = useState(false);

  const columns = [
    {
      accessorKey: "paymentNumber",
      header: "Payment",
      sortable: true,
      cell: (info: any) => (
        <div>
          <p className="font-medium font-mono text-xs">#{info.getValue()}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {info.row.original.invoice?.invoiceNumber || "—"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "invoice",
      header: "Customer",
      sortable: true,
      cell: (info: any) => (
        <span className="text-text-secondary text-sm">
          {info.getValue()?.customer?.name || "—"}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      sortable: true,
      cell: (info: any) => (
        <span className="font-semibold font-mono text-sm text-green-600">
          {formatCurrency(Number(info.getValue()))}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Method",
      sortable: true,
      cell: (info: any) => (
        <span className="text-text-secondary text-sm capitalize">
          {info.getValue()?.replace("_", " ").toLowerCase() || "—"}
        </span>
      ),
    },
    {
      accessorKey: "paymentDate",
      header: "Date",
      sortable: true,
      cell: (info: any) => (
        <span className="text-text-secondary text-xs">
          {formatDate(info.getValue())}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      sortable: true,
      cell: (info: any) => {
        const status = info.getValue();
        const statusStyles: Record<string, string> = {
          COMPLETED: "bg-green-100 text-green-700",
          PENDING: "bg-yellow-100 text-yellow-700",
          FAILED: "bg-red-100 text-red-700",
          REFUNDED: "bg-purple-100 text-purple-700",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || "bg-gray-100 text-gray-700"}`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Payments</h1>
          <p className="text-text-secondary text-sm mt-1">
            Track all payment transactions
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={TbCash}
          onClick={() => setShowPayment(true)}
        >
          Record Payment
        </Button>

        <PopupBottomRight
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          title="Record Payment"
          subtitle="Record a new payment for an invoice"
          width="max-w-xl"
        >
          <NewPaymentForm
            onSuccess={() => setShowPayment(false)}
            onCancel={() => setShowPayment(false)}
          />
        </PopupBottomRight>
      </div>

      <Table
        {...controller}
        columns={columns}
        path="payment"
        searchConfig={{
          placeholder: "Search by payment number or customer...",
        }}
        filtersConfig={[
          {
            key: "status",
            label: "Status",
            type: "select",
            options: ["COMPLETED", "PENDING", "FAILED", "REFUNDED"],
          },
          {
            key: "paymentMethod",
            label: "Method",
            type: "select",
            options: ["BANK_TRANSFER", "CASH", "CHEQUE", "UPI"],
          },
          {
            key: "paymentDateFrom",
            label: "From Date",
            type: "date",
          },
          {
            key: "paymentDateTo",
            label: "To Date",
            type: "date",
          },
          {
            key: "amountFrom",
            label: "Min Amount",
            type: "text",
            placeholder: "Min amount",
          },
          {
            key: "amountTo",
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
