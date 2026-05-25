"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

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
  CheckCircle2,
  LayoutDashboard,
  Sparkles,
  LocateFixed,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { QRCodeSVG } from "qrcode.react";

import { supabase } from "../lib/supabase";

import "leaflet/dist/leaflet.css";

const MapView = dynamic(
  () => import("../components/MapView"),
  {
    ssr: false,
  }
);

const STORAGE_KEY =
  "locateme_create_draft";

export default function CreatePage() {
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

  const [dashboardUrl, setDashboardUrl] =
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

  const [placeName, setPlaceName] =
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

    restoreDraft();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    saveDraft();
  }, [
    landmark,
    buildingColor,
    apartmentSide,
    floorNote,
    arrivalNote,
    phoneNumber,
    placeName,
    position,
    mounted,
    generatedGuide,
    shareUrl,
    dashboardUrl,
  ]);

  const saveDraft = () => {
    const draft = {
      landmark,
      buildingColor,
      apartmentSide,
      floorNote,
      arrivalNote,
      phoneNumber,
      placeName,
      position,
      shareUrl,
      dashboardUrl,
      generatedGuide,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(draft)
    );
  };

  const restoreDraft = () => {
    try {
      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!raw) return;

      const draft = JSON.parse(raw);

      setLandmark(
        draft.landmark || ""
      );

      setBuildingColor(
        draft.buildingColor || ""
      );

      setApartmentSide(
        draft.apartmentSide || ""
      );

      setFloorNote(
        draft.floorNote || ""
      );

      setArrivalNote(
        draft.arrivalNote || ""
      );

      setPhoneNumber(
        draft.phoneNumber || ""
      );

      setPlaceName(
        draft.placeName || ""
      );

      setGeneratedGuide(
        draft.generatedGuide || ""
      );

      if (draft.position) {
        setPosition(draft.position);
      }

      if (draft.shareUrl) {
        setShareUrl(
          draft.shareUrl
        );
      }

      if (draft.dashboardUrl) {
        setDashboardUrl(
          draft.dashboardUrl
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(
      STORAGE_KEY
    );

    setLandmark("");
    setBuildingColor("");
    setApartmentSide("");
    setFloorNote("");
    setArrivalNote("");
    setPhoneNumber("");
    setPlaceName("");
    setGeneratedGuide("");
    setShareUrl("");
    setDashboardUrl("");

    alert("Draft cleared.");
  };

  const fetchLocation = async () => {
    try {
      setLoading(true);

      if (
        typeof window === "undefined"
      ) {
        return;
      }

      if (
        !("geolocation" in navigator)
      ) {
        alert(
          "Geolocation is not supported on this device."
        );

        setLoading(false);

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([
            pos.coords.latitude,
            pos.coords.longitude,
          ]);

          setLoading(false);
        },

        (error) => {
          console.log(error);

          if (
            error.code === 1
          ) {
            alert(
              "Location permission denied."
            );
          } else if (
            error.code === 2
          ) {
            alert(
              "Location unavailable."
            );
          } else {
            alert(
              "Could not fetch your location."
            );
          }

          setLoading(false);
        },

        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );
    } catch (err) {
      console.log(err);

      alert(
        "Failed to access location."
      );

      setLoading(false);
    }
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

    if (!text) return;

    const speech =
      new SpeechSynthesisUtterance(
        text
      );

    speech.rate = 0.92;

    speech.pitch = 1;

    window.speechSynthesis.cancel();

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

      const dashboardId =
        Math.random()
          .toString(36)
          .substring(2, 12);

      const { error } =
        await supabase
          .from("locations")
          .insert({
            id,

            dashboard_id:
              dashboardId,

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

            place_name:
              placeName,

            arrived: false,
          });

      if (error) {
        console.log(error);

        alert(error.message);

        setLoading(false);

        return;
      }

      const url = `${window.location.origin}/lm/${id}`;

      const dash =
        `${window.location.origin}/dashboard/${dashboardId}`;

      setShareUrl(url);

      setDashboardUrl(dash);

      setLoading(false);

      saveDraft();

      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    } catch (err) {
      console.log(err);

      alert(
        "Something went wrong."
      );

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
      `📍 *LocateMe Smart Location*\n\n${placeName || "Destination"}\n\n${shareUrl}\n\n🧭 Smart Guide:\n${generatedGuide}`
    );

    window.open(
      `https://wa.me/?text=${text}`,
      "_blank"
    );
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black text-white px-4 py-6">

      <div className="max-w-2xl mx-auto">

        <div className="mb-8">

          <div className="flex items-center gap-2 text-green-400 mb-4">
            <Sparkles size={18} />

            <span className="text-sm font-semibold">
              Elite Navigation System
            </span>

          </div>

          <h1 className="text-5xl font-black tracking-tight">
            LocateMe
          </h1>

          <p className="text-zinc-400 mt-3 text-lg leading-7">
            Smart African location sharing
            with live arrival tracking.
          </p>

        </div>

        <div className="rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">

          {leafletIcon && (
            <MapView
              position={position}
              setPosition={setPosition}
              draggable={true}
            />
          )}

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

          <button
            onClick={fetchLocation}
            className="bg-white text-black rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] transition"
          >
            <LocateFixed size={18} />

            {loading
              ? "Fetching..."
              : "Use Live Location"}
          </button>

          <button
            onClick={clearDraft}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Clear Draft
          </button>

        </div>

        <div className="mt-6 space-y-4">

          <InputCard
            icon={<MapPin size={16} />}
            title="Place Name"
          >
            <input
              type="text"
              placeholder="Home, Office, Hostel..."
              value={placeName}
              onChange={(e) =>
                setPlaceName(
                  e.target.value
                )
              }
              className="input"
            />
          </InputCard>

          <InputCard
            icon={<MapPin size={16} />}
            title="Landmark"
          >
            <input
              type="text"
              placeholder="Near Shell station"
              value={landmark}
              onChange={(e) =>
                setLandmark(
                  e.target.value
                )
              }
              className="input"
            />
          </InputCard>

          <InputCard
            icon={<Building2 size={16} />}
            title="Building Color"
          >
            <input
              type="text"
              placeholder="Blue building"
              value={buildingColor}
              onChange={(e) =>
                setBuildingColor(
                  e.target.value
                )
              }
              className="input"
            />
          </InputCard>

          <InputCard
            icon={<Home size={16} />}
            title="Apartment / Gate Side"
          >
            <input
              type="text"
              placeholder="Second gate on left"
              value={apartmentSide}
              onChange={(e) =>
                setApartmentSide(
                  e.target.value
                )
              }
              className="input"
            />
          </InputCard>

          <InputCard
            icon={<Layers3 size={16} />}
            title="Floor / Room"
          >
            <input
              type="text"
              placeholder="Top floor room 4"
              value={floorNote}
              onChange={(e) =>
                setFloorNote(
                  e.target.value
                )
              }
              className="input"
            />
          </InputCard>

          <InputCard
            icon={<StickyNote size={16} />}
            title="Arrival Note"
          >
            <textarea
              placeholder="Call when you arrive"
              value={arrivalNote}
              onChange={(e) =>
                setArrivalNote(
                  e.target.value
                )
              }
              className="input h-28 resize-none"
            />
          </InputCard>

          <InputCard
            icon={<Phone size={16} />}
            title="Phone Number"
          >
            <input
              type="text"
              placeholder="+233..."
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(
                  e.target.value
                )
              }
              className="input"
            />
          </InputCard>

        </div>

        <button
          onClick={createLink}
          disabled={loading}
          className="w-full mt-6 bg-green-500 hover:bg-green-400 transition rounded-2xl py-5 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <MapPin size={20} />

          {loading
            ? "Generating..."
            : "Generate LocateMe Link"}
        </button>

        {shareUrl && (
          <div className="mt-6 bg-zinc-900 rounded-3xl p-5 border border-zinc-800 space-y-5">

            <div className="flex items-center gap-2 text-green-400 font-semibold">
              <CheckCircle2 size={18} />
              Location Generated
            </div>

            <div className="bg-zinc-800 rounded-2xl p-4">

              <p className="text-sm text-zinc-400 mb-2">
                Share Link
              </p>

              <div className="break-all text-sm">
                {shareUrl}
              </div>

            </div>

            <div className="bg-zinc-800 rounded-2xl p-4">

              <div className="flex items-center gap-2 mb-3 text-green-400">

                <ShieldCheck size={16} />

                Smart Guide

              </div>

              <p className="leading-7 text-sm">
                {generatedGuide}
              </p>

            </div>

            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={copyLink}
                className="bg-zinc-800 rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
              >
                <Copy size={16} />

                {copied
                  ? "Copied"
                  : "Copy"}
              </button>

              <button
                onClick={shareWhatsApp}
                className="bg-green-600 rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
              >
                <Share2 size={16} />
                WhatsApp
              </button>

            </div>

            <Link
              href={dashboardUrl}
              className="w-full bg-purple-600 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={18} />
              Open Sender Dashboard
            </Link>

            <div className="bg-white rounded-3xl p-5 flex justify-center">

              <QRCodeSVG
                value={shareUrl}
                size={190}
              />

            </div>

            <button
              onClick={speakGuide}
              className="w-full bg-blue-600 rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
            >
              <Mic size={18} />
              Play Voice Guidance
            </button>

          </div>
        )}

      </div>

    </main>
  );
}

function InputCard({
  icon,
  title,
  children,
}: any) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">

      <label className="text-sm text-zinc-400 flex items-center gap-2 mb-3">
        {icon}
        {title}
      </label>

      {children}

    </div>
  );
}