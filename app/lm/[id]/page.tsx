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
  Car,
  BellRing,
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

  place_name?: string;

  arrived: boolean;
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
    requestNotificationPermission();

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

        getDistance(data);

        subscribeToArrival(data.id);
      }

      setLoading(false);
    }

    fetchLocation();
  }, [params]);

  const requestNotificationPermission =
    async () => {
      if (
        typeof window !==
          "undefined" &&
        "Notification" in window
      ) {
        await Notification.requestPermission();
      }
    };

  const subscribeToArrival = (
    locationId: string
  ) => {
    supabase
      .channel(`arrival-${locationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "locations",
          filter: `id=eq.${locationId}`,
        },
        (payload: any) => {
          if (
            payload.new.arrived ===
            true
          ) {
            setData((prev: any) => ({
              ...prev,
              arrived: true,
            }));

            speak(
              "Receiver has arrived at destination"
            );

            if (
              Notification.permission ===
              "granted"
            ) {
              new Notification(
                "LocateMe Arrival",
                {
                  body:
                    "Your visitor has arrived.",
                }
              );
            }
          }
        }
      )
      .subscribe();
  };

  const getDistance = (
    destination: LocationData
  ) => {
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

          alert(
            "Sender has been notified instantly."
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

  const googleMapsLink =
    `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}`;

  const uberDeepLink =
    `uber://?client_id=&action=setPickup&pickup=my_location&dropoff[latitude]=${data.latitude}&dropoff[longitude]=${data.longitude}&dropoff[formatted_address]=${encodeURIComponent(
      data.place_name ||
        data.landmark ||
        "LocateMe Destination"
    )}`;

  const uberFallbackLink =
    `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${data.latitude}&dropoff[longitude]=${data.longitude}&dropoff[formatted_address]=${encodeURIComponent(
      data.place_name ||
        data.landmark ||
        "LocateMe Destination"
    )}`;

  const openUber = () => {
    window.location.href =
      uberDeepLink;

    setTimeout(() => {
      window.open(
        uberFallbackLink,
        "_blank"
      );
    }, 1500);
  };

  const openBolt = () => {
    window.open(
      googleMapsLink,
      "_blank"
    );
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 py-6">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <h1 className="text-5xl font-black">
            Destination
          </h1>

          <p className="text-zinc-400 mt-2 leading-7">
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

        {distanceAway && (
          <div className="mt-4 bg-green-500 text-black rounded-2xl p-4 flex items-center gap-3 font-semibold">

            <LocateFixed size={20} />

            <span>
              You are {distanceAway}
            </span>

          </div>
        )}

        {data.arrived && (
          <div className="mt-4 bg-blue-600 rounded-2xl p-4 flex items-center gap-3 font-semibold">

            <BellRing size={20} />

            <span>
              Receiver has arrived
            </span>

          </div>
        )}

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

            <p className="text-sm leading-7">
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

          {data.phone_number && (
            <a
              href={`tel:${data.phone_number}`}
              className="w-full bg-zinc-800 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              Call Sender
            </a>
          )}

          <button
            onClick={markArrived}
            disabled={
              data.arrived ||
              arrivalLoading
            }
            className="w-full bg-purple-600 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 size={18} />

            {data.arrived
              ? "Arrived"
              : arrivalLoading
              ? "Updating..."
              : "I've Arrived"}
          </button>

          <button
            onClick={openUber}
            className="w-full bg-black border border-zinc-700 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
          >
            <Car size={18} />
            Ride with Uber
          </button>

          <button
            onClick={openBolt}
            className="w-full bg-green-500 text-black rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
          >
            <Car size={18} />
            Ride with Bolt
          </button>

          <a
            href={googleMapsLink}
            target="_blank"
            className="w-full bg-zinc-800 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
          >
            <Navigation size={18} />
            Open In Google Maps
          </a>

        </div>

      </div>
    </main>
  );
}