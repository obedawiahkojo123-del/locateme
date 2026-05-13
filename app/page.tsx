"use client";

import { useEffect, useState } from "react";

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
  Loader2,
} from "lucide-react";

import { QRCodeSVG } from "qrcode.react";

import { supabase } from "./lib/supabase";

import "leaflet/dist/leaflet.css";

const MapView = dynamic(
  () => import("./components/MapView"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] bg-zinc-900 animate-pulse rounded-3xl" />
    ),
  }
);

export default function HomePage() {
  const [mounted, setMounted] =
    useState(false);

  const [loadingLocation, setLoadingLocation] =
    useState(false);

  const [creating, setCreating] =
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

  const [placeName, setPlaceName] =
    useState("");

  const [
    generatedGuide,
    setGeneratedGuide,
  ] = useState("");

  useEffect(() => {
    setMounted(true);

    setTimeout(() => {
      fetchLocation();
    }, 800);
  }, []);

  const fetchLocation = async () => {
    try {
      setLoadingLocation(true);

      if (
        typeof window === "undefined"
      ) {
        return;
      }

      if (
        !navigator.geolocation
      ) {
        alert(
          "Geolocation is not supported on this device."
        );

        setLoadingLocation(false);

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([
            pos.coords.latitude,
            pos.coords.longitude,
          ]);

          setLoadingLocation(false);
        },

        (err) => {
          console.log(err);

          let message =
            "Unable to fetch your location.";

          if (
            err.code === 1
          ) {
            message =
              "Location permission denied. Please allow location access in Safari or Chrome.";
          }

          if (
            err.code === 2
          ) {
            message =
              "Location unavailable. Please try again.";
          }

          if (
            err.code === 3
          ) {
            message =
              "Location request timed out.";
          }

          alert(message);

          setLoadingLocation(false);
        },

        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );
    } catch (err) {
      console.log(err);

      setLoadingLocation(false);
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

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(
        text
      );

    speech.rate = 0.92;

    speech.pitch = 1;

    window.speechSynthesis.speak(
      speech
    );
  };

  const createLink = async () => {
    try {
      setCreating(true);

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

            place_name:
              placeName,

            arrived: false,
          });

      if (error) {
        console.log(error);

        alert(error.message);

        setCreating(false);

        return;
      }

      const url = `${window.location.origin}/lm/${id}`;

      setShareUrl(url);

      setCreating(false);
    } catch (err) {
      console.log(err);

      alert(
        "Something went wrong."
      );

      setCreating(false);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;

    await navigator.clipboard.writeText(
      shareUrl
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const shareWhatsApp = () => {
    if (!shareUrl) return;

    const text = encodeURIComponent(
      `📍 LocateMe Location\n\n${shareUrl}`
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
          <h1 className="text-5xl font-black tracking-tight">
            LocateMe
          </h1>

          <p className="text-zinc-400 mt-3 text-lg leading-7">
            Smart location sharing for
            Africa and beyond.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden border border-zinc-800">
          <MapView
            position={position}
            setPosition={setPosition}
            draggable={true}
          />
        </div>

        <button
          onClick={fetchLocation}
          disabled={loadingLocation}
          className="w-full mt-5 bg-white disabled:opacity-70 text-black rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
        >
          {loadingLocation ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <Navigation size={18} />
          )}

          {loadingLocation
            ? "Fetching location..."
            : "Use My Live Location"}
        </button>

        <div className="mt-6 space-y-4">

          <InputCard
            icon={<MapPin size={16} />}
            title="Place Name"
          >
            <input
              type="text"
              placeholder="Home, Office, Shop..."
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
          disabled={creating}
          className="w-full mt-6 bg-green-500 hover:bg-green-400 disabled:opacity-70 transition rounded-2xl py-5 font-bold text-lg flex items-center justify-center gap-2"
        >
          {creating ? (
            <Loader2
              size={20}
              className="animate-spin"
            />
          ) : (
            <MapPin size={20} />
          )}

          {creating
            ? "Generating..."
            : "Generate LocateMe Link"}
        </button>

        {shareUrl && (
          <div className="mt-6 bg-zinc-900 rounded-3xl p-5 border border-zinc-800 space-y-5">

            <div className="flex items-center gap-2 text-green-400 font-semibold">
              <CheckCircle2 size={18} />
              Link Generated Successfully
            </div>

            <div className="bg-zinc-800 rounded-xl p-4 text-sm break-all">
              {shareUrl}
            </div>

            <div className="bg-zinc-800 rounded-2xl p-4">
              <p className="text-sm text-zinc-400 mb-2">
                Smart Guide
              </p>

              <p className="text-sm leading-7">
                {generatedGuide}
              </p>
            </div>

            <div className="flex gap-3">

              <button
                onClick={copyLink}
                className="flex-1 bg-zinc-800 rounded-xl py-4 flex items-center justify-center gap-2"
              >
                <Copy size={16} />

                {copied
                  ? "Copied"
                  : "Copy"}
              </button>

              <button
                onClick={shareWhatsApp}
                className="flex-1 bg-green-600 rounded-xl py-4 flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                WhatsApp
              </button>

            </div>

            <div className="bg-white rounded-2xl p-5 flex justify-center">
              <QRCodeSVG
                value={shareUrl}
                size={190}
              />
            </div>

            <button
              onClick={speakGuide}
              className="w-full bg-blue-600 rounded-xl py-4 flex items-center justify-center gap-2 font-semibold"
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