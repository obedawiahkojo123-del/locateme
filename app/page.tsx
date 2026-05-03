"use client";

import { useState } from "react";

export default function Home() {
  const [locationLink, setLocationLink] = useState("");
  const [landmark, setLandmark] = useState("");
  const [status, setStatus] = useState("");

  const getLocation = () => {
    setStatus("Starting GPS...");

    if (!navigator.geolocation) {
      setStatus("GPS not supported on this device");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        const link = `https://maps.google.com/?q=${latitude},${longitude}`;

        setLocationLink(link);
        setStatus(`GPS success ✅ (±${Math.round(accuracy)} meters)`);
      },
      (err) => {
        console.error(err);

        let message = "Unknown error";

        if (err.code === 1) message = "Permission denied ❌";
        if (err.code === 2) message = "Location unavailable ❌";
        if (err.code === 3) message = "Request timeout ❌";

        setStatus(`GPS failed: ${message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  const shareWhatsApp = () => {
    if (!locationLink) return;

    const message = `Here’s my exact location for delivery: ${locationLink}${
      landmark ? ` | Landmark: ${landmark}` : ""
    }`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const copyLink = async () => {
    if (!locationLink) return;

    try {
      await navigator.clipboard.writeText(locationLink);
      alert("Link copied!");
    } catch {
      alert("Copy failed");
    }
  };

  const reset = () => {
    setLocationLink("");
    setLandmark("");
    setStatus("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-sm flex flex-col gap-5 text-center">
        <h1 className="text-3xl font-bold">LocateMe</h1>

        {!locationLink && (
          <button
            onClick={getLocation}
            className="w-full bg-black text-white py-4 rounded-xl text-lg active:scale-95 transition"
          >
            Get My Location
          </button>
        )}

        {status && (
          <p className="text-sm text-gray-600">{status}</p>
        )}

        {locationLink && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Add landmark (e.g. blue kiosk opposite Melcom)"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="border p-3 rounded-lg w-full"
            />

            <button
              onClick={shareWhatsApp}
              className="bg-green-600 text-white py-3 rounded-xl text-lg active:scale-95 transition"
            >
              Share via WhatsApp
            </button>

            <button
              onClick={copyLink}
              className="border py-3 rounded-xl text-lg active:scale-95 transition"
            >
              Copy Link
            </button>

            <button
              onClick={reset}
              className="text-sm text-gray-500 underline"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </main>
  );
}