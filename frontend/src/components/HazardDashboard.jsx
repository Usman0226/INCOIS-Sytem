// src/components/HazardDashboard.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Plugins
import "leaflet.heat";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

// ---------------- Utilities ----------------
const now = () => new Date().toISOString();
const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

const SEVERITIES = ["Critical", "High", "Moderate", "Low"];
const HAZ_TYPES = ["Tsunami waves", "Storm surge", "High wave conditions", "Marine weather", "Coastal erosion"];
const STATUSES = ["verified", "unverified", "flagged", "dismissed"];
const ZONES = ["Administrative", "Oceanographic", "Population-based"];
const TIME_PRESETS = ["24h", "7d", "Seasonal", "Custom"];

// Sample hazards
const sampleHazards = [
  { id: 1, lat: 13.08, lng: 80.27, severity: "Critical", type: "Tsunami waves", status: "unverified", createdAt: hoursAgo(2), zone: "Administrative" },
  { id: 2, lat: 11.02, lng: 76.96, severity: "High", type: "Storm surge", status: "unverified", createdAt: hoursAgo(1), zone: "Oceanographic" },
  { id: 3, lat: 19.08, lng: 72.88, severity: "Moderate", type: "High wave conditions", status: "flagged", createdAt: hoursAgo(6), zone: "Population-based" },
  { id: 4, lat: 9.08,  lng: 79.88, severity: "Low", type: "Coastal erosion", status: "verified", createdAt: hoursAgo(12), validatedAt: hoursAgo(11.5), validatedBy: "scientist@incois", zone: "Administrative" },
  { id: 5, lat: 12.95, lng: 80.23, severity: "High", type: "Marine weather", status: "unverified", createdAt: minutesAgo(30), zone: "Oceanographic" },
  { id: 6,  lat: 17.69, lng: 83.23, severity: "High",     type: "Storm surge",          status: "unverified", createdAt: minutesAgo(20), zone: "Oceanographic" },
  { id: 7,  lat: 9.97,  lng: 76.28, severity: "Moderate", type: "Marine weather",       status: "unverified", createdAt: minutesAgo(55), zone: "Administrative" },
  { id: 8,  lat: 15.49, lng: 73.82, severity: "Critical", type: "Tsunami waves",         status: "unverified", createdAt: hoursAgo(3),    zone: "Population-based", radiusMeters: 60000 },
  { id: 9,  lat: 16.98, lng: 82.24, severity: "High",     type: "High wave conditions",  status: "unverified", createdAt: hoursAgo(4),    zone: "Oceanographic" },
  { id: 10, lat: 20.32, lng: 86.61, severity: "Low",      type: "Coastal erosion",       status: "unverified", createdAt: hoursAgo(5),    zone: "Administrative",   radiusMeters: 9000 },
  { id: 11, lat: 21.63, lng: 87.51, severity: "Moderate", type: "Marine weather",        status: "unverified", createdAt: minutesAgo(75), zone: "Population-based" },
  { id: 12, lat: 12.91, lng: 74.85, severity: "High",     type: "Storm surge",           status: "unverified", createdAt: minutesAgo(42), zone: "Oceanographic" }
];


// Touch-friendly icon
const createCircleIcon = (color, size = 30) =>
  L.divIcon({
    className: "hazard-marker",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size]
  });

const statusColors = {
  verified: "text-green-600",
  unverified: "text-orange-600",
  flagged: "text-red-600",
  dismissed: "text-slate-500"
};

// Severity → default range (meters)
const severityRadiusMeters = (sev) =>
  ({ Critical: 50000, High: 30000, Moderate: 15000, Low: 8000 }[sev] ?? 10000);

// Viewport height fix for mobile browsers
function useViewportHeightVar() {
  useEffect(() => {
    const set = () => {
      document.documentElement.style.setProperty("--app-vh", `${window.innerHeight}px`);
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);
}

// Heatmap Overlay
function HeatmapOverlay({ points, radius = 25, blur = 15, maxZoom = 12 }) {
  const map = useMap();
  const layerRef = useRef(null);

  // Create layer once, remove on unmount
  useEffect(() => {
    layerRef.current = L.heatLayer(points || [], { radius, blur, maxZoom }).addTo(map);
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

  // Update points when they change
  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.setLatLngs(points || []);
  }, [points]);

  // Recreate layer when core options change
  useEffect(() => {
    if (!map) return;
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }
    layerRef.current = L.heatLayer(points || [], { radius, blur, maxZoom }).addTo(map);
  }, [radius, blur, maxZoom, map]);

  return null;
}

// Marker Cluster Component (with chunkedLoading)
function MarkersClusterGroup({ hazards, iconFor }) {
  const map = useMap();

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      chunkedLoading: true, // smoother UI with many markers
    });
    hazards.forEach(h => {
      const marker = L.marker([h.lat, h.lng], { icon: iconFor(h.status) });
      marker.bindPopup(
        `<div>
          <p class="font-semibold">${h.type}</p>
          <p class="text-xs">${h.severity} • ${new Date(h.createdAt).toLocaleString()}</p>
          <div class="text-xs ${statusColors[h.status]}">${h.status}</div>
        </div>`
      );
      cluster.addLayer(marker);
    });
    cluster.addTo(map);
    return () => {
      map.removeLayer(cluster);
    };
  }, [hazards, iconFor, map]);

  return null;
}

// Range rings overlay using L.circle (radius in meters)
function RangeCircles({ hazards }) {
  const map = useMap();
  const groupRef = useRef(null);

  useEffect(() => {
    groupRef.current = L.layerGroup().addTo(map);
    return () => {
      if (groupRef.current) {
        map.removeLayer(groupRef.current);
        groupRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.clearLayers();
    hazards.forEach(h => {
      const radius = h.radiusMeters ?? severityRadiusMeters(h.severity);
      const circle = L.circle([h.lat, h.lng], {
        radius,                // meters
        color: "#0ea5e9",
        fillColor: "#0ea5e9",
        fillOpacity: 0.15,
        weight: 1,
        // pane defaults to overlayPane; markers render above in markerPane
      });
      circle.bindPopup(
        `<div class="text-xs">
           <div class="font-semibold">${h.type}</div>
           <div>Range ≈ ${(radius / 1000).toFixed(0)} km</div>
         </div>`
      );
      circle.addTo(groupRef.current);
    });
  }, [hazards]);

  return null;
}

// Invalidate size on mount and container resize
function SizeInvalidator({ deps = [] }) {
  const map = useMap();
  useEffect(() => {
    // on mount
    map.invalidateSize();
    // observe container
    const container = map.getContainer();
    let ro;
    if (container && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(container);
    }
    return () => {
      if (ro) ro.disconnect();
    };
  }, [map]);

  // also invalidate when deps change (e.g., drawers/breakpoints)
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 0);
  }, [map, ...deps]);

  return null;
}

// ---------------- Main Dashboard ----------------
export default function HazardDashboard() {
  useViewportHeightVar();

  const [hazards, setHazards] = useState(sampleHazards);
  const [filter, setFilter] = useState({ severities: new Set(), types: new Set(), statuses: new Set(), zones: new Set() });
  const [timePreset, setTimePreset] = useState("24h");
  const [customTime, setCustomTime] = useState({});
  const [timeline, setTimeline] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [showPins, setShowPins] = useState(true);
  const [showHeat, setShowHeat] = useState(true);
  const [showRanges, setShowRanges] = useState(true);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [metrics, setMetrics] = useState({ lastFilterMs: 0 });

  const mapRef = useRef(null);

  // Detect mobile width for map interaction toggles
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when a drawer is open (mobile)
  useEffect(() => {
    const lock = leftOpen || rightOpen;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [leftOpen, rightOpen]);

  // Build icons per device density
  const iconFor = (status) => {
    const size = isMobile ? 36 : 30;
    const colors = {
      verified: "#22c55e",
      unverified: "#f97316",
      flagged: "#ef4444",
      dismissed: "#94a3b8"
    };
    return createCircleIcon(colors[status], size);
  };

  // Time filter
  const withinPreset = (iso, preset, custom) => {
    const t = new Date(iso).getTime();
    const nowT = Date.now();
    if (preset === "24h") return t >= nowT - 24 * 3600 * 1000;
    if (preset === "7d") return t >= nowT - 7 * 24 * 3600 * 1000;
    if (preset === "Seasonal") return new Date(iso).getMonth() === new Date().getMonth();
    if (preset === "Custom") {
      const s = custom?.start ? new Date(custom.start).getTime() : -Infinity;
      const e = custom?.end ? new Date(custom.end).getTime() : Infinity;
      return t >= s && t <= e;
    }
    return true;
  };

  // Timeline play
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTimeline(t => (t >= 100 ? 0 : t + 2)), 300);
    return () => clearInterval(id);
  }, [playing]);

  // Filter hazards (measure compute time)
  const t0 = performance.now();
  const filtered = useMemo(() => {
    return hazards.filter(h => {
      if (!withinPreset(h.createdAt, timePreset, customTime)) return false;
      if (filter.severities.size && !filter.severities.has(h.severity)) return false;
      if (filter.types.size && !filter.types.has(h.type)) return false;
      if (filter.statuses.size && !filter.statuses.has(h.status)) return false;
      if (filter.zones.size && !filter.zones.has(h.zone)) return false;

      const maxAgeMs = 7 * 24 * 3600 * 1000;
      const age = Date.now() - new Date(h.createdAt).getTime();
      const cutoff = (timeline / 100) * maxAgeMs;
      return age <= cutoff;
    });
  }, [hazards, filter, timePreset, customTime, timeline]);

  useEffect(() => {
    const dt = performance.now() - t0;
    setMetrics({ lastFilterMs: Math.round(dt) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  const pending = hazards.filter(h => h.status === "unverified");

  // Actions
  const verify = (id) =>
    setHazards(prev => prev.map(h => h.id === id ? { ...h, status: "verified", validatedAt: now(), validatedBy: "scientist@incois" } : h));
  const flag = (id) =>
    setHazards(prev => prev.map(h => h.id === id ? { ...h, status: "flagged", validatedAt: now(), validatedBy: "scientist@incois" } : h));
  const dismiss = (id) =>
    setHazards(prev => prev.map(h => h.id === id ? { ...h, status: "dismissed", validatedAt: now(), validatedBy: "scientist@incois" } : h));

  const fitAll = () => {
    if (!mapRef.current || !filtered.length) return;
    const bounds = L.latLngBounds(filtered.map(h => [h.lat, h.lng]));
    mapRef.current.flyToBounds(bounds.pad(0.2));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <header className="bg-sky-100 px-4 md:px-6 py-3 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          {/* Mobile toggles */}
          <button className="md:hidden px-2 py-1 bg-slate-200 rounded" onClick={() => setLeftOpen(true)} aria-label="Open filters">Filters</button>
          <h1 className="font-bold text-base md:text-lg text-slate-700">Pro Hazard Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-700">
          <span>Filter: {metrics.lastFilterMs} ms</span>
          <button onClick={fitAll} className="px-2 py-1 bg-slate-200 rounded">Fit</button>
          <button onClick={() => setRightOpen(true)} className="md:hidden px-2 py-1 bg-slate-200 rounded" aria-label="Open queue">Queue</button>
        </div>
      </header>

      <div className="flex-1 grid grid-rows-[auto_1fr_auto] md:grid-rows-1 md:grid-cols-[320px_1fr_360px]">
        {/* Left sidebar (off-canvas on mobile) */}
        <aside className={`bg-white border-r overflow-y-auto p-4 ${leftOpen ? "fixed inset-0 z-40" : "hidden"} md:block md:relative`}>
          {/* Mobile close */}
          <div className="md:hidden flex justify-between items-center mb-3">
            <div className="font-semibold">Filters</div>
            <button onClick={() => setLeftOpen(false)} className="px-2 py-1 bg-slate-200 rounded">Close</button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">Severity</div>
              {SEVERITIES.map(s => (
                <button key={s} className={`block w-full text-left px-3 py-2 mb-1 rounded ${filter.severities.has(s) ? "bg-sky-100" : "bg-slate-100"}`}
                  onClick={() => setFilter(prev => ({ ...prev, severities: toggleSet(prev.severities, s) }))}>{s}</button>
              ))}
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">Hazard Type</div>
              {HAZ_TYPES.map(t => (
                <button key={t} className={`block w-full text-left px-3 py-2 mb-1 rounded ${filter.types.has(t) ? "bg-sky-100" : "bg-slate-100"}`}
                  onClick={() => setFilter(prev => ({ ...prev, types: toggleSet(prev.types, t) }))}>{t}</button>
              ))}
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">Status</div>
              {STATUSES.map(s => (
                <button key={s} className={`block w-full text-left px-3 py-2 mb-1 rounded ${filter.statuses.has(s) ? "bg-sky-100" : "bg-slate-100"}`}
                  onClick={() => setFilter(prev => ({ ...prev, statuses: toggleSet(prev.statuses, s) }))}>{s}</button>
              ))}
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">Zones</div>
              {ZONES.map(z => (
                <button key={z} className={`block w-full text-left px-3 py-2 mb-1 rounded ${filter.zones.has(z) ? "bg-sky-100" : "bg-slate-100"}`}
                  onClick={() => setFilter(prev => ({ ...prev, zones: toggleSet(prev.zones, z) }))}>{z}</button>
              ))}
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">Time Range</div>
              <div className="flex flex-wrap gap-2">
                {TIME_PRESETS.map(p => (
                  <button key={p} className={`px-3 py-1 rounded ${timePreset === p ? "bg-sky-600 text-white" : "bg-slate-200"}`} onClick={() => setTimePreset(p)}>{p}</button>
                ))}
              </div>
              {timePreset === "Custom" && (
                <div className="mt-2 space-y-2">
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-2 py-1"
                    onChange={e => setCustomTime(ct => ({ ...ct, start: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                  />
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-2 py-1"
                    onChange={e => setCustomTime(ct => ({ ...ct, end: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                  />
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">Layers</div>
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={showPins} onChange={e => setShowPins(e.target.checked)} /> <span>Pin Clusters</span>
              </label>
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={showHeat} onChange={e => setShowHeat(e.target.checked)} /> <span>Hotspot Heatmap</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={showRanges} onChange={e => setShowRanges(e.target.checked)} /> <span>Issue Range Rings</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Map */}
        <main className="relative">
          <div
            style={{
              height: "calc(var(--app-vh, 100dvh) - 48px)"
            }}
            className="md:h-full"
          >
            <MapContainer
              center={[12.97, 80.23]}
              zoom={6}
              style={{ height: "100%", width: "100%" }}
              whenCreated={m => (mapRef.current = m)}
              scrollWheelZoom={!isMobile}
              doubleClickZoom={!isMobile}
              touchZoom={true}
            >
              {/* auto-size handling */}
              <SizeInvalidator deps={[leftOpen, rightOpen, isMobile]} />

              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {showHeat && (
                <HeatmapOverlay
                  points={filtered.map(h => [
                    h.lat,
                    h.lng,
                    h.severity === "Critical" ? 1 :
                    h.severity === "High" ? 0.8 :
                    h.severity === "Moderate" ? 0.6 : 0.4
                  ])}
                />
              )}

              {showRanges && <RangeCircles hazards={filtered} />}

              {showPins && <MarkersClusterGroup hazards={filtered} iconFor={iconFor} />}
            </MapContainer>
          </div>

          {/* Bottom timeline on mobile */}
          <div className="md:hidden absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-2 rounded shadow flex items-center gap-2">
            <button className="px-2 py-1 bg-slate-200 rounded" onClick={() => setPlaying(p => !p)}>{playing ? "Pause" : "Play"}</button>
            <input type="range" min="0" max="100" value={timeline} onChange={e => setTimeline(Number(e.target.value))} />
          </div>
        </main>

        {/* Right panel (off-canvas on mobile) */}
        <aside className={`bg-white border-l overflow-y-auto p-4 ${rightOpen ? "fixed inset-0 z-40" : "hidden"} md:block md:relative`}>
          <div className="md:hidden flex justify-between items-center mb-3">
            <div className="font-semibold">Validation Queue</div>
            <button onClick={() => setRightOpen(false)} className="px-2 py-1 bg-slate-200 rounded">Close</button>
          </div>

          <h3 className="font-semibold mb-3 hidden md:block">Validation Queue</h3>
          {pending.map(q => (
            <div key={q.id} className="border rounded p-3 mb-3">
              <div className="font-semibold text-red-600">{q.severity}</div>
              <div className="text-sm">{q.type} • {new Date(q.createdAt).toLocaleString()}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => verify(q.id)} className="px-2 py-1 bg-green-600 text-black rounded text-xs">Verify</button>
                <button onClick={() => flag(q.id)} className="px-2 py-1 bg-yellow-500 text-black rounded text-xs">Flag</button>
                <button onClick={() => dismiss(q.id)} className="px-2 py-1 bg-slate-200 rounded text-xs">Dismiss</button>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );

  function toggleSet(set, value) {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  }
}
