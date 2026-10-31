"use client";

import { useDialogBehavior } from "@/components/useDialogBehavior";
import { formatObserved } from "@/lib/view";
import type { MonthlyCount, SightingDto, TimelineEntry } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRef, useState } from "react";

type DetailResponse = {
  sighting: SightingDto;
  timeline: TimelineEntry[];
  monthlyCounts: MonthlyCount[];
};

const TIMELINE_PREVIEW = 5;
const SPARK_MONTHS = 24;

function IconCalendar() {
  return (
    <svg className="fact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg className="fact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconGauge() {
  return (
    <svg className="fact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 14a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 14l4-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

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

  const months = (query.data?.monthlyCounts ?? []).slice(-SPARK_MONTHS);
  const sparkMax = Math.max(1, ...months.map((m) => m.count));
  const totalInView = months.reduce((sum, m) => sum + m.count, 0);
  const timeline = query.data?.timeline ?? [];
  const preview = timeline.slice(0, TIMELINE_PREVIEW);
  const rest = timeline.slice(TIMELINE_PREVIEW);

  return (
    <aside
      ref={panelRef}
      className="sighting-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sighting-title"
      aria-describedby="sighting-summary"
    >
      <div className="panel-hero">
        <button type="button" className="panel-close" onClick={onClose} aria-label="Close sighting details">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
        {sighting ? (
          <>
            <div className="panel-species">
              <Image
                className="panel-thumb"
                src={`/images/species-${sighting.species.slug}.jpg`}
                alt={sighting.species.name}
                width={64}
                height={64}
              />
              <div>
                <h2 id="sighting-title">{sighting.species.name}</h2>
                <p className="latin">{sighting.species.latinName}</p>
              </div>
            </div>
            <div className="panel-badges">
              <span className="panel-badge">
                {sighting.source === "user_submitted" ? "Community report" : "Imported record"}
              </span>
              <span className="panel-badge">
                {sighting.severity ? `${sighting.severity} severity` : "Severity not recorded"}
              </span>
            </div>
          </>
        ) : (
          <h2 id="sighting-title">Sighting</h2>
        )}
      </div>

      <div className="panel-body">
        <p id="sighting-summary" className="sr-only">
          Sighting details. Press Escape to close and return to the marker.
        </p>
        {query.isLoading ? <p>Loading sighting…</p> : null}
        {query.isError ? <p role="alert">That sighting could not be loaded.</p> : null}
        {query.data === null ? <p role="alert">This sighting is no longer available.</p> : null}

        {sighting && query.data ? (
          <>
            <dl className="facts">
              <div className="fact">
                <IconCalendar />
                <div>
                  <dt>When</dt>
                  <dd>{formatObserved(sighting.observedAt)}</dd>
                </div>
              </div>
              <div className="fact">
                <IconPin />
                <div>
                  <dt>Where</dt>
                  <dd>
                    {sighting.region.name}
                    {sighting.locationLabel ? `, ${sighting.locationLabel}` : ""}
                    {sighting.coordinatesAreApproximate
                      ? ". Mapped to the city centre; the record has no exact coordinates."
                      : ""}
                  </dd>
                </div>
              </div>
              <div className="fact">
                <IconGauge />
                <div>
                  <dt>Severity</dt>
                  <dd>
                    {sighting.severity ??
                      "Not recorded. Imported records do not include a severity."}
                  </dd>
                </div>
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

            <h3 className="panel-section-title">
              <span>Activity in {sighting.region.name}</span>
              <span className="help">{totalInView} in range</span>
            </h3>
            {months.length > 0 ? (
              <>
                <div
                  className="spark"
                  role="img"
                  aria-label={`Monthly sightings in ${sighting.region.name} over the last ${months.length} months, peak ${sparkMax}.`}
                >
                  {months.map((month) => (
                    <span
                      key={month.periodStart}
                      className="spark-bar filled"
                      data-peak={month.count === sparkMax ? "true" : undefined}
                      style={{ height: `${Math.max(6, (month.count / sparkMax) * 100)}%` }}
                      title={`${month.periodStart.slice(0, 7)}: ${month.count}`}
                    />
                  ))}
                </div>
                <div className="spark-meta">
                  <span>{months[0]?.periodStart.slice(0, 7)}</span>
                  <span>peak {sparkMax}</span>
                  <span>{months[months.length - 1]?.periodStart.slice(0, 7)}</span>
                </div>
              </>
            ) : (
              <p className="help">No monthly history for this city yet.</p>
            )}

            <h3 className="panel-section-title">
              <span>Latest sightings here</span>
            </h3>
            <ol className="timeline">
              {preview.map((entry) => (
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
            {rest.length > 0 ? (
              <details className="timeline-more">
                <summary>Show {rest.length} more</summary>
                <ol className="timeline" style={{ marginTop: "0.4rem" }}>
                  {rest.map((entry) => (
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
              </details>
            ) : null}
          </>
        ) : null}
      </div>
    </aside>
  );
}
