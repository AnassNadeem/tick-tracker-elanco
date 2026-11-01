"use client";

import { findCity } from "@/lib/cities";
import { LeafletContext, createLeafletContext } from "@react-leaflet/core";
import { Map as LeafletMap, divIcon, type LatLngExpression } from "leaflet";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type MapHost = HTMLDivElement & { __pinMap?: LeafletMap; _leaflet_id?: number };

function mapIsLive(map: LeafletMap | undefined, node: HTMLElement): map is LeafletMap {
  if (!map) return false;
  try {
    return map.getContainer() === node;
  } catch {
    return false;
  }
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.setView([lat, lng], 11, { animate: !reduce });
  }, [lat, lng, map]);
  return null;
}

function Picker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (event) => onPick(event.latlng.lat, event.latlng.lng),
  });
  return null;
}

const pinIcon = divIcon({
  className: "tick-marker-wrap",
  html: `<span class="tick-marker" data-shape="circle" data-severity="high"><span>P</span></span>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function SafePinMap({
  center,
  zoom,
  children,
}: {
  center: LatLngExpression;
  zoom: number;
  children: ReactNode;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const initial = useRef({ center, zoom });
  const [context, setContext] = useState<ReturnType<typeof createLeafletContext> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = nodeRef.current as MapHost | null;
    if (!node) return;

    let map: LeafletMap;
    const existing = node.__pinMap;
    if (mapIsLive(existing, node)) {
      map = existing;
    } else {
      delete node._leaflet_id;
      try {
        map = new LeafletMap(node, {
          center: initial.current.center,
          zoom: initial.current.zoom,
          scrollWheelZoom: true,
        });
      } catch {
        const timer = window.setTimeout(() => setFailed(true), 0);
        return () => window.clearTimeout(timer);
      }
      node.__pinMap = map;
    }

    const fit = () => {
      if (mapIsLive(map, node)) map.invalidateSize();
    };
    fit();
    const frame = window.requestAnimationFrame(fit);
    setContext(createLeafletContext(map));

    return () => {
      window.cancelAnimationFrame(frame);
      const current = map;
      window.setTimeout(() => {
        if (!node.isConnected && mapIsLive(current, node)) {
          current.remove();
          delete node.__pinMap;
          delete node._leaflet_id;
        }
      }, 0);
    };
  }, []);

  if (failed) {
    return <p className="help">The pin map could not be loaded. You can still submit using the city only.</p>;
  }

  return (
    <div
      ref={nodeRef}
      className="pin-map"
      role="application"
      aria-label="Optional location pin. Click the map to drop a pin."
    >
      {context ? <LeafletContext value={context}>{children}</LeafletContext> : null}
    </div>
  );
}

export default function PinMap({
  lat,
  lng,
  city,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  city: string;
  onPick: (lat: number, lng: number) => void;
}) {
  const selected = findCity(city);
  const center: LatLngExpression = selected ? [selected.lat, selected.lng] : [54.6, -3.4];
  const position: LatLngExpression | null = lat !== null && lng !== null ? [lat, lng] : null;

  return (
    <SafePinMap center={center} zoom={selected ? 11 : 6}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selected ? <Recenter lat={selected.lat} lng={selected.lng} /> : null}
      <Picker onPick={onPick} />
      {position ? <Marker position={position} icon={pinIcon} title="Chosen location" keyboard={false} /> : null}
    </SafePinMap>
  );
}
