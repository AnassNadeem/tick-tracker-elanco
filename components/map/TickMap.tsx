"use client";

import type { MapPoint } from "@/lib/map-points";
import { divIcon, type LatLngExpression } from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import Supercluster from "supercluster";
import { markerHtml } from "./Legend";
import "leaflet/dist/leaflet.css";

type ClusterProps = {
  cluster: true;
  cluster_id: number;
  point_count: number;
};

const CLUSTER_THRESHOLD = 200;

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

function isCluster(properties: MapPoint | ClusterProps): properties is ClusterProps {
  return "cluster" in properties && properties.cluster === true;
}

function SightingMarkers({
  points,
  selectedId,
  onSelect,
  onBounds,
}: {
  points: MapPoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBounds: (bounds: { north: number; south: number; east: number; west: number }) => void;
}) {
  const map = useMap();
  const onBoundsRef = useRef(onBounds);
  useEffect(() => {
    onBoundsRef.current = onBounds;
  }, [onBounds]);
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
      const box = {
        north: next.getNorth(),
        south: next.getSouth(),
        east: next.getEast(),
        west: next.getWest(),
      };
      setView({ zoom: map.getZoom(), ...box });
      onBoundsRef.current(box);
    },
  });

  useEffect(() => {
    const next = map.getBounds();
    onBoundsRef.current({
      north: next.getNorth(),
      south: next.getSouth(),
      east: next.getEast(),
      west: next.getWest(),
    });
  }, [map]);

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
          const icon = divIcon({
            className: "tick-marker-wrap",
            html: `<span class="cluster-marker">${count}</span>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });
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
        const icon = divIcon({
          className: "tick-marker-wrap",
          html: markerHtml({
            speciesSlug: point.speciesSlug,
            severity: point.severity,
            recent: point.recent,
            selected: point.id === selectedId,
          }),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
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
  onBounds,
}: {
  points: MapPoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBounds: (bounds: { north: number; south: number; east: number; west: number }) => void;
}) {
  return (
    <MapContainer
      center={[54.6, -3.4]}
      zoom={6}
      minZoom={5}
      maxZoom={16}
      className="tick-map"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapLabel />
      <SightingMarkers
        points={points}
        selectedId={selectedId}
        onSelect={onSelect}
        onBounds={onBounds}
      />
    </MapContainer>
  );
}
