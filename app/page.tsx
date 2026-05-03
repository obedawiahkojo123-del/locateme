"use client";

import { useState } from "react";

export default function Home() {
  const [locationLink, setLocationLink] = useState("");
  const [landmark, setLandmark] = useState("");
  const [status, setStatus] = useState("");

  const getLocation = () => {
    setStatus("Button clicked...");

    if (!navigator.geolocation) {
      setStatus("Geolocation not supported");
      return;
    }

    setStatus("Requesting location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const link = `https://maps.google.com/?q=${lat},${lng}`;
        setLocationLink(link);
        setStatus("Location found ✅");
      },
      (err) => {
        console.error(err);

        // fallback test location (Accra)
        const fallback = "https://maps.google.com/?q=5.6037,-0.1870";
        setLocationLink(fallback);

        setStatus("Location blocked ❌ (using fallback Accra)");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const shareWhatsApp = () => {
    const message = `Here’s my exact location: ${locationLink}${
      landmark ? ` | Landmark: ${landmark}` : ""
    }`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-5 text-center">
        <h1 className="text-3xl font-bold">LocateMe</h1>

        <button
          onClick={getLocation}
          className="bg-black text-white py-4 rounded-xl text-lg"
        >
          Get My Location
        </button>

        <p className="text-sm text-gray-500">{status}</p>

        {locationLink && (
          <>
            <input
              placeholder="Add landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="border p-3 rounded-lg"
            />

            <button
              onClick={shareWhatsApp}
              className="bg-green-600 text-white py-3 rounded-xl"
            >
              Share via WhatsApp
            </button>

            <button
              onClick={() => navigator.clipboard.writeText(locationLink)}
              className="border py-3 rounded-xl"
            >
              Copy Link
            </button>
          </>
        )}
      </div>
    </main>
  );
}