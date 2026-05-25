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
  ArrowRight,
  ExternalLink,
  Sparkles,
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

  const [isMobile, setIsMobile] =
    useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(
        /iPhone|iPad|iPod|Android/i.test(
          navigator.userAgent
        )
      );
    }

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
    const channel = supabase
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
              true &&
            payload.old.arrived ===
              false
          ) {
            setData((prev: any) => ({
              ...prev,
              arrived: true,
            }));

            speak(
              "Receiver has arrived at destination"
            );

            try {
              const audio =
                new Audio(
                  "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
                );

              audio.volume = 1;

              audio.play();
            } catch (err) {
              console.log(err);
            }

            if (
              "Notification" in window &&
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

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  };

  const getDistance = (
    destination: LocationData
  ) => {
    if (
      typeof navigator ===
      "undefined"
    )
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

          try {
            const audio =
              new Audio(
                "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
              );

            audio.play();
          } catch (err) {
            console.log(err);
          }

          alert(
            "Sender notified successfully."
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
        Location not found.
      </main>
    );
  }

  const destinationLabel =
    data.place_name ||
    data.landmark ||
    "LocateMe Destination";

  const googleMapsLink =
    `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}&travelmode=driving`;

  const appleMapsLink =
    `http://maps.apple.com/?daddr=${data.latitude},${data.longitude}`;

  const uberDeepLink =
    `uber://?action=setPickup&pickup=my_location&dropoff[latitude]=${data.latitude}&dropoff[longitude]=${data.longitude}&dropoff[nickname]=${encodeURIComponent(
      destinationLabel
    )}`;

  const uberFallbackLink =
    `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${data.latitude}&dropoff[longitude]=${data.longitude}&dropoff[nickname]=${encodeURIComponent(
      destinationLabel
    )}`;

  const openUber = () => {
    if (isMobile) {
      window.location.href =
        uberDeepLink;

      setTimeout(() => {
        window.location.href =
          uberFallbackLink;
      }, 1400);
    } else {
      window.open(
        uberFallbackLink,
        "_blank"
      );
    }
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

        <div className="mb-7">

          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm mb-5">

            <Sparkles size={14} />

            Smart Destination Link

          </div>

          <h1 className="text-5xl font-black leading-tight">
            {destinationLabel}
          </h1>

          <p className="text-zinc-400 mt-3 leading-7">
            Navigate smarter with real-time
            guidance and arrival tracking.
          </p>

        </div>

        <div className="rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
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
          <div className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 flex items-center gap-3 font-semibold animate-pulse">

            <BellRing size={22} />

            <span>
              Arrival confirmed successfully
            </span>

          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

          <button
            onClick={() =>
              window.open(
                googleMapsLink,
                "_blank"
              )
            }
            className="bg-white text-black rounded-2xl py-5 font-bold flex items-center justify-center gap-2"
          >
            <Navigation size={20} />
            Google Maps
          </button>

          <button
            onClick={() =>
              window.open(
                appleMapsLink,
                "_blank"
              )
            }
            className="bg-zinc-900 border border-zinc-800 rounded-2xl py-5 font-bold flex items-center justify-center gap-2"
          >
            <MapPin size={20} />
            Apple Maps
          </button>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">

          <button
            onClick={openUber}
            className="bg-black border border-zinc-700 rounded-2xl py-5 font-bold flex items-center justify-center gap-2 hover:border-zinc-500 transition"
          >
            <Car size={20} />
            Uber Ride
          </button>

          <button
            onClick={openBolt}
            className="bg-green-500 text-black rounded-2xl py-5 font-bold flex items-center justify-center gap-2 hover:bg-green-400 transition"
          >
            <Car size={20} />
            Bolt Ride
          </button>

        </div>

        <div className="mt-5 space-y-4">

          <InfoCard
            icon={<MapPin size={18} />}
            title="Landmark"
            value={data.landmark || "N/A"}
          />

          <InfoCard
            icon={<Building2 size={18} />}
            title="Building Color"
            value={
              data.building_color || "N/A"
            }
          />

          <InfoCard
            icon={<Home size={18} />}
            title="Apartment / Gate Side"
            value={
              data.apartment_side || "N/A"
            }
          />

          <InfoCard
            icon={<Layers3 size={18} />}
            title="Floor / Room"
            value={
              data.floor_note || "N/A"
            }
          />

          <InfoCard
            icon={<StickyNote size={18} />}
            title="Arrival Note"
            value={
              data.arrival_note ||
              "No extra note"
            }
          />

          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">

            <p className="text-sm text-zinc-400 mb-3">
              Smart Guidance
            </p>

            <p className="leading-8 text-zinc-100">
              {data.smart_guide}
            </p>

          </div>

          <button
            onClick={() =>
              speak(data.smart_guide)
            }
            className="w-full bg-blue-600 rounded-2xl py-5 font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition"
          >
            <Volume2 size={18} />
            Play Voice Guide
          </button>

          {data.phone_number && (
            <a
              href={`tel:${data.phone_number}`}
              className="w-full bg-zinc-800 rounded-2xl py-5 font-bold flex items-center justify-center gap-2 hover:bg-zinc-700 transition"
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
            className="w-full bg-purple-600 rounded-2xl py-5 font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-purple-500 transition"
          >
            <CheckCircle2 size={18} />

            {data.arrived
              ? "Arrival Confirmed"
              : arrivalLoading
              ? "Updating..."
              : "I've Arrived"}
          </button>

          <a
            href={googleMapsLink}
            target="_blank"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 font-bold flex items-center justify-center gap-2 hover:border-zinc-600 transition"
          >
            <ExternalLink size={18} />

            Open Full Navigation

            <ArrowRight size={18} />

          </a>

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
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex items-start gap-3">

      {icon}

      <div>

        <p className="text-sm text-zinc-400">
          {title}
        </p>

        <p className="font-semibold mt-1 leading-7">
          {value}
        </p>

      </div>

    </div>
  );
}