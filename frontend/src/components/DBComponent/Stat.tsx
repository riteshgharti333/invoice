import {
  TbCash,
  TbFileInvoice,
  TbAlertCircle,
  TbFileText,
  TbTrendingUp,
  TbTrendingDown,
} from "react-icons/tb";

const statCards = [
  {
    id: 1,
    label: "Total Revenue",
    value: "₹4,50,000",
    subtitle: "+12% from last month",
    icon: TbCash,
    trend: "up",
    gradient: "from-emerald-400 to-teal-500",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
    iconBg: "bg-white/80",
    blobColor: "bg-emerald-200/40",
    accentColor: "bg-emerald-300/60",
  },
  {
    id: 2,
    label: "Outstanding",
    value: "₹1,20,000",
    subtitle: "5 invoices overdue",
    icon: TbAlertCircle,
    trend: "down",
    gradient: "from-rose-400 to-red-500",
    bgLight: "bg-rose-50",
    textColor: "text-rose-700",
    iconBg: "bg-white/80",
    blobColor: "bg-rose-200/40",
    accentColor: "bg-rose-300/60",
  },
  {
    id: 3,
    label: "Total Invoices",
    value: "48",
    subtitle: "12 created this month",
    icon: TbFileInvoice,
    trend: "up",
    gradient: "from-blue-400 to-indigo-500",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    iconBg: "bg-white/80",
    blobColor: "bg-blue-200/40",
    accentColor: "bg-blue-300/60",
  },
  {
    id: 4,
    label: "Total Quotations",
    value: "24",
    subtitle: "5 approved this month",
    icon: TbFileText,
    trend: "up",
    gradient: "from-violet-400 to-purple-500",
    bgLight: "bg-violet-50",
    textColor: "text-violet-700",
    iconBg: "bg-white/80",
    blobColor: "bg-violet-200/40",
    accentColor: "bg-violet-300/60",
  },
];

export function Stat({ columns }: { columns: number }) {
  return (
   <div className={`grid gap-5 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
      {statCards.map((card) => (
        <div
          key={card.id}
          className={`relative overflow-hidden rounded-3xl ${card.bgLight} p-6  shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group`}
        >
          <div
            className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${card.blobColor} group-hover:scale-125 transition-transform duration-500`}
          />
          <div
            className={`absolute -bottom-8 -left-8 w-24 h-24 rounded-full ${card.accentColor} group-hover:scale-110 transition-transform duration-500`}
          />
          <div className="absolute top-4 right-20 flex gap-1.5 opacity-30">
            <div className={`w-1.5 h-1.5 rounded-full ${card.textColor}`} />
            <div className={`w-1.5 h-1.5 rounded-full ${card.textColor}`} />
            <div className={`w-1.5 h-1.5 rounded-full ${card.textColor}`} />
          </div>
          <p
            className={`absolute -bottom-4 -right-2 text-[80px] font-black ${card.textColor} opacity-[0.04] select-none leading-none`}
          >
            {card.id}
          </p>
          <div className="relative z-10">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.iconBg} shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300`}
            >
              <card.icon size={22} className={card.textColor} />
            </div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              {card.label}
            </p>
            <p className="text-[30px] font-black tracking-tighter leading-none bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
              {card.value}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              {card.trend === "up" ? (
                <TbTrendingUp size={15} className="text-emerald-600" />
              ) : (
                <TbTrendingDown size={15} className="text-rose-600" />
              )}
              <span className="text-xs font-medium text-text-muted">
                {card.subtitle}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
