"use client";

import { CITIES } from "@/lib/cities";
import { warningMessages, validateReport } from "@/lib/report-rules";
import type { FieldMessage, SightingDto, SpeciesDto } from "@/lib/types";
import { fieldErrors, reportSchema } from "@/lib/validators";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

const PinMap = dynamic(() => import("./PinMap"), {
  ssr: false,
  loading: () => <div className="pin-map map-loading">Loading the pin map…</div>,
});

type FormState = {
  observedDate: string;
  observedTime: string;
  region: string;
  species: string;
  severity: string;
  locationLabel: string;
  reporterNote: string;
  lat: string;
  lng: string;
};

const EMPTY: FormState = {
  observedDate: "",
  observedTime: "",
  region: "",
  species: "",
  severity: "",
  locationLabel: "",
  reporterNote: "",
  lat: "",
  lng: "",
};

function messagesFor(messages: FieldMessage[], field: string) {
  return messages.filter((message) => message.field === field);
}

function formPayload(values: FormState) {
  return {
    observedDate: values.observedDate,
    observedTime: values.observedTime,
    region: values.region,
    species: values.species,
    ...(values.severity ? { severity: values.severity } : {}),
    ...(values.locationLabel ? { locationLabel: values.locationLabel } : {}),
    ...(values.reporterNote ? { reporterNote: values.reporterNote } : {}),
    ...(values.lat ? { lat: values.lat } : {}),
    ...(values.lng ? { lng: values.lng } : {}),
  };
}

export default function ReportForm() {
  const searchParams = useSearchParams();
  const [values, setValues] = useState<FormState>(() => ({
    ...EMPTY,
    region: searchParams.get("region") ?? "",
    species: searchParams.get("species") ?? "",
  }));
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldMessage[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState<{ sighting: SightingDto; warnings: FieldMessage[] } | null>(null);

  const speciesQuery = useQuery({
    queryKey: ["species"],
    queryFn: async () => {
      const response = await fetch("/api/species");
      if (!response.ok) throw new Error("Could not load species");
      return (await response.json()) as { data: SpeciesDto[] };
    },
  });

  const warnings = useMemo(() => {
    if (!values.observedDate || !values.observedTime || !values.region || !values.species) return [];
    const parsed = reportSchema.safeParse(formPayload(values));
    if (!parsed.success) return [];
    return warningMessages(parsed.data, Boolean(file));
  }, [values, file]);

  function update(key: keyof FormState, value: string) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "region") {
        next.lat = "";
        next.lng = "";
      }
      return next;
    });
    setSaved(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setSaved(null);
    const parsed = reportSchema.safeParse(formPayload(values));
    const nextErrors = parsed.success ? validateReport(parsed.data) : fieldErrors(parsed.error);
    if (file) {
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(file.type)) {
        nextErrors.push({ field: "image", message: "Upload a JPEG, PNG, WEBP, or GIF" });
      } else if (file.size > 5 * 1024 * 1024) {
        nextErrors.push({ field: "image", message: "Images must be 5 MB or smaller" });
      }
    }
    setErrors(nextErrors);
    if (nextErrors.length > 0 || !parsed.success) return;

    const body = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (value) body.set(key, value);
    }
    if (file) body.set("image", file);

    setPending(true);
    try {
      const response = await fetch("/api/sightings", { method: "POST", body });
      const payload = (await response.json()) as {
        sighting?: SightingDto;
        errors?: FieldMessage[];
        warnings?: FieldMessage[];
      };
      if (!response.ok || !payload.sighting) {
        setErrors(payload.errors ?? [{ field: "form", message: "The sighting could not be saved" }]);
        return;
      }
      setErrors([]);
      setSaved({ sighting: payload.sighting, warnings: payload.warnings ?? [] });
    } catch {
      setErrors([{ field: "form", message: "The network request failed. Try again." }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="report-form card" onSubmit={onSubmit} noValidate>
      <Field
        id="observedDate"
        label="Date"
        type="date"
        value={values.observedDate}
        onChange={(value) => update("observedDate", value)}
        errors={submitted ? messagesFor(errors, "observedDate") : []}
        warnings={messagesFor(warnings, "observedDate")}
        required
      />
      <Field
        id="observedTime"
        label="Time"
        type="time"
        value={values.observedTime}
        onChange={(value) => update("observedTime", value)}
        errors={submitted ? messagesFor(errors, "observedTime") : []}
        warnings={[]}
        required
      />
      <div className="field">
        <label htmlFor="region">City</label>
        <select
          id="region"
          value={values.region}
          onChange={(event) => update("region", event.target.value)}
          required
          aria-invalid={submitted && messagesFor(errors, "region").length > 0 ? true : undefined}
          aria-describedby={submitted && messagesFor(errors, "region").length > 0 ? "region-messages" : undefined}
        >
          <option value="">Choose a city</option>
          {CITIES.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
        <Messages id="region" errors={submitted ? messagesFor(errors, "region") : []} warnings={[]} />
      </div>
      <div className="field">
        <label htmlFor="species">Species</label>
        <select
          id="species"
          value={values.species}
          onChange={(event) => update("species", event.target.value)}
          required
          aria-invalid={submitted && messagesFor(errors, "species").length > 0 ? true : undefined}
          aria-describedby={submitted && messagesFor(errors, "species").length > 0 ? "species-messages" : undefined}
        >
          <option value="">Choose a species</option>
          {(speciesQuery.data?.data ?? []).map((species) => (
            <option key={species.slug} value={species.slug}>
              {species.name}
            </option>
          ))}
        </select>
        <Messages id="species" errors={submitted ? messagesFor(errors, "species") : []} warnings={[]} />
      </div>
      <div className="field">
        <label htmlFor="severity">Severity (optional)</label>
        <select
          id="severity"
          value={values.severity}
          onChange={(event) => update("severity", event.target.value)}
          aria-describedby={messagesFor(warnings, "severity").length ? "severity-messages" : undefined}
        >
          <option value="">Not sure</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <Messages id="severity" errors={[]} warnings={messagesFor(warnings, "severity")} />
      </div>
      <div className="field">
        <label htmlFor="locationLabel">Place name (optional)</label>
        <input
          id="locationLabel"
          value={values.locationLabel}
          onChange={(event) => update("locationLabel", event.target.value)}
          maxLength={160}
        />
      </div>
      <div className="field field-span">
        <label htmlFor="pin-map">Location pin (optional)</label>
        <p id="pin-help" className="help">
          Click the map to drop a pin, or leave it blank to use the city.
        </p>
        <div id="pin-map">
          <PinMap
            lat={values.lat ? Number(values.lat) : null}
            lng={values.lng ? Number(values.lng) : null}
            city={values.region}
            onPick={(lat, lng) => {
              setValues((current) => ({ ...current, lat: lat.toFixed(5), lng: lng.toFixed(5) }));
            }}
          />
        </div>
        <Messages id="lat" errors={submitted ? messagesFor(errors, "lat") : []} warnings={[]} />
      </div>
      <div className="field field-span">
        <label htmlFor="reporterNote">Note (optional)</label>
        <textarea
          id="reporterNote"
          value={values.reporterNote}
          onChange={(event) => update("reporterNote", event.target.value)}
          maxLength={1000}
        />
      </div>
      <div className="field field-span">
        <label htmlFor="image">Photo (optional)</label>
        <div className="file-row">
          <label className="file-button" htmlFor="image">
            Choose a photo
          </label>
          <span className="file-name">{file ? file.name : "No file chosen"}</span>
        </div>
        <input
          id="image"
          className="file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          aria-describedby={
            messagesFor(warnings, "image").length || (submitted && messagesFor(errors, "image").length)
              ? "image-messages"
              : undefined
          }
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <Messages id="image" errors={submitted ? messagesFor(errors, "image") : []} warnings={messagesFor(warnings, "image")} />
      </div>
      <div className="field-span" aria-live="polite">
        {messagesFor(errors, "form").map((message) => (
          <p key={message.message} className="error-text" role="alert">
            {message.message}
          </p>
        ))}
        {saved ? (
          <div className="success">
            <h2>Sighting saved</h2>
            <p>It is on the map now.</p>
            {saved.warnings.map((warning) => (
              <p key={warning.field} className="warning-text">
                {warning.message}
              </p>
            ))}
            <p>
              <Link href={`/map?sighting=${saved.sighting.id}`}>View it on the map</Link>
            </p>
          </div>
        ) : null}
      </div>
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Submit sighting"}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  errors,
  warnings,
  required,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  errors: FieldMessage[];
  warnings: FieldMessage[];
  required?: boolean;
}) {
  const describedBy = [...errors, ...warnings].length ? `${id}-messages` : undefined;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required ? " (required)" : ""}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        aria-invalid={errors.length > 0 || undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
      />
      <Messages id={id} errors={errors} warnings={warnings} />
    </div>
  );
}

function Messages({
  id,
  errors,
  warnings,
}: {
  id: string;
  errors: FieldMessage[];
  warnings: FieldMessage[];
}) {
  if (errors.length === 0 && warnings.length === 0) return null;
  return (
    <div id={`${id}-messages`}>
      {errors.map((message) => (
        <p key={message.message} className="error-text" role="alert">
          {message.message}
        </p>
      ))}
      {warnings.map((message) => (
        <p key={message.message} className="warning-text">
          {message.message}
        </p>
      ))}
    </div>
  );
}
