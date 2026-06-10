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
  BellRing,
} from "lucide-react";

import { QRCodeSVG } from "qrcode.react";

import { supabase } from "../lib/supabase";

import { speak } from "../lib/speak";

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

  const [draftLoaded, setDraftLoaded] =
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

  const [showArrivalPopup, setShowArrivalPopup] =
    useState(false);

  const [arrivalPlace, setArrivalPlace] =
    useState("");

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

    setDraftLoaded(true);

    if (
      "Notification" in window &&
      Notification.permission !==
        "granted"
    ) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!mounted || !draftLoaded)
      return;

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
    draftLoaded,
  ]);

  useEffect(() => {
    if (!shareUrl) return;

    const locationId =
      shareUrl.split("/lm/")[1];

    if (!locationId) return;

    const channel = supabase
      .channel(`creator-${locationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "locations",
          filter: `id=eq.${locationId}`,
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

            setShowArrivalPopup(true);

            speak(
              `Visitor arrived at ${place}`
            );

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
              "Notification" in
                window &&
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
              setShowArrivalPopup(
                false
              );
            }, 6500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [shareUrl]);

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
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(draft)
    );
  };

  const restoreDraft = () => {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) return;

    try {
      const draft = JSON.parse(raw);

      if (draft.landmark)
        setLandmark(draft.landmark);

      if (draft.buildingColor)
        setBuildingColor(
          draft.buildingColor
        );

      if (draft.apartmentSide)
        setApartmentSide(
          draft.apartmentSide
        );

      if (draft.floorNote)
        setFloorNote(
          draft.floorNote
        );

      if (draft.arrivalNote)
        setArrivalNote(
          draft.arrivalNote
        );

      if (draft.phoneNumber)
        setPhoneNumber(
          draft.phoneNumber
        );

      if (draft.placeName)
        setPlaceName(
          draft.placeName
        );

      if (draft.position)
        setPosition(draft.position);
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
    setPosition([
      5.6037,
      -0.187,
    ]);
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

    speak(text);
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
          .substring(2, 10);

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

      localStorage.removeItem(
        STORAGE_KEY
      );

      setLoading(false);
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
      `📍 LocateMe Location\n\n${shareUrl}`
    );

    window.location.href =
      `https://wa.me/?text=${text}`;
  };

  if (!mounted) return null;

  return (
    <>
      {showArrivalPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">

          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-pulse" />

          <div className="relative overflow-hidden bg-zinc-900 border border-green-500 rounded-[2rem] p-8 w-full max-w-md shadow-[0_0_100px_rgba(34,197,94,0.45)] animate-bounce">

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
                Your visitor has successfully
                arrived at
                <span className="block text-white font-bold text-2xl mt-2">
                  {arrivalPlace}
                </span>
              </p>

            </div>

          </div>

        </div>
      )}

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
              Smart location sharing for
              Africa and beyond.
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

          <button
            onClick={fetchLocation}
            className="w-full mt-5 bg-white text-black rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] transition"
          >

            <Navigation size={18} />

            {loading
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
            className="w-full mt-6 bg-green-500 hover:bg-green-400 transition rounded-2xl py-5 font-bold text-lg flex items-center justify-center gap-2"
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

                Link Generated Successfully

              </div>

              <div>

                <p className="text-sm text-zinc-400 mb-2">
                  Share Link
                </p>

                <div className="bg-zinc-800 rounded-xl p-4 text-sm break-all">

                  {shareUrl}

                </div>

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

              <Link
                href={dashboardUrl}
                className="w-full bg-purple-600 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
              >

                <LayoutDashboard size={18} />

                Open Sender Dashboard

              </Link>

              <button
                onClick={clearDraft}
                className="w-full bg-zinc-800 rounded-2xl py-4 font-semibold"
              >
                Clear Draft
              </button>

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
    </>
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