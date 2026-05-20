import Link from "next/link";

import {
  MapPin,
  Navigation,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent_40%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-8">

        <nav className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-black">
              <Navigation size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight">
                LocateMe
              </h1>

              <p className="text-zinc-500 text-sm">
                Smart African Navigation
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-5 py-3 rounded-2xl font-semibold transition"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            <Link
              href="/create"
              className="bg-white text-black px-5 py-3 rounded-2xl font-bold hover:scale-[1.02] transition"
            >
              Open App
            </Link>

          </div>

        </nav>

        <section className="pt-24 pb-20 text-center">

          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-5 py-3 rounded-full text-sm text-zinc-300">

            <Sparkles size={16} />

            Built for Africa • GPS + Smart Guidance
          </div>

          <h2 className="text-6xl md:text-8xl font-black mt-10 leading-[0.95] tracking-tight">

            Share locations
            <br />
            smarter & faster.

          </h2>

          <p className="text-zinc-400 text-xl mt-10 max-w-3xl mx-auto leading-9">

            Built for apartments, hostels,
            campuses, shops and African
            streets where normal addresses fail.

            <br />
            Send precise directions with voice guidance,
            live maps, Uber routing and arrival tracking.

          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mt-14">

            <Link
              href="/create"
              className="bg-green-500 hover:bg-green-400 text-black px-10 py-5 rounded-3xl text-lg font-black transition flex items-center justify-center gap-2"
            >
              Create Location
              <ArrowRight size={20} />
            </Link>

            <Link
              href="/dashboard"
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-10 py-5 rounded-3xl text-lg font-bold transition"
            >
              View Dashboard
            </Link>

          </div>

        </section>

        <section
          id="features"
          className="grid md:grid-cols-3 gap-7 pb-24"
        >

          <FeatureCard
            icon={<MapPin />}
            title="Smart Directions"
            text="Guide visitors with landmarks, building colors, apartment sides and voice instructions."
          />

          <FeatureCard
            icon={<Smartphone />}
            title="Mobile First"
            text="Perfect for WhatsApp sharing, Uber routing, Bolt navigation and mobile users."
          />

          <FeatureCard
            icon={<ShieldCheck />}
            title="Live Arrival Status"
            text="Get notified instantly when your visitor arrives at the destination."
          />

        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 md:p-12 mb-16">

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div>

              <p className="text-green-400 font-semibold mb-4">
                WHY LOCATEME?
              </p>

              <h3 className="text-4xl md:text-5xl font-black leading-tight">

                No more
                <br />
                “Where are you?”
                calls.

              </h3>

              <p className="text-zinc-400 mt-6 text-lg leading-8">

                Your visitors get exact guidance,
                navigation apps, smart directions,
                distance calculation and arrival confirmation
                all from one clean link.

              </p>

              <div className="flex gap-4 mt-8">

                <Link
                  href="/create"
                  className="bg-green-500 text-black px-7 py-4 rounded-2xl font-bold"
                >
                  Start Sharing
                </Link>

                <Link
                  href="/dashboard"
                  className="bg-black border border-zinc-700 px-7 py-4 rounded-2xl font-semibold"
                >
                  Dashboard
                </Link>

              </div>

            </div>

            <div className="bg-black border border-zinc-800 rounded-[2rem] p-8">

              <div className="space-y-5">

                <MiniCard
                  title="📍 Live GPS Pin"
                  text="Precise location sharing"
                />

                <MiniCard
                  title="🗣️ Voice Guidance"
                  text="Auto spoken directions"
                />

                <MiniCard
                  title="🚗 Uber + Bolt Support"
                  text="Open navigation instantly"
                />

                <MiniCard
                  title="✅ Arrival Confirmation"
                  text="Know when visitors arrive"
                />

              </div>

            </div>

          </div>

        </section>

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
    <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition rounded-[2rem] p-7">

      <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mb-6">
        {icon}
      </div>

      <h3 className="text-2xl font-black">
        {title}
      </h3>

      <p className="text-zinc-400 mt-4 leading-8">
        {text}
      </p>

    </div>
  );
}

function MiniCard({
  title,
  text,
}: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

      <h4 className="font-bold text-lg">
        {title}
      </h4>

      <p className="text-zinc-400 mt-2">
        {text}
      </p>

    </div>
  );
}