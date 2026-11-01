"use client";

import { useSyncExternalStore } from "react";

function emptySubscribe() {
  return () => {};
}

function clientYear() {
  return new Date().getFullYear();
}

function serverYear() {
  return null;
}

// The year is read in the browser. Cache Components rejects `new Date()` during prerender.
export default function CopyrightYear() {
  const year = useSyncExternalStore(emptySubscribe, clientYear, serverYear);
  return <>{year ?? ""}</>;
}
