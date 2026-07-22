import { TbFileText, TbUsers, TbArrowRight } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Quotation {
  id: string;
  quotationNumber: string;
  customer?: { name: string } | string;
  total: number;
  status: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string | null;
  invoices?: number;
}

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20, y: 10 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

interface QuotationCustomerProps {
  quotations?: Quotation[];
  customers?: Customer[];
}

export default function QuotationCustomer({
  quotations = [],
  customers = [],
}: QuotationCustomerProps) {
  const navigate = useNavigate();

  const displayQuotations = quotations.slice(0, 5);
  const displayCustomers = customers.slice(0, 5);

  const getCustomerName = (customer: Quotation["customer"]) => {
    if (!customer) return "Unknown";
    if (typeof customer === "string") return customer;
    return customer.name || "Unknown";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Recent Quotations */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden bg-white rounded-3xl border border-border p-6 group/card hover:shadow-xl transition-all duration-300"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-12 -right-12 w-36 h-36 bg-amber-100/30 rounded-full group-hover/card:scale-125 transition-transform duration-500"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-8 -left-8 w-24 h-24 bg-orange-100/40 rounded-full group-hover/card:scale-110 transition-transform duration-500"
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
                className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center"
              >
                <TbFileText size={18} className="text-amber-600" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm">
                  Recent Quotations
                </h3>
                <p className="text-xs text-text-muted">Latest 5 quotations</p>
              </div>
            </div>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              whileHover={{ x: 3 }}
              onClick={() => navigate("/quotations")}
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View All <TbArrowRight size={13} />
            </motion.button>
          </div>

          {displayQuotations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-text-muted">No recent quotations</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              {displayQuotations.map((quo, index) => (
                <motion.div
                  key={quo.id}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(0,0,0,0.02)",
                    transition: { type: "spring", stiffness: 400, damping: 25 },
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/quotation/${quo.id}`)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-hover transition-colors cursor-pointer group/row"
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
                      className={`w-2 h-2 rounded-full shrink-0 ${statusDots[quo.status] || "bg-slate-400"} group-hover/row:scale-125 transition-transform`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary font-mono">
                        #{quo.quotationNumber}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {getCustomerName(quo.customer)}
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
                      ₹{quo.total.toLocaleString("en-IN")}
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${statusColors[quo.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}
                    >
                      {quo.status}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Recent Customers */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="relative overflow-hidden bg-white rounded-3xl border border-border p-6 group/card hover:shadow-xl transition-all duration-300"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute -top-10 -right-10 w-32 h-32 bg-violet-100/40 rounded-full group-hover/card:scale-125 transition-transform duration-500"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 27, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-10 -left-10 w-28 h-28 bg-purple-100/30 rounded-full group-hover/card:scale-110 transition-transform duration-500"
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.45,
                  type: "spring",
                  stiffness: 200,
                }}
                className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center"
              >
                <TbUsers size={18} className="text-violet-600" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm">
                  Recent Customers
                </h3>
                <p className="text-xs text-text-muted">Latest 5 customers</p>
              </div>
            </div>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              whileHover={{ x: 3 }}
              onClick={() => navigate("/customers")}
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View All <TbArrowRight size={13} />
            </motion.button>
          </div>

          {displayCustomers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-text-muted">No recent customers</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              {displayCustomers.map((cust, index) => (
                <motion.div
                  key={cust.id}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(0,0,0,0.02)",
                    transition: { type: "spring", stiffness: 400, damping: 25 },
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/customer/${cust.id}`)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-hover transition-colors cursor-pointer group/row"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0 group-hover/row:scale-110 transition-transform"
                    >
                      {cust.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </motion.div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary">
                        {cust.name}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {cust.email || ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="text-sm font-semibold text-text-primary"
                    >
                      {cust.invoices || 0}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.55 + index * 0.1 }}
                      className="text-[10px] text-text-muted"
                    >
                      invoices
                    </motion.p>
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
