"use client";

import { useDialogBehavior } from "@/components/useDialogBehavior";
import { formatObserved } from "@/lib/view";
import type { MonthlyCount, SightingDto, TimelineEntry } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";

type DetailResponse = {
  sighting: SightingDto;
  timeline: TimelineEntry[];
  monthlyCounts: MonthlyCount[];
};

export default function SightingPanel({
  id,
  onClose,
  onSelect,
}: {
  id: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const [shareMessage, setShareMessage] = useState("");
  useDialogBehavior(true, panelRef, onClose);

  const query = useQuery({
    queryKey: ["sighting", id],
    queryFn: async () => {
      const response = await fetch(`/api/sightings/${id}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Could not load sighting");
      return (await response.json()) as DetailResponse;
    },
  });

  const sighting = query.data?.sighting;
  const maxMonth = Math.max(1, ...(query.data?.monthlyCounts.map((month) => month.count) ?? [1]));

  async function share() {
    const url = new URL(window.location.href);
    url.searchParams.set("sighting", id);
    const payload = {
      title: "Tick sighting",
      text: sighting ? `${sighting.species.name} in ${sighting.region.name}` : "Tick sighting",
      url: url.toString(),
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        setShareMessage("Share sheet opened.");
      } else {
        await navigator.clipboard.writeText(url.toString());
        setShareMessage("Link copied.");
      }
    } catch {
      setShareMessage("Share was cancelled.");
    }
  }

  const destination = sighting
    ? `${sighting.lat ?? sighting.region.lat},${sighting.lng ?? sighting.region.lng}`
    : "";

  return (
    <aside
      ref={panelRef}
      className="sighting-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sighting-title"
      aria-describedby="sighting-summary"
    >
      <div className="panel-head">
        <h2 id="sighting-title">{sighting ? sighting.species.name : "Sighting"}</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <p id="sighting-summary" className="help">
        Sighting details. Press Escape to close and return to the marker.
      </p>
      {query.isLoading ? <p>Loading sighting…</p> : null}
      {query.isError ? <p role="alert">That sighting could not be loaded.</p> : null}
      {query.data === null ? <p role="alert">This sighting is no longer available.</p> : null}
      {sighting && query.data ? (
        <>
          <p className="latin">{sighting.species.latinName}</p>
          <dl className="facts">
            <div>
              <dt>When</dt>
              <dd>{formatObserved(sighting.observedAt)}</dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>
                {sighting.region.name}
                {sighting.locationLabel ? ` — ${sighting.locationLabel}` : ""}
                {sighting.coordinatesAreApproximate
                  ? ". Mapped to the city centre. The source record has no exact coordinates."
                  : ""}
              </dd>
            </div>
            <div>
              <dt>Severity</dt>
              <dd>{sighting.severity ?? "Not recorded. Imported records do not include a severity."}</dd>
            </div>
          </dl>
          {sighting.reporterNote ? <p>{sighting.reporterNote}</p> : null}
          {sighting.imageUrl ? (
            <Image
              src={sighting.imageUrl}
              alt={`Photo submitted with the ${sighting.species.name} sighting`}
              width={640}
              height={480}
              className="sighting-photo"
            />
          ) : null}
          <div className="actions">
            <Link
              href={`/report?region=${encodeURIComponent(sighting.region.name)}&species=${encodeURIComponent(sighting.species.slug)}`}
            >
              Report a sighting
            </Link>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${destination}`}
              target="_blank"
              rel="noreferrer"
            >
              Get directions
            </a>
            <button type="button" onClick={share}>
              Share
            </button>
          </div>
          <p className="help" aria-live="polite">
            {shareMessage}
            {sighting.coordinatesAreApproximate
              ? " Directions open the city centre, not a precise spot."
              : ""}
          </p>
          <h3>Activity in {sighting.region.name}</h3>
          <ol className="month-bars">
            {query.data.monthlyCounts.map((month) => (
              <li key={month.periodStart}>
                <span className="bar" style={{ width: `${Math.max(8, (month.count / maxMonth) * 100)}%` }} />
                <span>
                  {month.periodStart.slice(0, 7)} · {month.count}
                </span>
              </li>
            ))}
          </ol>
          <h3>Latest sightings here</h3>
          <ol className="timeline">
            {query.data.timeline.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onSelect(entry.id)}
                  aria-current={entry.id === sighting.id ? "true" : undefined}
                >
                  {formatObserved(entry.observedAt)} · {entry.speciesName}
                  {entry.severity ? ` · ${entry.severity}` : ""}
                </button>
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </aside>
  );
}
