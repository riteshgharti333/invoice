import { TbFileInvoice, TbArrowRight } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
  };
  total: number;
  status: string;
}

interface InvoiceDashboardProps {
  invoices?: Invoice[];
}

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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20, y: 10 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

interface InvoiceDashboardProps {
  invoices?: Invoice[];
}

export default function InvoiceDashboard({
  invoices = [],
}: InvoiceDashboardProps) {
  const navigate = useNavigate();

  const displayInvoices = invoices.slice(0, 5);

  return (
    <div className="h-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden bg-white rounded-3xl border border-border p-6 group/card hover:shadow-xl transition-all duration-300 h-full"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-12 -right-12 w-36 h-36 bg-brand/5 rounded-full group-hover/card:scale-125 transition-transform duration-500"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-100/40 rounded-full group-hover/card:scale-110 transition-transform duration-500"
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.3,
                  type: "spring",
                  stiffness: 200,
                }}
                className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center"
              >
                <TbFileInvoice size={18} className="text-brand" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm">
                  Recent Invoices
                </h3>
                <p className="text-xs text-text-muted">Latest 5 invoices</p>
              </div>
            </div>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              whileHover={{ x: 3 }}
              onClick={() => navigate("/invoices")}
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View All <TbArrowRight size={13} />
            </motion.button>
          </div>

          {displayInvoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-text-muted">No recent invoices</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              {displayInvoices.map((inv, index) => (
                <motion.div
                  key={inv.id}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(0,0,0,0.02)",
                    transition: { type: "spring", stiffness: 400, damping: 25 },
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/invoice/${inv.id}`)}
                  className="flex items-center justify-between py-3 rounded-2xl hover:bg-surface-hover transition-colors cursor-pointer group/row"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                        ease: "easeInOut",
                      }}
                      className={`w-2 h-2 rounded-full shrink-0 ${statusDots[inv.status] || "bg-slate-400"} group-hover/row:scale-125 transition-transform`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary font-mono">
                        #{inv.invoiceNumber}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {inv.customer?.name || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="text-sm font-semibold text-text-primary"
                    >
                      ₹{inv.total.toLocaleString("en-IN")}
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${statusColors[inv.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}
                    >
                      {inv.status}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
