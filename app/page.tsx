import Link from "next/link";

import {
  MapPin,
  Navigation,
  Shield,
  Smartphone,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      <div className="max-w-6xl mx-auto px-6 py-8">

        <nav className="flex items-center justify-between">

          <h1 className="text-3xl font-bold">
            LocateMe
          </h1>

          <div className="flex items-center gap-3">

            <Link
              href="/dashboard"
              className="text-zinc-400 hover:text-white transition"
            >
              Dashboard
            </Link>

            <Link
              href="/create"
              className="bg-white text-black px-5 py-3 rounded-2xl font-semibold hover:scale-105 transition"
            >
              Create Link
            </Link>

          </div>

        </nav>

        <section className="pt-24 pb-20 text-center">

          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-300 mb-8">
            <MapPin size={15} />
            Smart Location Sharing
          </div>

          <h2 className="text-6xl md:text-7xl font-black leading-tight max-w-4xl mx-auto">
            Share locations
            <br />
            the smart African way.
          </h2>

          <p className="text-zinc-400 text-xl mt-8 max-w-2xl mx-auto leading-relaxed">
            Send precise directions using landmarks,
            building colors, gate sides, voice guidance
            and live maps.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">

            <Link
              href="/create"
              className="bg-green-500 hover:bg-green-400 text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition"
            >
              Start Sharing
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/dashboard"
              className="border border-zinc-700 hover:border-zinc-500 px-8 py-4 rounded-2xl font-semibold transition"
            >
              View Dashboard
            </Link>

          </div>

        </section>

        <section className="grid md:grid-cols-3 gap-6 pb-20">

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

            <div className="bg-green-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-5">
              <Navigation size={28} />
            </div>

            <h3 className="text-2xl font-bold mb-3">
              Precise Directions
            </h3>

            <p className="text-zinc-400 leading-relaxed">
              Use landmarks, apartment sides,
              floor numbers and custom arrival notes.
            </p>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

            <div className="bg-blue-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-5">
              <Smartphone size={28} />
            </div>

            <h3 className="text-2xl font-bold mb-3">
              Mobile First
            </h3>

            <p className="text-zinc-400 leading-relaxed">
              Designed for WhatsApp sharing,
              QR codes and mobile navigation.
            </p>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

            <div className="bg-purple-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-5">
              <Shield size={28} />
            </div>

            <h3 className="text-2xl font-bold mb-3">
              Safe & Reliable
            </h3>

            <p className="text-zinc-400 leading-relaxed">
              Real-time location storage with
              instant access links and voice guidance.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}