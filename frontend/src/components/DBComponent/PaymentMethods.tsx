import { motion } from "framer-motion";
import {
  TbCash,
  TbSend,
  TbBuildingBank,
  TbCreditCard,
  TbDots,
  TbWallet,
} from "react-icons/tb";

const iconMap: Record<string, any> = {
  "UPI Payments": TbSend,
  "Bank Transfer": TbBuildingBank,
  "Credit Card": TbCreditCard,
  "Debit Card": TbCreditCard,
  Cash: TbCash,
  Other: TbDots,
  PAYPAL: TbWallet,
};

const colorMap: Record<string, any> = {
  "UPI Payments": { color: "text-violet-600", bg: "bg-violet-50", dot: "bg-violet-500" },
  "Bank Transfer": { color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-500" },
  "Credit Card": { color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  "Debit Card": { color: "text-cyan-600", bg: "bg-cyan-50", dot: "bg-cyan-500" },
  Cash: { color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
  Other: { color: "text-gray-600", bg: "bg-gray-50", dot: "bg-gray-500" },
  PAYPAL: { color: "text-indigo-600", bg: "bg-indigo-50", dot: "bg-indigo-500" },
};

interface PaymentMethod {
  id: number;
  label: string;
  value: number;
  count: number;
}

interface PaymentMethodsProps {
  data?: PaymentMethod[];
  isLoading?: boolean;
}

export default function PaymentMethods({ data, isLoading }: PaymentMethodsProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-3xl border border-border p-6 animate-pulse h-[420px]" />
    );
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    return `₹${value.toLocaleString("en-IN")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="relative overflow-hidden bg-white rounded-3xl border border-border p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full opacity-60" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-violet-50 rounded-full opacity-60" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
              <TbWallet size={18} className="text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Payment Methods</h3>
              <p className="text-xs text-text-muted">{data.length} methods used</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {data.map((item, index) => {
            const Icon = iconMap[item.label] || TbDots;
            const colors = colorMap[item.label] || colorMap["Other"];
            const percent = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : "0";

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ x: 4 }}
                className="flex  items-center justify-between p-4 rounded-2xl hover:bg-surface-hover transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`}
                  >
                    <Icon size={18} className={colors.color} />
                  </motion.div>
                  <div>
                    <span className="text-sm font-medium text-text-primary block">{item.label}</span>
                    <span className="text-[11px] text-text-muted">{item.count} transactions • {percent}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    className={`w-2 h-2 rounded-full ${colors.dot}`}
                  />
                  <span className="text-sm font-bold text-text-primary">{formatCurrency(item.value)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}