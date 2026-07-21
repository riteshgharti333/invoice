import { TbFileInvoice, TbUsers, TbArrowRight } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

const recentInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-0012",
    customer: "John Doe",
    total: 5000,
    status: "PAID",
    date: "Jul 20",
  },
  {
    id: "2",
    invoiceNumber: "INV-0013",
    customer: "Sarah Smith",
    total: 12000,
    status: "SENT",
    date: "Jul 19",
  },
  {
    id: "3",
    invoiceNumber: "INV-0014",
    customer: "Mike Brown",
    total: 8500,
    status: "OVERDUE",
    date: "Jul 18",
  },
  {
    id: "4",
    invoiceNumber: "INV-0015",
    customer: "Lisa Wang",
    total: 3200,
    status: "PAID",
    date: "Jul 17",
  },
];

const statusColors: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SENT: "bg-blue-50 text-blue-700 border-blue-200",
  OVERDUE: "bg-rose-50 text-rose-700 border-rose-200",
  DRAFT: "bg-slate-50 text-slate-600 border-slate-200",
  CANCELLED: "bg-slate-50 text-slate-400 border-slate-200",
};

const statusDots: Record<string, string> = {
  PAID: "bg-emerald-500",
  SENT: "bg-blue-500",
  OVERDUE: "bg-rose-500",
  DRAFT: "bg-slate-400",
  CANCELLED: "bg-slate-300",
};

export default function IC() {
  const navigate = useNavigate();

  return (
    <div className="h-full">
      {/* Recent Invoices */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-border p-6 group/card hover:shadow-xl transition-all duration-300 h-full">
        {/* Decorative Blob */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-brand/5 rounded-full group-hover/card:scale-125 transition-transform duration-500" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-100/40 rounded-full group-hover/card:scale-110 transition-transform duration-500" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
                <TbFileInvoice size={18} className="text-brand" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm">
                  Recent Invoices
                </h3>
                <p className="text-xs text-text-muted">Latest 5 invoices</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/invoices")}
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View All <TbArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-2">
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => navigate(`/invoice/${inv.id}`)}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-hover transition-colors cursor-pointer group/row"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${statusDots[inv.status]} group-hover/row:scale-125 transition-transform`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary font-mono">
                      #{inv.invoiceNumber}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {inv.customer}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-text-primary">
                    ₹{inv.total.toLocaleString("en-IN")}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${statusColors[inv.status]}`}
                  >
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
