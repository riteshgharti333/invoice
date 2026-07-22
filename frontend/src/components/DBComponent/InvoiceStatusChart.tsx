import { useState } from "react";
import Chart from "react-apexcharts";
import { motion, AnimatePresence } from "framer-motion";
import { MdPieChart } from "react-icons/md";

const donutColors = ["#059669", "#2563EB", "#DC2626", "#94A3B8", "#CBD5E1"];

interface InvoiceStatusProps {
  data?: {
    series: number[];
    labels: string[];
  };
  isLoading?: boolean;
}

export default function InvoiceStatusChart({ data, isLoading }: InvoiceStatusProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-3xl border border-border p-6 animate-pulse h-[420px]" />
    );
  }

  const total = data.series.reduce((a, b) => a + b, 0);

  const donutOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Inter, sans-serif",
      background: "transparent",
      animations: { enabled: true, speed: 600, animateGradually: { enabled: true, delay: 100 } },
    },
    colors: donutColors,
    labels: data.labels.map((l) => l.charAt(0) + l.slice(1).toLowerCase()),
    stroke: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "12px",
              fontWeight: 600,
              color: "#94A3B8",
              formatter: () => total.toString(),
            },
            value: { fontSize: "24px", fontWeight: 800, color: "#0F172A" },
          },
        },
      },
    },
    legend: { show: false },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden bg-white rounded-3xl border border-border p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-60" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-50 rounded-full opacity-60" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
            <MdPieChart size={18} className="text-brand" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Invoice Status</h3>
            <p className="text-xs text-text-muted">{total} total invoices</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-full max-w-[260px] mx-auto">
            <Chart options={donutOptions} series={data.series} type="donut" height={260} />
          </div>

          {/* Legend */}
          <div className="w-full mt-2">
            <div className="grid grid-cols-5 gap-2">
              {data.labels.map((label, index) => {
                const value = data.series[index];
                const percent = total > 0 ? ((value / total) * 100).toFixed(0) : "0";

                return (
                  <motion.button
                    key={label}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                      selectedIndex === index ? "bg-surface-hover" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: donutColors[index] }}
                      />
                      <span className="text-xs font-semibold text-text-primary">
                        {percent}%
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted font-medium text-center leading-tight">
                      {label.charAt(0) + label.slice(1).toLowerCase()}
                    </span>
                    <span className="text-[10px] text-text-muted">{value}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}