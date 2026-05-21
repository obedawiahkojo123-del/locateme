"use client";

import type { Metadata } from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

import {
  useEffect,
  useState,
} from "react";

import {
  BellRing,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "./lib/supabase";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LocateMe",
  description:
    "Smart African location sharing platform",
};

function GlobalArrivalListener() {
  const [showPopup, setShowPopup] =
    useState(false);

  const [arrivalPlace, setArrivalPlace] =
    useState("");

  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission !==
        "granted"
    ) {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel("global-arrivals")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "locations",
        },
        (payload: any) => {
          if (
            payload.new.arrived ===
              true &&
            payload.old.arrived ===
              false
          ) {
            const place =
              payload.new.place_name ||
              payload.new.landmark ||
              "Destination";

            setArrivalPlace(place);

            setShowPopup(true);

            const audio =
              new Audio(
                "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
              );

            audio.play();

            if (
              Notification.permission ===
              "granted"
            ) {
              new Notification(
                "LocateMe Arrival",
                {
                  body: `Visitor arrived at ${place}`,
                }
              );
            }

            setTimeout(() => {
              setShowPopup(false);
            }, 6000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, []);

  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">

          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-pulse" />

          <div className="relative bg-zinc-900 border border-green-500 rounded-[2rem] p-8 w-full max-w-md shadow-[0_0_80px_rgba(34,197,94,0.45)] animate-bounce">

            <div className="flex items-center justify-center mb-5">

              <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center">

                <CheckCircle2
                  size={50}
                  className="text-black"
                />

              </div>

            </div>

            <div className="text-center">

              <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-lg mb-3">

                <BellRing size={20} />

                LIVE ARRIVAL
              </div>

              <h2 className="text-3xl font-black mb-3">
                Visitor Arrived
              </h2>

              <p className="text-zinc-300 leading-7">
                Your visitor has arrived at
                <span className="text-white font-bold">
                  {" "}
                  {arrivalPlace}
                </span>
              </p>

            </div>

          </div>

        </div>
      )}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-black text-white antialiased overflow-x-hidden">

        <GlobalArrivalListener />

        {children}

      </body>
    </html>
  );
}