import Chart from "react-apexcharts";

const monthlyData = [
  { month: "Jan", revenue: 65000 },
  { month: "Feb", revenue: 78000 },
  { month: "Mar", revenue: 55000 },
  { month: "Apr", revenue: 92000 },
  { month: "May", revenue: 85000 },
  { month: "Jun", revenue: 75000 },
  { month: "Jul", revenue: 68000 },
  { month: "Aug", revenue: 88000 },
  { month: "Sep", revenue: 72000 },
  { month: "Oct", revenue: 95000 },
  { month: "Nov", revenue: 82000 },
  { month: "Dec", revenue: 70000 },
];

export default function Revenue() {
  const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      sparkline: { enabled: false },
      fontFamily: "Inter, sans-serif",
      background: "transparent",
      animations: {
        enabled: true,
        speed: 600,
        animateGradually: { enabled: true, delay: 80 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 12,
        borderRadiusApplication: "end",
        columnWidth: "50%",
        colors: {
          backgroundBarColors: [],
        },
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
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.85,
        stops: [0, 100],
      },
    },
    stroke: {
      show: true,
      width: 0,
      colors: ["transparent"],
    },
    grid: {
      show: true,
      borderColor: "#F1F5F9",
      strokeDashArray: 0,
      position: "back",
      xaxis: {
        lines: { show: false },
      },
      yaxis: {
        lines: { show: true },
      },
      padding: {
        top: 8,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    xaxis: {
      categories: monthlyData.map((d) => d.month),
      labels: {
        show: true,
        style: {
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: "Inter, sans-serif",
          colors: "#94A3B8",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: true,
      labels: {
        show: true,
        style: {
          fontSize: "11px",
          fontWeight: 500,
          fontFamily: "Inter, sans-serif",
          colors: "#94A3B8",
        },
        formatter: (value) => {
          if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
          return `₹${(value / 1000).toFixed(0)}K`;
        },
      },
    },
    tooltip: {
      enabled: true,
      followCursor: true,
      intersect: false,
      shared: false,
      custom: ({ dataPointIndex, w }) => {
        const value = w.globals.series[0][dataPointIndex];
        const month = w.globals.labels[dataPointIndex];
        return `
          <div style="
            border-radius: 14px;
            padding: 12px 16px;
            font-family: Inter, sans-serif;
          ">
            <p style="font-size: 11px; font-weight: 500; color: #94A3B8; margin: 0 0 4px 0;">${month} 2026</p>
            <p style="font-size: 18px; font-weight: 700; color: black; margin: 0;">
              ₹${value.toLocaleString("en-IN")}
            </p>
          </div>
        `;
      },
    },
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
      active: {
        filter: {
          type: "none",
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
  };

  const chartSeries = [
    {
      name: "Revenue",
      data: monthlyData.map((d) => d.revenue),
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-border p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-bold text-text-primary">
            Monthly Revenue
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Revenue overview for 2026
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-brand tracking-tight">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-text-muted text-right">yearly total</p>
        </div>
      </div>

      <div className="-mx-3">
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height={310}
        />
      </div>
    </div>
  );
}
