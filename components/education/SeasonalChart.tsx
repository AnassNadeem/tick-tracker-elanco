"use client";

import { CITIES } from "@/lib/cities";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const YEARS = Array.from({ length: 2026 - 2012 + 1 }, (_, index) => String(2012 + index));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type TrendResponse = {
  data: { periodStart: string; count: number }[];
};

export default function SeasonalChart() {
  const [city, setCity] = useState("London");
  const [year, setYear] = useState("2024");

  const query = useQuery({
    queryKey: ["trends", city, year],
    queryFn: async () => {
      const params = new URLSearchParams({
        interval: "month",
        from: `${year}-01-01`,
        to: `${year}-12-31`,
      });
      if (city !== "all") params.set("region", city);
      const response = await fetch(`/api/stats/trends?${params.toString()}`);
      if (!response.ok) throw new Error("Could not load the chart");
      return (await response.json()) as TrendResponse;
    },
  });

  const rows = useMemo(() => {
    return MONTHS.map((label, index) => {
      const key = `${year}-${String(index + 1).padStart(2, "0")}`;
      const match = query.data?.data.find((point) => point.periodStart.startsWith(key));
      return { month: label, count: match?.count ?? 0 };
    });
  }, [query.data, year]);

  const place = city === "all" ? "the UK" : city;

  return (
    <div className="card" aria-busy={query.isLoading}>
      <div className="filter-fields">
        <div>
          <label htmlFor="chart-city">City</label>
          <select id="chart-city" value={city} onChange={(event) => setCity(event.target.value)}>
            <option value="all">All UK</option>
            {CITIES.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="chart-year">Year</label>
          <select id="chart-year" value={year} onChange={(event) => setYear(event.target.value)}>
            {YEARS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      <h2>
        Sightings in {place}, {year}
      </h2>
      {query.isLoading ? <p>Loading the chart…</p> : null}
      {query.isError ? (
        <p role="alert">The chart could not be loaded. The database may not be seeded yet.</p>
      ) : null}
      <div className="chart-frame" aria-hidden="true">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={rows}>
            <CartesianGrid stroke="#e6e1d6" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#0e5c4a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="data-table">
        <caption>
          Monthly tick sightings in {place} during {year}
        </caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Sightings</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.month}>
              <th scope="row">{row.month}</th>
              <td>{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
