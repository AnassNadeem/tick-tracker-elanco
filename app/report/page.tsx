import ReportForm from "@/components/report/ReportForm";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Report a sighting",
};

export default function ReportPage() {
  return (
    <div className="page report-page">
      <h1>Report a sighting</h1>
      <Suspense fallback={<p>Loading the form…</p>}>
        <ReportForm />
      </Suspense>
    </div>
  );
}
