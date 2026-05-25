"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  BellRing,
  CheckCircle2,
  Sparkles,
  MapPin,
} from "lucide-react";

import { supabase } from "../lib/supabase";

interface ArrivalPayload {
  id: string;
  place_name?: string;
  landmark?: string;
  arrived: boolean;
}

export default function GlobalArrivalListener() {
  const [showPopup, setShowPopup] =
    useState(false);

  const [arrivalPlace, setArrivalPlace] =
    useState("");

  const [arrivalTime, setArrivalTime] =
    useState("");

  const timeoutRef =
    useRef<NodeJS.Timeout | null>(
      null
    );

  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    if (
      "Notification" in window &&
      Notification.permission !==
        "granted"
    ) {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel(
        `global-arrivals-live`
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "locations",
        },
        (payload: any) => {
          const oldData =
            payload.old as ArrivalPayload;

          const newData =
            payload.new as ArrivalPayload;

          if (
            newData.arrived ===
              true &&
            oldData.arrived ===
              false
          ) {
            const place =
              newData.place_name ||
              newData.landmark ||
              "Destination";

            setArrivalPlace(place);

            setArrivalTime(
              new Date().toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
            );

            setShowPopup(true);

            try {
              const successAudio =
                new Audio(
                  "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg"
                );

              successAudio.volume =
                1;

              successAudio.play();
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
                  body: `Visitor arrived at ${place}`,
                  icon: "/icon.png",
                }
              );
            }

            if (
              navigator.vibrate
            ) {
              navigator.vibrate([
                300,
                100,
                300,
              ]);
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
                setShowPopup(false);
              }, 7000);
          }
        }
      )
      .subscribe();

    return () => {
      if (
        timeoutRef.current
      ) {
        clearTimeout(
          timeoutRef.current
        );
      }

      supabase.removeChannel(
        channel
      );
    };
  }, []);

  if (!showPopup) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center px-5">

      <div className="absolute inset-0 bg-black/85 backdrop-blur-md animate-pulse" />

      <div className="relative overflow-hidden bg-zinc-900 border border-green-500 rounded-[2.3rem] p-8 w-full max-w-md shadow-[0_0_120px_rgba(34,197,94,0.45)] animate-[bounce_1s_ease-in-out]">

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-lime-300" />

        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/20 blur-3xl rounded-full" />

        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full" />

        <div className="flex items-center justify-center mb-6">

          <div className="relative">

            <div className="absolute inset-0 rounded-full bg-green-500 blur-2xl opacity-70 animate-ping" />

            <div className="relative w-28 h-28 rounded-full bg-green-500 flex items-center justify-center border-4 border-white/10">

              <CheckCircle2
                size={56}
                className="text-black"
              />

            </div>

          </div>

        </div>

        <div className="text-center">

          <div className="inline-flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full font-bold text-sm mb-5">

            <BellRing size={18} />

            LIVE ARRIVAL

            <Sparkles size={16} />

          </div>

          <h2 className="text-4xl font-black mb-4 leading-tight">

            Visitor
            <br />
            Arrived Successfully

          </h2>

          <div className="bg-black/40 border border-zinc-800 rounded-2xl p-5 mb-5">

            <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm mb-2">

              <MapPin size={15} />

              Destination

            </div>

            <p className="text-2xl font-black text-white leading-tight">
              {arrivalPlace}
            </p>

          </div>

          <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">

            <span>
              Confirmed at
            </span>

            <span className="text-white font-semibold">
              {arrivalTime}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}