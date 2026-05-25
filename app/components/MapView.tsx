"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import { useEffect } from "react";

import "leaflet/dist/leaflet.css";

interface Props {
  position: [number, number];

  setPosition?: (
    pos: [number, number]
  ) => void;

  draggable?: boolean;

  zoom?: number;

  popupText?: string;
}

const markerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],
});

function RecenterMap({
  position,
}: {
  position: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(position);
  }, [position, map]);

  return null;
}

export default function MapView({
  position,
  setPosition,
  draggable = false,
  zoom = 17,
  popupText = "LocateMe Destination",
}: Props) {
  return (
    <div className="h-[45vh] w-full">

      <MapContainer
        center={position}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >

        <RecenterMap
          position={position}
        />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={position}
          draggable={draggable}
          icon={markerIcon}
          eventHandlers={{
            dragend: (e) => {
              if (!setPosition) return;

              const marker =
                e.target;

              const latlng =
                marker.getLatLng();

              setPosition([
                latlng.lat,
                latlng.lng,
              ]);
            },
          }}
        >

          <Popup>
            {popupText}
          </Popup>

        </Marker>

      </MapContainer>

    </div>
  );
}