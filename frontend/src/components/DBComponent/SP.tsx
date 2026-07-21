import Chart from "react-apexcharts";
import { MdPieChart } from "react-icons/md";
import { TbCash, TbClock, TbTrendingUp, TbCheck } from "react-icons/tb";

const donutData = {
  series: [30, 8, 5, 3, 2],
  labels: ["Paid", "Sent", "Overdue", "Draft", "Cancelled"],
};

const paymentStats = [
  { id: 1, label: "Total Received", value: "₹3,30,000", icon: TbCash, color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  { id: 2, label: "Pending", value: "₹1,20,000", icon: TbClock, color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
  { id: 3, label: "Success Rate", value: "73%", icon: TbCheck, color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-500" },
  { id: 4, label: "This Month", value: "₹85,000", icon: TbTrendingUp, color: "text-violet-600", bg: "bg-violet-50", dot: "bg-violet-500" },
];

const donutColors = ["#059669", "#2563EB", "#DC2626", "#94A3B8", "#CBD5E1"];

export default function StatusAndPayments() {
  const donutOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Inter, sans-serif",
      background: "transparent",
      animations: { enabled: true, speed: 800, animateGradually: { enabled: true, delay: 100 } },
    },
    colors: donutColors,
    labels: donutData.labels,
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "13px",
              fontWeight: 600,
              color: "#94A3B8",
              formatter: () => "48",
            },
            value: { fontSize: "28px", fontWeight: 800, color: "#0F172A" },
          },
        },
      },
    },
    legend: {
      show: true,
      position: "bottom",
      fontSize: "12px",
      fontWeight: 500,
      labels: { colors: "#64748B" },
      markers: { size: 8, strokeWidth: 0 },
      itemMargin: { horizontal: 16, vertical: 4 },
    },
    tooltip: {
      custom: ({ series, seriesIndex, w }) => {
        const value = series[seriesIndex];
        const label = w.globals.labels[seriesIndex];
        const total = series.reduce((a: number, b: number) => a + b, 0);
        const percent = ((value / total) * 100).toFixed(1);
        return `
          <div style="background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 14px 18px; box-shadow: 0 20px 50px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${donutColors[seriesIndex]};"></div>
              <p style="font-size: 11px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">${label}</p>
            </div>
            <p style="font-size: 20px; font-weight: 700; color: #0F172A; margin: 0;">${value} <span style="font-size: 12px; color: #94A3B8;">(${percent}%)</span></p>
          </div>
        `;
      },
    },
    dataLabels: { enabled: false },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Invoice Status Donut */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-border p-6 group/card hover:shadow-xl transition-all duration-300">
        {/* Blobs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full group-hover/card:scale-125 transition-transform duration-500" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-50 rounded-full group-hover/card:scale-110 transition-transform duration-500" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
              <MdPieChart size={18} className="text-brand" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Invoice Status</h3>
              <p className="text-xs text-text-muted">Breakdown of all invoices</p>
            </div>
          </div>

          <div className="-mx-2">
            <Chart options={donutOptions} series={donutData.series} type="donut" height={300} />
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-border p-6 group/card hover:shadow-xl transition-all duration-300">
        {/* Blobs */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-50 rounded-full group-hover/card:scale-125 transition-transform duration-500" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-violet-50 rounded-full group-hover/card:scale-110 transition-transform duration-500" />
        <div className="absolute top-10 right-16 flex gap-1.5 opacity-25">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TbCash size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Payment Summary</h3>
              <p className="text-xs text-text-muted">Key payment metrics</p>
            </div>
          </div>

          <div className="space-y-3">
            {paymentStats.map((stat) => (
              <div
                key={stat.id}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface-hover transition-colors cursor-pointer group/row"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <stat.icon size={18} className={stat.color} />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{stat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stat.dot} group-hover/row:scale-125 transition-transform`} />
                  <span className="text-lg font-bold text-text-primary">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}