"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  MapPin,
  ExternalLink,
  Clock3,
  Plus,
} from "lucide-react";

import { supabase } from "../lib/supabase";

interface LocationData {
  id: string;

  landmark: string;

  place_name: string;

  created_at: string;
}

export default function DashboardPage() {
  const [
    recentLocations,
    setRecentLocations,
  ] = useState<LocationData[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations =
    async () => {

      const { data, error } =
        await supabase
          .from("locations")
          .select(
            "id, landmark, place_name, created_at"
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
    <main className="min-h-screen bg-black text-white px-4 py-8">

      <div className="max-w-4xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

          <div>

            <h1 className="text-5xl font-black">
              Dashboard
            </h1>

            <p className="text-zinc-400 mt-2">
              Manage all your shared locations.
            </p>

          </div>

          <Link
            href="/create"
            className="bg-green-500 hover:bg-green-400 text-black px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition"
          >
            <Plus size={18} />
            New Location
          </Link>

        </div>

        {loading ? (

          <div className="text-zinc-500">
            Loading locations...
          </div>

        ) : recentLocations.length === 0 ? (

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center">

            <h2 className="text-2xl font-bold mb-3">
              No Locations Yet
            </h2>

            <p className="text-zinc-500 mb-6">
              Start by creating your first
              smart location link.
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

          <div className="grid gap-4">

            {recentLocations.map(
              (loc) => (

                <div
                  key={loc.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 hover:border-zinc-700 transition"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex-1">

                      <div className="flex items-center gap-2 mb-2">

                        <MapPin
                          size={17}
                        />

                        <h2 className="text-xl font-bold">
                          {loc.place_name ||
                            "Unnamed Place"}
                        </h2>

                      </div>

                      <p className="text-zinc-400">
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

                    </div>

                    <Link
                      href={`/lm/${loc.id}`}
                      className="bg-white text-black px-5 py-3 rounded-2xl font-semibold flex items-center gap-2"
                    >
                      <ExternalLink
                        size={16}
                      />

                      Open
                    </Link>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </main>
  );
}