"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import {
  Copy,
  Share2,
  CheckCircle2,
  Mic,
  Car,
} from "lucide-react";

import { QRCodeSVG } from "qrcode.react";

import { supabase } from "../../lib/supabase";

import { speak } from "../../lib/speak";

interface LocationData {
  id: string;

  smart_guide: string;

  phone_number: string;

  bolt_link?: string;

  uber_link?: string;
}

export default function SharePage() {
  const params = useParams();

  const [data, setData] =
    useState<LocationData | null>(null);

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data } =
        await supabase
          .from("locations")
          .select("*")
          .eq("id", params.id)
          .single();

      if (data) {
        setData(data);
      }
    }

    fetchData();
  }, [params]);

  if (!data) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  const shareUrl = `${window.location.origin}/lm/${data.id}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(
      shareUrl
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `📍 LocateMe Location\n\n${shareUrl}`
    );

    window.location.href = `https://wa.me/?text=${text}`;
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">

      <div className="max-w-xl mx-auto">

        <div className="text-center mb-8">

          <div className="flex justify-center mb-4">
            <CheckCircle2
              size={70}
              className="text-green-500"
            />
          </div>

          <h1 className="text-5xl font-bold">
            Link Ready
          </h1>

          <p className="text-zinc-400 mt-3">
            Your LocateMe destination
            is live and ready to share.
          </p>

        </div>

        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-5 space-y-5">

          <div>
            <p className="text-sm text-zinc-400 mb-2">
              Share Link
            </p>

            <div className="bg-zinc-800 rounded-2xl p-4 text-sm break-all">
              {shareUrl}
            </div>
          </div>

          <div className="bg-zinc-800 rounded-2xl p-4">
            <p className="text-sm text-zinc-400 mb-2">
              Smart Guide
            </p>

            <p className="text-sm">
              {data.smart_guide}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 flex justify-center">
            <QRCodeSVG
              value={shareUrl}
              size={220}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">

            <button
              onClick={copyLink}
              className="bg-zinc-800 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
            >
              <Copy size={18} />

              {copied
                ? "Copied"
                : "Copy"}
            </button>

            <button
              onClick={shareWhatsApp}
              className="bg-green-600 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              WhatsApp
            </button>

          </div>

          <button
            onClick={() =>
              speak(data.smart_guide)
            }
            className="w-full bg-blue-600 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
          >
            <Mic size={18} />
            Play Voice Guide
          </button>

          {data.bolt_link && (
            <a
              href={data.bolt_link}
              target="_blank"
              className="w-full bg-lime-500 text-black rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
            >
              <Car size={18} />
              Open Bolt
            </a>
          )}

          {data.uber_link && (
            <a
              href={data.uber_link}
              target="_blank"
              className="w-full bg-white text-black rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
            >
              <Car size={18} />
              Open Uber
            </a>
          )}

        </div>

      </div>

    </main>
  );
}