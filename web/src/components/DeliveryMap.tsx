"use client";

import { useEffect, useRef, useState } from "react";

interface Coords {
  lat: number;
  lng: number;
}

const CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src=\"${src}\"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load script: " + src));
    document.head.appendChild(s);
  });
}

function ensureCss(href: string) {
  if (document.querySelector(`link[href=\"${href}\"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}

export default function DeliveryMap({ initial }: { initial?: Coords }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [coords, setCoords] = useState<Coords | null>(() => {
    try {
      const raw = localStorage.getItem("deliveryCoords");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return initial || null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ensureCss(CSS_URL);
    let mounted = true;

    loadScript(JS_URL)
      .then(() => {
        if (!mounted) return;
        (async () => {
          // prefer global L from CDN, otherwise dynamic import
          // @ts-ignore
          let L = (window as any).L;
          if (!L) {
            try {
              // dynamic import of leaflet as fallback
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const mod = await import("leaflet");
              L = mod;
            } catch (e) {
              console.error("Leaflet not available:", e);
              return;
            }
          }

          if (!containerRef.current) return;

          const defaultCoords = coords || { lat: -1.286389, lng: 36.817223 };
          mapRef.current = L.map(containerRef.current).setView([defaultCoords.lat, defaultCoords.lng], 13);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(mapRef.current);

          markerRef.current = L.marker([defaultCoords.lat, defaultCoords.lng], { draggable: true }).addTo(mapRef.current);

          markerRef.current.on("dragend", () => {
            const p = markerRef.current.getLatLng();
            const next = { lat: p.lat, lng: p.lng };
            setCoords(next);
            try {
              localStorage.setItem("deliveryCoords", JSON.stringify(next));
            } catch (e) {}
          });

          mapRef.current.on("click", (e: any) => {
            markerRef.current.setLatLng(e.latlng);
            const next = { lat: e.latlng.lat, lng: e.latlng.lng };
            setCoords(next);
            try {
              localStorage.setItem("deliveryCoords", JSON.stringify(next));
            } catch (e) {}
          });
        })().catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));

    return () => {
      mounted = false;
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    // keep map centered when coords change externally
    if (coords && mapRef.current) {
      try {
        mapRef.current.setView([coords.lat, coords.lng], 13);
        markerRef.current?.setLatLng([coords.lat, coords.lng]);
      } catch (e) {}
    }
  }, [coords]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported in this browser.");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(next);
        try {
          localStorage.setItem("deliveryCoords", JSON.stringify(next));
        } catch (e) {}
        if (mapRef.current) {
          mapRef.current.setView([next.lat, next.lng], 13);
          markerRef.current?.setLatLng([next.lat, next.lng]);
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
        alert("Unable to get your location. Please allow location access or enter an address.");
      }
    );
  };

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Delivery map</p>
          <h3 className="text-lg font-semibold text-slate-900">Choose delivery location</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={useMyLocation}
            className="rounded-full bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            {loading ? "Locating..." : "Use my location"}
          </button>
        </div>
      </div>

      <div className="w-full h-64 overflow-hidden rounded-xl" ref={containerRef} />

      <div className="mt-3 text-sm text-slate-600">
        {coords ? (
          <div>
            Selected: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
          </div>
        ) : (
          <div>Tap the map to choose a location or use your device location.</div>
        )}
      </div>
    </div>
  );
}
