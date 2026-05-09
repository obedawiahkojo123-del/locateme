"use client";

import { useEffect, useMemo, useState } from "react";

import dynamic from "next/dynamic";

import {
  MapPin,
  Share2,
  Navigation,
  Mic,
  Copy,
  Building2,
  Home,
  Layers3,
  StickyNote,
  Phone,
} from "lucide-react";

import { QRCodeSVG } from "qrcode.react";

import { supabase } from "./lib/supabase";

import "leaflet/dist/leaflet.css";

const MapView = dynamic(
  () => import("./components/MapView"),
  {
    ssr: false,
  }
);

export default function HomePage() {
  const [mounted, setMounted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [position, setPosition] =
    useState<[number, number]>([
      5.6037,
      -0.187,
    ]);

  const [shareUrl, setShareUrl] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [landmark, setLandmark] =
    useState("");

  const [
    buildingColor,
    setBuildingColor,
  ] = useState("");

  const [
    apartmentSide,
    setApartmentSide,
  ] = useState("");

  const [floorNote, setFloorNote] =
    useState("");

  const [arrivalNote, setArrivalNote] =
    useState("");

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [
    generatedGuide,
    setGeneratedGuide,
  ] = useState("");

  const leafletIcon = useMemo(() => {
    if (typeof window === "undefined")
      return null;

    const L = require("leaflet");

    return L.icon({
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

      iconSize: [25, 41],

      iconAnchor: [12, 41],
    });
  }, []);

  useEffect(() => {
    setMounted(true);

    fetchLocation();
  }, []);

  const fetchLocation = () => {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([
          pos.coords.latitude,
          pos.coords.longitude,
        ]);

        setLoading(false);
      },

      (err) => {
        console.log(err);

        alert(
          "Could not fetch location"
        );

        setLoading(false);
      },

      {
        enableHighAccuracy: true,

        timeout: 15000,

        maximumAge: 0,
      }
    );
  };

  const generateSmartGuide = () => {
    const parts = [];

    if (landmark)
      parts.push(
        `Near ${landmark}`
      );

    if (buildingColor)
      parts.push(
        `${buildingColor} building`
      );

    if (apartmentSide)
      parts.push(apartmentSide);

    if (floorNote)
      parts.push(floorNote);

    if (arrivalNote)
      parts.push(arrivalNote);

    const text = parts.join(". ");

    setGeneratedGuide(text);

    return text;
  };

  const speakGuide = () => {
    const text =
      generatedGuide ||
      generateSmartGuide();

    const speech =
      new SpeechSynthesisUtterance(
        text
      );

    speech.rate = 0.92;

    window.speechSynthesis.speak(
      speech
    );
  };

  const createLink = async () => {
    try {
      setLoading(true);

      const smartGuide =
        generateSmartGuide();

      const id = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const { error } =
        await supabase
          .from("locations")
          .insert({
            id,

            latitude: position[0],

            longitude: position[1],

            landmark,

            building_color:
              buildingColor,

            apartment_side:
              apartmentSide,

            floor_note:
              floorNote,

            arrival_note:
              arrivalNote,

            phone_number:
              phoneNumber,

            smart_guide:
              smartGuide,

            arrived: false,
          });

      if (error) {
        console.log(error);

        alert(error.message);

        setLoading(false);

        return;
      }

      const url = `${window.location.origin}/lm/${id}`;

      setShareUrl(url);

      setLoading(false);
    } catch (err) {
      console.log(err);

      setLoading(false);
    }
  };

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

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black text-white px-4 py-6">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <h1 className="text-5xl font-bold">
            LocateMe
          </h1>

          <p className="text-zinc-400 mt-2">
            Smart location sharing for
            Africa and beyond.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden border border-zinc-800">
          {leafletIcon && (
            <MapView
              position={position}
              setPosition={setPosition}
              draggable={true}
            />
          )}
        </div>

        <button
          onClick={fetchLocation}
          className="w-full mt-5 bg-white text-black rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
        >
          <Navigation size={18} />

          {loading
            ? "Fetching location..."
            : "Use My Live Location"}
        </button>

        <div className="mt-5 space-y-4">

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">

            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <MapPin size={16} />
              Landmark
            </label>

            <input
              type="text"
              placeholder="Near Shell station"
              value={landmark}
              onChange={(e) =>
                setLandmark(
                  e.target.value
                )
              }
              className="w-full mt-2 bg-zinc-800 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">

            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <Building2 size={16} />
              Building Color
            </label>

            <input
              type="text"
              placeholder="Blue building"
              value={buildingColor}
              onChange={(e) =>
                setBuildingColor(
                  e.target.value
                )
              }
              className="w-full mt-2 bg-zinc-800 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">

            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <Home size={16} />
              Apartment / Gate Side
            </label>

            <input
              type="text"
              placeholder="Second gate on left"
              value={apartmentSide}
              onChange={(e) =>
                setApartmentSide(
                  e.target.value
                )
              }
              className="w-full mt-2 bg-zinc-800 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">

            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <Layers3 size={16} />
              Floor / Room
            </label>

            <input
              type="text"
              placeholder="Top floor room 4"
              value={floorNote}
              onChange={(e) =>
                setFloorNote(
                  e.target.value
                )
              }
              className="w-full mt-2 bg-zinc-800 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">

            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <StickyNote size={16} />
              Arrival Note
            </label>

            <textarea
              placeholder="Call when you arrive"
              value={arrivalNote}
              onChange={(e) =>
                setArrivalNote(
                  e.target.value
                )
              }
              className="w-full mt-2 bg-zinc-800 rounded-xl px-4 py-3 outline-none h-28 resize-none"
            />
          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">

            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <Phone size={16} />
              Phone Number
            </label>

            <input
              type="text"
              placeholder="+233..."
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(
                  e.target.value
                )
              }
              className="w-full mt-2 bg-zinc-800 rounded-xl px-4 py-3 outline-none"
            />
          </div>

        </div>

        <button
          onClick={createLink}
          className="w-full mt-5 bg-green-500 hover:bg-green-400 transition rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
        >
          <MapPin size={18} />
          Generate LocateMe Link
        </button>

        {shareUrl && (
          <div className="mt-5 bg-zinc-900 rounded-3xl p-5 border border-zinc-800 space-y-5">

            <div>
              <p className="text-sm text-zinc-400 mb-2">
                Share Link
              </p>

              <div className="bg-zinc-800 rounded-xl p-3 text-sm break-all">
                {shareUrl}
              </div>
            </div>

            <div className="bg-zinc-800 rounded-2xl p-4">
              <p className="text-sm text-zinc-400 mb-2">
                Smart Guide
              </p>

              <p className="text-sm">
                {generatedGuide}
              </p>
            </div>

            <div className="flex gap-3">

              <button
                onClick={copyLink}
                className="flex-1 bg-zinc-800 rounded-xl py-3 flex items-center justify-center gap-2"
              >
                <Copy size={16} />

                {copied
                  ? "Copied"
                  : "Copy"}
              </button>

              <button
                onClick={shareWhatsApp}
                className="flex-1 bg-green-600 rounded-xl py-3 flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                WhatsApp
              </button>

            </div>

            <div className="bg-white rounded-2xl p-5 flex justify-center">
              <QRCodeSVG
                value={shareUrl}
                size={180}
              />
            </div>

            <button
              onClick={speakGuide}
              className="w-full bg-blue-600 rounded-xl py-3 flex items-center justify-center gap-2"
            >
              <Mic size={18} />
              Voice Guidance
            </button>

          </div>
        )}

      </div>
    </main>
  );
}