import Link from "next/link";

import {
  MapPin,
  Navigation,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between">

          <h1 className="text-3xl font-black">
            LocateMe
          </h1>

          <Link
            href="/create"
            className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
          >
            Open App
          </Link>

        </div>

        <div className="mt-24 text-center">

          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-sm text-zinc-300">

            <Navigation size={16} />

            Smart African Navigation
          </div>

          <h2 className="text-6xl md:text-7xl font-black mt-8 leading-tight">

            Share locations
            <br />
            the smarter way.

          </h2>

          <p className="text-zinc-400 text-xl mt-8 max-w-2xl mx-auto leading-8">

            Built for apartments, hostels,
            shops, campuses and African
            streets where addresses fail.

          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">

            <Link
              href="/create"
              className="bg-green-500 hover:bg-green-400 transition px-8 py-5 rounded-2xl text-lg font-bold"
            >
              Create Location
            </Link>

            <a
              href="#features"
              className="bg-zinc-900 border border-zinc-800 px-8 py-5 rounded-2xl text-lg font-semibold"
            >
              Explore Features
            </a>

          </div>

        </div>

        <div
          id="features"
          className="grid md:grid-cols-3 gap-6 mt-28"
        >

          <FeatureCard
            icon={<MapPin />}
            title="Smart Directions"
            text="Guide visitors with landmarks, building colors and notes."
          />

          <FeatureCard
            icon={<Smartphone />}
            title="Mobile First"
            text="Designed perfectly for WhatsApp sharing and phone navigation."
          />

          <FeatureCard
            icon={<ShieldCheck />}
            title="Instant Access"
            text="No sign up required. Create and share immediately."
          />

        </div>

      </div>

    </main>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

      <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-5">
        {icon}
      </div>

      <h3 className="text-2xl font-bold">
        {title}
      </h3>

      <p className="text-zinc-400 mt-3 leading-7">
        {text}
      </p>

    </div>
  );
}