import SeasonalChart from "@/components/education/SeasonalChart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seasonal activity",
};

export default function ActivityPage() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="eyebrow-badge">Trends</span>
        <h1>Seasonal activity</h1>
        <p className="lede">Monthly sightings by city and year.</p>
      </div>
      <SeasonalChart />
    </div>
  );
}
