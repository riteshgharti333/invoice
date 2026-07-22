import Chart from "react-apexcharts";
import { motion } from "framer-motion";
import { TbChartBar, TbArrowUpRight, TbArrowDownRight, TbMinus } from "react-icons/tb";

interface MonthlyData {
  month: string;
  revenue: number;
}

interface RevenueProps {
  data?: {
    total: number;
    subtitle: string;
    months: MonthlyData[];
  };
  isLoading?: boolean;
}

export default function Revenue({ data, isLoading }: RevenueProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-3xl border border-border p-6 animate-pulse h-[400px]" />
    );
  }

  const { total, subtitle, months } = data;

  const isPositive = subtitle.startsWith("+");
  const isNegative = subtitle.startsWith("-");
  const TrendIcon = isPositive ? TbArrowUpRight : isNegative ? TbArrowDownRight : TbMinus;
  const trendColor = isPositive ? "text-emerald-600" : isNegative ? "text-rose-600" : "text-text-muted";

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
      background: "transparent",
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: { enabled: true, delay: 100 },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        borderRadiusApplication: "end",
        columnWidth: "55%",
      },
    },
    colors: ["#2563EB"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0,
        gradientToColors: ["#3B82F6"],
        opacityFrom: 1,
        opacityTo: 0.7,
        stops: [0, 100],
      },
    },
    grid: {
      borderColor: "#F1F5F9",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories: months.map((d) => d.month),
      labels: { style: { fontSize: "12px", fontWeight: 500, colors: "#94A3B8" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "11px", fontWeight: 500, colors: "#94A3B8" },
        formatter: (value: number) => {
          if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
          return `₹${(value / 1000).toFixed(0)}K`;
        },
      },
    },
    tooltip: {
      custom: ({ dataPointIndex, w }) => {
        const value = w.globals.series[0][dataPointIndex];
        const month = w.globals.labels[dataPointIndex];
        return `
          <div style="background: white; border: 1px solid #E2E8F0; border-radius: 14px; padding: 12px 16px; box-shadow: 0 16px 40px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <div style="width: 8px; height: 8px; border-radius: 4px; background: #2563EB;"></div>
              <p style="font-size: 11px; font-weight: 600; color: #94A3B8; text-transform: uppercase; margin: 0;">${month}</p>
            </div>
            <p style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">₹${value.toLocaleString("en-IN")}</p>
          </div>
        `;
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
  };

  const chartSeries = [{ name: "Revenue", data: months.map((d) => d.revenue) }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden bg-white rounded-3xl border border-border p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-60" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-indigo-50 rounded-full opacity-60" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <TbChartBar size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Monthly Revenue</h3>
              <p className="text-xs text-text-muted">Revenue overview for 2026</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-text-primary tracking-tight">
              ₹{total.toLocaleString("en-IN")}
            </p>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <TrendIcon size={12} className={trendColor} />
              <p className={`text-[11px] font-medium ${trendColor}`}>{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="-mx-2">
          <Chart options={chartOptions} series={chartSeries} type="bar" height={280} />
        </div>
      </div>
    </motion.div>
  );
}