"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import {
  MapPin,
  ExternalLink,
  Clock3,
  Plus,
  CheckCircle2,
  Car,
  BellRing,
  Sparkles,
  Navigation,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

interface LocationData {
  id: string;

  landmark: string;

  place_name: string;

  created_at: string;

  arrived: boolean;

  latitude: number;

  longitude: number;
}

export default function DashboardPage() {
  const params = useParams();

  const dashboardId =
    params.id as string;

  const [
    recentLocations,
    setRecentLocations,
  ] = useState<LocationData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showArrivalPopup, setShowArrivalPopup] =
    useState(false);

  const [arrivalPlace, setArrivalPlace] =
    useState("");

  const timeoutRef =
    useRef<NodeJS.Timeout | null>(
      null
    );

  useEffect(() => {
    fetchLocations();

    if (
      "Notification" in window &&
      Notification.permission !==
        "granted"
    ) {
      Notification.requestPermission();
    }

    const channel =
      supabase.channel(
        `dashboard-${dashboardId}`
      );

    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "locations",
        },
        (payload) => {
          const updated =
            payload.new as LocationData;

          setRecentLocations(
            (prev) =>
              prev.map((loc) =>
                loc.id === updated.id
                  ? {
                      ...loc,
                      arrived:
                        updated.arrived,
                    }
                  : loc
              )
          );

          if (updated.arrived) {
            const place =
              updated.place_name ||
              updated.landmark ||
              "Destination";

            setArrivalPlace(place);

            setShowArrivalPopup(
              true
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
              "Notification" in
                window &&
              Notification.permission ===
                "granted"
            ) {
              new Notification(
                "LocateMe Arrival",
                {
                  body: `Receiver arrived at ${place}`,
                }
              );
            }

            if (
              timeoutRef.current
            ) {
              clearTimeout(
                timeoutRef.current
              );
            }

            timeoutRef.current =
              setTimeout(() => {
                setShowArrivalPopup(
                  false
                );
              }, 6500);
          }
        }
      )
      .subscribe();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(
          timeoutRef.current
        );
      }

      supabase.removeChannel(
        channel
      );
    };
  }, []);

  const fetchLocations =
    async () => {

      const { data, error } =
        await supabase
          .from("locations")
          .select(
            `
            id,
            landmark,
            place_name,
            created_at,
            arrived,
            latitude,
            longitude
          `
          )
          .eq(
            "dashboard_id",
            dashboardId
          )
          .order(
            "created_at",
            { ascending: false }
          );

      if (!error && data) {
        setRecentLocations(data);
      }

      setLoading(false);
    };

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString();
  };

  return (
    <>
      {showArrivalPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">

          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-pulse" />

          <div className="relative overflow-hidden bg-zinc-900 border border-green-500 rounded-[2rem] p-8 w-full max-w-md shadow-[0_0_100px_rgba(34,197,94,0.45)] animate-bounce">

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-300" />

            <div className="flex items-center justify-center mb-6">

              <div className="relative">

                <div className="absolute inset-0 rounded-full bg-green-500 blur-2xl opacity-60 animate-ping" />

                <div className="relative w-24 h-24 rounded-full bg-green-500 flex items-center justify-center">

                  <CheckCircle2
                    size={50}
                    className="text-black"
                  />

                </div>

              </div>

            </div>

            <div className="text-center">

              <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-lg mb-3">

                <BellRing size={20} />

                LIVE ARRIVAL

                <Sparkles size={18} />

              </div>

              <h2 className="text-3xl font-black mb-4">
                Receiver Arrived
              </h2>

              <p className="text-zinc-300 leading-7 text-lg">
                Someone has arrived at
                <span className="block text-white font-bold text-2xl mt-2">
                  {arrivalPlace}
                </span>
              </p>

            </div>

          </div>

        </div>
      )}

      <main className="min-h-screen bg-black text-white px-4 py-8">

        <div className="max-w-4xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

            <div>

              <h1 className="text-5xl font-black">
                Sender Dashboard
              </h1>

              <p className="text-zinc-400 mt-2">
                Manage and monitor your
                shared locations in real
                time.
              </p>

            </div>

            <Link
              href="/create"
              className="bg-green-500 hover:bg-green-400 text-black px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition hover:scale-[1.02]"
            >
              <Plus size={18} />
              New Location
            </Link>

          </div>

          {loading ? (

            <div className="text-zinc-500 text-lg">
              Loading locations...
            </div>

          ) : recentLocations.length === 0 ? (

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center">

              <h2 className="text-2xl font-bold mb-3">
                No Locations Yet
              </h2>

              <p className="text-zinc-500 mb-6">
                Start by creating your
                first smart location link.
              </p>

              <Link
                href="/create"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-semibold"
              >
                <Plus size={18} />
                Create Location
              </Link>

            </div>

          ) : (

            <div className="grid gap-5">

              {recentLocations.map(
                (loc) => {

                  const encodedName =
                    encodeURIComponent(
                      loc.place_name ||
                        "LocateMe Destination"
                    );

                  const uberLink =
                    `uber://?action=setPickup&dropoff[latitude]=${loc.latitude}&dropoff[longitude]=${loc.longitude}&dropoff[nickname]=${encodedName}`;

                  const boltLink =
                    `https://bolt.eu/launch?lat=${loc.latitude}&lng=${loc.longitude}`;

                  const googleMapsLink =
                    `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`;

                  return (

                    <div
                      key={loc.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition"
                    >

                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                        <div className="flex-1">

                          <div className="flex items-center gap-2 mb-2">

                            <MapPin
                              size={18}
                            />

                            <h2 className="text-2xl font-bold">
                              {loc.place_name ||
                                "Unnamed Place"}
                            </h2>

                          </div>

                          <p className="text-zinc-400 leading-7">
                            {loc.landmark ||
                              "No landmark added"}
                          </p>

                          <div className="flex items-center gap-2 text-zinc-500 text-sm mt-4">

                            <Clock3
                              size={15}
                            />

                            <span>
                              {formatDate(
                                loc.created_at
                              )}
                            </span>

                          </div>

                          {loc.arrived && (

                            <div className="mt-5 bg-green-500 text-black rounded-2xl px-5 py-3 inline-flex items-center gap-2 font-bold">

                              <CheckCircle2
                                size={18}
                              />

                              Receiver Arrived

                            </div>

                          )}

                        </div>

                        <div className="flex flex-col gap-3 w-full lg:w-[230px]">

                          <Link
                            href={`/lm/${loc.id}`}
                            className="bg-white text-black px-5 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
                          >
                            <ExternalLink
                              size={16}
                            />

                            Open Link
                          </Link>

                          <a
                            href={uberLink}
                            className="bg-black border border-zinc-700 px-5 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
                          >
                            <Car size={16} />

                            Uber
                          </a>

                          <a
                            href={boltLink}
                            className="bg-lime-500 text-black px-5 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                          >
                            <Navigation size={16} />

                            Bolt
                          </a>

                          <a
                            href={googleMapsLink}
                            target="_blank"
                            className="bg-zinc-800 px-5 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
                          >
                            <MapPin size={16} />

                            Google Maps
                          </a>

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </div>

      </main>
    </>
  );
}