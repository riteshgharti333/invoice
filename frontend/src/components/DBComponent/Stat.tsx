import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbCash,
  TbFileInvoice,
  TbAlertCircle,
  TbFileText,
  TbTrendingUp,
  TbTrendingDown,
  TbChevronDown,
} from "react-icons/tb";

type Period = "3months" | "6months" | "yearly";

const periodLabels: Record<Period, string> = {
  "3months": "Last 3 Months",
  "6months": "Last 6 Months",
  yearly: "Last Year",
};

interface StatData {
  value: number;
  subtitle: string;
}

interface StatsResponse {
  totalRevenue: Record<Period, StatData>;
  outstanding: Record<Period, StatData>;
  totalInvoices: Record<Period, StatData>;
  totalQuotations: Record<Period, StatData>;
}

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, startCounting: boolean) {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!startCounting) { setCount(0); return; }
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const currentCount = Math.floor(easeOutQuart * end);
      if (countRef.current !== currentCount) { countRef.current = currentCount; setCount(currentCount); }
      if (progress < duration) { animationFrameRef.current = requestAnimationFrame(animate); }
      else { setCount(end); }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [end, duration, startCounting]);

  return count;
}

const cardConfigs = {
  totalRevenue: {
    label: "Total Revenue",
    icon: TbCash,
    gradient: "from-emerald-400 to-teal-500",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
    iconBg: "bg-white/80",
    blobColor: "bg-emerald-200/40",
    accentColor: "bg-emerald-300/60",
    isCurrency: true,
    trend: (subtitle: string) => subtitle.startsWith("+") ? "up" : subtitle.startsWith("-") ? "down" : "neutral",
  },
  outstanding: {
    label: "Outstanding",
    icon: TbAlertCircle,
    gradient: "from-rose-400 to-red-500",
    bgLight: "bg-rose-50",
    textColor: "text-rose-700",
    iconBg: "bg-white/80",
    blobColor: "bg-rose-200/40",
    accentColor: "bg-rose-300/60",
    isCurrency: true,
    trend: () => "down" as const,
  },
  totalInvoices: {
    label: "Total Invoices",
    icon: TbFileInvoice,
    gradient: "from-blue-400 to-indigo-500",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    iconBg: "bg-white/80",
    blobColor: "bg-blue-200/40",
    accentColor: "bg-blue-300/60",
    isCurrency: false,
    trend: () => "up" as const,
  },
  totalQuotations: {
    label: "Total Quotations",
    icon: TbFileText,
    gradient: "from-violet-400 to-purple-500",
    bgLight: "bg-violet-50",
    textColor: "text-violet-700",
    iconBg: "bg-white/80",
    blobColor: "bg-violet-200/40",
    accentColor: "bg-violet-300/60",
    isCurrency: false,
    trend: () => "up" as const,
  },
};

function AnimatedValue({ value, isCurrency, isVisible }: { value: number; isCurrency: boolean; isVisible: boolean }) {
  const count = useCountUp(value, 2000, isVisible);

  const formatValue = (num: number) => {
    if (isCurrency) return `₹${num.toLocaleString("en-IN")}`;
    return num.toString();
  };

  return (
    <p className="text-[30px] font-black tracking-tighter leading-none bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
      {formatValue(count)}
    </p>
  );
}

function StatCard({ cardKey, data, index }: { cardKey: string; data: Record<Period, StatData>; index: number }) {
  const [period, setPeriod] = useState<Period>("yearly");
  const [showDropdown, setShowDropdown] = useState(false);
  const config = cardConfigs[cardKey as keyof typeof cardConfigs];
  const cardData = data[period];
  const trend = typeof config.trend === "function" ? config.trend(cardData.subtitle) : config.trend;

  useEffect(() => {
    const handleClickOutside = () => { if (showDropdown) setShowDropdown(false); };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showDropdown]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-3xl ${config.bgLight} p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group`}
    >
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${config.blobColor} group-hover:scale-125 transition-transform duration-500`} />
      <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 2 }}
        className={`absolute -bottom-8 -left-8 w-24 h-24 rounded-full ${config.accentColor} group-hover:scale-110 transition-transform duration-500`} />

      <div className="absolute top-4 right-4 z-20">
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl text-xs font-medium text-gray-600 hover:bg-white hover:shadow-sm transition-all duration-200">
          <span className="max-w-[80px] truncate">{periodLabels[period]}</span>
          <motion.div animate={{ rotate: showDropdown ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <TbChevronDown size={12} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-2 w-44 bg-white border border-border rounded-xl shadow-xl z-30 overflow-hidden">
              {(Object.keys(periodLabels) as Period[]).map((key) => (
                <button key={key} onClick={() => { setPeriod(key); setShowDropdown(false); }}
                  className={`w-full px-4 py-2.5 text-sm text-left hover:bg-surface-hover transition-colors flex items-center justify-between ${period === key ? "text-brand font-semibold bg-brand/5" : "text-text-secondary"}`}>
                  {periodLabels[key]}
                  {period === key && <motion.div layoutId={`activeDot-${cardKey}`} className="w-2 h-2 bg-brand rounded-full" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className={`absolute -bottom-4 -right-2 text-[80px] font-black ${config.textColor} opacity-[0.04] select-none leading-none`}>{index + 1}</p>

      <div className="relative z-10">
        <motion.div whileHover={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.3 }}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center ${config.iconBg} shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <config.icon size={22} className={config.textColor} />
        </motion.div>

        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">{config.label}</p>

        <motion.div key={period} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <AnimatedValue value={cardData.value} isCurrency={config.isCurrency} isVisible={true} />
        </motion.div>

        <div className="flex items-center gap-1.5 mt-2">
          {trend === "up" ? <TbTrendingUp size={15} className="text-emerald-600" /> : trend === "down" ? <TbTrendingDown size={15} className="text-rose-600" /> : null}
          <span className="text-xs font-medium text-text-muted">{cardData.subtitle}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function Stat({ columns, data }: { columns: number; data?: StatsResponse; isLoading?: boolean }) {
  if (!data) {
    return (
      <div className={`grid gap-5 ${columns === 2 ? "grid-cols-2" : "grid-cols-4"}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-3xl border border-border p-6 animate-pulse h-[200px]" />
        ))}
      </div>
    );
  }

  const statsData = {
    totalRevenue: data.totalRevenue,
    outstanding: data.outstanding,
    totalInvoices: data.totalInvoices,
    totalQuotations: data.totalQuotations,
  };

  const cardKeys = Object.keys(statsData);

  return (
    <div className={`grid gap-5 ${columns === 2 ? "grid-cols-2" : "grid-cols-4"}`}>
      {cardKeys.map((key, index) => (
        <StatCard key={key} cardKey={key} data={statsData[key as keyof typeof statsData]} index={index} />
      ))}
    </div>
  );
}