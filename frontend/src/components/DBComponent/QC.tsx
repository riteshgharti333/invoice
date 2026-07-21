import { TbFileText, TbUsers, TbArrowRight } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

const recentQuotations = [
  { id: "1", quotationNumber: "QUO-0012", customer: "John Doe", total: 45000, status: "APPROVED", date: "Jul 20" },
  { id: "2", quotationNumber: "QUO-0013", customer: "Sarah Smith", total: 28000, status: "SENT", date: "Jul 19" },
  { id: "3", quotationNumber: "QUO-0014", customer: "Mike Brown", total: 62000, status: "DRAFT", date: "Jul 18" },
  { id: "4", quotationNumber: "QUO-0015", customer: "Lisa Wang", total: 15000, status: "APPROVED", date: "Jul 17" },
  { id: "5", quotationNumber: "QUO-0016", customer: "Tom Davis", total: 35000, status: "EXPIRED", date: "Jul 16" },
];

const recentCustomers = [
  { id: "1", name: "John Doe", email: "john@example.com", phone: "+91 98765 43210", invoices: 12 },
  { id: "2", name: "Sarah Smith", email: "sarah@example.com", phone: "+91 87654 32109", invoices: 8 },
  { id: "3", name: "Mike Brown", email: "mike@example.com", phone: "+91 76543 21098", invoices: 5 },
  { id: "4", name: "Lisa Wang", email: "lisa@example.com", phone: "+91 65432 10987", invoices: 15 },
  { id: "5", name: "Tom Davis", email: "tom@example.com", phone: "+91 54321 09876", invoices: 3 },
];

const statusColors: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SENT: "bg-blue-50 text-blue-700 border-blue-200",
  DRAFT: "bg-slate-50 text-slate-600 border-slate-200",
  EXPIRED: "bg-amber-50 text-amber-700 border-amber-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusDots: Record<string, string> = {
  APPROVED: "bg-emerald-500",
  SENT: "bg-blue-500",
  DRAFT: "bg-slate-400",
  EXPIRED: "bg-amber-500",
  REJECTED: "bg-rose-500",
};

export default function QC() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Recent Quotations */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-border p-6 group/card hover:shadow-xl transition-all duration-300">
        {/* Decorative Blob */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-100/30 rounded-full group-hover/card:scale-125 transition-transform duration-500" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-orange-100/40 rounded-full group-hover/card:scale-110 transition-transform duration-500" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <TbFileText size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm">Recent Quotations</h3>
                <p className="text-xs text-text-muted">Latest 5 quotations</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/quotations")}
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View All <TbArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-2">
            {recentQuotations.map((quo) => (
              <div
                key={quo.id}
                onClick={() => navigate(`/quotation/${quo.id}`)}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-hover transition-colors cursor-pointer group/row"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${statusDots[quo.status]} group-hover/row:scale-125 transition-transform`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary font-mono">
                      #{quo.quotationNumber}
                    </p>
                    <p className="text-xs text-text-muted truncate">{quo.customer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-text-primary">
                    ₹{quo.total.toLocaleString("en-IN")}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${statusColors[quo.status]}`}
                  >
                    {quo.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-border p-6 group/card hover:shadow-xl transition-all duration-300">
        {/* Decorative Blob */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-100/40 rounded-full group-hover/card:scale-125 transition-transform duration-500" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-purple-100/30 rounded-full group-hover/card:scale-110 transition-transform duration-500" />
       
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                <TbUsers size={18} className="text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm">Recent Customers</h3>
                <p className="text-xs text-text-muted">Latest 5 customers</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/customers")}
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View All <TbArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-2">
            {recentCustomers.map((cust) => (
              <div
                key={cust.id}
                onClick={() => navigate(`/customer/${cust.id}`)}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-hover transition-colors cursor-pointer group/row"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0 group-hover/row:scale-110 transition-transform">
                    {cust.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{cust.name}</p>
                    <p className="text-xs text-text-muted truncate">{cust.email}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-text-primary">{cust.invoices}</p>
                  <p className="text-[10px] text-text-muted">invoices</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}