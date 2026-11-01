"use client";

import type { MapPoint } from "@/lib/map-points";
import { LeafletContext, createLeafletContext } from "@react-leaflet/core";
import { Map as LeafletMap, divIcon, type DivIcon, type LatLngExpression } from "leaflet";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import Supercluster from "supercluster";
import { markerHtml } from "./Legend";
import "leaflet/dist/leaflet.css";

type ClusterProps = {
  cluster: true;
  cluster_id: number;
  point_count: number;
};

const CLUSTER_THRESHOLD = 200;
const icons = new Map<string, DivIcon>();

function iconFor(key: string, html: string, size: number) {
  const cached = icons.get(key);
  if (cached) return cached;
  const icon = divIcon({
    className: "tick-marker-wrap",
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
  icons.set(key, icon);
  return icon;
}

function MapLabel() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    container.setAttribute(
      "aria-label",
      "Map of UK tick sightings. Tab to a marker and press Enter to open it.",
    );
  }, [map]);
  return null;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type MapHost = HTMLDivElement & { __tickMap?: LeafletMap; _leaflet_id?: number };

function mapIsLive(map: LeafletMap | undefined, node: HTMLElement): map is LeafletMap {
  if (!map) return false;
  try {
    return map.getContainer() === node;
  } catch {
    return false;
  }
}

// MapContainer removes its map during React's dev replay and then refuses to
// create another one. This keeps the same map across that replay, and removes
// it only after the container has actually left the page.
function SafeMap({ children }: { children: ReactNode }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [context, setContext] = useState<ReturnType<typeof createLeafletContext> | null>(null);

  useEffect(() => {
    const node = nodeRef.current as MapHost | null;
    if (!node) return;

    const existing = node.__tickMap;
    let map: LeafletMap;
    if (mapIsLive(existing, node)) {
      map = existing;
    } else {
      delete node._leaflet_id;
      map = new LeafletMap(node, {
        center: [54.6, -3.4],
        zoom: 6,
        minZoom: 5,
        maxZoom: 16,
        scrollWheelZoom: true,
      });
      node.__tickMap = map;
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
        if (!node.isConnected && current && mapIsLive(current, node)) {
          current.remove();
          delete node.__tickMap;
          delete node._leaflet_id;
        }
      }, 0);
    };
  }, []);

  return (
    <div ref={nodeRef} className="tick-map">
      {context ? <LeafletContext value={context}>{children}</LeafletContext> : null}
    </div>
  );
}

function FlyToCity({ focus }: { focus: { lat: number; lng: number } | null }) {
  const map = useMap();
  const seen = useRef("");
  useEffect(() => {
    if (!focus) {
      seen.current = "";
      return;
    }
    const key = `${focus.lat.toFixed(4)},${focus.lng.toFixed(4)}`;
    if (seen.current === key) return;
    seen.current = key;
    map.flyTo([focus.lat, focus.lng], 11, { animate: !prefersReducedMotion() });
  }, [focus, map]);
  return null;
}

function isCluster(properties: MapPoint | ClusterProps): properties is ClusterProps {
  return "cluster" in properties && properties.cluster === true;
}

function SightingMarkers({
  points,
  selectedId,
  onSelect,
}: {
  points: MapPoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const map = useMap();
  const [view, setView] = useState(() => {
    const box = map.getBounds();
    return {
      zoom: map.getZoom(),
      west: box.getWest(),
      south: box.getSouth(),
      east: box.getEast(),
      north: box.getNorth(),
    };
  });

  useMapEvents({
    moveend: () => {
      const next = map.getBounds();
      setView({
        zoom: map.getZoom(),
        west: next.getWest(),
        south: next.getSouth(),
        east: next.getEast(),
        north: next.getNorth(),
      });
    },
  });

  const index = useMemo(() => {
    const cluster = new Supercluster<MapPoint, ClusterProps>({ radius: 56, maxZoom: 16 });
    cluster.load(
      points.map((point) => ({
        type: "Feature" as const,
        properties: point,
        geometry: { type: "Point" as const, coordinates: [point.lng, point.lat] },
      })),
    );
    return cluster;
  }, [points]);

  const features =
    points.length > CLUSTER_THRESHOLD
      ? index.getClusters([view.west, view.south, view.east, view.north], Math.round(view.zoom))
      : points.map((point) => ({
          type: "Feature" as const,
          properties: point,
          geometry: {
            type: "Point" as const,
            coordinates: [point.lng, point.lat] as [number, number],
          },
        }));

  return (
    <>
      {features.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const position: LatLngExpression = [lat, lng];
        if (isCluster(feature.properties)) {
          const count = feature.properties.point_count;
          const clusterId = feature.properties.cluster_id;
          const icon = iconFor(`cluster-${count}`, `<span class="cluster-marker">${count}</span>`, 40);
          return (
            <Marker
              key={`cluster-${clusterId}`}
              position={position}
              icon={icon}
              title={`${count} sightings. Activate to zoom in.`}
              keyboard
              eventHandlers={{
                click: () => {
                  const expansion = index.getClusterExpansionZoom(clusterId);
                  map.setView(position, expansion, { animate: !prefersReducedMotion() });
                },
              }}
            />
          );
        }

        const point = feature.properties;
        const selected = point.id === selectedId;
        const icon = iconFor(
          `${point.speciesSlug}|${point.severity ?? ""}|${point.recent}|${selected}`,
          markerHtml({
            speciesSlug: point.speciesSlug,
            severity: point.severity,
            recent: point.recent,
            selected,
          }),
          28,
        );
        return (
          <Marker
            key={point.id}
            position={position}
            icon={icon}
            title={point.label}
            keyboard
            zIndexOffset={point.id === selectedId ? 500 : 0}
            eventHandlers={{ click: () => onSelect(point.id) }}
          />
        );
      })}
    </>
  );
}

export default function TickMap({
  points,
  selectedId,
  onSelect,
  focus = null,
}: {
  points: MapPoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  focus?: { lat: number; lng: number } | null;
}) {
  return (
    <SafeMap>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapLabel />
      <FlyToCity focus={focus} />
      <SightingMarkers points={points} selectedId={selectedId} onSelect={onSelect} />
    </SafeMap>
  );
}
