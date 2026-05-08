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
      }

      setLoading(false);
    }

    fetchLocation();
  }, [params]);

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