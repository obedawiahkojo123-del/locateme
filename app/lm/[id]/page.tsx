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
  Phone,
  CheckCircle2,
  LocateFixed,
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

  phone_number: string;

  arrived: boolean;

  place_name?: string;
}

export default function LocationPage() {
  const params = useParams();

  const [data, setData] =
    useState<LocationData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [distanceAway, setDistanceAway] =
    useState("");

  const [arrivalLoading, setArrivalLoading] =
    useState(false);

  useEffect(() => {
    async function fetchLocation() {
      try {
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

          getDistance(data);
        }
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    }

    fetchLocation();
  }, [params]);

  const getDistance = (
    destination: LocationData
  ) => {
    if (!navigator.geolocation)
      return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat1 =
          pos.coords.latitude;

        const lon1 =
          pos.coords.longitude;

        const lat2 =
          destination.latitude;

        const lon2 =
          destination.longitude;

        const R = 6371;

        const dLat =
          ((lat2 - lat1) *
            Math.PI) /
          180;

        const dLon =
          ((lon2 - lon1) *
            Math.PI) /
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

        const distance =
          R * c;

        if (distance < 1) {
          setDistanceAway(
            `${Math.round(
              distance * 1000
            )} meters away`
          );
        } else {
          setDistanceAway(
            `${distance.toFixed(
              1
            )} km away`
          );
        }
      }
    );
  };

  const markArrived =
    async () => {
      if (!data) return;

      try {
        setArrivalLoading(true);

        const { error } =
          await supabase
            .from("locations")
            .update({
              arrived: true,
            })
            .eq("id", data.id);

        if (!error) {
          setData({
            ...data,
            arrived: true,
          });

          speak(
            "Arrival status updated"
          );
        }

        setArrivalLoading(false);
      } catch (err) {
        console.log(err);

        setArrivalLoading(false);
      }
    };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">

          <div className="w-14 h-14 border-4 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-5" />

          <p className="text-zinc-400">
            Loading destination...
          </p>

        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">

          <h1 className="text-4xl font-black">
            Location Not Found
          </h1>

          <p className="text-zinc-500 mt-3">
            This LocateMe link may
            have expired.
          </p>

        </div>
      </main>
    );
  }

  const liveMapLink =
    `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;

  const uberLink =
    `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${data.latitude}&dropoff[longitude]=${data.longitude}`;

  const boltLink =
    `https://bolt.eu/ride/?destination=${data.latitude},${data.longitude}`;

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-8">

          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-sm text-zinc-300 mb-5">

            <MapPin size={15} />

            LocateMe Destination
          </div>

          <h1 className="text-5xl font-black tracking-tight">
            {data.place_name ||
              "Destination"}
          </h1>

          <p className="text-zinc-400 mt-3 text-lg leading-7">
            Someone shared a smart
            location with you.
          </p>

        </div>

        <div className="rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl">

          <MapView
            position={[
              data.latitude,
              data.longitude,
            ]}
            draggable={false}
          />

        </div>

        {distanceAway && (
          <div className="mt-5 bg-gradient-to-r from-green-500 to-emerald-400 text-black rounded-2xl p-4 flex items-center gap-3 font-bold shadow-lg">

            <LocateFixed size={20} />

            <span>
              You are {distanceAway}
            </span>

          </div>
        )}

        {data.arrived && (
          <div className="mt-4 bg-blue-600 rounded-2xl p-4 flex items-center gap-3 font-semibold">

            <CheckCircle2 size={20} />

            <span>
              Receiver has arrived
            </span>

          </div>
        )}

        <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-5">

          <p className="text-sm text-zinc-500 mb-2">
            Smart Guidance
          </p>

          <p className="text-lg leading-8">
            {data.smart_guide ||
              "No smart guide available"}
          </p>

        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">

          <button
            onClick={() =>
              speak(data.smart_guide)
            }
            className="bg-blue-600 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
          >
            <Volume2 size={18} />
            Voice Guide
          </button>

          {data.phone_number ? (
            <a
              href={`tel:${data.phone_number}`}
              className="bg-zinc-800 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              Call
            </a>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl py-4 text-center text-zinc-500">
              No Phone
            </div>
          )}

        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">

          <a
            href={uberLink}
            target="_blank"
            className="bg-black border border-zinc-700 rounded-2xl py-4 font-bold flex items-center justify-center"
          >
            Uber
          </a>

          <a
            href={boltLink}
            target="_blank"
            className="bg-green-500 text-black rounded-2xl py-4 font-bold flex items-center justify-center"
          >
            Bolt
          </a>

        </div>

        <a
          href={liveMapLink}
          target="_blank"
          className="w-full mt-3 bg-white text-black rounded-2xl py-5 font-bold text-lg flex items-center justify-center gap-2"
        >
          <Navigation size={20} />
          Open In Google Maps
        </a>

        <button
          onClick={markArrived}
          disabled={
            data.arrived ||
            arrivalLoading
          }
          className="w-full mt-3 bg-purple-600 rounded-2xl py-5 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <CheckCircle2 size={20} />

          {data.arrived
            ? "Arrived"
            : arrivalLoading
            ? "Updating..."
            : "I've Arrived"}
        </button>

        <div className="mt-8 space-y-4">

          <InfoCard
            icon={<MapPin size={18} />}
            title="Landmark"
            value={data.landmark}
          />

          <InfoCard
            icon={<Building2 size={18} />}
            title="Building Color"
            value={data.building_color}
          />

          <InfoCard
            icon={<Home size={18} />}
            title="Apartment / Gate Side"
            value={data.apartment_side}
          />

          <InfoCard
            icon={<Layers3 size={18} />}
            title="Floor / Room"
            value={data.floor_note}
          />

          <InfoCard
            icon={<StickyNote size={18} />}
            title="Arrival Note"
            value={data.arrival_note}
          />

        </div>

      </div>

    </main>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-start gap-3">

      <div className="mt-1">
        {icon}
      </div>

      <div>
        <p className="text-sm text-zinc-500">
          {title}
        </p>

        <p className="font-semibold mt-1 leading-7">
          {value || "N/A"}
        </p>
      </div>

    </div>
  );
}