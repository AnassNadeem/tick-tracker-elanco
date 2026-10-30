import ReportForm from "@/components/report/ReportForm";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Report a sighting",
};

export default function ReportPage() {
  return (
    <div className="page">
      <h1>Report a sighting</h1>
      <p className="lede">
        Add a tick you have seen. Date, time, city, and species are required. A photo and a map pin
        are optional. This does not notify a vet or a doctor.
      </p>
      <Suspense fallback={<p>Loading the form…</p>}>
        <ReportForm />
      </Suspense>
    </div>
  );
}
