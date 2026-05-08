"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

interface Props {
  position: [number, number];

  setPosition?: (
    pos: [number, number]
  ) => void;

  draggable?: boolean;
}

const markerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],
});

export default function MapView({
  position,
  setPosition,
  draggable = false,
}: Props) {
  return (
    <div className="h-[45vh] w-full">

      <MapContainer
        center={position}
        zoom={17}
        scrollWheelZoom={true}
        className="h-full w-full"
      >

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
        />

      </MapContainer>

    </div>
  );
}