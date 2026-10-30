import SeasonalChart from "@/components/education/SeasonalChart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seasonal activity",
};

export default function ActivityPage() {
  return (
    <div className="page">
      <h1>Seasonal activity</h1>
      <p className="lede">
        Counts by month for one city, or for the whole dataset. The bars are the same numbers as the
        table underneath, which is there for anyone who cannot see the chart.
      </p>
      <SeasonalChart />
    </div>
  );
}
