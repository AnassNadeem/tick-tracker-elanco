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
        <p className="lede">
          Tick activity rises and falls across the year. Explore sightings by month for a single city
          or the whole UK, and pick a year to compare seasons. The chart and the table below it show
          the same numbers &mdash; the table is there for anyone who cannot see the chart.
        </p>
      </div>
      <SeasonalChart />
    </div>
  );
}
