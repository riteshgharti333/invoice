import IC from "../../components/DBComponent/IC";
import QC from "../../components/DBComponent/QC";
import Revenue from "../../components/DBComponent/Revenue";
import StatusAndPayments from "../../components/DBComponent/SP";
import { Stat } from "../../components/DBComponent/Stat";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left Column — 2/3 width */}
        <div className="col-span-2 space-y-5">
          <Stat columns={2} /> {/* 4 cards in a 2x2 grid */}
        </div>

        {/* Right Column — 1/3 width */}
        <div className="col-span-1">
          <IC /> {/* Single tall card */}
        </div>
      </div>

      <Revenue />
      <StatusAndPayments />
      <QC />
    </div>
  );
}
