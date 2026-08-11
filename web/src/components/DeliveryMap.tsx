"use client";

import { useEffect, useRef, useState } from "react";
import type { LatLngTuple, LeafletMouseEvent, Map as LeafletMap, Marker } from "leaflet";

interface Coords {
  lat: number;
  lng: number;
}

const CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load script: " + src));
    document.head.appendChild(s);
  });
}

function ensureCss(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}

export default function DeliveryMap({ initial }: { initial?: Coords }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const coordsRef = useRef<Coords | null>(initial ?? null);
  const [coords, setCoords] = useState<Coords | null>(() => {
    try {
      const raw = localStorage.getItem("deliveryCoords");
      if (raw) {
        const parsed = JSON.parse(raw) as Coords;
        coordsRef.current = parsed;
        return parsed;
      }
    } catch {
      // ignore invalid saved coords
    }
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
          const windowWithLeaflet = window as Window & { L?: typeof import("leaflet") };
          let L = windowWithLeaflet.L;

          if (!L) {
            try {
              const mod = await import("leaflet");
              L = mod;
            } catch (error) {
              console.error("Leaflet not available:", error);
              return;
            }
          }

          if (!containerRef.current) return;

          const defaultCoords: Coords = coordsRef.current ?? { lat: -1.286389, lng: 36.817223 };
          mapRef.current = L.map(containerRef.current).setView([defaultCoords.lat, defaultCoords.lng] as LatLngTuple, 13);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(mapRef.current);

          markerRef.current = L.marker([defaultCoords.lat, defaultCoords.lng] as LatLngTuple, { draggable: true }).addTo(mapRef.current);

          markerRef.current.on("dragend", () => {
            const point = markerRef.current?.getLatLng();
            if (!point) return;
            const next = { lat: point.lat, lng: point.lng };
            setCoords(next);
            coordsRef.current = next;
            try {
              localStorage.setItem("deliveryCoords", JSON.stringify(next));
            } catch {
              // ignore localStorage errors
            }
          });

          mapRef.current.on("click", (event: LeafletMouseEvent) => {
            markerRef.current?.setLatLng(event.latlng);
            const next = { lat: event.latlng.lat, lng: event.latlng.lng };
            setCoords(next);
            coordsRef.current = next;
            try {
              localStorage.setItem("deliveryCoords", JSON.stringify(next));
            } catch {
              // ignore localStorage errors
            }
          });
        })().catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (coords && mapRef.current) {
      try {
        mapRef.current.setView([coords.lat, coords.lng] as LatLngTuple, 13);
        markerRef.current?.setLatLng([coords.lat, coords.lng] as LatLngTuple);
      } catch {
        // ignore leaflet issues while rendering
      }
    }
  }, [coords]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported in this browser.");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(next);
        coordsRef.current = next;
        try {
          localStorage.setItem("deliveryCoords", JSON.stringify(next));
        } catch {
          // ignore localStorage errors
        }
        if (mapRef.current) {
          mapRef.current.setView([next.lat, next.lng] as LatLngTuple, 13);
          markerRef.current?.setLatLng([next.lat, next.lng] as LatLngTuple);
        }
        setLoading(false);
      },
      () => {
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
