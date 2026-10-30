"use client";

import { useEffect, useState } from "react";

// Rendered on the client so the layout can still be prerendered/cached
// (Cache Components rejects `new Date()` during prerender).
export default function CopyrightYear() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return <>{year ?? ""}</>;
}
