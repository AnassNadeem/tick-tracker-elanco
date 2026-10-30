"use client";

import { findCity } from "@/lib/cities";
import { divIcon, type LatLngExpression } from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
    <MapContainer center={center} zoom={selected ? 11 : 6} className="pin-map" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selected ? <Recenter lat={selected.lat} lng={selected.lng} /> : null}
      <Picker onPick={onPick} />
      {position ? <Marker position={position} icon={pinIcon} title="Chosen location" keyboard={false} /> : null}
    </MapContainer>
  );
}
