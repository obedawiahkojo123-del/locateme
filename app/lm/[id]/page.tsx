"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import dynamic from "next/dynamic";

import {
  Navigation,
  MapPin,
  Building2,
  Home,
  Layers3,
  StickyNote,
  Volume2,
  Car,
  Timer,
  Route,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import { speak } from "../../lib/speak";

const MapView = dynamic(
  () => import("../../components/MapView"),
  {
    ssr: false,
  }
);

interface LocationData {
  id: string;

  latitude: number;

  longitude: number;

  landmark: string;

  building_color: string;

  apartment_side: string;

  floor_note: string;

  arrival_note: string;

  smart_guide: string;
}

export default function LocationPage() {
  const params = useParams();

  const [data, setData] =
    useState<LocationData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [userPosition, setUserPosition] =
    useState<[number, number] | null>(
      null
    );

  const [distanceAway, setDistanceAway] =
    useState("");

  const [eta, setEta] =
    useState("");

  useEffect(() => {
    async function fetchLocation() {
      const { data, error } =
        await supabase
          .from("locations")
          .select("*")
          .eq("id", params.id)
          .single();

      if (!error && data) {
        setData(data);

        speak(
          data.smart_guide ||
            `Destination loaded near ${data.landmark}`
        );

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLat =
              pos.coords.latitude;

            const userLng =
              pos.coords.longitude;

            setUserPosition([
              userLat,
              userLng,
            ]);

            const distance =
              calculateDistance(
                userLat,
                userLng,
                data.latitude,
                data.longitude
              );

            setDistanceAway(
              `${distance.toFixed(
                1
              )} km away`
            );

            const estimatedMinutes =
              Math.max(
                1,
                Math.round(distance * 3)
              );

            setEta(
              `~${estimatedMinutes} mins away`
            );
          }
        );
      }

      setLoading(false);
    }

    fetchLocation();
  }, [params]);

  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371;

    const dLat =
      ((lat2 - lat1) * Math.PI) /
      180;

    const dLon =
      ((lon2 - lon1) * Math.PI) /
      180;

    const a =
      Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
      Math.cos(
        (lat1 * Math.PI) / 180
      ) *
        Math.cos(
          (lat2 * Math.PI) / 180
        ) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return R * c;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading destination...
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Location not found.
      </main>
    );
  }

  const liveMapLink = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;

  const boltLink = `https://bolt.eu/ride/?destination=${data.latitude},${data.longitude}`;

  const uberLink = `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${data.latitude}&dropoff[longitude]=${data.longitude}`;

  return (
    <main className="min-h-screen bg-black text-white px-4 py-6">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <h1 className="text-5xl font-bold">
            Destination
          </h1>

          <p className="text-zinc-400 mt-2">
            Someone shared a LocateMe pin with you
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden border border-zinc-800">
          <MapView
            position={[
              data.latitude,
              data.longitude,
            ]}
            draggable={false}
          />
        </div>

        <div className="mt-5 space-y-4">

          <div className="grid grid-cols-2 gap-3">

            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                <Route size={16} />
                Distance
              </div>

              <p className="font-bold text-lg">
                {distanceAway ||
                  "Calculating..."}
              </p>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                <Timer size={16} />
                ETA
              </div>

              <p className="font-bold text-lg">
                {eta ||
                  "Calculating..."}
              </p>
            </div>

          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex items-start gap-3">

            <MapPin size={18} />

            <div>
              <p className="text-sm text-zinc-400">
                Landmark
              </p>

              <p className="font-semibold mt-1">
                {data.landmark || "N/A"}
              </p>
            </div>

          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex items-start gap-3">

            <Building2 size={18} />

            <div>
              <p className="text-sm text-zinc-400">
                Building Color
              </p>

              <p className="font-semibold mt-1">
                {data.building_color ||
                  "N/A"}
              </p>
            </div>

          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex items-start gap-3">

            <Home size={18} />

            <div>
              <p className="text-sm text-zinc-400">
                Apartment / Gate Side
              </p>

              <p className="font-semibold mt-1">
                {data.apartment_side ||
                  "N/A"}
              </p>
            </div>

          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex items-start gap-3">

            <Layers3 size={18} />

            <div>
              <p className="text-sm text-zinc-400">
                Floor / Room
              </p>

              <p className="font-semibold mt-1">
                {data.floor_note ||
                  "N/A"}
              </p>
            </div>

          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex items-start gap-3">

            <StickyNote size={18} />

            <div>
              <p className="text-sm text-zinc-400">
                Arrival Note
              </p>

              <p className="font-semibold mt-1">
                {data.arrival_note ||
                  "No extra note"}
              </p>
            </div>

          </div>

          <div className="bg-zinc-800 rounded-2xl p-4">
            <p className="text-sm text-zinc-400 mb-2">
              Smart Guidance
            </p>

            <p className="text-sm">
              {data.smart_guide}
            </p>
          </div>

          <button
            onClick={() =>
              speak(data.smart_guide)
            }
            className="w-full bg-blue-600 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
          >
            <Volume2 size={18} />
            Play Voice Guide
          </button>

          <div className="grid grid-cols-2 gap-3">

            <a
              href={boltLink}
              target="_blank"
              className="bg-green-500 text-black rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
            >
              <Car size={18} />
              Bolt
            </a>

            <a
              href={uberLink}
              target="_blank"
              className="bg-white text-black rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
            >
              <Car size={18} />
              Uber
            </a>

          </div>

          <a
            href={liveMapLink}
            target="_blank"
            className="w-full bg-green-500 text-black rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
          >
            <Navigation size={18} />
            Open In Google Maps
          </a>

        </div>

      </div>
    </main>
  );
}