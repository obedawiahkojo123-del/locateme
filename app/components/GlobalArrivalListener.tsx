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
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function GlobalArrivalListener() {
  const [showPopup, setShowPopup] =
    useState(false);

  const [arrivalPlace, setArrivalPlace] =
    useState("");

  const processedIds =
    useRef<Set<string>>(new Set());

  const timeoutRef =
    useRef<NodeJS.Timeout | null>(
      null
    );

  useEffect(() => {
    if (
      typeof window === "undefined"
    )
      return;

    if (
      "Notification" in window &&
      Notification.permission !==
        "granted"
    ) {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel("global-arrivals-live")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "locations",
        },
        (payload: any) => {
          const newData =
            payload.new;

          const oldData =
            payload.old;

          if (
            newData.arrived ===
              true &&
            oldData.arrived ===
              false
          ) {
            if (
              processedIds.current.has(
                newData.id
              )
            ) {
              return;
            }

            processedIds.current.add(
              newData.id
            );

            const place =
              newData.place_name ||
              newData.landmark ||
              "Destination";

            setArrivalPlace(place);

            setShowPopup(true);

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
                  body: `Visitor arrived at ${place}`,
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
                setShowPopup(false);
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

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-6">

      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <div className="relative overflow-hidden bg-zinc-900 border border-green-500 rounded-[2rem] p-8 w-full max-w-md shadow-[0_0_100px_rgba(34,197,94,0.45)]">

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
            Visitor Arrived
          </h2>

          <p className="text-zinc-300 leading-7 text-lg">
            Your visitor has arrived at
            <span className="block text-white font-bold text-2xl mt-2">
              {arrivalPlace}
            </span>
          </p>

        </div>

      </div>

    </div>
  );
}