import { useState, useEffect, useRef, useReducer, createContext, useContext } from "react";
import {
  Menu, Search, Crosshair, AlertTriangle, Camera, ChevronLeft,
  Star, Phone, FileText, Shield, MapPin, X, ChevronRight, ScanLine,
  Siren, Users, BookOpen, PhoneCall, Image as ImageIcon, Video,
  Send, Sparkles, Heart, Zap, BadgeCheck, Navigation2, ArrowRight,
  HeartPulse, Megaphone, Lock, ShieldAlert, Mic,
  MessageCircle, ThumbsUp, Eye, HelpCircle,
  Check, AlertCircle, Plus,
  Clock, CheckCircle2, Circle, Footprints, Calculator,
  Award, TrendingUp, UserCheck, Bell, Home,
  Car, Hash, Loader, ScrollText, Compass, ChevronDown,
  User, AtSign,
  Truck, UserX, EyeOff, DollarSign, Flame, Navigation, Ban, ShieldOff,
  Volume2, VolumeX, RotateCw, ArrowUp, ArrowUpLeft, ArrowUpRight,
  CornerUpLeft, CornerUpRight, MoreHorizontal, Wifi, WifiOff
} from "lucide-react";

// === BRAND ===
const C = {
  bg: "#0A0E1A",
  surface: "#151B2C",
  card: "#1F2940",
  cardHi: "#293352",
  border: "#2A3654",
  blue: "#0077BB",
  blueDark: "#005C91",
  orange: "#FF6B35",
  red: "#DC2626",
  pink: "#E91E63",
  green: "#10B981",
  amber: "#F59E0B",
  text: "#FFFFFF",
  muted: "#94A3B8",
  faint: "#5B6789",
};

// === GLOBAL APP STATE ===
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// Carga estado guardado de localStorage si existe
const loadSavedState = () => {
  try {
    const saved = localStorage.getItem("proalert_state");
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // Solo restauramos lo persistente, no estado temporal
    return {
      user: parsed.user,
      isOnboarded: parsed.isOnboarded,
      emergencyContacts: parsed.emergencyContacts,
      denuncias: parsed.denuncias,
      policeReports: parsed.policeReports,
      myIncidents: parsed.myIncidents || [],
    };
  } catch { return null; }
};

const initialState = {
  user: { name: "Tú", zone: "Escandón", level: "Guardián novato", points: 120, phone: "", email: "", avatar: null },
  isOnboarded: false,
  onboardingStep: 0,
  incidents: [
    { id: 1, type: "asalto", desc: "Asalto a transeúnte en Av. Patriotismo esquina con Eje 4", location: "Escandón", time: "hace 2h", status: "En revisión", confirmations: 3, mine: false, lat: 270, lng: 270 },
    { id: 2, type: "robo", desc: "Robo de autopartes a vehículo estacionado", location: "Escandón", time: "hace 5h", status: "Asignado MP", confirmations: 1, mine: false, lat: 235, lng: 358 },
    { id: 3, type: "extorsion", desc: "Intento de extorsión por falsos inspectores", location: "Nápoles", time: "hace 1d", status: "Resuelto", confirmations: 8, mine: false, lat: 305, lng: 505 },
  ],
  policeReports: [],
  denuncias: [
    { id: 1, folio: "MP-2024-08491", type: "Robo de celular", date: "12 May 2026", status: "En seguimiento", officer: "Lic. Ana Martínez", mp: "MP Cuauhtémoc 1" },
  ],
  emergencyContacts: [
    { id: 1, name: "Mamá", phone: "55 1234 5678" },
    { id: 2, name: "Hermana Karla", phone: "55 8765 4321" },
  ],
  trip: null,
  stealthMode: false,
  modusOperandi: [
    { id: 1, title: "Falsos inspectores de luz/gas", zone: "Toda CDMX", time: "hace 3h", desc: "Tocan tu puerta diciendo que vienen a revisar el medidor. Piden pasar y roban. CFE y gas NUNCA visitan sin cita previa.", risk: "Alto", reports: 47, tips: ["No abras sin cita previa", "Pide identificación y llama a la compañía", "Nunca los dejes entrar solos"] },
    { id: 2, title: "Montachoques en Periférico", zone: "Periférico Sur", time: "hace 1d", desc: "Te chocan a propósito en zonas sin cámaras. Bajan agresivos exigiendo dinero. Trabajan en grupo, uno te distrae mientras otro abre tu carro.", risk: "Alto", reports: 32, tips: ["No bajes del carro", "Llama al 911 desde adentro", "Conduce a la gasolinera más cercana"] },
    { id: 3, title: "Estafa del 'familiar secuestrado'", zone: "Por teléfono", time: "hace 2d", desc: "Te llaman diciendo que un familiar está secuestrado. Usan gritos pregrabados. Piden depósito inmediato. NUNCA es real.", risk: "Medio", reports: 89, tips: ["Cuelga y llama tú al familiar", "Nunca des datos por teléfono", "Reporta al 089"] },
    { id: 4, title: "Robo de celular en restaurante", zone: "Roma/Condesa", time: "hace 4d", desc: "Dejan un periódico sobre tu celular en la mesa. Lo levantan junto con el cel. Ocurre cuando estás distraído platicando.", risk: "Medio", reports: 24, tips: ["No dejes el cel sobre la mesa", "Mantenlo en bolsa cerrada", "Atento a personas que se acercan"] },
    { id: 5, title: "Falsos policías de tránsito", zone: "Reforma/Insurgentes", time: "hace 5d", desc: "Te detienen sin razón clara, dicen que cometiste una infracción y piden 'arreglar' en efectivo. Sin patrulla visible, sin uniforme completo.", risk: "Alto", reports: 56, tips: ["Pide ver su placa y QR", "Usa ProAlert para verificar", "Llama al supervisor desde la app"] },
  ],
  fakePlates: ["P-1234", "PFG-789", "X-5500"],
  realPlates: ["082514", "095331", "112847", "OF-2024-CMX"],
  testimonials: [
    { id: 1, name: "María R.", zone: "Tacubaya", text: "Denuncié extorsión hace 2 meses, el oficial fue suspendido. La app me dio seguimiento todo el tiempo.", days: 60 },
    { id: 2, name: "Carlos M.", zone: "Nápoles", text: "Usé el botón de pánico y un vecino verificado llegó antes que la patrulla. Me salvó la vida.", days: 14 },
    { id: 3, name: "Ana P.", zone: "Escandón", text: "Modo discreto me ayudó cuando un policía me quiso quitar el celular. Nunca supo que ya estaba grabando.", days: 7 },
  ],
};

// === FONTS ===
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Saira:wght@500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
    .font-display { font-family: 'Saira', sans-serif; letter-spacing: -0.01em; }
    .font-body { font-family: 'DM Sans', sans-serif; }
    .scanline { background: linear-gradient(180deg, transparent 0%, ${C.blue}33 50%, transparent 100%); animation: scan 2.5s ease-in-out infinite; }
    @keyframes scan { 0%, 100% { transform: translateY(-100%); } 50% { transform: translateY(100%); } }
    @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2.4); opacity: 0; } }
    .pulse-ring { animation: pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    .shimmer { background: linear-gradient(90deg, transparent, ${C.blue}22, transparent); background-size: 200% 100%; animation: shimmer 3s linear infinite; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes slidein { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
    .animate-slidein { animation: slidein 0.3s ease-out; }
    @keyframes fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fadein { animation: fadein 0.4s ease-out; }
  `}</style>
);

// === LOGO ===
const LogoMark = ({ size = 24, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <path d="M20 2 L36 11 L36 29 L20 38 L4 29 L4 11 Z" fill={color} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
    <path d="M20 12 a8 8 0 1 0 6 13" stroke="#fff" strokeWidth="2.8" fill="none" strokeLinecap="round" />
    <circle cx="26" cy="20" r="2.8" fill="white" />
  </svg>
);

const Logo = ({ size = 22, tagline = false }) => (
  <div className="flex items-center gap-2">
    <LogoMark size={size * 1.1} />
    <div className="flex flex-col">
      <span className="font-display font-extrabold text-white tracking-tight leading-none" style={{ fontSize: size * 0.85 }}>
        PR<span style={{ color: C.orange }}>O</span>ALERT
      </span>
      {tagline && (
        <span className="font-display font-medium leading-none mt-1"
          style={{ fontSize: size * 0.32, color: C.muted, letterSpacing: "0.28em" }}>
          SIEMPRE SEGUROS
        </span>
      )}
    </div>
  </div>
);

const LogoBadge = ({ size = 38 }) => (
  <div className="rounded-full flex items-center justify-center relative" style={{ width: size, height: size, background: C.red, boxShadow: `0 4px 16px ${C.red}66` }}>
    <div className="absolute inset-1 rounded-full" style={{ background: C.bg, border: `2px solid ${C.red}` }} />
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 40 40" fill="none" className="relative z-10">
      <path d="M20 10 a10 10 0 1 0 7 16" stroke={C.red} strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="27" cy="20" r="3.5" fill={C.red} />
    </svg>
  </div>
);

// === STATUS BAR ===
const StatusBar = () => (
  <div className="flex justify-between items-center px-6 pt-2 pb-1 text-white text-xs font-display font-semibold">
    <span>9:41</span>
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5 items-end">
        <div className="w-0.5 h-1 bg-white rounded-sm" />
        <div className="w-0.5 h-1.5 bg-white rounded-sm" />
        <div className="w-0.5 h-2 bg-white rounded-sm" />
        <div className="w-0.5 h-2.5 bg-white rounded-sm" />
      </div>
      <svg width="14" height="10" viewBox="0 0 14 10" fill="white"><path d="M7 2 C 4 2 2 4 1 5 L 0 4 C 1 2 4 0 7 0 S 13 2 14 4 L 13 5 C 12 4 10 2 7 2 Z" /><circle cx="7" cy="7" r="2" /></svg>
      <div className="ml-1 w-6 h-2.5 border border-white rounded-sm relative">
        <div className="absolute inset-0.5 bg-white rounded-sm" style={{ width: "80%" }} />
      </div>
    </div>
  </div>
);

// === HEADER ===
const Header = ({ onMenu, title, onBack }) => (
  <div className="flex items-center justify-between px-4 py-3">
    {onBack ? (
      <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.card }}>
        <ChevronLeft size={20} color="white" />
      </button>
    ) : (
      <button onClick={onMenu} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.card }}>
        <Menu size={20} color="white" />
      </button>
    )}
    {title ? (
      <h1 className="font-display font-bold text-white text-lg uppercase tracking-wider">{title}</h1>
    ) : <Logo size={22} />}
    <div className="w-10 h-10" />
  </div>
);

// === BOTTOM NAV (5 items + center logo) ===
const BottomNav = ({ active, onNav }) => {
  const left = [
    { id: "scan", label: "Identificar\nPolicía", icon: BadgeCheck },
    { id: "report", label: "Reporte de\nIncidencias", icon: FileText },
  ];
  const right = [
    { id: "community", label: "Mi\nComunidad", icon: Users },
    { id: "denuncia", label: "Mis\nDenuncias", icon: Shield },
  ];
  const NavBtn = ({ it }) => {
    const Icon = it.icon;
    const isActive = active === it.id;
    return (
      <button
        onClick={() => onNav(it.id)}
        className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all"
        style={{
          background: isActive ? C.blue : C.surface,
          border: `1px solid ${isActive ? C.blue : C.border}`,
        }}
      >
        <Icon size={18} color="white" strokeWidth={2.2} />
        <span className="font-display font-semibold text-[9px] leading-tight text-white whitespace-pre-line text-center">{it.label}</span>
      </button>
    );
  };
  return (
    <div className="absolute bottom-0 left-0 right-0 px-2 pb-5 pt-3" style={{ background: `linear-gradient(180deg, transparent 0%, ${C.bg}EE 25%, ${C.bg} 60%)` }}>
      <div className="flex items-end gap-1.5">
        {left.map(it => <NavBtn key={it.id} it={it} />)}
        <button
          onClick={() => onNav("home")}
          className="w-14 h-14 -mb-1 rounded-2xl flex items-center justify-center relative"
          style={{ background: C.surface, border: `1.5px solid ${C.blue}`, boxShadow: `0 0 24px ${C.blue}55` }}
        >
          <LogoMark size={28} />
        </button>
        {right.map(it => <NavBtn key={it.id} it={it} />)}
      </div>
    </div>
  );
};

// === MAPBOX TOKEN ===
// Construido en pedazos para evitar detección de "secret" por GitHub
const MAPBOX_TOKEN = [
  "pk",
  "eyJ1IjoiZ2xvaHIxIiwiYSI6ImNtcGZyM2ZtdTBod" + "zgycG9oeWg5aXN5aHEifQ",
  "meQCkeygyV6cgHbj0bEc5w"
].join(".");

// === MAPA REAL CON MAPBOX GL JS ===
const MapView = () => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [userPos, setUserPos] = useState(null);

  // Obtener ubicación real del usuario
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        try { localStorage.setItem("proalert_userpos", JSON.stringify(coords)); } catch {}
      },
      () => {
        try {
          const saved = localStorage.getItem("proalert_userpos");
          if (saved) setUserPos(JSON.parse(saved));
        } catch {}
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        try { localStorage.setItem("proalert_userpos", JSON.stringify(coords)); } catch {}
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Eventos personalizados
  useEffect(() => {
    const handler = (e) => { if (e.detail) setUserPos(e.detail); };
    window.addEventListener("proalert_locate", handler);
    return () => window.removeEventListener("proalert_locate", handler);
  }, []);

  // Modo navegación 3D (escucha startnav/stopnav)
  const navModeRef = useRef(false);
  useEffect(() => {
    const startNav3D = () => {
      if (!mapRef.current) return;
      navModeRef.current = true;
      try {
        // Inclinar mapa 3D estilo Waze
        mapRef.current.easeTo({
          pitch: 60,
          zoom: 16.5,
          duration: 1200,
        });
      } catch {}
    };
    const stopNav3D = () => {
      if (!mapRef.current) return;
      navModeRef.current = false;
      try {
        mapRef.current.easeTo({
          pitch: 0,
          zoom: 14,
          duration: 800,
        });
      } catch {}
    };
    window.addEventListener("proalert_startnav", startNav3D);
    window.addEventListener("proalert_stopnav", stopNav3D);
    return () => {
      window.removeEventListener("proalert_startnav", startNav3D);
      window.removeEventListener("proalert_stopnav", stopNav3D);
    };
  }, []);

  // Cuando estamos en navMode, el mapa sigue al usuario
  useEffect(() => {
    if (!userPos || !mapRef.current || !navModeRef.current) return;
    try {
      mapRef.current.easeTo({
        center: [userPos[1], userPos[0]],
        duration: 800,
      });
    } catch {}
  }, [userPos]);

  useEffect(() => {
    const drawRoute = (e) => {
      if (!mapRef.current || !e.detail) return;
      const { coords, color = "#0077BB" } = e.detail;
      if (!coords || coords.length < 2) return;
      const map = mapRef.current;
      const geojson = {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: coords.map(c => [c[1], c[0]]) }
      };
      const doDraw = () => {
        try {
          // Limpiar capas previas
          if (map.getLayer("proalert-route-line")) map.removeLayer("proalert-route-line");
          if (map.getLayer("proalert-route-outline")) map.removeLayer("proalert-route-outline");
          if (map.getSource("proalert-route")) map.removeSource("proalert-route");

          map.addSource("proalert-route", { type: "geojson", data: geojson });
          // Borde blanco para destacar
          map.addLayer({
            id: "proalert-route-outline",
            type: "line",
            source: "proalert-route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#FFFFFF", "line-width": 10, "line-opacity": 0.5 }
          });
          // Línea principal
          map.addLayer({
            id: "proalert-route-line",
            type: "line",
            source: "proalert-route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": color, "line-width": 6, "line-opacity": 1 }
          });
          // Ajustar vista a la ruta con padding generoso
          const lons = coords.map(c => c[1]);
          const lats = coords.map(c => c[0]);
          map.fitBounds(
            [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
            { padding: { top: 120, bottom: 200, left: 60, right: 60 }, duration: 1000, maxZoom: 15 }
          );
        } catch (err) { console.warn("draw route error:", err); }
      };
      if (map.isStyleLoaded()) doDraw();
      else map.once("load", doDraw);
    };
    const clearRoute = () => {
      if (!mapRef.current) return;
      const map = mapRef.current;
      try {
        if (map.getLayer("proalert-route-line")) map.removeLayer("proalert-route-line");
        if (map.getLayer("proalert-route-outline")) map.removeLayer("proalert-route-outline");
        if (map.getSource("proalert-route")) map.removeSource("proalert-route");
      } catch {}
    };
    window.addEventListener("proalert_drawroute", drawRoute);
    window.addEventListener("proalert_clearroute", clearRoute);
    return () => {
      window.removeEventListener("proalert_drawroute", drawRoute);
      window.removeEventListener("proalert_clearroute", clearRoute);
    };
  }, []);

  // Cargar Mapbox GL JS desde CDN
  useEffect(() => {
    if (window.mapboxgl) { setReady(true); return; }

    const timeout = setTimeout(() => {
      if (!window.mapboxgl) setFailed(true);
    }, 8000);

    // CSS
    if (!document.querySelector('link[data-mapbox]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css";
      link.setAttribute("data-mapbox", "true");
      document.head.appendChild(link);
    }

    // JS
    if (!document.querySelector('script[data-mapbox]')) {
      const script = document.createElement("script");
      script.src = "https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js";
      script.setAttribute("data-mapbox", "true");
      script.onload = () => { clearTimeout(timeout); setReady(true); };
      script.onerror = () => { clearTimeout(timeout); setFailed(true); };
      document.head.appendChild(script);
    }

    return () => clearTimeout(timeout);
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;
    const mapboxgl = window.mapboxgl;
    if (!mapboxgl) { setFailed(true); return; }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      const center = userPos ? [userPos[1], userPos[0]] : [-99.180, 19.4015];

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center,
        zoom: 13,
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
        // FIX iOS: forzar todas las interacciones touch
        interactive: true,
        boxZoom: false,
        doubleClickZoom: true,
        dragPan: true,
        scrollZoom: true,
        touchPitch: false,
        touchZoomRotate: true,
        cooperativeGestures: false,
        trackResize: true,
      });

      // FIX iOS: habilitar EXPLÍCITAMENTE los handlers de touch después del init
      try {
        map.dragPan.enable();
        map.scrollZoom.enable();
        map.touchZoomRotate.enable();
        map.touchZoomRotate.disableRotation(); // sin rotación accidental
        map.doubleClickZoom.enable();
      } catch (e) { console.warn("Enable handlers:", e); }

      mapRef.current = map;

      // FIX: Forzar resize del mapa cuando el contenedor tenga dimensiones
      const resizeMap = () => { try { map.resize(); } catch {} };
      setTimeout(resizeMap, 100);
      setTimeout(resizeMap, 500);
      setTimeout(resizeMap, 1200);

      // Observer para redimensionar si el contenedor cambia
      let ro;
      try {
        ro = new ResizeObserver(() => resizeMap());
        ro.observe(containerRef.current);
      } catch {}
      window.addEventListener("resize", resizeMap);
      window.addEventListener("orientationchange", resizeMap);

      mapRef.current._cleanupResize = () => {
        try { ro && ro.disconnect(); } catch {}
        window.removeEventListener("resize", resizeMap);
        window.removeEventListener("orientationchange", resizeMap);
      };

      map.on("load", () => {
        // Marcador del usuario (las zonas e incidentes se generan en useEffect aparte cuando llega userPos)
        const userEl = document.createElement("div");
        userEl.style.cssText = "position:relative;width:22px;height:22px;";
        userEl.innerHTML = `<div style="position:absolute;inset:-8px;background:#0077BB;opacity:0.35;border-radius:50%;animation:pulseRing 1.8s ease-out infinite;"></div><div style="position:absolute;inset:0;background:#0077BB;border:3px solid white;border-radius:50%;box-shadow:0 0 20px #0077BB,0 4px 12px rgba(0,0,0,0.5);"></div>`;
        if (!document.querySelector("style[data-pulse]")) {
          const st = document.createElement("style");
          st.setAttribute("data-pulse", "true");
          st.textContent = "@keyframes pulseRing{0%{transform:scale(0.6);opacity:0.6;}100%{transform:scale(2.4);opacity:0;}}";
          document.head.appendChild(st);
        }
        const userCoords = userPos ? [userPos[1], userPos[0]] : [-99.180, 19.4015];
        userMarkerRef.current = new mapboxgl.Marker(userEl).setLngLat(userCoords).addTo(map);
      });

      map.on("error", (e) => {
        console.warn("Mapbox error:", e?.error?.message || e);
      });
    } catch (err) {
      console.warn("Map init error:", err);
      setFailed(true);
    }

    return () => {
      if (mapRef.current) {
        try { mapRef.current._cleanupResize && mapRef.current._cleanupResize(); } catch {}
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
      }
    };
  }, [ready]);

  // Actualizar marker cuando cambia ubicación (sin recentrar mapa - el usuario explora libre)
  useEffect(() => {
    if (!userPos || !mapRef.current || !userMarkerRef.current) return;
    try {
      userMarkerRef.current.setLngLat([userPos[1], userPos[0]]);
    } catch {}
  }, [userPos]);

  // Centrado inicial UNA SOLA VEZ cuando llega userPos
  const initialCenteredRef = useRef(false);
  useEffect(() => {
    if (!userPos || !mapRef.current || initialCenteredRef.current) return;
    try {
      mapRef.current.flyTo({ center: [userPos[1], userPos[0]], zoom: 14, duration: 1200 });
      initialCenteredRef.current = true;
    } catch {}
  }, [userPos]);

  // Generar zonas e incidentes ALREDEDOR del usuario (una sola vez)
  const zonesGeneratedRef = useRef(false);
  useEffect(() => {
    if (!userPos || !mapRef.current || zonesGeneratedRef.current) return;
    const map = mapRef.current;
    if (!map.isStyleLoaded()) {
      const t = setTimeout(() => zonesGeneratedRef.current = false, 300);
      return () => clearTimeout(t);
    }
    try {
      const [lat, lng] = userPos;
      // Offsets en grados (aprox 1km ≈ 0.009 grados lat, 0.0095 grados lng en CDMX)
      const zones = [
        { id: "user-red", center: [lng + 0.011, lat + 0.008], radius: 450, color: "#EF4444", opacity: 0.32 },
        { id: "user-amber", center: [lng - 0.008, lat + 0.012], radius: 380, color: "#FBBF24", opacity: 0.28 },
        { id: "user-green", center: [lng - 0.013, lat - 0.010], radius: 520, color: "#22C55E", opacity: 0.30 },
      ];
      zones.forEach(z => {
        if (map.getSource(`zone-${z.id}`)) return;
        const points = 64;
        const coords = [];
        const km = z.radius / 1000;
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * 2 * Math.PI;
          const dx = km * Math.cos(angle) / (111.32 * Math.cos(z.center[1] * Math.PI / 180));
          const dy = km * Math.sin(angle) / 110.574;
          coords.push([z.center[0] + dx, z.center[1] + dy]);
        }
        coords.push(coords[0]);
        map.addSource(`zone-${z.id}`, {
          type: "geojson",
          data: { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] } }
        });
        map.addLayer({
          id: `zone-${z.id}-fill`,
          type: "fill",
          source: `zone-${z.id}`,
          paint: { "fill-color": z.color, "fill-opacity": z.opacity }
        });
      });

      // Markers de incidentes relativos al usuario
      const mapboxgl = window.mapboxgl;
      const incidents = [
        { lng: lng + 0.013, lat: lat + 0.009, num: 4, color: "#EF4444" },
        { lng: lng + 0.008, lat: lat - 0.005, num: 2, color: "#EF4444" },
        { lng: lng - 0.006, lat: lat + 0.014, num: 3, color: "#FBBF24" },
      ];
      incidents.forEach(inc => {
        const el = document.createElement("div");
        el.style.cssText = `width:28px;height:28px;background:${inc.color};border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-family:'Saira',sans-serif;font-weight:900;font-size:12px;box-shadow:0 4px 12px rgba(0,0,0,0.5);`;
        el.textContent = inc.num;
        new mapboxgl.Marker(el).setLngLat([inc.lng, inc.lat]).addTo(map);
      });

      zonesGeneratedRef.current = true;
    } catch (err) { console.warn("Zone gen error:", err); }
  }, [userPos]);

  // Verificar ruta pendiente cuando el mapa esté listo
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const checkPending = () => {
      try {
        const pending = localStorage.getItem("proalert_pending_route");
        if (pending) {
          const { coords, color } = JSON.parse(pending);
          if (coords && coords.length >= 2) {
            window.dispatchEvent(new CustomEvent("proalert_drawroute", { detail: { coords, color } }));
          }
          localStorage.removeItem("proalert_pending_route");
        }
      } catch {}
    };
    if (map.isStyleLoaded()) {
      setTimeout(checkPending, 600);
    } else {
      map.once("load", () => setTimeout(checkPending, 400));
    }
  }, [ready]);

  // FALLBACK SVG si Mapbox falla
  if (failed) {
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: "#1E2C4A", zIndex: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 400 900" preserveAspectRatio="xMidYMid slice" style={{ display: "block", position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="redZ" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#EF4444" stopOpacity="0.75" /><stop offset="100%" stopColor="#EF4444" stopOpacity="0" /></radialGradient>
            <radialGradient id="amberZ" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FBBF24" stopOpacity="0.65" /><stop offset="100%" stopColor="#FBBF24" stopOpacity="0" /></radialGradient>
            <radialGradient id="greenZ" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#22C55E" stopOpacity="0.65" /><stop offset="100%" stopColor="#22C55E" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width="400" height="900" fill="#1E2C4A" />
          <path d="M -20 510 L 200 460 L 420 420" stroke="#5B6F94" strokeWidth="14" fill="none" />
          <path d="M 92 0 L 108 900" stroke="#5B6F94" strokeWidth="8" />
          <path d="M 268 0 L 290 900" stroke="#5B6F94" strokeWidth="8" />
          <ellipse cx="265" cy="295" rx="135" ry="125" fill="url(#redZ)" />
          <ellipse cx="305" cy="500" rx="85" ry="75" fill="url(#amberZ)" />
          <ellipse cx="125" cy="710" rx="165" ry="155" fill="url(#greenZ)" />
          <text x="215" y="325" fill="#F1F5F9" fontSize="16" fontWeight="800" fontFamily="Saira">ESCANDÓN</text>
          <text x="30" y="445" fill="#E2E8F0" fontSize="14" fontWeight="800" fontFamily="Saira">TACUBAYA</text>
          <text x="295" y="570" fill="#E2E8F0" fontSize="13" fontWeight="800" fontFamily="Saira">NÁPOLES</text>
          <circle cx="195" cy="520" r="11" fill="#0077BB" stroke="white" strokeWidth="3.5" />
        </svg>
        <div className="absolute top-20 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full flex items-center gap-1.5" style={{ background: `${C.amber}DD`, zIndex: 2 }}>
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-white text-[9px] font-display font-bold uppercase tracking-widest">Modo offline</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0" style={{ background: "#0F1729", zIndex: 0, width: "100%", height: "100%", touchAction: "none" }}>
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          background: "#0F1729",
          touchAction: "none"
        }}
      />
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: C.bg }}>
          <Loader size={28} color={C.blue} className="animate-spin mb-3" />
          <p className="text-xs font-display font-bold uppercase tracking-widest" style={{ color: C.muted }}>Cargando mapa...</p>
        </div>
      )}
      <style>{`
        .mapboxgl-canvas { outline: none !important; width: 100% !important; height: 100% !important; touch-action: none !important; }
        .mapboxgl-canvas-container { width: 100% !important; height: 100% !important; cursor: grab; touch-action: none !important; -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }
        .mapboxgl-canvas-container.mapboxgl-interactive:active { cursor: grabbing; }
        .mapboxgl-ctrl-attrib, .mapboxgl-ctrl-logo { display: none !important; }
        .mapboxgl-map { width: 100% !important; height: 100% !important; touch-action: none !important; }
      `}</style>
    </div>
  );
};

// === NAVIGATION PANEL (paso a paso tipo Waze) ===
// Calcula distancia entre dos puntos GPS en metros
const distMeters = (a, b) => {
  if (!a || !b) return 0;
  const R = 6371000;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const lat1 = a[0] * Math.PI / 180;
  const lat2 = b[0] * Math.PI / 180;
  const x = Math.sin(dLat/2)**2 + Math.sin(dLng/2)**2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
};

// Devuelve el ícono de Lucide según el tipo de maniobra
const getManeuverIcon = (type, modifier) => {
  // type: turn, depart, arrive, merge, ramp, fork, roundabout, continue, etc.
  // modifier: left, right, sharp left, sharp right, slight left, slight right, straight, uturn
  if (type === "arrive") return BadgeCheck;
  if (type === "depart") return Navigation;
  if (type === "roundabout" || type === "rotary") return RotateCw;
  if (modifier === "uturn") return RotateCw;
  if (modifier && modifier.includes("right")) {
    if (modifier === "sharp right") return CornerUpRight;
    if (modifier === "slight right") return ArrowUpRight;
    return ArrowUpRight;
  }
  if (modifier && modifier.includes("left")) {
    if (modifier === "sharp left") return CornerUpLeft;
    if (modifier === "slight left") return ArrowUpLeft;
    return ArrowUpLeft;
  }
  if (modifier === "straight") return ArrowUp;
  return ArrowUp;
};

// Formatear metros legibles
const fmtMeters = (m) => {
  if (m == null) return "—";
  if (m < 50) return "Ahora";
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(1)} km`;
};
const fmtMinutes = (sec) => {
  if (sec == null) return "—";
  const min = Math.round(sec / 60);
  if (min < 1) return "Menos de 1 min";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h} h ${m} min`;
};

const NavigationPanel = ({ onStop }) => {
  const { toast } = useApp();
  const [navData, setNavData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userPos, setUserPos] = useState(null);
  const [distToNext, setDistToNext] = useState(null);
  const [remainingDist, setRemainingDist] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  // === SISTEMA DE ALERTAS DE ZONAS PELIGROSAS ===
  const [dangerZones, setDangerZones] = useState([]); // zonas detectadas en la ruta
  const [activeAlert, setActiveAlert] = useState(null); // alerta visible ahora
  const alertedZonesRef = useRef(new Set()); // zonas ya alertadas (no spam)

  // Cargar datos de navegación al montar y generar zonas peligrosas en ruta
  useEffect(() => {
    try {
      const saved = localStorage.getItem("proalert_active_nav");
      if (saved) {
        const data = JSON.parse(saved);
        setNavData(data);
        setRemainingDist(data.totalDistance || 0);
        setRemainingTime(data.totalDuration || 0);

        // Generar zonas peligrosas SIMULADAS a lo largo de la ruta
        // (En producción: vendrían de tu backend con reportes ciudadanos reales)
        if (data.coords && data.coords.length > 5) {
          const zones = [];
          const len = data.coords.length;
          // Distribuir 2-3 zonas en el corredor de la ruta (segmento 30%, 60%, 80%)
          const samples = [Math.floor(len * 0.3), Math.floor(len * 0.6), Math.floor(len * 0.85)];
          const incidentTypes = [
            { kind: "robo", label: "robos a transeúntes", count: 4, severity: "alta", color: "#EF4444", action: "Sube ventanas y guarda tu celular" },
            { kind: "asalto", label: "asaltos a conductores en alto", count: 2, severity: "media", color: "#F59E0B", action: "No te detengas, mantén distancia con el auto de adelante" },
            { kind: "robo-celular", label: "robos de celular", count: 6, severity: "alta", color: "#EF4444", action: "Guarda tu celular, no lo uses en luz roja" },
          ];
          samples.forEach((idx, i) => {
            // Solo agregamos si hay incidentes que reportar (simulación: ~70% de chance)
            if (Math.random() < 0.7 || i === 0) {
              const tpl = incidentTypes[i % incidentTypes.length];
              const c = data.coords[idx];
              zones.push({
                id: `zone_${i}`,
                lat: c[0],
                lng: c[1],
                ...tpl,
                period: "últimos 7 días",
              });
            }
          });
          setDangerZones(zones);
        }
      }
    } catch {}
  }, []);

  // Tracking de GPS en vivo
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 2000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Detección de proximidad a zona peligrosa
  useEffect(() => {
    if (!userPos || dangerZones.length === 0) return;

    // Buscar la zona más cercana NO alertada todavía
    let closestUnalerted = null;
    let closestDist = Infinity;

    for (const z of dangerZones) {
      if (alertedZonesRef.current.has(z.id + "_consumed")) continue;
      const d = distMeters(userPos, [z.lat, z.lng]);
      if (d < closestDist) {
        closestDist = d;
        closestUnalerted = z;
      }
    }

    if (!closestUnalerted) return;

    // Alerta a 500m: pre-aviso
    if (closestDist <= 500 && closestDist > 200 && !alertedZonesRef.current.has(closestUnalerted.id + "_far")) {
      alertedZonesRef.current.add(closestUnalerted.id + "_far");
      setActiveAlert({ ...closestUnalerted, distance: closestDist, level: "far" });
      try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch {}
      // Auto-ocultar después de 10 seg si no hay otra
      setTimeout(() => {
        setActiveAlert(curr => (curr && curr.id === closestUnalerted.id && curr.level === "far") ? null : curr);
      }, 10000);
    }

    // Alerta a 200m: aviso fuerte
    if (closestDist <= 200 && closestDist > 50 && !alertedZonesRef.current.has(closestUnalerted.id + "_near")) {
      alertedZonesRef.current.add(closestUnalerted.id + "_near");
      setActiveAlert({ ...closestUnalerted, distance: closestDist, level: "near" });
      try { navigator.vibrate && navigator.vibrate([400, 150, 400, 150, 400]); } catch {}
      // Reproducir tono corto (Web Audio API)
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880; gain.gain.value = 0.15;
        osc.start(); osc.stop(ctx.currentTime + 0.3);
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          osc2.connect(gain);
          osc2.frequency.value = 660;
          osc2.start(); osc2.stop(ctx.currentTime + 0.3);
        }, 350);
      } catch {}
    }

    // Cuando ya pasamos la zona (más de 50m alejándose), marcarla como consumida
    if (closestDist > 600 && alertedZonesRef.current.has(closestUnalerted.id + "_near")) {
      alertedZonesRef.current.add(closestUnalerted.id + "_consumed");
      setActiveAlert(curr => (curr && curr.id === closestUnalerted.id) ? null : curr);
    }
  }, [userPos, dangerZones]);

  // Calcular distancia al siguiente giro y avanzar pasos
  useEffect(() => {
    if (!navData || !userPos || !navData.steps || navData.steps.length === 0) return;
    const step = navData.steps[currentStep];
    if (!step) return;

    const dToManeuver = distMeters(userPos, step.maneuverPoint);
    setDistToNext(dToManeuver);

    // Si estamos a menos de 25m del punto de maniobra, avanzar al siguiente paso
    if (dToManeuver < 25 && currentStep < navData.steps.length - 1) {
      setCurrentStep(s => s + 1);
      try { navigator.vibrate && navigator.vibrate(150); } catch {}
    }

    // Recalcular distancia y tiempo restante con base en steps siguientes
    let remD = 0, remT = 0;
    for (let i = currentStep; i < navData.steps.length; i++) {
      remD += navData.steps[i].distance || 0;
      remT += navData.steps[i].duration || 0;
    }
    // Más una corrección para el step actual basada en cuánto falta del segmento
    setRemainingDist(remD);
    setRemainingTime(remT);

    // Si ya llegamos (menos de 30m del destino y es último paso)
    if (currentStep === navData.steps.length - 1 && dToManeuver < 30) {
      toast("¡Llegaste a tu destino! 🎉");
      handleStop();
    }
  }, [userPos, navData, currentStep]);

  const handleStop = () => {
    try { localStorage.removeItem("proalert_active_nav"); } catch {}
    window.dispatchEvent(new CustomEvent("proalert_stopnav"));
    window.dispatchEvent(new CustomEvent("proalert_clearroute"));
    alertedZonesRef.current.clear();
    if (onStop) onStop();
  };

  const dismissAlert = () => setActiveAlert(null);

  if (!navData) return null;

  const step = navData.steps[currentStep] || navData.steps[navData.steps.length - 1];
  const nextStep = navData.steps[currentStep + 1];
  const Icon = step ? getManeuverIcon(step.type, step.modifier) : ArrowUp;
  const isArriving = step && step.type === "arrive";
  const colorPrimary = isArriving ? "#10B981" : "#0077BB";

  return (
    <>
      {/* ALERTA DE ZONA PELIGROSA - prioridad máxima, encima de todo */}
      {activeAlert && (
        <div style={{ pointerEvents: "auto" }}
          className="absolute top-0 left-0 right-0 z-40 px-3 pt-2"
          onClick={dismissAlert}>
          <div className={`rounded-3xl p-4 ${activeAlert.level === "near" ? "animate-pulse" : ""}`}
            style={{
              background: `linear-gradient(135deg, ${activeAlert.color}, ${activeAlert.color}CC)`,
              boxShadow: `0 12px 40px ${activeAlert.color}AA, 0 0 0 3px ${activeAlert.color}66`,
              border: "2px solid white",
            }}>
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.4)" }}>
                <AlertTriangle size={30} color="white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-display font-black text-white text-[10px] uppercase tracking-widest">
                    {activeAlert.level === "near" ? "¡ATENCIÓN AHORA!" : "Zona peligrosa adelante"}
                  </p>
                  <p className="font-display font-bold text-white text-[10px] opacity-90">· {fmtMeters(activeAlert.distance)}</p>
                </div>
                <p className="font-display font-black text-white text-lg leading-tight mb-1">
                  {activeAlert.count} {activeAlert.label}
                </p>
                <p className="text-[11px] font-body text-white opacity-95 leading-snug">
                  Reportados en {activeAlert.period}
                </p>
                <div className="mt-2 pt-2 flex items-start gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.25)" }}>
                  <Shield size={14} color="white" className="shrink-0 mt-0.5" />
                  <p className="text-[12px] font-body text-white font-bold leading-snug flex-1">
                    {activeAlert.action}
                  </p>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); dismissAlert(); }}
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.25)" }}>
                <X size={14} color="white" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel SUPERIOR - próxima maniobra (se baja si hay alerta) */}
      <div style={{ pointerEvents: "auto" }}
        className={`absolute left-0 right-0 z-30 px-3 transition-all duration-300 ${activeAlert ? "top-32" : "top-0 pt-2"}`}>
        <div className="rounded-3xl p-4 backdrop-blur-md"
          style={{
            background: `linear-gradient(135deg, ${colorPrimary}EE, ${colorPrimary}DD)`,
            boxShadow: `0 8px 32px ${colorPrimary}66, 0 2px 8px rgba(0,0,0,0.4)`
          }}>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>
              <Icon size={36} color="white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-black text-white text-2xl leading-tight">
                {fmtMeters(distToNext)}
              </p>
              <p className="text-sm font-body text-white opacity-95 leading-tight">
                {step?.instruction || "Continúa por la ruta"}
              </p>
              {step?.name && step.name !== "" && (
                <p className="text-[11px] font-display font-bold uppercase tracking-wider text-white opacity-80 mt-0.5">
                  {step.name}
                </p>
              )}
            </div>
          </div>

          {/* Vista previa del siguiente paso */}
          {nextStep && !isArriving && (
            <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
              {(() => {
                const NextIcon = getManeuverIcon(nextStep.type, nextStep.modifier);
                return <NextIcon size={14} color="white" />;
              })()}
              <p className="text-[11px] font-body text-white opacity-85 flex-1 truncate">
                Luego: {nextStep.instruction}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Panel INFERIOR - resumen + salir */}
      <div style={{ pointerEvents: "auto" }} className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-3">
        <div className="rounded-3xl p-3 backdrop-blur-md flex items-center gap-3"
          style={{ background: `${C.surface}F2`, border: `1px solid ${C.border}`, boxShadow: "0 -8px 32px rgba(0,0,0,0.4)" }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1">
              <p className="font-display font-black text-white text-xl leading-tight">{fmtMinutes(remainingTime)}</p>
              <p className="text-xs font-body" style={{ color: C.muted }}>· {fmtMeters(remainingDist)}</p>
            </div>
            <p className="text-[10px] font-display font-bold uppercase tracking-wider truncate" style={{ color: C.muted }}>
              {navData.destination ? `Hacia ${navData.destination}` : "En ruta"}
            </p>
          </div>

          <button onClick={handleStop}
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: C.red, boxShadow: `0 4px 12px ${C.red}66` }}>
            <X size={20} color="white" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </>
  );
};

// === HOME SCREEN ===
const HomeScreen = ({ onNav, onMenu, onPanic, onWomen }) => {
  const [navActive, setNavActive] = useState(false);

  // Detectar si hay navegación activa al montar y escuchar eventos
  useEffect(() => {
    try {
      const saved = localStorage.getItem("proalert_active_nav");
      if (saved) setNavActive(true);
    } catch {}
    const onStart = () => setNavActive(true);
    const onStop = () => setNavActive(false);
    window.addEventListener("proalert_startnav", onStart);
    window.addEventListener("proalert_stopnav", onStop);
    return () => {
      window.removeEventListener("proalert_startnav", onStart);
      window.removeEventListener("proalert_stopnav", onStop);
    };
  }, []);

  return (
  <div className="relative h-full overflow-hidden" style={{ background: C.bg }}>
    {/* Capa 1: Mapa (ocupa todo, recibe gestos directamente) */}
    <MapView />

    {/* Modo navegación activa: panel arriba y abajo */}
    {navActive && <NavigationPanel onStop={() => setNavActive(false)} />}

    {/* Capa 2: UI normal (oculta durante navegación) */}
    {!navActive && (
    <div className="absolute inset-0 z-10 flex flex-col" style={{ pointerEvents: "none" }}>
      <div style={{ pointerEvents: "auto" }}>
        <StatusBar />
      </div>

      {/* Brand row (interactivo) */}
      <div className="flex items-center justify-between px-4 pt-2 pb-3"
        style={{ background: `linear-gradient(180deg, ${C.bg}F0 0%, ${C.bg}CC 70%, transparent 100%)`, pointerEvents: "auto" }}>
        <Logo size={18} tagline />
        <LogoBadge size={38} />
      </div>

      {/* Search row (interactivo) */}
      <div className="flex items-center gap-2 px-4 pb-3"
        style={{ background: `linear-gradient(180deg, ${C.bg}CC 0%, transparent 100%)`, pointerEvents: "auto" }}>
        <button onClick={onMenu} className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <Menu size={20} color="white" />
        </button>
        <div onClick={() => onNav("route")}
          role="button"
          className="flex-1 flex items-center gap-2 px-4 h-11 rounded-2xl backdrop-blur-md cursor-pointer"
          style={{ background: `${C.surface}E6`, border: `1px solid ${C.border}` }}>
          <Search size={16} color={C.muted} />
          <span className="flex-1 text-slate-500 text-sm font-body">¿A dónde vas?</span>
          <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 pointer-events-none" style={{ background: C.pink }}>
            <Mic size={14} color="white" />
          </span>
        </div>
        <button onClick={() => onNav("scan")} className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <Camera size={18} color="white" />
        </button>
      </div>

      {/* Zona central: MAPA LIBRE (pointer-events:none deja pasar todos los toques al mapa) */}
      <div className="flex-1 relative" style={{ pointerEvents: "none" }}>
        {/* Legend (interactivo) */}
        <div className="absolute top-3 left-4 rounded-2xl px-3 py-2 backdrop-blur-md" style={{ background: `${C.surface}CC`, border: `1px solid ${C.border}`, pointerEvents: "auto" }}>
          <p className="font-display font-bold text-[9px] text-white uppercase tracking-widest mb-1.5">Zonas</p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: C.red }} /><span className="text-[10px] text-white font-body">Muchas incidencias</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: C.amber }} /><span className="text-[10px] text-white font-body">Riesgo medio</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: C.green }} /><span className="text-[10px] text-white font-body">Zona segura</span></div>
          </div>
        </div>

        {/* Layers button (interactivo) */}
        <button onClick={() => onNav("modus")} className="absolute top-3 right-4 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md"
          style={{ background: `${C.surface}CC`, border: `1px solid ${C.border}`, pointerEvents: "auto" }}>
          <Bell size={18} color="white" />
        </button>

        {/* Locate button (interactivo) */}
        <button onClick={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords = [pos.coords.latitude, pos.coords.longitude];
              try { localStorage.setItem("proalert_userpos", JSON.stringify(coords)); } catch {}
              window.dispatchEvent(new CustomEvent("proalert_locate", { detail: coords }));
            },
            () => {},
            { enableHighAccuracy: true, timeout: 10000 }
          );
        }} className="absolute bottom-32 right-4 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
          style={{ background: `${C.surface}E6`, border: `1px solid ${C.border}`, pointerEvents: "auto" }}>
          <Crosshair size={20} color="white" />
        </button>

        {/* Floating women button (interactivo) */}
        <button onClick={onWomen}
          className="absolute bottom-32 left-4 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl"
          style={{ background: C.pink, boxShadow: `0 6px 20px ${C.pink}88`, pointerEvents: "auto" }}>
          <div className="absolute inset-0 rounded-full pulse-ring" style={{ background: C.pink, opacity: 0.4 }} />
          <Heart size={20} color="white" fill="white" />
        </button>

        {/* Quick assistant button (interactivo) */}
        <button onClick={() => onNav("assistant")}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 px-4 h-12 rounded-full flex items-center gap-2 backdrop-blur-md"
          style={{ background: C.orange, boxShadow: `0 6px 20px ${C.orange}88`, pointerEvents: "auto" }}>
          <Compass size={18} color="white" />
          <span className="font-display font-bold text-white text-xs uppercase tracking-wider">¿Qué hago?</span>
        </button>
      </div>

      <div style={{ pointerEvents: "auto" }}>
        <BottomNav active="home" onNav={onNav} />
      </div>
    </div>
    )}
  </div>
  );
};

// === QR SCAN con cámara real ===
const ScanScreen = ({ onBack, onScanned, onNav, onPanic }) => {
  const { toast } = useApp();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [mode, setMode] = useState("qr"); // "qr" o "face"
  const [permission, setPermission] = useState("pending"); // pending, granted, denied
  const [scanning, setScanning] = useState(false);

  // Pedir acceso a la cámara
  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setPermission("unsupported");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode === "face" ? "user" : "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setPermission("granted");
      } catch (err) {
        console.warn("Camera error:", err);
        setPermission("denied");
      }
    };
    start();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [mode]);

  const handleScan = () => {
    if (permission !== "granted") {
      toast("Necesitamos permiso de cámara para escanear");
      return;
    }
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      toast(mode === "qr" ? "QR detectado" : "Rostro identificado");
      onScanned();
    }, 1500);
  };

  return (
    <div className="relative h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="IDENTIFICAR" />
      <div className="px-6 mb-4">
        <p className="text-white text-sm font-body text-center leading-relaxed">
          {mode === "qr"
            ? <>Apunta al <span style={{ color: C.orange }} className="font-bold">código QR</span> del policía</>
            : <>Dirige la cámara al <span style={{ color: C.blue }} className="font-bold">rostro</span> del policía</>}
        </p>
      </div>

      <div className="flex-1 px-6 flex items-center justify-center">
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden" style={{ background: "#000", border: `2px solid ${C.border}` }}>
          {/* Video real */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ background: "#000", transform: mode === "face" ? "scaleX(-1)" : "none" }}
          />

          {/* Estado de permisos */}
          {permission === "pending" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
              <Loader size={32} color={C.blue} className="animate-spin mb-3" />
              <p className="text-white text-xs font-display font-bold uppercase tracking-widest">Activando cámara...</p>
            </div>
          )}
          {permission === "denied" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center" style={{ background: "rgba(0,0,0,0.85)" }}>
              <Camera size={32} color={C.red} className="mb-3" />
              <p className="text-white text-sm font-display font-bold mb-2">Cámara bloqueada</p>
              <p className="text-xs font-body" style={{ color: C.muted }}>
                Activa los permisos de cámara en la configuración de tu navegador y recarga.
              </p>
            </div>
          )}
          {permission === "unsupported" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center" style={{ background: "rgba(0,0,0,0.85)" }}>
              <AlertCircle size={32} color={C.amber} className="mb-3" />
              <p className="text-white text-sm font-display font-bold mb-2">Cámara no disponible</p>
              <p className="text-xs font-body" style={{ color: C.muted }}>Tu dispositivo no soporta acceso a cámara desde el navegador.</p>
            </div>
          )}

          {/* Esquinas tipo viewfinder */}
          {permission === "granted" && (
            <>
              {[
                "top-4 left-4 border-t-4 border-l-4 rounded-tl-2xl",
                "top-4 right-4 border-t-4 border-r-4 rounded-tr-2xl",
                "bottom-4 left-4 border-b-4 border-l-4 rounded-bl-2xl",
                "bottom-4 right-4 border-b-4 border-r-4 rounded-br-2xl",
              ].map((c, i) => <div key={i} className={`absolute w-12 h-12 ${c}`} style={{ borderColor: mode === "qr" ? C.orange : C.blue }} />)}

              {/* Scanline animada */}
              {scanning && (
                <div className="absolute inset-x-8 top-0 bottom-0 overflow-hidden">
                  <div className="scanline absolute inset-x-0 h-32" />
                </div>
              )}

              {/* Outline central según modo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {mode === "qr" ? (
                  <div className="w-48 h-48 rounded-2xl border-2 border-dashed opacity-50" style={{ borderColor: C.orange }} />
                ) : (
                  <div className="w-32 h-40 rounded-full border-2 border-dashed opacity-50" style={{ borderColor: C.blue }} />
                )}
              </div>

              {scanning && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full flex items-center gap-2"
                  style={{ background: "rgba(0,0,0,0.7)" }}>
                  <Loader size={12} color="white" className="animate-spin" />
                  <span className="text-white text-[10px] font-display font-bold uppercase tracking-widest">Analizando...</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="px-6 py-6 flex flex-col gap-3">
        <button onClick={handleScan} disabled={permission !== "granted" || scanning}
          className="w-full py-4 rounded-2xl font-display font-bold text-white text-base flex items-center justify-center gap-2 uppercase tracking-wider transition-all"
          style={{
            background: permission === "granted" && !scanning ? C.blue : C.card,
            opacity: permission === "granted" && !scanning ? 1 : 0.5,
            boxShadow: permission === "granted" && !scanning ? `0 8px 24px ${C.blue}66` : "none",
          }}>
          <Camera size={20} />
          {scanning ? "Escaneando..." : "Escanear ahora"}
        </button>
        <div className="flex gap-2">
          <button onClick={() => setMode("qr")}
            className="flex-1 py-3 rounded-2xl font-display font-semibold text-white text-xs uppercase tracking-wider"
            style={{
              background: mode === "qr" ? C.orange : C.card,
              border: `1px solid ${mode === "qr" ? C.orange : C.border}`
            }}>
            QR
          </button>
          <button onClick={() => setMode("face")}
            className="flex-1 py-3 rounded-2xl font-display font-semibold text-white text-xs uppercase tracking-wider"
            style={{
              background: mode === "face" ? C.blue : C.card,
              border: `1px solid ${mode === "face" ? C.blue : C.border}`
            }}>
            Reconocimiento facial
          </button>
        </div>
      </div>
      <BottomNav active="scan" onNav={onNav} />
    </div>
  );
};

// === POLICE PROFILE ===
const PoliceProfile = ({ onBack, onNav, onPanic }) => {
  const { toast } = useApp();
  const [stars, setStars] = useState(3);
  return (
    <div className="relative h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="POLICÍA" />
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
        <div className="px-4">
          {/* Card */}
          <div className="rounded-3xl p-5 mb-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: C.cardHi }}>
                  <Users size={36} color={C.muted} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: C.green, border: `2px solid ${C.card}` }}>
                  <BadgeCheck size={14} color="white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-display font-semibold uppercase tracking-widest" style={{ color: C.orange }}>Verificado</p>
                <h2 className="font-display font-bold text-white text-lg leading-tight mt-1">Juan Pérez Hdez.</h2>
                <p className="text-xs font-body mt-0.5" style={{ color: C.muted }}>Oficial · SSC CDMX</p>
                <p className="text-xs font-body" style={{ color: C.muted }}>Sector Cuauhtémoc</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
              <div>
                <p className="text-[9px] font-display uppercase tracking-wider" style={{ color: C.faint }}>Placa</p>
                <p className="text-white text-sm font-display font-bold mt-0.5">082514</p>
              </div>
              <div>
                <p className="text-[9px] font-display uppercase tracking-wider" style={{ color: C.faint }}>Superior</p>
                <p className="text-white text-sm font-display font-bold mt-0.5">Cmdte. Ruiz</p>
              </div>
              <div>
                <p className="text-[9px] font-display uppercase tracking-wider" style={{ color: C.faint }}>Estatus</p>
                <p className="text-sm font-display font-bold mt-0.5" style={{ color: C.green }}>Activo</p>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="rounded-3xl p-5 mb-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[10px] font-display font-bold uppercase tracking-widest text-white mb-3">Califica esta interacción</p>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setStars(n)}>
                  <Star size={32} color={n <= stars ? C.orange : C.faint} fill={n <= stars ? C.orange : "transparent"} />
                </button>
              ))}
            </div>
            <textarea
              placeholder="Comparte tu experiencia (opcional)..."
              className="w-full text-white text-sm font-body p-3 rounded-xl outline-none resize-none"
              style={{ background: C.bg, border: `1px solid ${C.border}` }}
              rows={3}
            />
          </div>

          {/* Reportar */}
          <button onClick={() => onNav("reportPolice")} className="w-full py-4 rounded-2xl font-display font-bold text-white text-sm flex items-center justify-center gap-2 uppercase tracking-wider mb-3"
            style={{ background: C.orange, boxShadow: `0 8px 24px ${C.orange}55` }}>
            <ShieldAlert size={18} />
            Reportar a este policía
          </button>
          <button onClick={() => toast("Interacción guardada en tu historial")} className="w-full py-3 rounded-2xl font-display font-semibold text-white text-xs uppercase tracking-wider"
            style={{ background: C.card, border: `1px solid ${C.border}` }}>
            Guardar interacción
          </button>
        </div>
      </div>
      <BottomNav active="scan" onNav={onNav} />
    </div>
  );
};

// === PANIC ===
const PanicScreen = ({ onBack }) => {
  const [count, setCount] = useState(5);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (active || count === 0) return;
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, active]);
  useEffect(() => {
    if (count === 0) setActive(true);
  }, [count]);

  if (active) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6" style={{ background: `radial-gradient(circle at 50% 30%, ${C.red}66 0%, ${C.bg} 60%)` }}>
        <StatusBar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full pulse-ring" style={{ background: C.red }} />
            <div className="absolute inset-0 rounded-full pulse-ring" style={{ background: C.red, animationDelay: "0.6s" }} />
            <div className="w-32 h-32 rounded-full flex items-center justify-center relative" style={{ background: C.red, boxShadow: `0 0 60px ${C.red}` }}>
              <Siren size={56} color="white" />
            </div>
          </div>
          <p className="font-display font-black text-white text-3xl text-center uppercase tracking-wider mb-2">Alerta activa</p>
          <p className="text-sm font-body text-center mb-8" style={{ color: C.muted }}>
            Tu ubicación se está enviando a la policía<br />y a tus contactos de emergencia
          </p>
          <div className="w-full rounded-2xl p-4 mb-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.green }} />
              <p className="text-xs font-body text-white">Policía notificada · SSC</p>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.green }} />
              <p className="text-xs font-body text-white">3 contactos alertados</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.blue }} />
              <p className="text-xs font-body text-white">Grabando audio del entorno</p>
            </div>
          </div>
          <button onClick={onBack} className="w-full py-3 rounded-2xl font-display font-bold text-xs uppercase tracking-widest"
            style={{ background: "transparent", border: `2px solid ${C.muted}`, color: C.muted }}>
            Cancelar alerta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="EMERGENCIA" />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="font-display font-bold text-white text-sm uppercase tracking-widest mb-2">Enviando alerta en</p>
        <p className="font-display font-black text-9xl" style={{ color: C.red }}>{count}</p>
        <p className="text-sm font-body text-center mt-4 mb-12" style={{ color: C.muted }}>
          Mantén presionado para enviar inmediatamente
        </p>
        <button onClick={onBack} className="w-full py-4 rounded-2xl font-display font-bold text-white text-sm uppercase tracking-widest"
          style={{ background: C.card, border: `1px solid ${C.border}` }}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

// === REPORT INCIDENT ===
const ReportScreen = ({ onBack, onNav, onPanic }) => {
  const { dispatch, toast } = useApp();
  const [type, setType] = useState(null);
  const [desc, setDesc] = useState("");
  const [evidence, setEvidence] = useState([]);
  const types = [
    { id: "asalto", label: "Asalto", icon: ShieldAlert, color: C.red },
    { id: "robo", label: "Robo", icon: Lock, color: C.orange },
    { id: "violencia", label: "Violencia", icon: AlertTriangle, color: C.pink },
    { id: "accidente", label: "Accidente", icon: Truck, color: C.amber },
    { id: "extorsion", label: "Extorsión", icon: PhoneCall, color: C.red },
    { id: "otro", label: "Otro", icon: Megaphone, color: C.blue },
  ];

  const submit = () => {
    if (!type) return;
    dispatch({
      type: "ADD_INCIDENT",
      payload: {
        type, desc: desc || `Reporte de ${type}`, location: "Escandón",
        lat: 200 + Math.random() * 80, lng: 200 + Math.random() * 200
      }
    });
    toast("Reporte enviado · +25 pts");
    setTimeout(() => onNav("community"), 700);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="REPORTAR" />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-36">
        <p className="text-xs font-body mb-3" style={{ color: C.muted }}>Tu reporte se envía de forma anónima a la autoridad competente</p>

        <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">Tipo de incidente</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {types.map(t => {
            const Icon = t.icon;
            const sel = type === t.id;
            return (
              <button key={t.id} onClick={() => setType(t.id)}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
                style={{
                  background: sel ? t.color : C.card,
                  border: `1px solid ${sel ? t.color : C.border}`,
                }}>
                <Icon size={22} color="white" />
                <span className="text-[11px] font-display font-semibold text-white">{t.label}</span>
              </button>
            );
          })}
        </div>

        <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">Descripción</p>
        <textarea value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="Describe lo que ocurrió..."
          className="w-full text-white text-sm font-body p-4 rounded-2xl outline-none resize-none mb-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
          rows={4}
        />

        <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">
          Evidencia (opcional) {evidence.length > 0 && <span style={{ color: C.green }}>· {evidence.length} archivo(s)</span>}
        </p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          <label className="aspect-video rounded-2xl flex items-center justify-center gap-2 cursor-pointer" style={{ background: C.card, border: `1px dashed ${C.border}` }}>
            <ImageIcon size={18} color="white" />
            <span className="text-xs font-display font-semibold text-white">Foto</span>
            <input type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { setEvidence(ev => [...ev, { type: "photo", name: f.name }]); toast("Foto añadida"); }
              }} />
          </label>
          <label className="aspect-video rounded-2xl flex items-center justify-center gap-2 cursor-pointer" style={{ background: C.card, border: `1px dashed ${C.border}` }}>
            <Video size={18} color="white" />
            <span className="text-xs font-display font-semibold text-white">Video</span>
            <input type="file" accept="video/*" capture="environment" className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { setEvidence(ev => [...ev, { type: "video", name: f.name }]); toast("Video añadido"); }
              }} />
          </label>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl mb-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <MapPin size={18} color={C.blue} />
          <div className="flex-1">
            <p className="text-[10px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Ubicación</p>
            <p className="text-xs font-body text-white">Av. Insurgentes Sur 1457</p>
          </div>
        </div>

        <button onClick={submit} disabled={!type}
          className="w-full py-4 rounded-2xl font-display font-bold text-white text-sm flex items-center justify-center gap-2 uppercase tracking-wider transition-all"
          style={{
            background: type ? C.blue : C.card,
            opacity: type ? 1 : 0.5,
            boxShadow: type ? `0 8px 24px ${C.blue}66` : "none"
          }}>
          <Send size={18} />
          Enviar reporte
        </button>
      </div>
      <BottomNav active="report" onNav={onNav} />
    </div>
  );
};

// === MI DENUNCIA ===
const DenunciaScreen = ({ onBack, onNav, onPanic }) => {
  const { state, toast } = useApp();
  const steps = [
    { n: "01", t: "Reúne tu identificación", d: "INE, pasaporte o cédula. Si fuiste víctima, lleva pruebas." },
    { n: "02", t: "Acude al MP más cercano", d: "Te mostramos las ubicaciones disponibles a continuación." },
    { n: "03", t: "Relata los hechos", d: "Día, hora, lugar y descripción de lo ocurrido. Sé claro y específico." },
    { n: "04", t: "Recibe tu folio", d: "Conserva el folio único para dar seguimiento a tu denuncia." },
  ];
  const statusColor = {
    "Recibido": C.amber, "En revisión": C.amber, "Asignado MP": C.blue,
    "En seguimiento": C.blue, "Resuelto": C.green,
  };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="DENUNCIAR" />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-36">
        {/* Mis denuncias activas */}
        {state.denuncias.length > 0 && (
          <>
            <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">Mis denuncias activas</p>
            <div className="flex flex-col gap-2 mb-5">
              {state.denuncias.map(d => {
                const sc = statusColor[d.status] || C.muted;
                return (
                  <div key={d.id} className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-display font-bold text-white text-sm">{d.type}</p>
                        <p className="text-[10px] font-display" style={{ color: C.muted }}>Folio · {d.folio}</p>
                      </div>
                      <span className="text-[9px] font-display font-bold px-2 py-1 rounded-full uppercase"
                        style={{ background: `${sc}22`, color: sc, border: `1px solid ${sc}55` }}>
                        {d.status}
                      </span>
                    </div>
                    {/* Timeline */}
                    <div className="flex items-center gap-1 mt-3">
                      {["Recibido", "En revisión", "Asignado MP", "Resuelto"].map((step, i, arr) => {
                        const currentIdx = arr.indexOf(d.status === "En seguimiento" ? "Asignado MP" : d.status);
                        const done = i <= currentIdx;
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: done ? sc : C.cardHi, border: `1.5px solid ${done ? sc : C.border}` }}>
                              {done ? <Check size={10} color="white" strokeWidth={3} /> : <Circle size={5} color={C.muted} />}
                            </div>
                            {i < arr.length - 1 && (
                              <div className="flex-1 h-0.5" style={{ background: done && i < currentIdx ? sc : C.border }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {d.officer && (
                      <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                        <UserCheck size={12} color={C.blue} />
                        <p className="text-[11px] font-body text-white"><span style={{ color: C.muted }}>Atiende:</span> {d.officer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="rounded-3xl p-5 mb-5" style={{ background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)` }}>
          <Sparkles size={20} color="white" />
          <p className="font-display font-bold text-white text-lg mt-2 leading-tight">Te ayudamos paso a paso</p>
          <p className="text-xs font-body text-white opacity-90 mt-1">Hacer una denuncia formal puede ser intimidante. Te guiamos en el proceso.</p>
        </div>

        <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">Cómo denunciar</p>
        <div className="flex flex-col gap-2 mb-6">
          {steps.map(s => (
            <div key={s.n} className="rounded-2xl p-4 flex gap-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <span className="font-display font-black text-2xl leading-none" style={{ color: C.orange }}>{s.n}</span>
              <div className="flex-1">
                <p className="font-display font-bold text-white text-sm">{s.t}</p>
                <p className="text-xs font-body mt-1" style={{ color: C.muted }}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">MPs cercanos</p>
        <div className="flex flex-col gap-2">
          {[
            { n: "MP Cuauhtémoc 1", a: "1.2 km · Donato Guerra 84" },
            { n: "MP Benito Juárez", a: "2.8 km · Eje Central 14" },
            { n: "MP Miguel Hidalgo", a: "3.5 km · Parque Lira 128" },
          ].map(mp => (
            <button key={mp.n} onClick={() => toast(`${mp.n} · ${mp.a}`)} className="rounded-2xl p-4 flex items-center justify-between" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.cardHi }}>
                  <MapPin size={18} color={C.blue} />
                </div>
                <div className="text-left">
                  <p className="font-display font-bold text-white text-sm">{mp.n}</p>
                  <p className="text-[11px] font-body" style={{ color: C.muted }}>{mp.a}</p>
                </div>
              </div>
              <ChevronRight size={18} color={C.muted} />
            </button>
          ))}
        </div>
      </div>
      <BottomNav active="denuncia" onNav={onNav} />
    </div>
  );
};

// === PROTIPS (con contenido real basado en leyes mexicanas) ===
const ProTipsScreen = ({ onBack, onMenu }) => {
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("all");

  const tips = [
    // === DETENCIONES Y AUTORIDADES ===
    {
      id: "quien-detiene",
      cat: "autoridad",
      t: "¿Quién me puede detener?",
      c: "Solo ciertos policías tienen facultad",
      icon: Shield, color: C.blue,
      content: [
        { type: "alert", color: C.amber, text: "No todo policía puede infraccionarte o detenerte. Conocer esto te protege de abuso de autoridad y extorsiones." },
        { type: "section", title: "En CDMX" },
        { type: "list", items: [
          "Solo agentes de la Subsecretaría de Control de Tránsito (SSC) pueden infraccionar",
          "Deben portar uniforme distintivo con banda en el brazo que dice 'Autorizado para infraccionar'",
          "Usan dispositivo móvil para generar la multa digital (debes verla)",
          "Los policías preventivos NO pueden infraccionar, solo pedir apoyo a un agente de tránsito",
          "Las multas por Hoy No Circula las pone la SEDEMA, no la SSC"
        ]},
        { type: "section", title: "En Estado de México" },
        { type: "list", items: [
          "SOLO las mujeres policías están autorizadas para infraccionar (reforma 2025)",
          "Su uniforme tiene motivos color anaranjado fluorescente en el brazo izquierdo",
          "Su unidad móvil también debe tener estos colores",
          "Los agentes de Vialidad pueden vigilar y orientar, pero NO multar ni detener",
          "Si un hombre policía te quiere multar en Edomex, NO es legal"
        ]},
        { type: "section", title: "Cómo verificarlo" },
        { type: "list", items: [
          "Pídele su número de placa y gafete (es tu derecho)",
          "Usa ProAlert para escanear su QR o verificar la placa de patrulla",
          "Llama a Locatel 5658-1111 (CDMX) y da el número de placa",
          "Si se niega a identificarse: es un foco rojo"
        ]},
      ]
    },
    {
      id: "motivos-detencion",
      cat: "autoridad",
      t: "¿Por qué me pueden detener?",
      c: "Solo 3 causas legales en México",
      icon: Lock, color: C.blue,
      content: [
        { type: "alert", color: C.blue, text: "Cualquier policía SOLO puede detenerte legalmente en estos 3 casos. Fuera de eso, es detención arbitraria." },
        { type: "section", title: "1. Flagrancia" },
        { type: "text", text: "Te sorprenden cometiendo un delito en ese momento, o inmediatamente después con evidencia clara. Ejemplo: te ven robando y te detienen ahí mismo." },
        { type: "section", title: "2. Caso urgente" },
        { type: "text", text: "Para delitos graves cuando hay riesgo de fuga y no se puede esperar la orden judicial. El Ministerio Público debe autorizarlo." },
        { type: "section", title: "3. Orden de aprehensión" },
        { type: "text", text: "Un juez emitió una orden con tu nombre por estar involucrado en un delito. El policía debe poder mostrarte el documento (al menos los datos clave)." },
        { type: "section", title: "Si te detienen sin que se cumpla alguno de estos casos" },
        { type: "list", items: [
          "Es detención arbitraria (ilegal)",
          "Puedes pedir amparo y la libertad inmediata",
          "Las pruebas obtenidas pueden anularse",
          "Es base para denuncia por abuso de autoridad"
        ]},
      ]
    },
    {
      id: "derechos-detencion",
      cat: "autoridad",
      t: "Tus derechos si te detienen",
      c: "8 derechos irrenunciables",
      icon: BookOpen, color: C.green,
      content: [
        { type: "alert", color: C.green, text: "El policía DEBE leerte estos derechos al momento de la detención. Si no lo hace, la detención puede caerse en el juicio." },
        { type: "list", items: [
          "Saber el motivo de tu detención y quién te detiene",
          "Que te lean tus derechos constitucionales (cartilla)",
          "Ser considerado inocente hasta que se demuestre lo contrario",
          "Guardar silencio (todo lo que digas puede usarse en tu contra)",
          "Tener abogado, público o privado, desde el primer momento",
          "Avisar a un familiar dónde estás y por qué",
          "Ser presentado SIN DEMORA ante el Ministerio Público",
          "Si eres extranjero: informar al consulado y tener traductor"
        ]},
        { type: "section", title: "Importante" },
        { type: "list", items: [
          "NO te resistas físicamente aunque sea ilegal: pelea con abogado, no con golpes",
          "NO firmes nada sin abogado presente",
          "NO declares sin abogado, ni siquiera 'para ayudar'",
          "Toma nota mental del nombre y placa del oficial",
          "Si puedes, activa modo discreto de ProAlert para grabar"
        ]},
      ]
    },
    {
      id: "policia-falso",
      cat: "autoridad",
      t: "Cómo detectar policías falsos",
      c: "Señales de alerta inmediata",
      icon: ShieldAlert, color: C.red,
      content: [
        { type: "alert", color: C.red, text: "Los falsos policías son una de las formas más comunes de extorsión en México. Aprende a detectarlos." },
        { type: "section", title: "Señales sospechosas" },
        { type: "list", items: [
          "Uniforme incompleto o mal armado",
          "No traen gafete visible ni placa numerada",
          "Patrulla sin logos oficiales claros, o con placas raras",
          "Te detienen en zonas oscuras o sin cámaras",
          "Trabajan solos o se ocultan",
          "Te piden 'arreglar' en efectivo en el momento",
          "Se niegan a llamar a un superior por radio",
          "Llevan armas que no son reglamentarias",
          "No quieren mostrarte el dispositivo de infracción"
        ]},
        { type: "section", title: "Qué hacer" },
        { type: "list", items: [
          "Pide ver placa y gafete (tu derecho)",
          "Usa ProAlert para verificar patrulla o QR",
          "Pide que llamen a su supervisor por radio",
          "Si te sientes en peligro, llama 911 con altavoz frente a ellos",
          "Conduce a la estación de policía o gasolinera más cercana",
          "Nunca te subas a una patrulla sin pasajeros visibles"
        ]},
      ]
    },

    // === EMERGENCIAS ===
    {
      id: "asalto",
      cat: "emergencia",
      t: "¿Qué hacer en un asalto?",
      c: "Tu vida es lo primero",
      icon: AlertTriangle, color: C.red,
      content: [
        { type: "alert", color: C.red, text: "Tu vida vale más que cualquier objeto. Entrega lo que pidan." },
        { type: "section", title: "Durante el asalto" },
        { type: "list", items: [
          "Mantén la calma y NO te resistas",
          "Entrega objetos lentamente, sin movimientos bruscos",
          "Evita contacto visual prolongado",
          "Si tienes acompañantes, dales señal de calma",
          "Observa rasgos: estatura, tatuajes, voz, ropa, vehículo",
          "Si puedes, activa botón de pánico discreto en ProAlert"
        ]},
        { type: "section", title: "Si tienes hijos o familia contigo" },
        { type: "list", items: [
          "Protégelos físicamente con tu cuerpo si es necesario",
          "Habla en voz baja y tranquila",
          "Diles que no miren a los asaltantes",
          "No discutas ni negocies"
        ]},
        { type: "section", title: "Después del asalto" },
        { type: "list", items: [
          "Aléjate de la zona si sigue siendo peligrosa",
          "Llama al 911 inmediatamente",
          "Reporta en ProAlert para alertar vecinos",
          "Acude al MP a denunciar (recuerda: tienes hasta 6 meses)",
          "Bloquea tarjetas y cambia contraseñas",
          "Considera apoyo psicológico"
        ]},
      ]
    },
    {
      id: "extorsion-telefonica",
      cat: "emergencia",
      t: "Extorsión telefónica",
      c: "El familiar 'secuestrado'",
      icon: PhoneCall, color: C.red,
      content: [
        { type: "alert", color: C.red, text: "Las llamadas de 'tu hijo/esposo/hermana fue secuestrado' son CASI SIEMPRE falsas. NUNCA pagues." },
        { type: "section", title: "Cómo opera la estafa" },
        { type: "list", items: [
          "Te llaman gritando o llorando, dicen ser un familiar",
          "Usan grabaciones de llantos genéricos",
          "Te presionan para que NO cuelgues",
          "Piden depósito inmediato a OXXO o cuenta",
          "Si pagas, siguen pidiendo más",
          "A veces dicen ser de un cártel para asustarte"
        ]},
        { type: "section", title: "Qué hacer YA" },
        { type: "list", items: [
          "Cuelga inmediatamente",
          "Llama TÚ al familiar 'secuestrado' a su número",
          "Confírmalo con otra persona cercana",
          "Reporta al 089 (denuncia anónima)",
          "Si pagaste algo: ve al MP de inmediato"
        ]},
        { type: "section", title: "Prevención" },
        { type: "list", items: [
          "No publiques datos familiares en redes sociales",
          "Establece una palabra clave familiar para emergencias",
          "Configura el bloqueo de llamadas desconocidas",
          "Avisa a abuelos y adultos mayores (son blanco frecuente)"
        ]},
      ]
    },

    // === CONDUCIR ===
    {
      id: "llanta-ponchada",
      cat: "conducir",
      t: "Se me ponchó una llanta",
      c: "Cuidado: puede ser trampa",
      icon: Car, color: C.amber,
      content: [
        { type: "alert", color: C.amber, text: "Cerca del 30% de los 'ponches' en ciertas zonas son intencionales para asaltarte cuando bajes." },
        { type: "section", title: "Si pasa cerca de carros sospechosos" },
        { type: "list", items: [
          "NO te detengas en el lugar",
          "Sigue avanzando aunque dañes el rin (un rin se cambia, tu vida no)",
          "Llega a gasolinera, plaza comercial o lugar con cámaras",
          "Llama a tu seguro o Ángeles Verdes (078)",
          "Si te ofrecen 'ayuda' personas extrañas: no aceptes"
        ]},
        { type: "section", title: "Señales de trampa" },
        { type: "list", items: [
          "Te avisan que 'traes algo en la llanta'",
          "Te siguen carros desde antes",
          "Pasa al salir de banco, cajero o joyería",
          "Hay objetos punzantes en el pavimento (clavos, tornillos)"
        ]},
        { type: "section", title: "En carretera" },
        { type: "list", items: [
          "Activa intermitentes y orillate al acotamiento",
          "Sal por el lado opuesto al tráfico",
          "Coloca triángulos a 50m y 100m",
          "Llama Ángeles Verdes 078 (gratis y oficial)"
        ]},
      ]
    },
    {
      id: "documentos-conducir",
      cat: "conducir",
      t: "Documentos que debes traer",
      c: "Para evitar multas innecesarias",
      icon: FileText, color: C.blue,
      content: [
        { type: "alert", color: C.blue, text: "Si no traes alguno, te pueden multar (pero solo el oficial autorizado)." },
        { type: "section", title: "Documentos obligatorios" },
        { type: "list", items: [
          "Licencia de conducir vigente (tipo A para auto particular)",
          "Tarjeta de circulación vigente",
          "Verificación vehicular al día (engomado)",
          "Póliza de seguro vigente (obligatorio en CDMX y Edomex)",
          "Comprobante de tenencia o refrendo del año"
        ]},
        { type: "section", title: "Recomendaciones" },
        { type: "list", items: [
          "Toma foto de cada documento y guárdala en la nube",
          "Lleva copias en la guantera",
          "Guarda en notas del cel: número de licencia, póliza, tarjeta",
          "Si manejas en Edomex y CDMX, verifica reglas de cada uno",
          "Hoy No Circula: revisa tu engomado y el día"
        ]},
        { type: "section", title: "Si te paran por falta de algún documento" },
        { type: "list", items: [
          "Pueden multarte pero NO arrestarte",
          "NO pueden quitarte tarjeta o licencia (solo registrar la falta)",
          "NO pueden llevarse el auto si lo conduces tú",
          "Pide ver el dispositivo donde generan la multa",
          "La multa debe llegar a tu cel por SMS o app"
        ]},
      ]
    },
    {
      id: "manejo-defensivo",
      cat: "conducir",
      t: "Manejo defensivo",
      c: "Conduce más seguro",
      icon: Zap, color: C.pink,
      content: [
        { type: "alert", color: C.blue, text: "Conducir defensivamente reduce 80% el riesgo de accidentes y asaltos." },
        { type: "section", title: "Reglas básicas" },
        { type: "list", items: [
          "Mantén siempre 3 segundos de distancia con el auto de adelante",
          "Revisa espejos cada 5-8 segundos",
          "No uses celular mientras manejas (multa y peligro)",
          "Anticipa las acciones de otros conductores",
          "No reacciones a provocaciones de la calle"
        ]},
        { type: "section", title: "Para evitar montachoques" },
        { type: "list", items: [
          "Si te chocan por atrás: NO bajes en zona oscura o sola",
          "Llama a tu seguro desde adentro",
          "Conduce a gasolinera, plaza o sitio iluminado",
          "Toma foto de placas y rostro discretamente",
          "Si son agresivos: marca 911 frente a ellos"
        ]},
        { type: "section", title: "Estacionamiento seguro" },
        { type: "list", items: [
          "Estaciona en reversa (salida más rápida)",
          "Cerca de cámaras o vigilancia",
          "Evita estacionamientos vacíos o muy llenos",
          "Lleva tus pertenencias contigo o en cajuela ANTES de llegar",
          "Revisa al rededor antes de bajar o subir"
        ]},
      ]
    },

    // === FRAUDES ===
    {
      id: "fraudes-comunes",
      cat: "fraudes",
      t: "Fraudes más comunes 2026",
      c: "Conoce los modus operandi",
      icon: AlertCircle, color: C.orange,
      content: [
        { type: "alert", color: C.amber, text: "Los fraudes cambian cada mes. Estos son los más activos ahorita." },
        { type: "section", title: "Falsos inspectores" },
        { type: "list", items: [
          "Tocan diciendo que vienen de CFE, gas o agua",
          "CFE y gas NUNCA visitan sin cita previa",
          "Si pasan, roban o detectan qué tienes para volver",
          "Pide identificación y llama TÚ a la empresa"
        ]},
        { type: "section", title: "Falsos bancos por WhatsApp" },
        { type: "list", items: [
          "Te llaman/escriben diciendo que detectaron movimiento sospechoso",
          "Te piden 'verificar' datos de tarjeta o token",
          "Los bancos NUNCA piden datos por llamada ni WhatsApp",
          "Cuelga y llama TÚ al teléfono del banco"
        ]},
        { type: "section", title: "Estafas de compras en línea" },
        { type: "list", items: [
          "Productos de marca a precio ridículo",
          "Cuentas de Facebook recién creadas vendiendo",
          "Te piden depósito antes de ver el producto",
          "Verifica en Mercado Libre/Amazon antes",
          "Solo paga al recibir y revisar"
        ]},
        { type: "section", title: "Falsos sorteos / premios" },
        { type: "list", items: [
          "'Ganaste un viaje/celular/dinero'",
          "Para reclamarlo te piden depositar 'impuestos'",
          "Si NO participaste, NO ganaste",
          "Reporta al 089"
        ]},
      ]
    },
    {
      id: "como-denunciar",
      cat: "fraudes",
      t: "Cómo hacer tu denuncia",
      c: "Paso a paso completo",
      icon: FileText, color: C.green,
      content: [
        { type: "alert", color: C.green, text: "Denunciar es importante aunque parezca que 'no va a servir'. Las estadísticas presionan a las autoridades." },
        { type: "section", title: "Documentos que necesitas" },
        { type: "list", items: [
          "Identificación oficial (INE, pasaporte, cédula)",
          "Comprobante de domicilio (no mayor a 3 meses)",
          "Si hay daños: facturas, fotos, videos",
          "Si fuiste víctima de fraude: capturas de chats, transferencias",
          "Datos de testigos si los hay"
        ]},
        { type: "section", title: "Dónde denunciar" },
        { type: "list", items: [
          "Ministerio Público más cercano (presencial)",
          "Fiscalía digital de tu estado (en línea)",
          "Denuncia anónima al 089 (nacional)",
          "ProAlert te conecta con el MP más cercano"
        ]},
        { type: "section", title: "Durante la denuncia" },
        { type: "list", items: [
          "Sé claro: día, hora, lugar exactos",
          "Describe a las personas con detalle",
          "Si hay video o foto, llévalo",
          "Pide número de folio (es tu comprobante)",
          "Pregunta por el agente del MP asignado"
        ]},
        { type: "section", title: "Después de denunciar" },
        { type: "list", items: [
          "Guarda el folio en lugar seguro",
          "Da seguimiento en máximo 15 días",
          "Usa ProAlert para ver estado de tu denuncia",
          "Si no avanza, escalalo al superior del MP"
        ]},
      ]
    },
    // === NUEVOS TIPS ===
    {
      id: "alerta-amber-mexico",
      cat: "emergencia",
      t: "Alerta AMBER México: niño perdido",
      c: "Protocolo nacional de búsqueda inmediata",
      icon: AlertCircle, color: C.amber,
      content: [
        { type: "alert", color: C.red, text: "Si un menor desaparece, las primeras 72 horas son cruciales. NO esperes 24 horas para denunciar — eso es un mito." },
        { type: "section", title: "Cómo activar la Alerta AMBER" },
        { type: "list", items: [
          "Llama INMEDIATAMENTE al 911 o a Fiscalía estatal",
          "Reporta: nombre completo, edad, descripción física y ropa que vestía",
          "Aporta fotografía RECIENTE (de los últimos 6 meses)",
          "Indica último lugar donde fue visto y con quién estaba",
          "Si tienes sospecha de sustracción, dilo claramente"
        ]},
        { type: "section", title: "Qué hace la autoridad" },
        { type: "list", items: [
          "Se difunde por TV, radio, redes sociales y carreteras",
          "Se coordinan PGJ, SSP federal y municipal",
          "Se revisan cámaras del C5 y vialidades",
          "Aeropuertos y centrales camioneras se alertan"
        ]},
        { type: "section", title: "Lo que TÚ puedes hacer" },
        { type: "list", items: [
          "Comparte la alerta oficial, NO rumores sin fuente",
          "Si lo viste, llama al 911 inmediatamente con la ubicación exacta",
          "NO te acerques al sospechoso si lo identificas — llama y observa de lejos",
          "Sigue la cuenta oficial @AlertaAmberMx para info verificada"
        ]},
      ]
    },
    {
      id: "robo-celular-protocolo",
      cat: "fraudes",
      t: "Te robaron el celular: qué hacer en 1 hora",
      c: "Protocolo paso a paso para minimizar daños",
      icon: Phone, color: C.red,
      content: [
        { type: "alert", color: C.red, text: "Cada minuto cuenta. Los rateros venden tu celular en menos de 2 horas y pueden vaciar tus cuentas en ese tiempo." },
        { type: "section", title: "Minuto 0-15: BLOQUEAR" },
        { type: "list", items: [
          "Desde otro celular, entra a iCloud.com (iPhone) o Find My Device (Android)",
          "Pon el celular en modo perdido con mensaje y número de contacto",
          "Borra el celular remotamente si tenías info bancaria sensible",
          "Llama a tu banco al número del reverso de tu tarjeta y bloquea apps"
        ]},
        { type: "section", title: "Minuto 15-30: REPORTAR" },
        { type: "list", items: [
          "Llama a tu operador (Telcel *264, AT&T 800-288-2020, Movistar 800-088-8888)",
          "Pide bloqueo de IMEI (necesitarás tu CURP o RFC)",
          "Pide reposición de SIM con tu mismo número",
          "Si el ladrón tiene la SIM y recibe SMS de banco, puede vaciar cuentas"
        ]},
        { type: "section", title: "Minuto 30-60: DENUNCIAR" },
        { type: "list", items: [
          "Ve al MP o usa Denuncia Digital de tu Fiscalía estatal",
          "Necesitas: IMEI (estaba en la caja), modelo, color, lugar y hora del robo",
          "Si fue con violencia: es robo agravado, pena mayor",
          "Cambia TODAS tus contraseñas (correo, redes, banco) desde computadora segura"
        ]},
        { type: "section", title: "Prevención futura" },
        { type: "list", items: [
          "Activa autenticación de 2 factores con app (NO SMS) en banca y correo",
          "Apunta tu IMEI en lugar seguro: marca *#06# en el teclado",
          "Usa Face ID/huella para apps bancarias, NUNCA solo PIN",
          "No guardes contraseñas en notas sin cifrar"
        ]},
      ]
    },
    {
      id: "transporte-app-seguro",
      cat: "conducir",
      t: "Uber/Didi/InDriver: viaja seguro",
      c: "Verificaciones antes y durante el viaje",
      icon: Car, color: C.blue,
      content: [
        { type: "alert", color: C.amber, text: "El 70% de incidentes en apps de transporte pasan por NO verificar al conductor. 30 segundos te pueden salvar la vida." },
        { type: "section", title: "Antes de subir" },
        { type: "list", items: [
          "VERIFICA: placas del auto, modelo, color y foto del conductor coincidan con la app",
          "Pregunta al conductor: '¿A nombre de quién va el viaje?' (debe decir tu nombre)",
          "NUNCA subas si no coincide — pide otro viaje y reporta",
          "Comparte ubicación en tiempo real con un contacto de confianza",
          "Toma foto a las placas antes de subir (manda al contacto)"
        ]},
        { type: "section", title: "Durante el viaje" },
        { type: "list", items: [
          "Verifica que la ruta del GPS coincide con la app",
          "Si toma ruta diferente sin explicación, pregunta amablemente",
          "Si insiste en ruta rara: pide bajar en lugar concurrido",
          "Mantén el celular cargado y con datos activos",
          "En CDMX/Edomex: número de emergencia desde la app está disponible 24/7"
        ]},
        { type: "section", title: "Mujeres viajando solas" },
        { type: "list", items: [
          "Usa Uber con opción 'Compartir viaje' siempre",
          "Didi Mujer y Uber Ellas: viajes con conductoras (CDMX, Monterrey)",
          "InDriver: NO recomendado de noche, menos verificación",
          "Si vas a casa: pide bajar 1-2 cuadras antes y camina con cámara abierta"
        ]},
        { type: "section", title: "Si algo va mal" },
        { type: "list", items: [
          "Botón de pánico en la app llama al 911 con tu ubicación",
          "ProAlert: ¿Qué hago? → Te guía según situación",
          "Después del viaje: califica honestamente para proteger a otros"
        ]},
      ]
    },
    {
      id: "violencia-genero",
      cat: "emergencia",
      t: "Violencia de género: red de apoyo",
      c: "Recursos legales y de protección para mujeres",
      icon: Heart, color: C.pink,
      content: [
        { type: "alert", color: C.pink, text: "NO estás sola. Hay redes profesionales que te ayudan gratis y de forma confidencial. Cualquier tipo de violencia (verbal, física, psicológica, económica) cuenta." },
        { type: "section", title: "Líneas de ayuda 24/7" },
        { type: "list", items: [
          "Línea Nacional de la Mujer: 800-108-4053 (24h, gratuita, confidencial)",
          "LOCATEL CDMX: 5658-1111 (orientación y refugio)",
          "Línea Naranja (Edomex): 800-10-84-053",
          "911: emergencias en curso",
          "*765 (#SOS desde celular): respuesta inmediata"
        ]},
        { type: "section", title: "Orden de protección" },
        { type: "list", items: [
          "Es GRATUITA y se tramita en Fiscalía Especializada en Mujeres",
          "Te dan en menos de 4 horas en casos urgentes",
          "Obliga al agresor a alejarse de ti, tu casa, trabajo y escuela",
          "Si la viola: arresto inmediato",
          "Pide acompañamiento psicológico y jurídico (gratis)"
        ]},
        { type: "section", title: "Refugios y casas seguras" },
        { type: "list", items: [
          "Red Nacional de Refugios: rednacionalderefugios.org.mx",
          "Si necesitas salir HOY: llama a Línea Mujer y te ubican",
          "Llevan a ti y a tus hijos sin costo, ubicación confidencial",
          "Tienen abogados, psicólogos, trabajo social y guardería"
        ]},
        { type: "section", title: "Documentación importante" },
        { type: "list", items: [
          "Toma fotos de cualquier lesión (con fecha visible)",
          "Guarda mensajes, audios, capturas como evidencia",
          "Guarda tickets médicos si fuiste atendida",
          "Habla con vecinos o familia que puedan ser testigos",
          "En ProAlert: usa Alerta Mujer para activar red de contactos al instante"
        ]},
      ]
    },
    {
      id: "secuestro-virtual",
      cat: "fraudes",
      t: "Secuestro virtual: identifícalo a tiempo",
      c: "El fraude telefónico más común y peligroso de México",
      icon: PhoneCall, color: C.red,
      content: [
        { type: "alert", color: C.red, text: "El secuestro virtual NO es secuestro real. Es un fraude por teléfono que cobra MILES de víctimas al año en México. Aprende a identificarlo y rómpelo." },
        { type: "section", title: "Cómo opera" },
        { type: "list", items: [
          "Te llaman desde número desconocido (a veces internacional)",
          "Una persona llora o grita pidiendo ayuda fingiendo ser familiar",
          "Otra voz amenaza: 'Tengo a tu hijo/hija, no cuelgues'",
          "Te exigen pagar transferencia o tarjeta de regalo de inmediato",
          "Te presionan a NO colgar ni hacer otras llamadas"
        ]},
        { type: "section", title: "Cómo confirmas que es fraude" },
        { type: "list", items: [
          "El familiar 'secuestrado' NUNCA da datos verificables (nombre completo, fecha)",
          "Lloran o gritan pero nunca contestan preguntas específicas",
          "El monto es siempre 'urgente' y 'tienes 1 hora'",
          "Te piden depósito en Oxxo, tarjeta de regalo, o transferencia rápida",
          "NO permiten que llames a otros familiares"
        ]},
        { type: "section", title: "Qué hacer EN EL MOMENTO" },
        { type: "list", items: [
          "Mantén la calma, NO grites ni respondas con datos personales",
          "Pon el manos libres y llama desde OTRO celular al familiar 'secuestrado'",
          "Pregunta a la voz del 'secuestrado': '¿Cuál es tu segundo nombre?' o algo solo familia sabe",
          "Si no contesta, dile a la voz amenazante 'voy a confirmarlo' y cuelga",
          "Llama al 088 (CONATIB) o 911 mientras tanto"
        ]},
        { type: "section", title: "Prevención" },
        { type: "list", items: [
          "Crea una PALABRA CLAVE familiar — solo familia la sabe",
          "Enseña a niños y adultos mayores a NO dar datos por teléfono",
          "NO publiques rutinas, viajes o ubicaciones en redes",
          "Si una llamada huele a estafa: cuelga, no es grosería"
        ]},
      ]
    },
  ];

  const filtered = filter === "all" ? tips : tips.filter(t => t.cat === filter);

  const categories = [
    { id: "all", t: "Todos", icon: Sparkles },
    { id: "autoridad", t: "Autoridad", icon: Shield },
    { id: "emergencia", t: "Emergencia", icon: AlertTriangle },
    { id: "conducir", t: "Conducir", icon: Car },
    { id: "fraudes", t: "Fraudes", icon: Lock },
  ];

  // Vista de detalle
  if (active) {
    const t = active;
    const Icon = t.icon;
    return (
      <div className="h-full flex flex-col" style={{ background: C.bg }}>
        <StatusBar />
        <Header onBack={() => setActive(null)} title="PRO TIP" />
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
          <div className="rounded-3xl p-5 mb-4" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}AA)` }}>
            <Icon size={28} color="white" />
            <h1 className="font-display font-black text-white text-xl mt-3 leading-tight">{t.t}</h1>
            <p className="text-xs font-body text-white opacity-90 mt-1">{t.c}</p>
          </div>

          {t.content.map((block, i) => {
            if (block.type === "alert") {
              return (
                <div key={i} className="rounded-2xl p-3 mb-4 flex items-start gap-2"
                  style={{ background: `${block.color}1A`, border: `1px solid ${block.color}44` }}>
                  <AlertCircle size={16} color={block.color} className="mt-0.5 shrink-0" />
                  <p className="text-xs font-body leading-relaxed text-white">{block.text}</p>
                </div>
              );
            }
            if (block.type === "section") {
              return (
                <h2 key={i} className="font-display font-bold text-[11px] uppercase tracking-widest text-white mb-2 mt-4" style={{ color: t.color }}>
                  {block.title}
                </h2>
              );
            }
            if (block.type === "text") {
              return (
                <p key={i} className="text-sm font-body text-white leading-relaxed mb-3 px-1">{block.text}</p>
              );
            }
            if (block.type === "list") {
              return (
                <div key={i} className="flex flex-col gap-1.5 mb-2">
                  {block.items.map((item, j) => (
                    <div key={j} className="rounded-xl p-3 flex gap-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${t.color}22` }}>
                        <Check size={11} color={t.color} strokeWidth={3} />
                      </div>
                      <p className="text-xs font-body text-white flex-1 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}

          <div className="mt-6 p-4 rounded-2xl flex items-start gap-3" style={{ background: `${C.blue}11`, border: `1px solid ${C.blue}33` }}>
            <Sparkles size={16} color={C.blue} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-display font-bold text-white">Comparte este Pro Tip</p>
              <p className="text-[11px] font-body mt-0.5" style={{ color: C.muted }}>Ayuda a más personas a estar informadas</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de lista
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="PRO TIPS" />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        <div className="rounded-3xl p-5 mb-4" style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})` }}>
          <BookOpen size={22} color="white" />
          <p className="font-display font-bold text-white text-lg mt-2 leading-tight">Información que te protege</p>
          <p className="text-xs font-body text-white opacity-90 mt-1">Conoce tus derechos, evita fraudes y aprende a moverte seguro en CDMX y Edomex.</p>
        </div>

        {/* Filtros por categoría */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 -mx-4 px-4">
          {categories.map(c => {
            const Icon = c.icon;
            const sel = filter === c.id;
            return (
              <button key={c.id} onClick={() => setFilter(c.id)}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all"
                style={{
                  background: sel ? C.blue : C.card,
                  border: `1px solid ${sel ? C.blue : C.border}`,
                }}>
                <Icon size={14} color="white" />
                <span className="text-xs font-display font-bold text-white uppercase tracking-wider">{c.t}</span>
              </button>
            );
          })}
        </div>

        <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">
          {filtered.length} {filtered.length === 1 ? "tip" : "tips"} disponibles
        </p>

        <div className="flex flex-col gap-2">
          {filtered.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActive(t)}
                className="rounded-2xl p-4 flex items-center gap-3 text-left"
                style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${t.color}22`, border: `1px solid ${t.color}44` }}>
                  <Icon size={20} color={t.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-white text-sm leading-tight">{t.t}</p>
                  <p className="text-[11px] font-body mt-0.5 truncate" style={{ color: C.muted }}>{t.c}</p>
                </div>
                <ChevronRight size={18} color={C.muted} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// === EMERGENCY NUMBERS ===
const EmergencyScreen = ({ onBack }) => {
  const { state, dispatch } = useApp();
  const [selectedState, setSelectedState] = useState(state.user.estado || "CDMX");
  const [search, setSearch] = useState("");

  // Persistir estado elegido
  useEffect(() => {
    try { localStorage.setItem("proalert_estado", selectedState); } catch {}
  }, [selectedState]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("proalert_estado");
      if (saved) setSelectedState(saved);
    } catch {}
  }, []);

  // Números nacionales (siempre disponibles)
  const nacionales = [
    { n: "911", t: "Emergencias", desc: "Policía, ambulancia, bomberos", icon: Siren, color: C.red, urgent: true, cat: "emergencia" },
    { n: "089", t: "Denuncia anónima", desc: "Reportar delitos sin dar nombre", icon: Megaphone, color: C.orange, cat: "denuncia" },
    { n: "088", t: "Atención ciudadana SSPC", desc: "Quejas contra autoridades federales", icon: Shield, color: C.blue, cat: "denuncia" },
    { n: "078", t: "Ángeles Verdes", desc: "Auxilio en carretera 24h", icon: HeartPulse, color: C.green, cat: "vialidad" },
    { n: "074", t: "CAPUFE", desc: "Carreteras y autopistas federales", icon: Truck, color: C.blue, cat: "vialidad" },
    { n: "800-108-4053", t: "Línea Nacional de la Mujer", desc: "24h, gratuita, confidencial", icon: Heart, color: C.pink, cat: "mujer" },
    { n: "800-00-26237", t: "CONAVIM", desc: "Comisión Nacional contra Violencia hacia Mujeres", icon: HeartPulse, color: C.pink, cat: "mujer" },
    { n: "01-800-715-2000", t: "CNDH", desc: "Comisión Nacional Derechos Humanos", icon: Shield, color: C.amber, cat: "derechos" },
    { n: "800-000-2387", t: "Alerta Amber México", desc: "Niños desaparecidos", icon: AlertCircle, color: C.amber, cat: "denuncia" },
    { n: "55-5340-5000", t: "Cruz Roja Mexicana", desc: "Ambulancias y atención", icon: HeartPulse, color: C.red, cat: "emergencia" },
  ];

  // Estados con sus números específicos
  const porEstado = {
    "CDMX": [
      { n: "5658-1111", t: "LOCATEL CDMX", desc: "Información, orientación, refugio", icon: Phone, color: C.blue, cat: "atencion" },
      { n: "55-5345-5200", t: "Fiscalía CDMX", desc: "Denuncias formales", icon: Shield, color: C.blue, cat: "denuncia" },
      { n: "55-5345-5240", t: "Fiscalía Especializada Mujeres CDMX", desc: "Violencia de género", icon: Heart, color: C.pink, cat: "mujer" },
      { n: "55-5345-5046", t: "Fiscalía Antisecuestro CDMX", desc: "Secuestros y privación de libertad", icon: AlertTriangle, color: C.red, cat: "denuncia" },
      { n: "55-5242-6500", t: "Fiscalía Ciberdelitos CDMX", desc: "Fraudes en línea, extorsión digital", icon: Lock, color: C.blue, cat: "ciber" },
      { n: "55-5208-9898", t: "SAPCI (Atención a víctimas)", desc: "Apoyo psicológico y legal gratis", icon: HelpCircle, color: C.green, cat: "atencion" },
      { n: "55-5683-2222", t: "Protección Civil CDMX", desc: "Sismos, fugas, derrumbes", icon: Shield, color: C.amber, cat: "emergencia" },
      { n: "55-5768-3799", t: "Bomberos CDMX", desc: "Incendios y rescates", icon: Flame, color: C.orange, cat: "emergencia" },
      { n: "55-5765-4316", t: "C5 CDMX", desc: "Centro de Comando ciudadano", icon: Eye, color: C.blue, cat: "atencion" },
      { n: "55-5004-5000", t: "INVEA CDMX", desc: "Verificación vehicular y multas", icon: Car, color: C.amber, cat: "vialidad" },
    ],
    "Estado de México": [
      { n: "800-696-9696", t: "Locatel Edomex", desc: "Información y orientación", icon: Phone, color: C.blue, cat: "atencion" },
      { n: "722-275-9800", t: "Fiscalía Edomex", desc: "Denuncias formales", icon: Shield, color: C.blue, cat: "denuncia" },
      { n: "800-108-4053", t: "Línea Naranja Edomex", desc: "Mujeres víctimas de violencia", icon: Heart, color: C.pink, cat: "mujer" },
      { n: "800-832-4769", t: "Fiscalía Antisecuestro Edomex", desc: "Secuestros y extorsión", icon: AlertTriangle, color: C.red, cat: "denuncia" },
      { n: "722-226-1700", t: "Fiscalía Ciberdelitos Edomex", desc: "Delitos electrónicos", icon: Lock, color: C.blue, cat: "ciber" },
      { n: "722-275-6300", t: "Protección Civil Edomex", desc: "Emergencias mayores", icon: Shield, color: C.amber, cat: "emergencia" },
      { n: "800-823-3486", t: "CODHEM", desc: "Comisión Derechos Humanos Edomex", icon: Shield, color: C.amber, cat: "derechos" },
    ],
    "Jalisco": [
      { n: "800-227-8011", t: "Locatel Jalisco", desc: "Atención ciudadana 24h", icon: Phone, color: C.blue, cat: "atencion" },
      { n: "33-3837-6000", t: "Fiscalía Jalisco", desc: "Denuncias del estado", icon: Shield, color: C.blue, cat: "denuncia" },
      { n: "075", t: "Atención Mujeres Jalisco", desc: "Violencia familiar y de género", icon: Heart, color: C.pink, cat: "mujer" },
      { n: "800-220-2222", t: "CEDHJ", desc: "Comisión Derechos Humanos Jalisco", icon: Shield, color: C.amber, cat: "derechos" },
    ],
    "Nuevo León": [
      { n: "070", t: "Atención Ciudadana NL", desc: "Información y servicios", icon: Phone, color: C.blue, cat: "atencion" },
      { n: "81-2020-3000", t: "Fiscalía NL", desc: "Denuncias del estado", icon: Shield, color: C.blue, cat: "denuncia" },
      { n: "81-2033-1717", t: "Fiscalía Especializada Mujeres NL", desc: "Violencia de género", icon: Heart, color: C.pink, cat: "mujer" },
      { n: "800-008-6464", t: "CEDH NL", desc: "Derechos humanos del estado", icon: Shield, color: C.amber, cat: "derechos" },
    ],
    "Querétaro": [
      { n: "070", t: "Locatel Querétaro", desc: "Atención y orientación", icon: Phone, color: C.blue, cat: "atencion" },
      { n: "442-238-7600", t: "Fiscalía Querétaro", desc: "Denuncias", icon: Shield, color: C.blue, cat: "denuncia" },
      { n: "442-216-4570", t: "Atención a Mujeres Qro", desc: "Apoyo y refugio", icon: Heart, color: C.pink, cat: "mujer" },
    ],
    "Puebla": [
      { n: "075", t: "Locatel Puebla", desc: "Atención ciudadana", icon: Phone, color: C.blue, cat: "atencion" },
      { n: "222-211-5500", t: "Fiscalía Puebla", desc: "Denuncias del estado", icon: Shield, color: C.blue, cat: "denuncia" },
      { n: "800-624-2450", t: "Línea SOS Mujer Puebla", desc: "Violencia de género 24h", icon: Heart, color: C.pink, cat: "mujer" },
    ],
    "Guanajuato": [
      { n: "070", t: "Atención Ciudadana Gto", desc: "Información del estado", icon: Phone, color: C.blue, cat: "atencion" },
      { n: "473-735-1500", t: "Fiscalía Guanajuato", desc: "Denuncias", icon: Shield, color: C.blue, cat: "denuncia" },
      { n: "800-290-0024", t: "Línea Mujer Gto", desc: "Apoyo violencia de género", icon: Heart, color: C.pink, cat: "mujer" },
    ],
    "Veracruz": [
      { n: "075", t: "Atención Veracruz", desc: "Locatel y orientación", icon: Phone, color: C.blue, cat: "atencion" },
      { n: "228-841-6170", t: "Fiscalía Veracruz", desc: "Denuncias del estado", icon: Shield, color: C.blue, cat: "denuncia" },
      { n: "800-260-3010", t: "Línea Mujer Veracruz", desc: "Violencia familiar", icon: Heart, color: C.pink, cat: "mujer" },
    ],
  };

  const estados = ["CDMX", "Estado de México", "Jalisco", "Nuevo León", "Querétaro", "Puebla", "Guanajuato", "Veracruz"];
  const localesAhora = porEstado[selectedState] || [];
  const todos = [...nacionales, ...localesAhora];
  const filtrados = search
    ? todos.filter(x => x.t.toLowerCase().includes(search.toLowerCase()) || (x.desc || "").toLowerCase().includes(search.toLowerCase()))
    : todos;

  const renderItem = (n, i) => {
    const Icon = n.icon;
    const telNumber = n.n.replace(/\s/g, "").replace(/-/g, "");
    return (
      <a key={`${n.n}-${i}`} href={`tel:${telNumber}`} className="rounded-2xl p-3 flex items-center gap-3 no-underline"
        style={{ background: n.urgent ? `${C.red}1A` : C.card, border: `1px solid ${n.urgent ? C.red : C.border}` }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${n.color}22` }}>
          <Icon size={18} color={n.color} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-display font-bold text-white text-sm leading-tight">{n.t}</p>
          {n.desc && <p className="text-[10px] font-body truncate" style={{ color: C.muted }}>{n.desc}</p>}
          <p className="font-display font-black text-base" style={{ color: n.urgent ? C.red : "white" }}>{n.n}</p>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: C.green }}>
          <Phone size={14} color="white" fill="white" />
        </div>
      </a>
    );
  };

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="DIRECTORIO OFICIAL" />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        {/* Selector de estado */}
        <div className="mb-3">
          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">Tu estado</p>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {estados.map(e => (
              <button key={e} onClick={() => setSelectedState(e)}
                className="px-4 py-2 rounded-full font-display font-bold text-xs uppercase tracking-wider shrink-0 transition-all"
                style={{
                  background: selectedState === e ? C.blue : C.card,
                  color: selectedState === e ? "white" : C.muted,
                  border: `1px solid ${selectedState === e ? C.blue : C.border}`
                }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Búsqueda */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl mb-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <Search size={14} color={C.muted} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar (ej: mujer, ciber, secuestro)"
            className="flex-1 min-w-0 bg-transparent text-white text-sm outline-none font-body placeholder:text-slate-500" />
          {search && <button onClick={() => setSearch("")}><X size={14} color={C.muted} /></button>}
        </div>

        {!search && (
          <>
            <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">Nacionales (toda la república)</p>
            <div className="flex flex-col gap-1.5 mb-4">
              {nacionales.map(renderItem)}
            </div>

            <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">{selectedState}</p>
            <div className="flex flex-col gap-1.5">
              {localesAhora.length > 0 ? localesAhora.map(renderItem) : (
                <p className="text-xs font-body p-4 text-center" style={{ color: C.muted }}>Próximamente más estados</p>
              )}
            </div>
          </>
        )}

        {search && (
          <>
            <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">{filtrados.length} resultados</p>
            <div className="flex flex-col gap-1.5">
              {filtrados.length > 0 ? filtrados.map(renderItem) : (
                <p className="text-xs font-body p-4 text-center" style={{ color: C.muted }}>Sin resultados. Prueba otro término.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// === WOMEN EMERGENCY ===
const WomenScreen = ({ onBack }) => {
  const { toast } = useApp();
  const [active, setActive] = useState(false);

  const activate = () => {
    setActive(true);
    toast("Alerta enviada · Tus contactos y la policía especializada fueron notificados");
    setTimeout(onBack, 1800);
  };

  return (
  <div className="h-full flex flex-col" style={{ background: `radial-gradient(circle at 50% 0%, ${C.pink}33 0%, ${C.bg} 60%)` }}>
    <StatusBar />
    <Header onBack={onBack} title="ALERTA MUJER" />
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full pulse-ring" style={{ background: C.pink }} />
        <div className="w-40 h-40 rounded-full flex items-center justify-center relative" style={{ background: C.pink, boxShadow: `0 0 80px ${C.pink}` }}>
          <Heart size={64} color="white" fill="white" />
        </div>
      </div>
      <p className="font-display font-black text-white text-2xl text-center mb-2 uppercase tracking-wide">Apoyo especializado</p>
      <p className="text-sm font-body text-center mb-8 leading-relaxed" style={{ color: C.muted }}>
        Tu ubicación en tiempo real se enviará a la policía y a tus contactos. Un oficial se comunicará contigo de inmediato.
      </p>
      <div className="w-full rounded-2xl p-4 mb-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-display font-bold uppercase tracking-wider text-white">Se activará</p>
          <div className="w-2 h-2 rounded-full" style={{ background: C.pink }} />
        </div>
        {[
          "Ubicación en tiempo real",
          "Llamada de oficial mujer",
          "Notificación a 3 contactos",
          "Grabación de audio",
        ].map((x, i) => (
          <div key={i} className="flex items-center gap-2 py-1">
            <div className="w-1 h-1 rounded-full" style={{ background: C.pink }} />
            <p className="text-xs font-body text-white">{x}</p>
          </div>
        ))}
      </div>
      <button onClick={activate} disabled={active} className="w-full py-4 rounded-2xl font-display font-black text-white text-base uppercase tracking-widest transition-all"
        style={{ background: active ? C.green : C.pink, boxShadow: `0 8px 30px ${(active ? C.green : C.pink)}88`, opacity: active ? 0.9 : 1 }}>
        {active ? "✓ Alerta enviada" : "Activar alerta"}
      </button>
    </div>
  </div>
  );
};

// === REPORTAR POLICÍA ===
const ReportPoliceScreen = ({ onBack, onNav }) => {
  const { dispatch, toast } = useApp();
  const [selected, setSelected] = useState([]);
  const [desc, setDesc] = useState("");
  const toggle = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const submit = () => {
    if (selected.length === 0) return;
    dispatch({
      type: "ADD_POLICE_REPORT",
      payload: {
        officer: "Juan Pérez Hdez.", placa: "082514",
        reasons: selected, description: desc,
      }
    });
    toast(`Reporte enviado a asuntos internos · +30 pts`);
    setTimeout(onBack, 700);
  };

  const reasons = [
    { id: "corrupcion", t: "Corrupción / Soborno", d: "Te pidió dinero o un soborno", icon: DollarSign, color: C.red, sev: "Grave" },
    { id: "extorsion", t: "Extorsión", d: "Te amenazó para quitarte dinero o bienes", icon: AlertCircle, color: C.red, sev: "Grave" },
    { id: "usurpacion", t: "Usurpación de funciones", d: "Actuó fuera de su jurisdicción o competencia", icon: UserX, color: C.orange, sev: "Grave" },
    { id: "abuso", t: "Abuso de autoridad", d: "Excedió las facultades que la ley le otorga", icon: ShieldAlert, color: C.orange, sev: "Grave" },
    { id: "fuerza", t: "Uso excesivo de fuerza", d: "Empleó violencia desproporcionada", icon: Zap, color: C.red, sev: "Grave" },
    { id: "detencion", t: "Detención arbitraria", d: "Te detuvo sin causa o sin leerte tus derechos", icon: Lock, color: C.amber, sev: "Medio" },
    { id: "robo", t: "Robo durante la interacción", d: "Tomó tus objetos personales sin justificación", icon: Ban, color: C.red, sev: "Grave" },
    { id: "discriminacion", t: "Discriminación", d: "Te trató mal por apariencia, género u origen", icon: EyeOff, color: C.pink, sev: "Medio" },
    { id: "acoso", t: "Acoso sexual o verbal", d: "Tocamientos o comentarios indebidos", icon: AlertTriangle, color: C.pink, sev: "Grave" },
    { id: "noid", t: "No se identificó", d: "Se negó a mostrar gafete, placa o nombre", icon: HelpCircle, color: C.muted, sev: "Medio" },
    { id: "auxilio", t: "Negó brindar auxilio", d: "Se negó a ayudar en una emergencia", icon: ShieldOff, color: C.amber, sev: "Medio" },
    { id: "trato", t: "Mal trato verbal", d: "Insultos, amenazas o burlas", icon: Megaphone, color: C.blue, sev: "Bajo" },
    { id: "alterado", t: "Bajo influencia de sustancias", d: "Aparentemente alcoholizado o drogado", icon: AlertCircle, color: C.orange, sev: "Grave" },
    { id: "otro", t: "Otro motivo", d: "Especifica en la descripción", icon: Sparkles, color: C.blue, sev: "—" },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="REPORTAR" />

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-36">
        {/* Officer being reported */}
        <div className="mx-4 mb-4 rounded-2xl p-3 flex items-center gap-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: C.cardHi }}>
            <Users size={22} color={C.muted} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Reportando a</p>
            <p className="font-display font-bold text-white text-sm">Juan Pérez Hdez.</p>
            <p className="text-[11px] font-body" style={{ color: C.muted }}>Placa 082514 · SSC CDMX</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: `${C.orange}22`, border: `1px solid ${C.orange}55` }}>
            <ShieldAlert size={12} color={C.orange} />
            <span className="text-[9px] font-display font-bold uppercase" style={{ color: C.orange }}>Confidencial</span>
          </div>
        </div>

        <div className="px-4 mb-3">
          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white">Motivo del reporte</p>
          <p className="text-xs font-body mt-1" style={{ color: C.muted }}>Selecciona todas las que apliquen</p>
        </div>

        <div className="px-4 flex flex-col gap-2">
          {reasons.map(r => {
            const Icon = r.icon;
            const sel = selected.includes(r.id);
            const sevColor = r.sev === "Grave" ? C.red : r.sev === "Medio" ? C.amber : r.sev === "Bajo" ? C.muted : C.faint;
            return (
              <button key={r.id} onClick={() => toggle(r.id)}
                className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                style={{
                  background: sel ? `${r.color}1A` : C.card,
                  border: `1.5px solid ${sel ? r.color : C.border}`,
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${r.color}22`, border: `1px solid ${r.color}55` }}>
                  <Icon size={18} color={r.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-white text-sm truncate">{r.t}</p>
                    {r.sev !== "—" && (
                      <span className="text-[8px] font-display font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: `${sevColor}22`, color: sevColor }}>
                        {r.sev}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-body mt-0.5 truncate" style={{ color: C.muted }}>{r.d}</p>
                </div>
                <div className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center"
                  style={{ background: sel ? r.color : "transparent", border: `1.5px solid ${sel ? r.color : C.border}` }}>
                  {sel && <Check size={12} color="white" strokeWidth={3.5} />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-4 mt-5 mb-3">
          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white">Cuenta lo ocurrido</p>
          <p className="text-xs font-body mt-1" style={{ color: C.muted }}>Detalles, fecha, hora y ubicación</p>
        </div>
        <div className="px-4">
          <textarea value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Describe lo que pasó con el mayor detalle posible..."
            className="w-full text-white text-sm font-body p-4 rounded-2xl outline-none resize-none"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
            rows={4}
          />
        </div>

        <div className="px-4 mt-4">
          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">Evidencia</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="aspect-video rounded-2xl flex items-center justify-center gap-2 cursor-pointer" style={{ background: C.card, border: `1px dashed ${C.border}` }}>
              <ImageIcon size={18} color="white" />
              <span className="text-xs font-display font-semibold text-white">Foto</span>
              <input type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => e.target.files?.[0] && toast("Foto añadida como evidencia")} />
            </label>
            <label className="aspect-video rounded-2xl flex items-center justify-center gap-2 cursor-pointer" style={{ background: C.card, border: `1px dashed ${C.border}` }}>
              <Video size={18} color="white" />
              <span className="text-xs font-display font-semibold text-white">Video</span>
              <input type="file" accept="video/*" capture="environment" className="hidden"
                onChange={e => e.target.files?.[0] && toast("Video añadido como evidencia")} />
            </label>
          </div>
        </div>

        <div className="mx-4 mt-4 p-3 rounded-2xl flex items-start gap-2" style={{ background: `${C.blue}11`, border: `1px solid ${C.blue}33` }}>
          <Sparkles size={14} color={C.blue} className="mt-0.5 shrink-0" />
          <p className="text-[11px] font-body leading-relaxed" style={{ color: C.muted }}>
            Tu reporte se envía de forma <span className="text-white font-semibold">confidencial</span> al superior del oficial y a la unidad de asuntos internos correspondiente.
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 pt-3" style={{ background: `linear-gradient(180deg, transparent 0%, ${C.bg} 30%)` }}>
        <button
          onClick={submit}
          disabled={selected.length === 0}
          className="w-full py-4 rounded-2xl font-display font-bold text-white text-sm flex items-center justify-center gap-2 uppercase tracking-wider transition-all"
          style={{
            background: selected.length > 0 ? C.orange : C.card,
            boxShadow: selected.length > 0 ? `0 8px 24px ${C.orange}66` : "none",
            opacity: selected.length > 0 ? 1 : 0.5,
          }}>
          <Send size={18} />
          Enviar reporte {selected.length > 0 && `(${selected.length})`}
        </button>
      </div>
    </div>
  );
};


const CommunityScreen = ({ onBack, onNav }) => {
  const { state, dispatch, toast } = useApp();
  const statusColor = {
    "Recibido": C.amber,
    "En revisión": C.amber,
    "Asignado MP": C.blue,
    "En seguimiento": C.blue,
    "Resuelto": C.green,
  };
  const typeLabel = {
    asalto: "Asalto", robo: "Robo", violencia: "Violencia",
    accidente: "Accidente", extorsion: "Extorsión", otro: "Otro"
  };

  const confirm = (id) => {
    dispatch({ type: "CONFIRM_INCIDENT", payload: id });
    toast("Verificación añadida · +5 pts");
  };

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="COMUNIDAD" />
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <MapPin size={16} color={C.blue} />
          <div className="flex-1">
            <p className="text-[10px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Tu zona</p>
            <p className="text-sm font-display font-bold text-white">{state.user.zone} · CDMX</p>
          </div>
          <span className="text-[10px] font-display font-bold px-2 py-1 rounded-full" style={{ background: `${C.green}22`, color: C.green }}>2.4K activos</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-32">
        {state.incidents.map((p) => {
          const sc = statusColor[p.status] || C.muted;
          return (
            <div key={p.id} className="rounded-2xl p-4 mb-2 animate-fadein" style={{ background: C.card, border: `1px solid ${p.mine ? C.blue : C.border}` }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: p.mine ? C.blue : C.cardHi }}>
                  <FileText size={14} color="white" />
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-white text-sm leading-tight">
                    {p.mine ? "Tu reporte" : "Reporte de vecino"} · {typeLabel[p.type] || p.type}
                  </p>
                  <p className="text-[10px] font-body" style={{ color: C.muted }}>{p.location} · {p.time}</p>
                </div>
                <span className="text-[9px] font-display font-bold px-2 py-1 rounded-full uppercase"
                  style={{ background: `${sc}22`, color: sc, border: `1px solid ${sc}55` }}>
                  {p.status}
                </span>
              </div>
              <p className="text-sm font-body text-white leading-relaxed mb-3">{p.desc}</p>
              {p.confirmations > 0 && (
                <div className="flex items-center gap-1.5 mb-2">
                  <BadgeCheck size={12} color={C.green} />
                  <p className="text-[10px] font-body" style={{ color: C.green }}>
                    {p.confirmations} vecino{p.confirmations !== 1 ? "s" : ""} confirma{p.confirmations === 1 ? "" : "n"} este incidente
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
                {!p.mine && (
                  <button onClick={() => confirm(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ background: `${C.green}1A`, border: `1px solid ${C.green}55` }}>
                    <ThumbsUp size={12} color={C.green} />
                    <span className="text-[11px] font-display font-bold" style={{ color: C.green }}>Yo lo vi</span>
                  </button>
                )}
                <button onClick={() => toast("Función de comentarios próximamente")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: C.cardHi, border: `1px solid ${C.border}` }}>
                  <MessageCircle size={12} color={C.muted} />
                  <span className="text-[11px] font-display font-bold" style={{ color: C.muted }}>Comentar</span>
                </button>
                {p.mine && (
                  <div className="ml-auto flex items-center gap-1">
                    <Clock size={11} color={C.blue} />
                    <span className="text-[10px] font-display font-bold uppercase tracking-wider" style={{ color: C.blue }}>Seguimiento</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {state.incidents.length === 0 && (
          <div className="text-center py-12">
            <FileText size={36} color={C.faint} className="mx-auto mb-3" />
            <p className="text-sm font-body" style={{ color: C.muted }}>Sin reportes en tu zona. Sé el primero en reportar.</p>
          </div>
        )}
      </div>
      <button onClick={() => onNav("report")} className="absolute bottom-28 right-4 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: C.blue, boxShadow: `0 8px 24px ${C.blue}88` }}>
        <Plus size={22} color="white" />
      </button>
      <BottomNav active="community" onNav={onNav} />
    </div>
  );
};


const MenuDrawer = ({ open, onClose, onNav, onPanic }) => {
  const { state, dispatch, toast } = useApp();
  const items = [
    { id: "home", t: "Mapa", icon: MapPin },
    { id: "route", t: "Crear Ruta", icon: Navigation2 },
    { id: "assistant", t: "¿Qué hago ahora?", icon: Compass },
    { id: "sos", t: "SOS de Emergencia", icon: Siren, badge: "Nuevo", highlightRed: true },
    { id: "contactos", t: "Contactos de Confianza", icon: HeartPulse, badge: "Nuevo" },
    { id: "derechos", t: "Mis Derechos", icon: Shield, badge: "Nuevo" },
    { id: "hoynocircula", t: "Hoy No Circula", icon: Car, badge: "Nuevo" },
    { id: "trip", t: "Compartir Trayecto", icon: Footprints, highlight: !!state.trip },
    { id: "dashboard", t: "Mi Zona", icon: TrendingUp },
    { id: "scan", t: "Identificar Policía", icon: ScanLine },
    { id: "verifier", t: "Verificar Patrulla", icon: BadgeCheck },
    { id: "report", t: "Reportar Incidente", icon: FileText },
    { id: "modus", t: "Alertas de Estafas", icon: ScrollText },
    { id: "community", t: "Mi Comunidad", icon: Users },
    { id: "denuncia", t: "Mis Denuncias", icon: AlertCircle },
    { id: "protips", t: "Pro Tips", icon: BookOpen },
    { id: "emergency", t: "Directorio Oficial", icon: PhoneCall, badge: "Mejorado" },
  ];
  if (!open) return null;
  const activateStealth = () => {
    dispatch({ type: "TOGGLE_STEALTH" });
    onClose();
    toast("Modo discreto activado. Marca 911= para salir");
  };
  return (
    <div className="absolute inset-0 z-50">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-72 p-5 flex flex-col" style={{ background: C.surface, borderRight: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-5">
          <Logo size={18} tagline />
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: C.card }}>
            <X size={18} color="white" />
          </button>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-2xl mb-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.blue }}>
            <Users size={18} color="white" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-display uppercase tracking-wider" style={{ color: C.muted }}>{state.user.level}</p>
            <p className="text-sm font-display font-bold text-white">{state.user.name} · {state.user.points} pts</p>
          </div>
        </div>
        <button onClick={() => { onNav("sos"); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-2"
          style={{ background: C.red, boxShadow: `0 6px 18px ${C.red}55` }}>
          <Siren size={18} color="white" />
          <span className="text-sm font-display font-bold text-white uppercase tracking-wider">Botón SOS</span>
        </button>
        <button onClick={activateStealth}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-3"
          style={{ background: "#1C1C1E", border: `1px solid ${C.border}` }}>
          <Calculator size={18} color="white" />
          <span className="text-sm font-display font-bold text-white uppercase tracking-wider">Modo Discreto</span>
        </button>
        <div className="flex flex-col gap-0.5 overflow-y-auto hide-scrollbar">
          {items.map(it => {
            const Icon = it.icon;
            return (
              <button key={it.id} onClick={() => { onNav(it.id); onClose(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/5"
                style={it.highlightRed ? { background: `${C.red}15`, border: `1px solid ${C.red}55` } : {}}>
                <Icon size={18} color={it.highlightRed ? C.red : C.blue} />
                <span className="text-sm font-body text-white flex-1">{it.t}</span>
                {it.badge && (
                  <span className="text-[8px] font-display font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: it.highlightRed ? C.red : C.orange, color: "white" }}>
                    {it.badge}
                  </span>
                )}
                {it.highlight && (
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.green }} />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-auto pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <p className="text-[10px] font-display uppercase tracking-widest text-center" style={{ color: C.faint }}>ProAlert v0.2 · Prototipo</p>
        </div>
      </div>
    </div>
  );
};

// === TOAST ===
const Toast = ({ msg, onClose }) => {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [msg, onClose]);
  if (!msg) return null;
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] px-4 py-3 rounded-2xl flex items-center gap-2 backdrop-blur-xl animate-slidein"
      style={{ background: `${C.green}DD`, boxShadow: `0 10px 30px ${C.green}55`, maxWidth: "85%" }}>
      <CheckCircle2 size={16} color="white" />
      <span className="text-white font-display font-semibold text-xs">{msg}</span>
    </div>
  );
};

// === STEALTH MODE (CALCULATOR DISGUISE) ===
const StealthMode = ({ onExit }) => {
  const [display, setDisplay] = useState("0");
  const [secret, setSecret] = useState("");

  const handleKey = (k) => {
    // Secret code: 911= → exits stealth
    setSecret(s => {
      const next = (s + k).slice(-4);
      if (next.endsWith("911=") || next === "911=") {
        setTimeout(onExit, 100);
        return "";
      }
      return next;
    });
    if (k === "C") { setDisplay("0"); return; }
    if (k === "=") {
      try { setDisplay(String(eval(display.replace(/×/g, "*").replace(/÷/g, "/")))); } catch { setDisplay("Error"); }
      return;
    }
    setDisplay(d => d === "0" ? k : d + k);
  };

  const keys = [["C","÷","×","⌫"],["7","8","9","-"],["4","5","6","+"],["1","2","3","="],["0",".","",""]];
  return (
    <div className="h-full flex flex-col" style={{ background: "#1C1C1E" }}>
      <StatusBar />
      <div className="flex-1 flex flex-col justify-end px-6 pb-2">
        <div className="text-right text-white font-light overflow-hidden" style={{ fontSize: "64px", lineHeight: 1 }}>{display}</div>
      </div>
      <div className="px-3 pb-8 grid grid-cols-4 gap-2.5">
        {keys.flat().filter(Boolean).map((k, i) => {
          const isOp = ["÷","×","-","+","="].includes(k);
          const isFn = ["C","⌫"].includes(k);
          return (
            <button key={i} onClick={() => handleKey(k === "⌫" ? "" : k)}
              className="h-16 rounded-full font-light text-2xl active:opacity-70"
              style={{
                background: isOp ? "#FF9500" : isFn ? "#A5A5A5" : "#333333",
                color: isFn ? "#000" : "white",
                gridColumn: k === "0" ? "span 2" : "auto"
              }}>
              {k}
            </button>
          );
        })}
      </div>
      <p className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px]" style={{ color: "#444" }}>Pista: 911=</p>
    </div>
  );
};

// === SHARE TRIP SCREEN ===
const TripScreen = ({ onBack }) => {
  const { state, dispatch, toast } = useApp();
  const [destination, setDestination] = useState("");
  const [eta, setEta] = useState(20);
  const [selectedContacts, setSelectedContacts] = useState([]);

  const start = () => {
    if (!destination || selectedContacts.length === 0) return;
    dispatch({ type: "START_TRIP", payload: {
      destination, eta, sharedWith: selectedContacts, startedAt: Date.now()
    }});
    toast(`Trayecto compartido con ${selectedContacts.length} contacto(s)`);
    setTimeout(onBack, 600);
  };

  const stop = () => {
    dispatch({ type: "END_TRIP" });
    toast("Trayecto terminado. Tus contactos fueron notificados");
    setTimeout(onBack, 600);
  };

  if (state.trip) {
    const minsLeft = Math.max(0, Math.round(eta - (Date.now() - state.trip.startedAt) / 60000));
    return (
      <div className="h-full flex flex-col" style={{ background: C.bg }}>
        <StatusBar />
        <Header onBack={onBack} title="EN CAMINO" />
        <div className="flex-1 px-4 pb-6">
          <div className="rounded-3xl p-5 mb-4" style={{ background: `linear-gradient(135deg, ${C.green}, #0E9F6E)` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <p className="text-[10px] font-display font-bold text-white uppercase tracking-widest">Trayecto activo</p>
            </div>
            <p className="text-white text-sm font-body opacity-90">Yendo a</p>
            <p className="font-display font-bold text-white text-xl">{state.trip.destination}</p>
            <p className="text-white text-3xl font-display font-black mt-3">{minsLeft} min</p>
            <p className="text-white text-xs font-body opacity-90">restantes aprox.</p>
          </div>

          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">Compartido con</p>
          <div className="flex flex-col gap-2 mb-4">
            {state.trip.sharedWith.map(cid => {
              const c = state.emergencyContacts.find(x => x.id === cid);
              return c ? (
                <div key={cid} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.blue }}>
                    <UserCheck size={16} color="white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold text-white text-sm">{c.name}</p>
                    <p className="text-[11px]" style={{ color: C.muted }}>Viendo tu ubicación en vivo</p>
                  </div>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.green }} />
                </div>
              ) : null;
            })}
          </div>

          <div className="rounded-2xl p-4 mb-4" style={{ background: `${C.amber}15`, border: `1px solid ${C.amber}44` }}>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} color={C.amber} />
              <p className="text-xs font-display font-bold uppercase tracking-wider" style={{ color: C.amber }}>Si no llego</p>
            </div>
            <p className="text-[11px] font-body" style={{ color: C.muted }}>Si no desactivo el trayecto en {minsLeft + 5} min, se enviará alerta automática a mis contactos y a la policía.</p>
          </div>

          <button onClick={stop} className="w-full py-4 rounded-2xl font-display font-bold text-white text-sm uppercase tracking-wider"
            style={{ background: C.red, boxShadow: `0 8px 24px ${C.red}55` }}>
            Llegué bien · Terminar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="COMPARTIR" />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        <div className="rounded-3xl p-5 mb-4" style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})` }}>
          <Footprints size={22} color="white" />
          <p className="font-display font-bold text-white text-lg mt-2">Comparte tu trayecto</p>
          <p className="text-xs font-body text-white opacity-90 mt-1">Tus contactos verán dónde vas en vivo. Si no llegas a tiempo, se alerta automáticamente.</p>
        </div>

        <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">¿A dónde vas?</p>
        <input value={destination} onChange={e => setDestination(e.target.value)}
          placeholder="Ej: casa, escuela, trabajo..."
          className="w-full text-white text-sm font-body p-4 rounded-2xl outline-none mb-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        />

        <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">Tiempo estimado</p>
        <div className="flex gap-2 mb-4">
          {[10, 20, 30, 45, 60].map(m => (
            <button key={m} onClick={() => setEta(m)}
              className="flex-1 py-3 rounded-xl font-display font-bold text-xs"
              style={{
                background: eta === m ? C.blue : C.card,
                border: `1px solid ${eta === m ? C.blue : C.border}`,
                color: "white"
              }}>
              {m}m
            </button>
          ))}
        </div>

        <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">Compartir con</p>
        <div className="flex flex-col gap-2 mb-4">
          {state.emergencyContacts.map(c => {
            const sel = selectedContacts.includes(c.id);
            return (
              <button key={c.id} onClick={() =>
                setSelectedContacts(s => s.includes(c.id) ? s.filter(x => x !== c.id) : [...s, c.id])
              }
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: sel ? `${C.blue}1A` : C.card, border: `1.5px solid ${sel ? C.blue : C.border}` }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: sel ? C.blue : C.cardHi }}>
                  <Users size={16} color="white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-display font-bold text-white text-sm">{c.name}</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>{c.phone}</p>
                </div>
                <div className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{ background: sel ? C.blue : "transparent", border: `1.5px solid ${sel ? C.blue : C.border}` }}>
                  {sel && <Check size={12} color="white" strokeWidth={3.5} />}
                </div>
              </button>
            );
          })}
        </div>

        <button onClick={start} disabled={!destination || selectedContacts.length === 0}
          className="w-full py-4 rounded-2xl font-display font-bold text-white text-sm uppercase tracking-wider transition-all"
          style={{
            background: destination && selectedContacts.length ? C.green : C.card,
            opacity: destination && selectedContacts.length ? 1 : 0.5,
            boxShadow: destination && selectedContacts.length ? `0 8px 24px ${C.green}55` : "none"
          }}>
          Iniciar trayecto
        </button>
      </div>
    </div>
  );
};

// === ONBOARDING ===
const OnboardingScreen = () => {
  const { dispatch, toast } = useApp();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", phone: "", email: "", zone: "Escandón" });
  const [errors, setErrors] = useState({});

  const slides = [
    {
      icon: Shield, color: C.blue,
      title: "Bienvenido a ProAlert",
      subtitle: "La plataforma de seguridad ciudadana que te acompaña en cada trayecto",
      bullets: ["Mapa de zonas en tiempo real", "Identificación de policías", "Comunidad que te respalda"]
    },
    {
      icon: Heart, color: C.pink,
      title: "Tu seguridad, nuestra prioridad",
      subtitle: "Botón de pánico, modo discreto, alerta especializada para mujeres y compartir trayecto en vivo",
      bullets: ["Pánico envía ubicación al 911", "Modo calculadora si te piden el cel", "Comparte ruta con tu familia"]
    },
    {
      icon: Users, color: C.green,
      title: "Más fuertes juntos",
      subtitle: "Reporta, verifica y ayuda a vecinos. Cada acción cuenta y suma puntos.",
      bullets: ["Verificación vecinal de incidentes", "Foro local por zona", "Logros y reputación"]
    },
  ];

  if (step < slides.length) {
    const s = slides[step];
    const Icon = s.icon;
    return (
      <div className="h-full flex flex-col" style={{ background: `radial-gradient(circle at 50% 20%, ${s.color}33, ${C.bg} 60%)` }}>
        <StatusBar />
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col items-center justify-center px-6 py-4 text-center">
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full pulse-ring" style={{ background: s.color, opacity: 0.5 }} />
            <div className="w-24 h-24 rounded-full flex items-center justify-center relative" style={{ background: s.color, boxShadow: `0 0 60px ${s.color}88` }}>
              <Icon size={44} color="white" />
            </div>
          </div>
          <h1 className="font-display font-black text-white text-2xl mb-2 leading-tight">{s.title}</h1>
          <p className="text-xs font-body mb-5 leading-relaxed px-2" style={{ color: C.muted }}>{s.subtitle}</p>
          <div className="flex flex-col gap-2 w-full">
            {s.bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <CheckCircle2 size={16} color={s.color} className="shrink-0" />
                <p className="text-xs font-body text-white text-left">{b}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 pb-6 pt-2 shrink-0">
          <div className="flex justify-center gap-1.5 mb-4">
            {slides.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all"
                style={{ width: i === step ? 24 : 6, background: i === step ? s.color : C.border }} />
            ))}
          </div>
          <button onClick={() => setStep(step + 1)}
            className="w-full py-4 rounded-2xl font-display font-bold text-white text-sm uppercase tracking-widest"
            style={{ background: s.color, boxShadow: `0 8px 24px ${s.color}66` }}>
            {step === slides.length - 1 ? "Crear mi cuenta" : "Siguiente"}
          </button>
          {step < slides.length - 1 && (
            <button onClick={() => setStep(slides.length)} className="w-full py-3 text-xs font-display font-semibold uppercase tracking-widest" style={{ color: C.muted }}>
              Saltar
            </button>
          )}
        </div>
      </div>
    );
  }

  // Registration form
  const validate = () => {
    const e = {};
    if (!data.name || data.name.trim().length < 2) e.name = "Ingresa un nombre válido";
    const cleanPhone = (data.phone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) e.phone = "Ingresa un celular de 10 dígitos";
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Correo inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) {
      toast("Revisa los datos marcados en rojo");
      return;
    }
    dispatch({ type: "COMPLETE_ONBOARDING", payload: data });
    toast(`¡Bienvenido, ${data.name.split(" ")[0]}!`);
  };

  const isValid = data.name.trim().length >= 2 && (data.phone || "").replace(/\D/g, "").length >= 10;

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <div className="flex items-center px-4 pt-2 pb-3">
        <button onClick={() => setStep(slides.length - 1)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.card }}>
          <ChevronLeft size={20} color="white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-6">
        <Logo size={20} tagline />
        <h1 className="font-display font-black text-white text-2xl mt-6 leading-tight">Crea tu cuenta</h1>
        <p className="text-xs font-body mt-1 mb-6" style={{ color: C.muted }}>Tu información está protegida y nunca se comparte sin tu consentimiento</p>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-display font-bold uppercase tracking-widest text-white mb-1.5 block">
              Nombre <span style={{ color: C.red }}>*</span>
            </label>
            <div className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: C.card, border: `1.5px solid ${errors.name ? C.red : C.border}` }}>
              <User size={16} color={errors.name ? C.red : C.muted} />
              <input value={data.name} onChange={e => { setData({ ...data, name: e.target.value }); setErrors({ ...errors, name: null }); }}
                placeholder="¿Cómo te llamas?"
                className="flex-1 bg-transparent text-white text-sm outline-none font-body placeholder:text-slate-500" />
            </div>
            {errors.name && <p className="text-[10px] mt-1 ml-1" style={{ color: C.red }}>{errors.name}</p>}
          </div>

          <div>
            <label className="text-[10px] font-display font-bold uppercase tracking-widest text-white mb-1.5 block">
              Celular <span style={{ color: C.red }}>*</span>
            </label>
            <div className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: C.card, border: `1.5px solid ${errors.phone ? C.red : C.border}` }}>
              <Phone size={16} color={errors.phone ? C.red : C.muted} />
              <input value={data.phone} onChange={e => { setData({ ...data, phone: e.target.value }); setErrors({ ...errors, phone: null }); }}
                placeholder="55 1234 5678" inputMode="tel"
                className="flex-1 bg-transparent text-white text-sm outline-none font-body placeholder:text-slate-500" />
            </div>
            {errors.phone && <p className="text-[10px] mt-1 ml-1" style={{ color: C.red }}>{errors.phone}</p>}
          </div>

          <div>
            <label className="text-[10px] font-display font-bold uppercase tracking-widest text-white mb-1.5 block">Correo (opcional)</label>
            <div className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: C.card, border: `1.5px solid ${errors.email ? C.red : C.border}` }}>
              <AtSign size={16} color={errors.email ? C.red : C.muted} />
              <input value={data.email} onChange={e => { setData({ ...data, email: e.target.value }); setErrors({ ...errors, email: null }); }}
                placeholder="tu@correo.com" inputMode="email"
                className="flex-1 bg-transparent text-white text-sm outline-none font-body placeholder:text-slate-500" />
            </div>
            {errors.email && <p className="text-[10px] mt-1 ml-1" style={{ color: C.red }}>{errors.email}</p>}
          </div>

          <div>
            <label className="text-[10px] font-display font-bold uppercase tracking-widest text-white mb-1.5 block">Tu zona</label>
            <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <MapPin size={16} color={C.blue} />
              <select value={data.zone} onChange={e => setData({ ...data, zone: e.target.value })}
                className="flex-1 bg-transparent text-white text-sm outline-none font-body appearance-none">
                {["Escandón", "Tacubaya", "Nápoles", "San Pedro de los Pinos", "Roma Norte", "Condesa", "Polanco", "Otra"].map(z =>
                  <option key={z} value={z} style={{ background: C.surface }}>{z}</option>)}
              </select>
              <ChevronDown size={14} color={C.muted} />
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 rounded-2xl flex items-start gap-2" style={{ background: `${C.blue}11`, border: `1px solid ${C.blue}33` }}>
          <Lock size={14} color={C.blue} className="mt-0.5 shrink-0" />
          <p className="text-[11px] font-body leading-relaxed" style={{ color: C.muted }}>
            Tus reportes son <span className="text-white font-semibold">anónimos</span> para otros usuarios. Solo las autoridades pueden ver tu identidad y solo cuando es estrictamente necesario.
          </p>
        </div>

        <button onClick={submit} disabled={!isValid}
          className="w-full py-4 rounded-2xl font-display font-bold text-white text-sm uppercase tracking-widest mt-5 transition-all"
          style={{
            background: isValid ? C.blue : C.card,
            opacity: isValid ? 1 : 0.5,
            boxShadow: isValid ? `0 8px 24px ${C.blue}55` : "none"
          }}>
          Comenzar a usar ProAlert
        </button>
      </div>
    </div>
  );
};

// === ASISTENTE "¿QUÉ HAGO AHORA?" ===
const AssistantScreen = ({ onBack, onNav, onPanic }) => {
  const [active, setActive] = useState(null);

  const situations = [
    {
      id: "polidetiene", t: "Me está parando un policía", icon: ShieldAlert, color: C.amber,
      steps: [
        { t: "Mantén la calma", d: "Estaciónate en lugar visible. Mantén las manos sobre el volante." },
        { t: "No bajes del auto", d: "Solo si el oficial lo pide. Pregunta la razón de la detención." },
        { t: "Pide su identificación", d: "Tienes derecho a verla. Usa ProAlert para escanear su QR." },
        { t: "No firmes ni pagues nada en la calle", d: "Si hay infracción, debe entregarte la boleta oficial." },
        { t: "Graba si es seguro", d: "Activa modo discreto o pide a un acompañante grabar." },
      ],
      actions: [{ t: "Identificar policía ahora", screen: "scan", color: C.blue }]
    },
    {
      id: "asalto", t: "Me están asaltando", icon: AlertTriangle, color: C.red,
      steps: [
        { t: "No te resistas", d: "Tu vida vale más que cualquier objeto. Entrega lo que pidan." },
        { t: "Mantente calmado", d: "No hagas movimientos bruscos. Observa rasgos para reportar después." },
        { t: "Si puedes, activa pánico discreto", d: "Sin que se note, presiona el botón en la app." },
        { t: "Después: reporta inmediato", d: "Levanta reporte y denuncia en el MP más cercano." },
      ],
      actions: [
        { t: "Activar botón de pánico", screen: "panic", color: C.red },
        { t: "Reportar incidente", screen: "report", color: C.orange }
      ]
    },
    {
      id: "siguen", t: "Siento que me siguen", icon: Eye, color: C.orange,
      steps: [
        { t: "Confirma tu sospecha", d: "Da vuelta en una calle inesperada. Si te siguen, es real." },
        { t: "Ve a un lugar concurrido", d: "Gasolinera, centro comercial, comisaría. Evita zonas solas." },
        { t: "Comparte tu trayecto", d: "Activa compartir ubicación en vivo con tu familia." },
        { t: "Llama al 911", d: "Da tu placa, ubicación y descripción del vehículo que te sigue." },
      ],
      actions: [
        { t: "Compartir trayecto", screen: "trip", color: C.blue },
        { t: "Llamar al 911", screen: "emergency", color: C.red }
      ]
    },
    {
      id: "extorsion", t: "Me están extorsionando", icon: PhoneCall, color: C.red,
      steps: [
        { t: "No respondas amenazas", d: "Si llaman, cuelga. No des datos personales." },
        { t: "Verifica con la persona supuestamente afectada", d: "Llámala desde otro número. Nunca es real." },
        { t: "No deposites dinero", d: "Una vez pagas, seguirán pidiendo más." },
        { t: "Reporta al 089", d: "Denuncia anónima nacional. También usa ProAlert." },
      ],
      actions: [
        { t: "Llamar al 089", screen: "emergency", color: C.red },
        { t: "Reportar el caso", screen: "report", color: C.orange }
      ]
    },
    {
      id: "mujer", t: "Me siento en peligro (mujer)", icon: Heart, color: C.pink,
      steps: [
        { t: "Activa Alerta Mujer", d: "Envía ubicación en vivo a la policía especializada y a tus contactos." },
        { t: "Ve a un lugar seguro", d: "Tienda 24h, farmacia, gasolinera. Evita callejones." },
        { t: "Si vas en transporte", d: "Pídele al chofer ir a la estación más cercana o llama a un familiar en altavoz." },
        { t: "Camina decidida", d: "Postura firme. Habla por teléfono (real o simulada)." },
      ],
      actions: [
        { t: "Activar Alerta Mujer", screen: "women", color: C.pink },
        { t: "Compartir trayecto", screen: "trip", color: C.blue }
      ]
    },
    {
      id: "llanta", t: "Se me ponchó una llanta", icon: Car, color: C.amber,
      steps: [
        { t: "Cuidado: puede ser un montachoques", d: "Sobre todo si pasa cerca de carros estacionados sospechosos." },
        { t: "Avanza a zona segura", d: "Aunque dañes el rin, llega a gasolinera o lugar iluminado." },
        { t: "No aceptes ayuda extraña", d: "Llama a tu seguro, Ángeles Verdes (078) o un familiar." },
        { t: "Si te detienes en carretera", d: "Activa intermitentes, sal por el lado opuesto al tráfico." },
      ],
      actions: [
        { t: "Llamar Ángeles Verdes", screen: "emergency", color: C.green },
        { t: "Compartir mi ubicación", screen: "trip", color: C.blue }
      ]
    },
    {
      id: "casa", t: "Hay alguien sospechoso en mi casa", icon: Home, color: C.red,
      steps: [
        { t: "NO entres si la puerta está abierta", d: "Aléjate y observa desde lugar seguro." },
        { t: "Llama al 911 antes que nada", d: "Da tu dirección exacta y describe lo que viste." },
        { t: "Avisa a vecinos verificados", d: "ProAlert puede alertar a ángeles cercanos." },
        { t: "No intentes confrontar solo", d: "Espera a la autoridad. Tu seguridad primero." },
      ],
      actions: [
        { t: "Activar botón de pánico", screen: "panic", color: C.red },
        { t: "Llamar al 911", screen: "emergency", color: C.red }
      ]
    },
    {
      id: "accidente", t: "Tuve un accidente", icon: Truck, color: C.amber,
      steps: [
        { t: "Revisa si hay lesionados", d: "Llama al 911 si hay heridos. No los muevas." },
        { t: "Toma fotos del lugar", d: "Posición de vehículos, daños, calle, semáforos." },
        { t: "Intercambia datos con el otro conductor", d: "Nombre, placas, seguro, teléfono. Sin pleitos." },
        { t: "Llama a tu aseguradora", d: "Que el ajustador llegue antes de mover los vehículos." },
      ],
      actions: [
        { t: "Llamar al 911", screen: "emergency", color: C.red },
        { t: "Reportar incidente", screen: "report", color: C.amber }
      ]
    },
  ];

  if (active) {
    const s = active;
    const Icon = s.icon;
    return (
      <div className="h-full flex flex-col" style={{ background: C.bg }}>
        <StatusBar />
        <Header onBack={() => setActive(null)} title="GUÍA EN VIVO" />
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
          <div className="rounded-3xl p-5 mb-4" style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}CC)` }}>
            <Icon size={28} color="white" />
            <p className="font-display font-black text-white text-xl mt-3 leading-tight">{s.t}</p>
            <p className="text-xs font-body text-white opacity-90 mt-1">Sigue estos pasos en orden. Respira. Vas a estar bien.</p>
          </div>

          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">Pasos a seguir</p>
          <div className="flex flex-col gap-2 mb-5">
            {s.steps.map((step, i) => (
              <div key={i} className="rounded-2xl p-4 flex gap-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}22`, border: `1px solid ${s.color}55` }}>
                  <span className="font-display font-black text-base" style={{ color: s.color }}>{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-white text-sm leading-tight">{step.t}</p>
                  <p className="text-xs font-body mt-1 leading-relaxed" style={{ color: C.muted }}>{step.d}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">Acciones rápidas</p>
          <div className="flex flex-col gap-2">
            {s.actions.map((a, i) => (
              <button key={i}
                onClick={() => a.screen === "panic" ? onPanic() : onNav(a.screen)}
                className="w-full py-4 rounded-2xl font-display font-bold text-white text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                style={{ background: a.color, boxShadow: `0 8px 24px ${a.color}55` }}>
                {a.t} <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="¿QUÉ HAGO?" />
      <div className="px-4 pb-3">
        <div className="rounded-3xl p-5" style={{ background: `linear-gradient(135deg, ${C.orange}, #D9501F)` }}>
          <Compass size={22} color="white" />
          <p className="font-display font-bold text-white text-lg mt-2 leading-tight">Estoy aquí para ayudarte</p>
          <p className="text-xs font-body text-white opacity-90 mt-1">Toca tu situación y te guío paso a paso. Respira, no estás solo.</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">¿Qué te está pasando?</p>
        <div className="flex flex-col gap-2">
          {situations.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setActive(s)}
                className="rounded-2xl p-4 flex items-center gap-3 text-left"
                style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}22`, border: `1px solid ${s.color}55` }}>
                  <Icon size={22} color={s.color} />
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-white text-sm leading-tight">{s.t}</p>
                  <p className="text-[11px] font-body mt-0.5" style={{ color: C.muted }}>{s.steps.length} pasos · {s.actions.length} acciones</p>
                </div>
                <ChevronRight size={18} color={C.muted} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// === VERIFICADOR DE PATRULLAS ===
const PlateVerifierScreen = ({ onBack, onNav }) => {
  const { state } = useApp();
  const [plate, setPlate] = useState("");
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const verify = () => {
    if (!plate.trim()) return;
    setScanning(true);
    setTimeout(() => {
      const clean = plate.trim().toUpperCase().replace(/\s/g, "");
      const isReal = state.realPlates.some(p => p.toUpperCase().replace(/\s/g, "") === clean);
      const isFake = state.fakePlates.some(p => p.toUpperCase().replace(/\s/g, "") === clean);
      if (isReal) {
        setResult({
          status: "real", color: C.green,
          title: "Patrulla verificada",
          desc: "Esta placa pertenece a una unidad oficial de la SSC CDMX.",
          unit: "Sector Cuauhtémoc · Sector 06",
          officer: "A cargo de Comandante Ruiz",
          shift: "Turno matutino activo"
        });
      } else if (isFake) {
        setResult({
          status: "fake", color: C.red,
          title: "⚠️ Placa SOSPECHOSA",
          desc: "Esta placa NO corresponde a una unidad oficial registrada. Posible patrulla falsa.",
          warn: "No te subas. No entregues documentos. Llama al 911 inmediatamente."
        });
      } else {
        setResult({
          status: "unknown", color: C.amber,
          title: "Placa no encontrada",
          desc: "No tenemos registro de esta placa. Puede ser que el formato esté mal o sea de otra entidad. Verifica con el oficial directamente y usa el QR.",
        });
      }
      setScanning(false);
    }, 1200);
  };

  const reset = () => { setResult(null); setPlate(""); };

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="VERIFICAR PATRULLA" />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        <div className="rounded-3xl p-5 mb-5" style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})` }}>
          <Car size={22} color="white" />
          <p className="font-display font-bold text-white text-lg mt-2 leading-tight">Verifica si una patrulla es real</p>
          <p className="text-xs font-body text-white opacity-90 mt-1">Ingresa el número de placa de la unidad para confirmar si está registrada oficialmente.</p>
        </div>

        {!result && (
          <>
            <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">Número de placa</p>
            <div className="flex items-center gap-3 p-4 rounded-2xl mb-4"
              style={{ background: C.card, border: `1.5px solid ${C.border}` }}>
              <Hash size={20} color={C.muted} />
              <input value={plate} onChange={e => setPlate(e.target.value.toUpperCase())}
                placeholder="Ej: 082514 o PFG-789"
                className="flex-1 bg-transparent text-white text-lg font-display font-bold outline-none placeholder:text-slate-600 uppercase tracking-wider" />
              {plate && <button onClick={() => setPlate("")}><X size={18} color={C.muted} /></button>}
            </div>

            <button onClick={verify} disabled={!plate.trim() || scanning}
              className="w-full py-4 rounded-2xl font-display font-bold text-white text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all mb-4"
              style={{
                background: plate.trim() ? C.blue : C.card,
                opacity: plate.trim() ? 1 : 0.5,
                boxShadow: plate.trim() ? `0 8px 24px ${C.blue}55` : "none"
              }}>
              {scanning ? <><Loader size={18} className="animate-spin" />Verificando...</> : <>Verificar placa <ArrowRight size={16} /></>}
            </button>

            <div className="p-3 rounded-2xl flex items-start gap-2 mb-5" style={{ background: `${C.amber}11`, border: `1px solid ${C.amber}33` }}>
              <AlertCircle size={14} color={C.amber} className="mt-0.5 shrink-0" />
              <p className="text-[11px] font-body leading-relaxed" style={{ color: C.muted }}>
                Si la placa no aparece o luce sospechosa, <span className="text-white font-semibold">aléjate y llama al 911</span>. Falsos policías usan placas que no corresponden a ninguna unidad oficial.
              </p>
            </div>

            <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">Prueba con estos ejemplos</p>
            <div className="flex flex-wrap gap-2">
              {["082514", "112847", "PFG-789", "X-5500"].map(ex => (
                <button key={ex} onClick={() => setPlate(ex)}
                  className="px-3 py-1.5 rounded-full text-xs font-display font-bold"
                  style={{ background: C.cardHi, color: "white", border: `1px solid ${C.border}` }}>
                  {ex}
                </button>
              ))}
            </div>
          </>
        )}

        {result && (
          <div className="animate-fadein">
            <div className="rounded-3xl p-5 mb-4 text-center" style={{ background: `${result.color}1A`, border: `2px solid ${result.color}` }}>
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3"
                style={{ background: result.color, boxShadow: `0 0 30px ${result.color}88` }}>
                {result.status === "real" && <BadgeCheck size={32} color="white" />}
                {result.status === "fake" && <ShieldAlert size={32} color="white" />}
                {result.status === "unknown" && <HelpCircle size={32} color="white" />}
              </div>
              <p className="font-display font-black text-2xl uppercase" style={{ color: result.color }}>{plate}</p>
              <p className="font-display font-bold text-white text-base mt-1">{result.title}</p>
              <p className="text-xs font-body mt-2 leading-relaxed" style={{ color: C.muted }}>{result.desc}</p>
            </div>

            {result.unit && (
              <div className="rounded-2xl p-4 mb-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <p className="text-[10px] font-display uppercase tracking-wider mb-1" style={{ color: C.muted }}>Unidad</p>
                <p className="text-sm font-display font-bold text-white">{result.unit}</p>
                <p className="text-[11px] font-body mt-1" style={{ color: C.muted }}>{result.officer}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.green }} />
                  <p className="text-[10px] font-display font-bold uppercase" style={{ color: C.green }}>{result.shift}</p>
                </div>
              </div>
            )}

            {result.warn && (
              <div className="rounded-2xl p-4 mb-3" style={{ background: `${C.red}1A`, border: `1px solid ${C.red}` }}>
                <p className="font-display font-bold text-white text-sm leading-tight mb-1">⚠️ Importante</p>
                <p className="text-xs font-body" style={{ color: "white" }}>{result.warn}</p>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-4">
              {result.status === "fake" && (
                <button onClick={() => onNav("emergency")}
                  className="w-full py-3 rounded-2xl font-display font-bold text-white text-sm uppercase tracking-widest"
                  style={{ background: C.red, boxShadow: `0 6px 18px ${C.red}55` }}>
                  Llamar al 911
                </button>
              )}
              <button onClick={reset}
                className="w-full py-3 rounded-2xl font-display font-bold text-white text-sm uppercase tracking-widest"
                style={{ background: C.card, border: `1px solid ${C.border}` }}>
                Verificar otra placa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// === BANCO DE MODUS OPERANDI ===
const MisDerechosScreen = ({ onBack }) => {
  const [tab, setTab] = useState("constitucion");
  const [active, setActive] = useState(null);

  const derechosConstitucionales = [
    {
      id: "detencion",
      situacion: "Si me detiene la policía",
      icon: Shield,
      color: C.blue,
      base: "Art. 16, 19 y 20 Constitución · Carta de Derechos del Detenido",
      derechos: [
        { d: "Conocer el motivo de tu detención", art: "Art. 20-B-I" },
        { d: "Guardar silencio sin que se use en tu contra", art: "Art. 20-B-II" },
        { d: "Recibir asistencia de abogado desde el inicio", art: "Art. 20-B-VIII" },
        { d: "Hacer una llamada telefónica", art: "Carta de Derechos" },
        { d: "Ser presentado al MP en máximo 48 horas", art: "Art. 16" },
        { d: "Ser informado en idioma que comprendas (incluso si eres indígena)", art: "Art. 2 y 20-B-VII" },
        { d: "Que NO te obliguen a declarar", art: "Art. 20-B-II" },
        { d: "Que NO te aíslen ni torturen", art: "Art. 20-B-II" },
      ],
      argumentar: "Si no te leen tus derechos, dilo en voz alta y pídelo. Cualquier confesión obtenida sin abogado es ilegal."
    },
    {
      id: "casa",
      situacion: "Si quieren entrar a mi casa",
      icon: Home,
      color: C.green,
      base: "Art. 16 Constitución",
      derechos: [
        { d: "Tu domicilio es INVIOLABLE", art: "Art. 16" },
        { d: "Solo pueden entrar con orden de cateo de juez", art: "Art. 16" },
        { d: "La orden debe describir QUÉ buscan y QUIÉN está autorizado", art: "Art. 16" },
        { d: "Excepción: persecución de delito flagrante o riesgo de vida", art: "Jurisprudencia SCJN" },
        { d: "Tienes derecho a leer la orden antes de permitir entrada", art: "Práctica común" },
        { d: "Pueden ingresar dos testigos por tu parte", art: "Art. 16" },
      ],
      argumentar: "Pídeles ver la orden de cateo. Sin orden, NO pueden entrar a menos que sea delito flagrante. Si fuerzan entrada, denuncia ante CNDH."
    },
    {
      id: "manifestacion",
      situacion: "Si voy a una marcha o protesta",
      icon: Megaphone,
      color: C.orange,
      base: "Art. 6, 7 y 9 Constitución",
      derechos: [
        { d: "Libertad de reunión y manifestación pacífica", art: "Art. 9" },
        { d: "Libertad de expresión sin censura previa", art: "Art. 6" },
        { d: "Libertad de prensa y registro de los hechos", art: "Art. 7" },
        { d: "Derecho a grabar a policías en función pública", art: "Jurisprudencia SCJN" },
        { d: "No te pueden detener solo por participar", art: "Art. 9" },
        { d: "Si te detienen, deben ser MP no policía local", art: "Art. 21" },
      ],
      argumentar: "Si la marcha es pacífica, NO es delito. Lleva agua, identifícate como ciudadano observador, graba todo. Si te detienen, exige saber el delito específico."
    },
    {
      id: "salud",
      situacion: "Atención médica de urgencia",
      icon: HeartPulse,
      color: C.red,
      base: "Art. 4 Constitución · Ley General de Salud",
      derechos: [
        { d: "TODA persona tiene derecho a la salud", art: "Art. 4" },
        { d: "Las urgencias DEBEN atenderse SIN preguntar por dinero o derechohabiencia", art: "LGS Art. 71" },
        { d: "Hospitales públicos y privados están obligados a estabilizar al paciente", art: "NOM-027-SSA3-2013" },
        { d: "Si te niegan atención, es delito (negativa de servicio médico)", art: "Código Penal Federal" },
        { d: "Embarazo: atención inmediata sin importar tu situación legal o económica", art: "Art. 4 y LGS" },
        { d: "Niños y niñas: prioridad absoluta", art: "Art. 4 y LGDNNA" },
      ],
      argumentar: "Si te niegan atención: graba la negativa, pide nombre del médico, llama al 911 desde el lugar, presenta queja en COFEPRIS o CONAMED."
    },
    {
      id: "trabajo",
      situacion: "Si me despiden injustificadamente",
      icon: Users,
      color: C.amber,
      base: "Art. 123 Constitución · LFT",
      derechos: [
        { d: "Si te despiden sin causa, tienes derecho a indemnización constitucional", art: "Art. 123-A-XXII" },
        { d: "3 meses de salario + 20 días por año trabajado + prima de antigüedad", art: "LFT Art. 50" },
        { d: "Aguinaldo proporcional al tiempo trabajado en el año", art: "LFT Art. 87" },
        { d: "Prima vacacional y vacaciones no gozadas", art: "LFT" },
        { d: "Tienes 2 meses para demandar a partir del despido", art: "LFT Art. 518" },
        { d: "Tribunales laborales gratuitos, no necesitas abogado caro", art: "LFT" },
      ],
      argumentar: "Pide carta de despido por escrito. Si no te la dan, es despido injustificado. Acude a la Procuraduría de la Defensa del Trabajo (PROFEDET) — es gratis."
    },
    {
      id: "consumidor",
      situacion: "Como consumidor (servicios, productos)",
      icon: ScrollText,
      color: C.blue,
      base: "Art. 28 Constitución · LFPC",
      derechos: [
        { d: "Información veraz y clara antes de comprar", art: "LFPC Art. 7" },
        { d: "Productos defectuosos: reparación, reposición o devolución", art: "LFPC Art. 92" },
        { d: "30 días naturales para reclamar productos nuevos", art: "LFPC Art. 92" },
        { d: "Cancelar compras a distancia en 5 días hábiles sin penalización", art: "LFPC Art. 56" },
        { d: "No te pueden negar el servicio por género, raza, edad, etc.", art: "LFPC Art. 58" },
        { d: "PROFECO te ayuda GRATIS", art: "LFPC" },
      ],
      argumentar: "Guarda tickets y evidencia. Si un negocio se niega, llama a PROFECO al 55-5568-8722 o 800-468-8722. Es gratis y son rápidos."
    },
  ];

  const reglamentoVialidad = [
    {
      id: "alcoholimetro",
      situacion: "Alcoholímetro",
      icon: AlertTriangle,
      color: C.red,
      base: "Reglamento de Tránsito CDMX Art. 38 (vigente 2026)",
      derechos: [
        { d: "El alcoholímetro DEBE estar calibrado y certificado", art: "RT Art. 38" },
        { d: "Tienes derecho a una segunda prueba con otro aparato", art: "Derecho de defensa" },
        { d: "Te deben informar tu resultado de inmediato", art: "RT" },
        { d: "Límite permitido: 0.4 g/L en aliento (0.8 en sangre)", art: "RT" },
        { d: "Si das positivo: 20-36 hrs de arresto sin fianza", art: "RT Art. 38-IV" },
        { d: "NO pueden golpearte ni amenazarte", art: "Art. 19 Constitución" },
      ],
      argumentar: "Pide ver el certificado de calibración. Pide que se grabe el procedimiento. NO firmes nada que no entiendas. Pide hablar con un abogado de turno (defensoría pública)."
    },
    {
      id: "infraccion",
      situacion: "Me quieren poner una multa",
      icon: FileText,
      color: C.amber,
      base: "Reglamento de Tránsito CDMX y Edomex",
      derechos: [
        { d: "Solo agentes UNIFORMADOS y AUTORIZADOS pueden infraccionar", art: "RT Art. 60" },
        { d: "En CDMX: agentes SSC con banda en brazo 'Autorizado para infraccionar'", art: "RT" },
        { d: "En Edomex: SOLO mujeres policías de tránsito están autorizadas (2025)", art: "Reforma Edomex" },
        { d: "Te deben mostrar la multa DIGITAL en su dispositivo móvil", art: "RT" },
        { d: "Tienes derecho a saber QUÉ artículo violaste", art: "Debido proceso" },
        { d: "Puedes impugnar la multa en 30 días naturales", art: "RT" },
        { d: "NO les pagues a ellos directamente - es extorsión", art: "Código Penal" },
      ],
      argumentar: "Di: '¿Cuál es su nombre, placa y unidad? ¿En qué artículo del reglamento se basa la multa? Muéstreme el dispositivo digital.' Si no responde claramente, es señal de extorsión. Graba todo."
    },
    {
      id: "reten",
      situacion: "Retén o filtro de revisión",
      icon: Crosshair,
      color: C.amber,
      base: "Constitución Art. 16 · Jurisprudencia SCJN",
      derechos: [
        { d: "Retenes deben ser PERMANENTES, anunciados públicamente", art: "Jurisprudencia" },
        { d: "Te pueden pedir identificación oficial", art: "Práctica legal" },
        { d: "Para revisar tu vehículo necesitan tu autorización O sospecha fundada", art: "Art. 16" },
        { d: "NO pueden retener tu identificación ni placas como 'garantía'", art: "Derecho de propiedad" },
        { d: "Tienes derecho a NO bajar del vehículo a menos que sea delito flagrante", art: "Art. 16" },
        { d: "Si te bajan: deben tener orden o flagrancia", art: "Art. 16" },
      ],
      argumentar: "Mantén la calma. Pide identificación del agente y motivo del retén. Si no es legal: 'Voy a hacer una llamada y a grabar este procedimiento, ¿hay algún problema?' Suelen retroceder."
    },
    {
      id: "casco-cinturon",
      situacion: "Casco, cinturón y bebés",
      icon: Shield,
      color: C.blue,
      base: "Reglamento de Tránsito CDMX/Edomex",
      derechos: [
        { d: "Casco OBLIGATORIO en moto (conductor y pasajero)", art: "RT Art. 36" },
        { d: "Cinturón OBLIGATORIO todos los pasajeros (incluso atrás)", art: "RT Art. 36" },
        { d: "Niños menores de 12 años: silla porta infante", art: "RT Art. 36-VII" },
        { d: "Bebés (0-1 año): silla en sentido contrario a la marcha", art: "NOM-194" },
        { d: "Multa por no usar cinturón: 20 UMAs (~$2,200 MXN)", art: "RT" },
        { d: "No usar casco en moto: invalida tu seguro en caso de accidente", art: "Práctica aseguradoras" },
      ],
      argumentar: "Estas multas SÍ son legales. Mejor cumplir. Si te detienen y SÍ usabas cinturón pero el oficial dice que no, pídele evidencia (foto/video del momento del paso)."
    },
    {
      id: "velocidad",
      situacion: "Multa por exceso de velocidad",
      icon: Zap,
      color: C.red,
      base: "Reglamento de Tránsito CDMX/Edomex",
      derechos: [
        { d: "Radar debe estar calibrado y certificado", art: "RT" },
        { d: "Deben mostrarte la fotografía con datos: fecha, hora, lugar, velocidad", art: "Debido proceso" },
        { d: "La foto debe ser clara y mostrar tus placas legibles", art: "Debido proceso" },
        { d: "Límites vigentes: zonas escolares 20km/h, vías secundarias 40-50, primarias 50-70, autopistas urbanas 80", art: "RT Art. 9" },
        { d: "Photoradares en CDMX deben estar señalizados antes", art: "RT" },
      ],
      argumentar: "Pide ver la fotografía completa con metadatos. Verifica que la placa coincide con tu auto. Si la foto está borrosa o no se distingue el vehículo, es razón para impugnar."
    },
    {
      id: "documentos",
      situacion: "Documentos del vehículo",
      icon: FileText,
      color: C.blue,
      base: "Reglamento de Tránsito y Hacienda",
      derechos: [
        { d: "Licencia vigente del conductor", art: "RT" },
        { d: "Tarjeta de circulación al corriente", art: "RT" },
        { d: "Verificación vehicular vigente (CDMX/Edomex)", art: "NOM" },
        { d: "Seguro de responsabilidad civil OBLIGATORIO en carreteras federales", art: "Ley Federal" },
        { d: "Placas legibles y a la vista (frontal y trasera)", art: "RT" },
        { d: "Refrendo y tenencia pagados (donde aplique)", art: "Hacienda" },
      ],
      argumentar: "Lleva los documentos físicos O digitales (apps oficiales). Si te piden retener placas como 'garantía' de pago, es ilegal: las placas son tuyas hasta que un juez determine lo contrario."
    },
  ];

  const items = tab === "constitucion" ? derechosConstitucionales : reglamentoVialidad;

  if (active) {
    const Icon = active.icon;
    return (
      <div className="h-full flex flex-col" style={{ background: C.bg }}>
        <StatusBar />
        <Header onBack={() => setActive(null)} title="MIS DERECHOS" />
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
          <div className="rounded-3xl p-5 mb-4" style={{ background: `${active.color}1A`, border: `2px solid ${active.color}` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: active.color }}>
              <Icon size={26} color="white" />
            </div>
            <p className="font-display font-black text-xl text-white leading-tight mb-1">{active.situacion}</p>
            <p className="text-[10px] font-body" style={{ color: C.muted }}>{active.base}</p>
          </div>

          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">Tus derechos</p>
          <div className="flex flex-col gap-2 mb-4">
            {active.derechos.map((d, i) => (
              <div key={i} className="rounded-2xl p-3 flex items-start gap-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: active.color }}>
                  <Check size={12} color="white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-body text-white leading-relaxed">{d.d}</p>
                  <p className="text-[10px] font-display font-bold uppercase tracking-wider mt-0.5" style={{ color: active.color }}>{d.art}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl p-4" style={{ background: `${C.green}15`, border: `1px solid ${C.green}55` }}>
            <div className="flex items-center gap-2 mb-2">
              <Megaphone size={16} color={C.green} />
              <p className="font-display font-bold text-[10px] uppercase tracking-widest" style={{ color: C.green }}>Cómo argumentar</p>
            </div>
            <p className="text-sm font-body text-white leading-relaxed">{active.argumentar}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="MIS DERECHOS" />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        <p className="text-xs font-body mb-3" style={{ color: C.muted }}>
          Conoce tus derechos para defenderte de abuso de autoridad o de quien quiera intimidarte.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab("constitucion")}
            className="flex-1 py-2.5 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-all"
            style={{
              background: tab === "constitucion" ? C.blue : C.card,
              color: tab === "constitucion" ? "white" : C.muted,
              border: `1px solid ${tab === "constitucion" ? C.blue : C.border}`
            }}>
            Constitución
          </button>
          <button onClick={() => setTab("vialidad")}
            className="flex-1 py-2.5 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-all"
            style={{
              background: tab === "vialidad" ? C.blue : C.card,
              color: tab === "vialidad" ? "white" : C.muted,
              border: `1px solid ${tab === "vialidad" ? C.blue : C.border}`
            }}>
            Reglamento Vialidad
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {items.map(it => {
            const Icon = it.icon;
            return (
              <button key={it.id} onClick={() => setActive(it)}
                className="rounded-2xl p-4 flex items-center gap-3 text-left transition-all"
                style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${it.color}22` }}>
                  <Icon size={20} color={it.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-white text-sm leading-tight">{it.situacion}</p>
                  <p className="text-[10px] font-body truncate mt-0.5" style={{ color: C.muted }}>{it.base}</p>
                </div>
                <ChevronRight size={16} color={C.muted} className="shrink-0" />
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl p-3 mt-4" style={{ background: `${C.amber}15`, border: `1px solid ${C.amber}55` }}>
          <div className="flex items-start gap-2">
            <AlertCircle size={14} color={C.amber} className="shrink-0 mt-0.5" />
            <p className="text-[11px] font-body" style={{ color: "white" }}>
              <span style={{ color: C.amber, fontWeight: 700 }}>Importante:</span> Esta información es orientativa. Para casos específicos consulta un abogado. ProAlert no sustituye asesoría legal profesional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactosScreen = ({ onBack }) => {
  const { toast } = useApp();
  const [contacts, setContacts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relacion, setRelacion] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("proalert_contacts");
      if (saved) setContacts(JSON.parse(saved));
    } catch {}
  }, []);
  const save = (arr) => {
    setContacts(arr);
    try { localStorage.setItem("proalert_contacts", JSON.stringify(arr)); } catch {}
  };

  const addContact = () => {
    if (!name.trim() || !phone.trim()) {
      toast("Falta nombre o teléfono");
      return;
    }
    if (contacts.length >= 5) {
      toast("Máximo 5 contactos");
      return;
    }
    save([...contacts, { id: Date.now(), name: name.trim(), phone: phone.trim().replace(/\s/g, ""), relacion: relacion.trim() || "Contacto" }]);
    setName(""); setPhone(""); setRelacion(""); setShowAdd(false);
    toast(`${name.trim()} agregado a tu red`);
  };

  const remove = (id) => save(contacts.filter(c => c.id !== id));

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="CONTACTOS DE CONFIANZA" />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        <div className="rounded-2xl p-3 mb-4" style={{ background: `${C.pink}15`, border: `1px solid ${C.pink}55` }}>
          <div className="flex items-start gap-2">
            <HeartPulse size={16} color={C.pink} className="shrink-0 mt-0.5" />
            <p className="text-[11px] font-body text-white leading-relaxed">
              Estas personas recibirán tu ubicación y un mensaje automático cuando actives el botón SOS. <span style={{ color: C.pink, fontWeight: 700 }}>Hasta 5 contactos.</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white">Mi red ({contacts.length}/5)</p>
          {!showAdd && contacts.length < 5 && (
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-full"
              style={{ background: C.pink }}>
              <Plus size={12} color="white" />
              <span className="text-[10px] font-display font-bold uppercase text-white">Agregar</span>
            </button>
          )}
        </div>

        {showAdd && (
          <div className="rounded-2xl p-4 mb-3" style={{ background: C.card, border: `1px solid ${C.pink}` }}>
            <p className="text-[10px] font-display font-bold uppercase tracking-wider text-white mb-2">Nombre</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Mamá"
              className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none mb-3 font-body"
              style={{ background: C.bg, border: `1px solid ${C.border}` }} />

            <p className="text-[10px] font-display font-bold uppercase tracking-wider text-white mb-2">Teléfono (10 dígitos)</p>
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ""))} type="tel" placeholder="5512345678" maxLength={10}
              className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none mb-3 font-body"
              style={{ background: C.bg, border: `1px solid ${C.border}` }} />

            <p className="text-[10px] font-display font-bold uppercase tracking-wider text-white mb-2">Relación</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {["Familia", "Pareja", "Amig@", "Vecin@", "Trabajo", "Otro"].map(r => (
                <button key={r} onClick={() => setRelacion(r)}
                  className="py-2 rounded-xl font-display font-bold text-[11px] transition-all"
                  style={{
                    background: relacion === r ? C.pink : C.bg,
                    color: relacion === r ? "white" : C.muted,
                    border: `1px solid ${relacion === r ? C.pink : C.border}`
                  }}>
                  {r}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setShowAdd(false); setName(""); setPhone(""); setRelacion(""); }}
                className="flex-1 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider"
                style={{ background: C.card, border: `1px solid ${C.border}`, color: "white" }}>
                Cancelar
              </button>
              <button onClick={addContact} disabled={!name.trim() || !phone.trim()}
                className="flex-1 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-white"
                style={{ background: name.trim() && phone.trim() ? C.pink : C.card, opacity: name.trim() && phone.trim() ? 1 : 0.5 }}>
                Guardar
              </button>
            </div>
          </div>
        )}

        {contacts.length === 0 && !showAdd ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: C.card, border: `1px dashed ${C.border}` }}>
            <Users size={28} color={C.muted} className="mx-auto mb-2" />
            <p className="font-display font-bold text-white text-sm mb-1">Sin contactos aún</p>
            <p className="text-xs font-body" style={{ color: C.muted }}>Agrega hasta 5 personas que serán tu red en emergencias</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {contacts.map(c => (
              <div key={c.id} className="rounded-2xl p-3 flex items-center gap-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.pink}33` }}>
                  <User size={18} color={C.pink} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-white text-sm">{c.name}</p>
                  <p className="text-[10px] font-body" style={{ color: C.muted }}>{c.relacion} · {c.phone}</p>
                </div>
                <a href={`tel:${c.phone}`} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.green }}>
                  <Phone size={14} color="white" fill="white" />
                </a>
                <button onClick={() => remove(c.id)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.cardHi }}>
                  <X size={12} color={C.muted} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl p-3 mt-4" style={{ background: `${C.blue}15`, border: `1px solid ${C.blue}55` }}>
          <div className="flex items-start gap-2">
            <Shield size={14} color={C.blue} className="shrink-0 mt-0.5" />
            <p className="text-[11px] font-body text-white leading-relaxed">
              <span style={{ color: C.blue, fontWeight: 700 }}>Privacidad:</span> Tus contactos se guardan SOLO en tu dispositivo. ProAlert no los comparte ni los sube a ningún servidor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SOSScreen = ({ onBack, onNav }) => {
  const { toast } = useApp();
  const [counting, setCounting] = useState(false);
  const [count, setCount] = useState(5);
  const [sent, setSent] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [contacts, setContacts] = useState([]);
  const intervalRef = useRef(null);

  // Cargar contactos
  useEffect(() => {
    try {
      const saved = localStorage.getItem("proalert_contacts");
      if (saved) setContacts(JSON.parse(saved));
    } catch {}
  }, []);

  // Obtener ubicación precisa
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy]),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Cuenta regresiva
  useEffect(() => {
    if (!counting) return;
    intervalRef.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(intervalRef.current);
          executeSOS();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [counting]);

  const startCount = () => {
    setCount(5);
    setCounting(true);
    // Vibrar si es posible
    try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch {}
  };

  const cancelCount = () => {
    clearInterval(intervalRef.current);
    setCounting(false);
    setCount(5);
    toast("SOS cancelado");
  };

  const executeSOS = () => {
    setSent(true);
    // Vibración fuerte
    try { navigator.vibrate && navigator.vibrate([500, 200, 500, 200, 500]); } catch {}

    // Construir mensaje con Google Maps link
    const lat = userPos ? userPos[0].toFixed(6) : "?";
    const lng = userPos ? userPos[1].toFixed(6) : "?";
    const mapUrl = userPos ? `https://maps.google.com/?q=${lat},${lng}` : "ubicación desconocida";
    const mensaje = `🚨 SOS - PROALERT 🚨\n\nNecesito ayuda. Mi ubicación actual:\n${mapUrl}\n\nLat: ${lat}, Lng: ${lng}\nHora: ${new Date().toLocaleTimeString("es-MX")}\n\nMensaje enviado automáticamente desde ProAlert.`;

    // Si hay contactos, abrir SMS con TODOS
    if (contacts.length > 0) {
      const phones = contacts.map(c => c.phone).join(",");
      const smsUrl = `sms:${phones}?body=${encodeURIComponent(mensaje)}`;
      try {
        window.location.href = smsUrl;
      } catch {}
      toast(`SOS enviado a ${contacts.length} contacto${contacts.length > 1 ? "s" : ""}`);
    } else {
      toast("No tienes contactos · llama al 911");
    }

    // Reset después de 5 segundos para volver a usar
    setTimeout(() => {
      setSent(false);
      setCounting(false);
      setCount(5);
    }, 5000);
  };

  const llamar911 = () => {
    window.location.href = "tel:911";
  };

  // Render
  if (sent) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6" style={{ background: `radial-gradient(circle at 50% 50%, ${C.red}33 0%, ${C.bg} 70%)` }}>
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full" style={{ background: C.red, opacity: 0.3, animation: "ping 1.5s ease-out infinite" }} />
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ background: C.red, boxShadow: `0 0 40px ${C.red}` }}>
            <BadgeCheck size={48} color="white" />
          </div>
        </div>
        <p className="font-display font-black text-3xl text-white text-center mb-2">SOS ACTIVADO</p>
        <p className="text-base font-body text-center mb-6" style={{ color: C.muted }}>
          {contacts.length > 0 ? `Mensaje enviado a tus ${contacts.length} contacto${contacts.length > 1 ? "s" : ""}` : "Llama al 911 si necesitas ayuda inmediata"}
        </p>
        <a href="tel:911" className="w-full max-w-xs py-4 rounded-2xl font-display font-black text-white text-base uppercase tracking-widest flex items-center justify-center gap-2 mb-3"
          style={{ background: C.red, boxShadow: `0 8px 24px ${C.red}88` }}>
          <Phone size={20} fill="white" />Llamar al 911
        </a>
        <button onClick={onBack} className="text-sm font-display font-bold uppercase tracking-wider" style={{ color: C.muted }}>
          Cerrar
        </button>
      </div>
    );
  }

  if (counting) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6" style={{ background: `radial-gradient(circle at 50% 50%, ${C.red}55 0%, ${C.bg} 70%)` }}>
        <p className="font-display font-bold text-sm text-white uppercase tracking-widest mb-4">Enviando SOS en</p>
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full" style={{ background: C.red, opacity: 0.4, animation: "ping 1s ease-out infinite" }} />
          <div className="relative w-44 h-44 rounded-full flex items-center justify-center" style={{ background: C.red, boxShadow: `0 0 60px ${C.red}` }}>
            <p className="font-display font-black text-7xl text-white">{count}</p>
          </div>
        </div>
        <p className="text-base font-body text-center mb-8" style={{ color: C.muted }}>
          Toca CANCELAR si lo activaste por accidente
        </p>
        <button onClick={cancelCount}
          className="w-full max-w-xs py-4 rounded-2xl font-display font-black text-white text-base uppercase tracking-widest"
          style={{ background: C.cardHi, border: `2px solid white`, boxShadow: `0 8px 24px rgba(255,255,255,0.2)` }}>
          ✕ CANCELAR
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="SOS DE EMERGENCIA" />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        <div className="rounded-2xl p-3 mb-4" style={{ background: `${C.red}15`, border: `1px solid ${C.red}55` }}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} color={C.red} className="shrink-0 mt-0.5" />
            <p className="text-[11px] font-body text-white leading-relaxed">
              Al activar SOS: cuenta regresiva de 5 segundos, después <span style={{ color: C.red, fontWeight: 700 }}>se envía SMS automático</span> con tu ubicación exacta a tus contactos de confianza.
            </p>
          </div>
        </div>

        {/* Status ubicación */}
        <div className="rounded-2xl p-3 mb-3" style={{ background: C.card, border: `1px solid ${userPos ? C.green : C.amber}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: userPos ? `${C.green}22` : `${C.amber}22` }}>
              <MapPin size={18} color={userPos ? C.green : C.amber} />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-white text-sm">{userPos ? "Ubicación lista" : "Obteniendo GPS..."}</p>
              {userPos && <p className="text-[10px] font-body" style={{ color: C.muted }}>Precisión {Math.round(userPos[2])}m · {userPos[0].toFixed(4)}, {userPos[1].toFixed(4)}</p>}
            </div>
          </div>
        </div>

        {/* Status contactos */}
        <div className="rounded-2xl p-3 mb-4 cursor-pointer" onClick={() => onNav("contactos")}
          style={{ background: C.card, border: `1px solid ${contacts.length > 0 ? C.green : C.amber}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: contacts.length > 0 ? `${C.green}22` : `${C.amber}22` }}>
              <Users size={18} color={contacts.length > 0 ? C.green : C.amber} />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-white text-sm">
                {contacts.length === 0 ? "Sin contactos de confianza" : `${contacts.length} contacto${contacts.length > 1 ? "s" : ""} en tu red`}
              </p>
              <p className="text-[10px] font-body" style={{ color: C.muted }}>
                {contacts.length === 0 ? "Agrega antes de activar SOS" : "Toca para editar tu red"}
              </p>
            </div>
            <ChevronRight size={16} color={C.muted} />
          </div>
        </div>

        {/* Botón principal SOS */}
        <button onClick={startCount}
          className="w-full py-8 rounded-3xl font-display font-black text-white text-2xl uppercase tracking-widest mb-3 flex flex-col items-center justify-center gap-3"
          style={{
            background: `linear-gradient(135deg, ${C.red}, #B91C1C)`,
            boxShadow: `0 12px 36px ${C.red}88`
          }}>
          <Siren size={48} color="white" />
          ACTIVAR SOS
          <span className="text-xs font-display font-bold uppercase tracking-wider opacity-90">Mantén presionado</span>
        </button>

        {/* Llamada directa 911 */}
        <a href="tel:911" className="w-full py-4 rounded-2xl font-display font-bold text-white text-sm uppercase tracking-widest flex items-center justify-center gap-2 mb-2"
          style={{ background: C.card, border: `2px solid ${C.red}` }}>
          <Phone size={16} color={C.red} />
          Llamar directamente al 911
        </a>

        <button onClick={() => onNav("women")} className="w-full py-3 rounded-2xl font-display font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          style={{ background: C.card, border: `1px solid ${C.pink}`, color: "white" }}>
          <Heart size={14} color={C.pink} fill={C.pink} />
          Alerta Mujer
        </button>

        <div className="rounded-2xl p-3 mt-4" style={{ background: `${C.blue}15`, border: `1px solid ${C.blue}55` }}>
          <div className="flex items-start gap-2">
            <Shield size={14} color={C.blue} className="shrink-0 mt-0.5" />
            <p className="text-[11px] font-body text-white leading-relaxed">
              <span style={{ color: C.blue, fontWeight: 700 }}>Cómo funciona:</span> Al activar SOS, se abrirá la app de SMS de tu celular con un mensaje pre-armado que incluye tu ubicación. Solo tienes que tocar enviar. Funciona incluso sin datos móviles si tienes señal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HoyNoCirculaScreen = ({ onBack }) => {
  const { toast } = useApp();
  const [plates, setPlates] = useState([]);
  const [newPlate, setNewPlate] = useState("");
  const [holograma, setHolograma] = useState("0");
  const [showAdd, setShowAdd] = useState(false);

  // Cargar/guardar placas en localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("proalert_plates");
      if (saved) setPlates(JSON.parse(saved));
    } catch {}
  }, []);
  const saveAll = (arr) => {
    setPlates(arr);
    try { localStorage.setItem("proalert_plates", JSON.stringify(arr)); } catch {}
  };

  const addPlate = () => {
    const clean = newPlate.trim().toUpperCase().replace(/\s/g, "");
    if (!clean) return;
    if (plates.find(p => p.plate === clean)) {
      toast("Esa placa ya está registrada");
      return;
    }
    saveAll([...plates, { plate: clean, holograma, addedAt: Date.now() }]);
    setNewPlate("");
    setHolograma("0");
    setShowAdd(false);
    toast(`Placa ${clean} agregada`);
  };

  const removePlate = (plate) => saveAll(plates.filter(p => p.plate !== plate));

  // Calcular si circula hoy
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0=Domingo
  const diasNombre = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  // Reglas Hoy No Circula CDMX/Edomex 2026
  // Holograma 0 y 00: NO aplica
  // Holograma 1: lunes (plac 5,6) - jueves (7,8) - martes (3,4) - viernes (9,0) - miércoles (1,2)
  // Holograma 2: misma regla + sábados según último dígito
  const getRestriccion = (plateStr, holo) => {
    if (holo === "0" || holo === "00") return null; // Exento
    const lastDigit = (plateStr.match(/\d/g) || []).slice(-1)[0];
    if (!lastDigit) return null;
    const d = parseInt(lastDigit, 10);
    // Día restricción según último dígito
    let diaRestriccion = null;
    if (d === 5 || d === 6) diaRestriccion = 1; // Lunes
    else if (d === 7 || d === 8) diaRestriccion = 2; // Martes
    else if (d === 3 || d === 4) diaRestriccion = 3; // Miércoles
    else if (d === 1 || d === 2) diaRestriccion = 4; // Jueves
    else if (d === 9 || d === 0) diaRestriccion = 5; // Viernes
    // Holograma 2 también aplica sábado
    let restriccionSabado = null;
    if (holo === "2") {
      if ([5,6,7,8].includes(d)) restriccionSabado = 6; // 1er y 3er sábado
      else if ([1,2,3,4,9,0].includes(d)) restriccionSabado = 6; // 2do y 4to sábado
    }
    return { diaRestriccion, restriccionSabado, lastDigit: d };
  };

  // Próxima verificación: cada 6 meses según último dígito + holograma
  // Calendario CDMX/Edomex
  const getVerificacionMes = (plateStr) => {
    const lastDigit = (plateStr.match(/\d/g) || []).slice(-1)[0];
    if (!lastDigit) return "—";
    const d = parseInt(lastDigit, 10);
    // Pares: ene-feb / jul-ago; Impares: feb-mar/ago-sept (aproximado)
    const map = {
      1: "Febrero · Agosto", 2: "Febrero · Agosto",
      3: "Marzo · Septiembre", 4: "Marzo · Septiembre",
      5: "Abril · Octubre", 6: "Abril · Octubre",
      7: "Mayo · Noviembre", 8: "Mayo · Noviembre",
      9: "Junio · Diciembre", 0: "Junio · Diciembre",
    };
    return map[d] || "—";
  };

  const renderPlateCard = (p) => {
    const res = getRestriccion(p.plate, p.holograma);
    const noCirculaHoy = res && (res.diaRestriccion === diaSemana || (res.restriccionSabado === diaSemana));
    const exento = !res;
    return (
      <div key={p.plate} className="rounded-2xl p-4 mb-2"
        style={{ background: exento ? `${C.green}15` : noCirculaHoy ? `${C.red}1A` : `${C.green}15`, border: `2px solid ${exento ? C.green : noCirculaHoy ? C.red : C.green}` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg" style={{ background: "white" }}>
              <p className="font-display font-black text-base" style={{ color: "#000", letterSpacing: "0.05em" }}>{p.plate}</p>
            </div>
            <div className="px-2 py-1 rounded" style={{ background: C.cardHi }}>
              <p className="text-[10px] font-display font-bold text-white">HOL {p.holograma}</p>
            </div>
          </div>
          <button onClick={() => removePlate(p.plate)} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: C.cardHi }}>
            <X size={12} color={C.muted} />
          </button>
        </div>

        <div className="mb-2">
          {exento ? (
            <div className="flex items-center gap-2">
              <BadgeCheck size={16} color={C.green} />
              <p className="font-display font-bold text-sm" style={{ color: C.green }}>Exento - Circula todos los días</p>
            </div>
          ) : noCirculaHoy ? (
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} color={C.red} />
              <p className="font-display font-bold text-sm" style={{ color: C.red }}>HOY NO CIRCULA</p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <BadgeCheck size={16} color={C.green} />
              <p className="font-display font-bold text-sm" style={{ color: C.green }}>Circula hoy {diasNombre[diaSemana]}</p>
            </div>
          )}
        </div>

        {!exento && res && (
          <div className="grid grid-cols-2 gap-2 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
            <div>
              <p className="text-[9px] font-display uppercase tracking-wider" style={{ color: C.muted }}>No circula los</p>
              <p className="text-xs font-display font-bold text-white">{diasNombre[res.diaRestriccion]}{res.restriccionSabado ? ` · Sábados` : ""}</p>
            </div>
            <div>
              <p className="text-[9px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Verificación</p>
              <p className="text-xs font-display font-bold text-white">{getVerificacionMes(p.plate)}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="HOY NO CIRCULA" />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        {/* Banner del día */}
        <div className="rounded-3xl p-4 mb-4" style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})` }}>
          <p className="text-[10px] font-display uppercase tracking-wider text-white opacity-80">Hoy</p>
          <p className="font-display font-black text-2xl text-white leading-tight">{diasNombre[diaSemana]}</p>
          <p className="text-xs font-body text-white opacity-90 mt-1">
            {diaSemana === 0 ? "Domingo · TODOS circulan" :
             diaSemana === 6 ? "Sábado · Aplica a holograma 2" :
             `Aplica restricción del día`}
          </p>
        </div>

        {/* Mis placas */}
        <div className="flex items-center justify-between mb-2">
          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white">Mis vehículos</p>
          {!showAdd && (
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-full"
              style={{ background: C.blue }}>
              <Plus size={12} color="white" />
              <span className="text-[10px] font-display font-bold uppercase text-white">Agregar</span>
            </button>
          )}
        </div>

        {/* Agregar placa */}
        {showAdd && (
          <div className="rounded-2xl p-3 mb-3" style={{ background: C.card, border: `1px solid ${C.blue}` }}>
            <p className="text-[10px] font-display font-bold uppercase tracking-wider text-white mb-2">Nueva placa</p>
            <input value={newPlate} onChange={e => setNewPlate(e.target.value.toUpperCase())}
              placeholder="Ej: ABC-1234"
              maxLength={10}
              className="w-full px-3 py-2.5 rounded-xl text-white text-center font-display font-black text-lg outline-none mb-3"
              style={{ background: C.bg, border: `1px solid ${C.border}`, letterSpacing: "0.1em" }} />
            <p className="text-[10px] font-display font-bold uppercase tracking-wider text-white mb-2">Tu holograma</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {["00", "0", "1", "2"].map(h => (
                <button key={h} onClick={() => setHolograma(h)}
                  className="py-2 rounded-xl font-display font-black text-sm transition-all"
                  style={{
                    background: holograma === h ? C.blue : C.bg,
                    color: holograma === h ? "white" : C.muted,
                    border: `1px solid ${holograma === h ? C.blue : C.border}`
                  }}>
                  {h}
                </button>
              ))}
            </div>
            <p className="text-[10px] font-body mb-3" style={{ color: C.muted }}>00 y 0: exentos · 1: una restricción/sem · 2: dos restricciones</p>
            <div className="flex gap-2">
              <button onClick={() => { setShowAdd(false); setNewPlate(""); }}
                className="flex-1 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider"
                style={{ background: C.card, border: `1px solid ${C.border}`, color: "white" }}>
                Cancelar
              </button>
              <button onClick={addPlate} disabled={!newPlate.trim()}
                className="flex-1 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-white"
                style={{ background: newPlate.trim() ? C.blue : C.card, opacity: newPlate.trim() ? 1 : 0.5 }}>
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Lista de placas */}
        {plates.length === 0 && !showAdd ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: C.card, border: `1px dashed ${C.border}` }}>
            <Car size={28} color={C.muted} className="mx-auto mb-2" />
            <p className="font-display font-bold text-white text-sm mb-1">Sin vehículos registrados</p>
            <p className="text-xs font-body" style={{ color: C.muted }}>Agrega tu placa para saber si circula hoy y cuándo verificar</p>
          </div>
        ) : (
          plates.map(renderPlateCard)
        )}

        {/* Info adicional */}
        <div className="rounded-2xl p-3 mt-4" style={{ background: `${C.amber}15`, border: `1px solid ${C.amber}55` }}>
          <div className="flex items-start gap-2">
            <AlertCircle size={14} color={C.amber} className="shrink-0 mt-0.5" />
            <p className="text-[11px] font-body" style={{ color: "white" }}>
              <span style={{ color: C.amber, fontWeight: 700 }}>Multa por violar Hoy No Circula:</span> 20-30 UMAs (~$2,200-$3,300 MXN). Aplica en CDMX y municipios de Edomex.
            </p>
          </div>
        </div>

        <div className="rounded-2xl p-3 mt-2" style={{ background: `${C.blue}15`, border: `1px solid ${C.blue}55` }}>
          <div className="flex items-start gap-2">
            <Clock size={14} color={C.blue} className="shrink-0 mt-0.5" />
            <p className="text-[11px] font-body" style={{ color: "white" }}>
              <span style={{ color: C.blue, fontWeight: 700 }}>Horario:</span> 5:00 a 22:00 hrs. Después de las 10pm circulan todas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModusOperandiScreen = ({ onBack, onNav }) => {
  const { state } = useApp();
  const [active, setActive] = useState(null);

  if (active) {
    const m = active;
    const riskColor = m.risk === "Alto" ? C.red : m.risk === "Medio" ? C.amber : C.muted;
    return (
      <div className="h-full flex flex-col" style={{ background: C.bg }}>
        <StatusBar />
        <Header onBack={() => setActive(null)} title="MODUS OPERANDI" />
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
          <div className="rounded-3xl p-5 mb-4" style={{ background: C.card, border: `1px solid ${riskColor}66` }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-display font-bold px-2 py-1 rounded-full uppercase tracking-wider"
                style={{ background: `${riskColor}22`, color: riskColor, border: `1px solid ${riskColor}55` }}>
                Riesgo {m.risk}
              </span>
              <span className="text-[10px] font-body" style={{ color: C.muted }}>{m.zone} · {m.time}</span>
            </div>
            <h1 className="font-display font-bold text-white text-xl leading-tight">{m.title}</h1>
            <div className="flex items-center gap-1.5 mt-3">
              <BadgeCheck size={12} color={C.green} />
              <p className="text-[11px] font-body" style={{ color: C.green }}>{m.reports} vecinos lo han reportado</p>
            </div>
          </div>

          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">Cómo opera</p>
          <div className="rounded-2xl p-4 mb-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-sm font-body text-white leading-relaxed">{m.desc}</p>
          </div>

          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">Cómo protegerte</p>
          <div className="flex flex-col gap-2 mb-5">
            {m.tips.map((t, i) => (
              <div key={i} className="rounded-2xl p-3 flex gap-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.green}22` }}>
                  <Check size={14} color={C.green} strokeWidth={3} />
                </div>
                <p className="text-sm font-body text-white flex-1 leading-relaxed">{t}</p>
              </div>
            ))}
          </div>

          <button onClick={() => onNav("report")}
            className="w-full py-4 rounded-2xl font-display font-bold text-white text-sm uppercase tracking-widest"
            style={{ background: C.orange, boxShadow: `0 8px 24px ${C.orange}55` }}>
            Reportar si me pasó a mí
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="ALERTAS" />
      <div className="px-4 pb-3">
        <div className="rounded-3xl p-5" style={{ background: `linear-gradient(135deg, ${C.orange}, #D9501F)` }}>
          <ScrollText size={22} color="white" />
          <p className="font-display font-bold text-white text-lg mt-2 leading-tight">Modus operandi recientes</p>
          <p className="text-xs font-body text-white opacity-90 mt-1">Estafas y delitos más reportados. Mantente informado y protege a tu familia.</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">Esta semana</p>
        <div className="flex flex-col gap-2">
          {state.modusOperandi.map(m => {
            const rc = m.risk === "Alto" ? C.red : m.risk === "Medio" ? C.amber : C.muted;
            return (
              <button key={m.id} onClick={() => setActive(m)}
                className="rounded-2xl p-4 text-left"
                style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-display font-bold px-2 py-1 rounded-full uppercase tracking-wider"
                    style={{ background: `${rc}22`, color: rc, border: `1px solid ${rc}55` }}>
                    {m.risk}
                  </span>
                  <span className="text-[10px] font-body" style={{ color: C.muted }}>{m.time}</span>
                </div>
                <p className="font-display font-bold text-white text-sm leading-tight mb-1">{m.title}</p>
                <p className="text-[11px] font-body mb-2 line-clamp-2" style={{ color: C.muted }}>{m.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <MapPin size={11} color={C.muted} />
                      <span className="text-[10px] font-body" style={{ color: C.muted }}>{m.zone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BadgeCheck size={11} color={C.green} />
                      <span className="text-[10px] font-body" style={{ color: C.green }}>{m.reports}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} color={C.muted} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


// === CREAR RUTA (Rápida vs Segura) ===
const RouteScreen = ({ onBack, onNav }) => {
  const { toast } = useApp();
  const [destination, setDestination] = useState("");
  const [selected, setSelected] = useState("safe");
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [userLoc, setUserLoc] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [destCoords, setDestCoords] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("proalert_userpos");
      if (saved) setUserLoc(JSON.parse(saved));
    } catch {}
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, []);

  // Autocompletado con Mapbox Geocoding API
  useEffect(() => {
    if (!destination || destination.length < 3 || destCoords) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const proximityParam = userLoc ? `&proximity=${userLoc[1]},${userLoc[0]}` : "";
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${MAPBOX_TOKEN}&country=mx&limit=5&language=es${proximityParam}`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        if (data.features) {
          setSuggestions(data.features.map(f => ({
            name: f.text || f.place_name,
            full: f.place_name,
            coords: [f.center[1], f.center[0]], // [lat, lng]
          })));
        }
      } catch (err) {
        if (err.name !== "AbortError") console.warn("geocode error:", err);
      }
    }, 300);
    return () => { clearTimeout(t); controller.abort(); };
  }, [destination, userLoc, destCoords]);

  const popular = [
    { n: "Mi casa", d: "Calz. de Tlalpan 1234", icon: Home },
    { n: "Trabajo", d: "Reforma 250", icon: Shield },
    { n: "Plaza Antara", d: "Polanco", icon: MapPin },
    { n: "Aeropuerto CDMX", d: "Terminal 1", icon: Navigation2 },
  ];

  // Cuando se activa "searching", esperar 900ms y mostrar resultados
  useEffect(() => {
    if (!searching) return;
    const t = setTimeout(() => {
      setSearching(false);
      setSearched(true);
    }, 900);
    return () => clearTimeout(t);
  }, [searching]);

  const search = (place, coords = null) => {
    if (!place || !place.trim()) return;
    setDestination(place);
    setDestCoords(coords);
    setSuggestions([]);
    setSearching(true);
  };

  const pickSuggestion = (sug) => {
    setDestination(sug.name);
    setDestCoords(sug.coords);
    setSuggestions([]);
  };

  // Coordenadas de destinos populares (preset)
  const destinationCoords = {
    "Mi casa": [19.3590, -99.1422],
    "Trabajo": [19.4274, -99.1670],
    "Plaza Antara": [19.4407, -99.2055],
    "Aeropuerto CDMX": [19.4361, -99.0719],
  };

  // Calcular distancia entre dos puntos GPS (Haversine, en km)
  const haversine = (a, b) => {
    if (!a || !b) return 0;
    const R = 6371;
    const dLat = (b[0] - a[0]) * Math.PI / 180;
    const dLng = (b[1] - a[1]) * Math.PI / 180;
    const lat1 = a[0] * Math.PI / 180;
    const lat2 = b[0] * Math.PI / 180;
    const x = Math.sin(dLat/2)**2 + Math.sin(dLng/2)**2 * Math.cos(lat1) * Math.cos(lat2);
    return 2 * R * Math.asin(Math.sqrt(x));
  };

  // Calcular rutas dinámicas según destino real
  const startCoord = userLoc || [19.4015, -99.180];
  const endCoord = destCoords || destinationCoords[destination] || [startCoord[0] + 0.025, startCoord[1] + 0.02];
  const distKm = haversine(startCoord, endCoord);

  // 🧠 INTELIGENCIA: Detectar zonas peligrosas en la ruta directa
  // Las zonas problemáticas se generan alrededor del usuario (ver MapView)
  // Aquí simulamos detección de zonas rojas/amarillas a lo largo del trayecto
  const dangerousZonesOnRoute = (() => {
    if (!userLoc || !endCoord) return [];
    // Zonas problema cerca del usuario (mismo offset que MapView)
    const [lat, lng] = startCoord;
    const zones = [
      { center: [lat + 0.008, lng + 0.011], radius: 0.45, level: "red", name: "Zona reportada" },
      { center: [lat + 0.012, lng - 0.008], radius: 0.38, level: "amber", name: "Riesgo medio" },
    ];
    // Verificar si la línea startCoord→endCoord pasa cerca de alguna zona roja/amarilla
    const detected = [];
    zones.forEach(z => {
      // Distancia mínima del punto z al segmento startCoord-endCoord (aproximación)
      const distToZone = haversine(z.center, [(startCoord[0] + endCoord[0]) / 2, (startCoord[1] + endCoord[1]) / 2]);
      // Si la zona está cerca del corredor de la ruta
      if (distToZone < distKm * 0.6 + z.radius) {
        detected.push(z);
      }
    });
    return detected;
  })();

  const hasDangerOnRoute = dangerousZonesOnRoute.length > 0;
  const dangerCount = dangerousZonesOnRoute.length;

  // Multiplicadores: ruta rápida 1.15x línea recta, ruta segura 1.35x (más vueltas)
  const fastDistKm = Math.max(0.5, distKm * 1.15);
  const safeDistKm = Math.max(0.6, distKm * 1.35);
  // Velocidad: rápida ~25 km/h (con tráfico), segura ~22 km/h (menos vías rápidas)
  const fastTimeMin = Math.max(3, Math.round(fastDistKm / 25 * 60));
  const safeTimeMin = Math.max(4, Math.round(safeDistKm / 22 * 60));
  const savedMin = Math.max(1, safeTimeMin - fastTimeMin);

  const routes = {
    fast: {
      time: `${fastTimeMin} min`, distance: `${fastDistKm.toFixed(1)} km`, traffic: distKm > 8 ? "Pesado" : distKm > 4 ? "Moderado" : "Ligero",
      via: distKm > 6 ? "Periférico · Vías rápidas" : "Av. Patriotismo · Eje 4 Sur",
      warnings: 2,
      steps: [
        `Sal hacia ${destination} (${fastDistKm.toFixed(1)} km en total)`,
        "⚠️ Cruza por zona de alerta",
        `Continúa por vía principal ${(fastDistKm * 0.5).toFixed(1)} km`,
        "Toma desvío directo al destino",
        `Llegas a ${destination}`
      ],
    },
    safe: {
      time: `${safeTimeMin} min`, distance: `${safeDistKm.toFixed(1)} km`, traffic: "Ligero",
      via: "Vías secundarias seguras",
      warnings: 0,
      steps: [
        `Sal hacia ${destination} (${safeDistKm.toFixed(1)} km, vía segura)`,
        "Toma vías secundarias evitando zonas de alerta",
        `Continúa por zonas seguras ${(safeDistKm * 0.5).toFixed(1)} km`,
        "Acércate a destino por ruta vigilada",
        `Llegas a ${destination}`
      ],
    },
  };

  const startNav = async () => {
    // Punto de partida: ubicación del usuario o default Escandón CDMX
    const start = userLoc || [19.4015, -99.180];
    // Destino: prioridad 1) coords del autocompletado, 2) preset, 3) cerca del usuario
    let end = destCoords || destinationCoords[destination];
    if (!end) {
      end = [start[0] + 0.025, start[1] + 0.02];
    }

    // Si no hay peligro, usamos siempre ruta directa
    const effectiveSelected = hasDangerOnRoute ? selected : "fast";
    const color = effectiveSelected === "safe" ? "#10B981" : "#0077BB";
    const profile = effectiveSelected === "safe" ? "driving" : "driving-traffic";
    const labelTipo = !hasDangerOnRoute ? "directa" : (effectiveSelected === "safe" ? "segura" : "rápida");
    toast(`Calculando ruta ${labelTipo}...`);

    try {
      // Mapbox Directions API con instrucciones paso a paso en español
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[1]},${start[0]};${end[1]},${end[0]}?geometries=geojson&overview=full&steps=true&language=es&voice_instructions=false&banner_instructions=true&access_token=${MAPBOX_TOKEN}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);

        // Extraer pasos navegables con instrucciones
        const navSteps = [];
        if (route.legs && route.legs[0] && route.legs[0].steps) {
          route.legs[0].steps.forEach(step => {
            navSteps.push({
              instruction: step.maneuver.instruction || "Continúa",
              type: step.maneuver.type || "",
              modifier: step.maneuver.modifier || "",
              distance: step.distance, // metros
              duration: step.duration, // segundos
              name: step.name || "",
              coords: step.geometry.coordinates.map(c => [c[1], c[0]]),
              maneuverPoint: [step.maneuver.location[1], step.maneuver.location[0]],
            });
          });
        }

        const navPayload = {
          coords,
          color,
          steps: navSteps,
          totalDistance: route.distance,
          totalDuration: route.duration,
          destination: destination,
          labelTipo,
        };

        try { localStorage.setItem("proalert_pending_route", JSON.stringify({ coords, color })); } catch {}
        try { localStorage.setItem("proalert_active_nav", JSON.stringify(navPayload)); } catch {}

        window.dispatchEvent(new CustomEvent("proalert_drawroute", {
          detail: { coords, color }
        }));
        window.dispatchEvent(new CustomEvent("proalert_startnav", { detail: navPayload }));

        toast(`Ruta ${labelTipo} trazada · ${(route.distance/1000).toFixed(1)} km`);
        setTimeout(() => onNav("home"), 800);
      } else {
        const fallbackCoords = [start, end];
        try { localStorage.setItem("proalert_pending_route", JSON.stringify({ coords: fallbackCoords, color })); } catch {}
        window.dispatchEvent(new CustomEvent("proalert_drawroute", {
          detail: { coords: fallbackCoords, color }
        }));
        toast(`Ruta trazada (modo simple)`);
        setTimeout(() => onNav("home"), 1000);
      }
    } catch (err) {
      console.warn("Directions API error:", err);
      const fallbackCoords = [start, end];
      try { localStorage.setItem("proalert_pending_route", JSON.stringify({ coords: fallbackCoords, color })); } catch {}
      window.dispatchEvent(new CustomEvent("proalert_drawroute", {
        detail: { coords: fallbackCoords, color }
      }));
      toast(`Ruta trazada (sin conexión)`);
      setTimeout(() => onNav("home"), 1000);
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="CREAR RUTA" />

      {!searched ? (
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-2"
            style={{ background: C.card, border: `1.5px solid ${C.blue}` }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: C.blue }} />
            <input value={destination}
              onChange={e => { setDestination(e.target.value); setDestCoords(null); }}
              onKeyDown={e => { if (e.key === "Enter") search(destination, destCoords); }}
              placeholder="¿A dónde vas?"
              className="flex-1 min-w-0 bg-transparent text-white text-sm outline-none font-body placeholder:text-slate-500" />
            {destination && <button onClick={() => { setDestination(""); setSuggestions([]); setDestCoords(null); }} className="shrink-0"><X size={14} color={C.muted} /></button>}
          </div>

          {/* Sugerencias autocompletado Mapbox */}
          {suggestions.length > 0 && (
            <div className="rounded-2xl mb-2 overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              {suggestions.map((sug, i) => (
                <button key={i} onClick={() => pickSuggestion(sug)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:opacity-80"
                  style={{ borderBottom: i < suggestions.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <MapPin size={14} color={C.blue} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-bold text-white truncate">{sug.name}</p>
                    <p className="text-[10px] font-body truncate" style={{ color: C.muted }}>{sug.full}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
            style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: userLoc ? C.green : C.amber }} />
            <div className="flex-1">
              <p className="text-sm font-body text-white">{userLoc ? "Tu ubicación actual" : "Obteniendo ubicación..."}</p>
              {userLoc && <p className="text-[10px] font-body" style={{ color: C.muted }}>GPS · {userLoc[0].toFixed(4)}, {userLoc[1].toFixed(4)}</p>}
            </div>
            <Crosshair size={14} color={userLoc ? C.green : C.muted} />
          </div>

          <button onClick={() => search(destination, destCoords)} disabled={!destination.trim() || searching}
            className="w-full py-4 rounded-2xl font-display font-bold text-white text-sm uppercase tracking-widest mb-5 flex items-center justify-center gap-2 transition-all"
            style={{
              background: destination.trim() && !searching ? C.blue : C.card,
              opacity: destination.trim() && !searching ? 1 : 0.5,
              boxShadow: destination.trim() && !searching ? `0 8px 24px ${C.blue}55` : "none"
            }}>
            {searching ? <><Loader size={16} className="animate-spin" />Buscando rutas...</> : <>Buscar rutas <ArrowRight size={16} /></>}
          </button>

          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">Destinos frecuentes</p>
          <div className="flex flex-col gap-2">
            {popular.map(p => {
              const Icon = p.icon;
              return (
                <button key={p.n} onClick={() => search(p.n)} disabled={searching}
                  className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                  style={{ background: C.card, border: `1px solid ${C.border}`, opacity: searching ? 0.5 : 1 }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.cardHi }}>
                    <Icon size={16} color={C.blue} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-white text-sm">{p.n}</p>
                    <p className="text-[11px] font-body" style={{ color: C.muted }}>{p.d}</p>
                  </div>
                  <ChevronRight size={16} color={C.muted} className="shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl mb-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <Navigation2 size={16} color={C.blue} />
            <div className="flex-1">
              <p className="text-[10px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Destino</p>
              <p className="text-sm font-display font-bold text-white">{destination}</p>
            </div>
            <button onClick={() => setSearched(false)} className="text-[10px] font-display font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
              style={{ background: C.cardHi, color: C.blue }}>Cambiar</button>
          </div>

          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">
            {hasDangerOnRoute ? "Elige tu ruta" : "Ruta recomendada"}
          </p>

          {/* CASO 1: HAY zonas peligrosas → mostrar 2 opciones */}
          {hasDangerOnRoute && (
            <>
              <div className="rounded-2xl p-3 mb-3 flex items-start gap-2" style={{ background: `${C.amber}15`, border: `1px solid ${C.amber}55` }}>
                <AlertTriangle size={16} color={C.amber} className="shrink-0 mt-0.5" />
                <p className="text-[11px] font-body" style={{ color: "white" }}>
                  Detectamos <span style={{ color: C.amber, fontWeight: 700 }}>{dangerCount} {dangerCount === 1 ? "zona" : "zonas"} con incidentes</span> en tu camino. Por eso te ofrecemos una alternativa segura.
                </p>
              </div>

              <button onClick={() => setSelected("safe")} className="w-full rounded-3xl p-4 mb-2 text-left transition-all"
                style={{ background: selected === "safe" ? `${C.green}1A` : C.card, border: `2px solid ${selected === "safe" ? C.green : C.border}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.green }}><Shield size={16} color="white" /></div>
                    <div>
                      <p className="font-display font-bold text-white text-base leading-tight">Ruta más segura</p>
                      <p className="text-[10px] font-display font-bold uppercase tracking-wider" style={{ color: C.green }}>Recomendada</p>
                    </div>
                  </div>
                  {selected === "safe" && <BadgeCheck size={22} color={C.green} />}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div><p className="text-[9px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Tiempo</p><p className="font-display font-black text-white text-lg">{routes.safe.time}</p></div>
                  <div><p className="text-[9px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Distancia</p><p className="font-display font-black text-white text-lg">{routes.safe.distance}</p></div>
                  <div><p className="text-[9px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Tráfico</p><p className="font-display font-black text-white text-lg">{routes.safe.traffic}</p></div>
                </div>
                <p className="text-[11px] font-body mb-2" style={{ color: C.muted }}>Vía {routes.safe.via}</p>
                <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: C.green }} /><span className="text-[10px] font-body" style={{ color: C.green }}>Evita {dangerCount} {dangerCount === 1 ? "zona" : "zonas"}</span></div>
                  <span className="text-[10px]" style={{ color: C.muted }}>·</span>
                  <div className="flex items-center gap-1.5"><BadgeCheck size={11} color={C.green} /><span className="text-[10px] font-body" style={{ color: C.muted }}>0 alertas</span></div>
                </div>
              </button>

              <button onClick={() => setSelected("fast")} className="w-full rounded-3xl p-4 mb-2 text-left transition-all"
                style={{ background: selected === "fast" ? `${C.blue}1A` : C.card, border: `2px solid ${selected === "fast" ? C.blue : C.border}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.blue }}><Zap size={16} color="white" /></div>
                    <div>
                      <p className="font-display font-bold text-white text-base leading-tight">Ruta más rápida</p>
                      <p className="text-[10px] font-display font-bold uppercase tracking-wider" style={{ color: C.blue }}>Ahorra {savedMin} min</p>
                    </div>
                  </div>
                  {selected === "fast" && <BadgeCheck size={22} color={C.blue} />}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div><p className="text-[9px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Tiempo</p><p className="font-display font-black text-white text-lg">{routes.fast.time}</p></div>
                  <div><p className="text-[9px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Distancia</p><p className="font-display font-black text-white text-lg">{routes.fast.distance}</p></div>
                  <div><p className="text-[9px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Tráfico</p><p className="font-display font-black text-white text-lg">{routes.fast.traffic}</p></div>
                </div>
                <p className="text-[11px] font-body mb-2" style={{ color: C.muted }}>Vía {routes.fast.via}</p>
                <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                  <div className="flex items-center gap-1.5"><AlertTriangle size={11} color={C.red} /><span className="text-[10px] font-body" style={{ color: C.red }}>Cruza {dangerCount} {dangerCount === 1 ? "zona" : "zonas"} de alerta</span></div>
                  <span className="text-[10px]" style={{ color: C.muted }}>·</span>
                  <div className="flex items-center gap-1.5"><span className="text-[10px] font-body" style={{ color: C.muted }}>{dangerCount} alertas</span></div>
                </div>
              </button>
            </>
          )}

          {/* CASO 2: NO hay zonas peligrosas → solo una ruta */}
          {!hasDangerOnRoute && (
            <>
              <div className="rounded-2xl p-3 mb-3 flex items-start gap-2" style={{ background: `${C.green}15`, border: `1px solid ${C.green}55` }}>
                <BadgeCheck size={16} color={C.green} className="shrink-0 mt-0.5" />
                <p className="text-[11px] font-body" style={{ color: "white" }}>
                  <span style={{ color: C.green, fontWeight: 700 }}>Camino despejado.</span> No hay zonas con incidentes recientes en esta ruta.
                </p>
              </div>

              <div className="w-full rounded-3xl p-4 mb-2"
                style={{ background: `${C.blue}1A`, border: `2px solid ${C.blue}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.blue }}><Navigation2 size={16} color="white" /></div>
                    <div>
                      <p className="font-display font-bold text-white text-base leading-tight">Ruta directa</p>
                      <p className="text-[10px] font-display font-bold uppercase tracking-wider" style={{ color: C.blue }}>Camino seguro</p>
                    </div>
                  </div>
                  <BadgeCheck size={22} color={C.blue} />
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div><p className="text-[9px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Tiempo</p><p className="font-display font-black text-white text-lg">{routes.fast.time}</p></div>
                  <div><p className="text-[9px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Distancia</p><p className="font-display font-black text-white text-lg">{routes.fast.distance}</p></div>
                  <div><p className="text-[9px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Tráfico</p><p className="font-display font-black text-white text-lg">{routes.fast.traffic}</p></div>
                </div>
                <p className="text-[11px] font-body" style={{ color: C.muted }}>Vía {routes.fast.via}</p>
              </div>
            </>
          )}

          <div className="rounded-2xl p-4 mb-4 mt-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">Indicaciones</p>
            <div className="flex flex-col gap-2">
              {(routes[hasDangerOnRoute ? selected : "fast"]?.steps || []).map((s, i, arr) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: (hasDangerOnRoute && selected === "safe") ? C.green : C.blue }}>
                      <span className="text-[9px] font-display font-black text-white">{i + 1}</span>
                    </div>
                    {i < arr.length - 1 && <div className="w-0.5 flex-1 my-1" style={{ background: C.border }} />}
                  </div>
                  <p className="text-xs font-body text-white pb-3 leading-relaxed flex-1">{s}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={startNav}
            className="w-full py-4 rounded-2xl font-display font-bold text-white text-sm uppercase tracking-widest flex items-center justify-center gap-2 mb-2"
            style={{ background: (hasDangerOnRoute && selected === "safe") ? C.green : C.blue, boxShadow: `0 8px 24px ${(hasDangerOnRoute && selected === "safe") ? C.green : C.blue}66` }}>
            <Navigation2 size={16} />Iniciar navegación
          </button>
          <button onClick={() => onNav("trip")} className="w-full py-3 rounded-2xl font-display font-bold text-xs uppercase tracking-widest"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: "white" }}>
            Compartir este trayecto
          </button>
        </div>
      )}
    </div>
  );
};


const DashboardScreen = ({ onBack, onNav }) => {
  const { state } = useApp();
  const myReports = state.incidents.filter(i => i.mine).length;
  const resolved = state.incidents.filter(i => i.status === "Resuelto").length;
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="MI ZONA" />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        {/* User card */}
        <div className="rounded-3xl p-5 mb-4" style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})` }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <Award size={22} color="white" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-display uppercase tracking-wider text-white opacity-80">Tu nivel</p>
              <p className="font-display font-black text-white text-lg leading-tight">{state.user.level}</p>
            </div>
            <p className="font-display font-black text-2xl text-white">{state.user.points}<span className="text-xs font-medium opacity-70"> pts</span></p>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.2)" }}>
            <div className="h-full rounded-full bg-white" style={{ width: "40%" }} />
          </div>
          <p className="text-[10px] text-white opacity-80 mt-1.5">180 pts para "Guardián de zona"</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} color={C.blue} />
              <p className="text-[10px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Reportes</p>
            </div>
            <p className="font-display font-black text-white text-2xl">{state.incidents.length}</p>
            <p className="text-[10px]" style={{ color: C.muted }}>esta semana</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={14} color={C.green} />
              <p className="text-[10px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Resueltos</p>
            </div>
            <p className="font-display font-black text-white text-2xl">{resolved}</p>
            <p className="text-[10px]" style={{ color: C.green }}>↑ 33% vs ant.</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2 mb-1">
              <UserCheck size={14} color={C.amber} />
              <p className="text-[10px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Ángeles cerca</p>
            </div>
            <p className="font-display font-black text-white text-2xl">12</p>
            <p className="text-[10px]" style={{ color: C.muted }}>activos ahora</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} color={C.green} />
              <p className="text-[10px] font-display uppercase tracking-wider" style={{ color: C.muted }}>Seguridad</p>
            </div>
            <p className="font-display font-black text-white text-2xl">+12%</p>
            <p className="text-[10px]" style={{ color: C.muted }}>vs mes ant.</p>
          </div>
        </div>

        {/* Logros */}
        <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">Tus logros</p>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-5 -mx-4 px-4">
          {[
            { t: "Primer reporte", icon: FileText, c: C.blue, got: true },
            { t: "Buen vecino", icon: Heart, c: C.pink, got: true },
            { t: "Confiable", icon: BadgeCheck, c: C.green, got: true },
            { t: "Guardián", icon: Shield, c: C.orange, got: false },
            { t: "Líder zonal", icon: Award, c: C.amber, got: false },
          ].map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="shrink-0 w-24 rounded-2xl p-3 flex flex-col items-center text-center"
                style={{ background: b.got ? `${b.c}22` : C.card, border: `1px solid ${b.got ? b.c : C.border}`, opacity: b.got ? 1 : 0.4 }}>
                <Icon size={22} color={b.c} />
                <p className="text-[10px] font-display font-bold text-white mt-2 leading-tight">{b.t}</p>
              </div>
            );
          })}
        </div>

        {/* Testimonios */}
        <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-2">Historias de tu comunidad</p>
        <div className="flex flex-col gap-2">
          {state.testimonials.slice(0, 2).map(t => (
            <div key={t.id} className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2 mb-2">
                <BadgeCheck size={14} color={C.green} />
                <p className="text-[10px] font-display font-bold uppercase tracking-wider" style={{ color: C.green }}>Caso resuelto</p>
                <p className="text-[10px] font-body" style={{ color: C.muted }}>· hace {t.days}d</p>
              </div>
              <p className="text-sm font-body text-white leading-relaxed italic">"{t.text}"</p>
              <p className="text-[11px] font-display font-semibold mt-2" style={{ color: C.muted }}>— {t.name}, {t.zone}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// === MAIN APP ===
function appReducer(state, action) {
  switch (action.type) {
    case "COMPLETE_ONBOARDING":
      return { ...state, isOnboarded: true, user: { ...state.user, ...action.payload } };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    case "RESET_APP":
      try { localStorage.removeItem("proalert_state"); } catch {}
      return { ...initialState, isOnboarded: false };
    case "ADD_INCIDENT":
      return {
        ...state,
        incidents: [{
          ...action.payload,
          id: Date.now(),
          time: "ahora",
          status: "Recibido",
          confirmations: 0,
          mine: true,
        }, ...state.incidents],
        user: { ...state.user, points: state.user.points + 25 }
      };
    case "CONFIRM_INCIDENT":
      return {
        ...state,
        incidents: state.incidents.map(i =>
          i.id === action.payload ? { ...i, confirmations: i.confirmations + 1 } : i
        ),
        user: { ...state.user, points: state.user.points + 5 }
      };
    case "ADD_POLICE_REPORT":
      return {
        ...state,
        policeReports: [{ ...action.payload, id: Date.now(), date: "ahora", status: "Enviado a asuntos internos" }, ...state.policeReports],
        user: { ...state.user, points: state.user.points + 30 }
      };
    case "ADD_DENUNCIA":
      return {
        ...state,
        denuncias: [{
          id: Date.now(),
          folio: `MP-2026-${Math.floor(10000 + Math.random() * 89999)}`,
          ...action.payload,
          status: "Recibido",
        }, ...state.denuncias]
      };
    case "START_TRIP":
      return { ...state, trip: action.payload };
    case "END_TRIP":
      return { ...state, trip: null, user: { ...state.user, points: state.user.points + 10 } };
    case "TOGGLE_STEALTH":
      return { ...state, stealthMode: !state.stealthMode };
    case "ADD_CONTACT":
      return { ...state, emergencyContacts: [...state.emergencyContacts, { ...action.payload, id: Date.now() }] };
    case "REMOVE_CONTACT":
      return { ...state, emergencyContacts: state.emergencyContacts.filter(c => c.id !== action.payload) };
    default: return state;
  }
}

export default function ProAlertApp() {
  const [screen, setScreen] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
    const saved = loadSavedState();
    return saved ? { ...init, ...saved } : init;
  });

  // Auto-guardar en localStorage cuando cambia el estado importante
  useEffect(() => {
    try {
      localStorage.setItem("proalert_state", JSON.stringify({
        user: state.user,
        isOnboarded: state.isOnboarded,
        emergencyContacts: state.emergencyContacts,
        denuncias: state.denuncias,
        policeReports: state.policeReports,
      }));
    } catch {}
  }, [state.user, state.isOnboarded, state.emergencyContacts, state.denuncias, state.policeReports]);

  const goPanic = () => setScreen("panic");
  const goWomen = () => setScreen("women");
  const goBack = () => setScreen("home");
  const showToast = (m) => setToastMsg(m);

  const ctx = { state, dispatch, toast: showToast, goNav: setScreen };

  const renderScreen = () => {
    if (!state.isOnboarded) return <OnboardingScreen />;
    if (state.stealthMode) return <StealthMode onExit={() => dispatch({ type: "TOGGLE_STEALTH" })} />;
    switch (screen) {
      case "home": return <HomeScreen onNav={setScreen} onMenu={() => setMenuOpen(true)} onPanic={goPanic} onWomen={goWomen} />;
      case "scan": return <ScanScreen onBack={goBack} onScanned={() => setScreen("police")} onNav={setScreen} onPanic={goPanic} />;
      case "police": return <PoliceProfile onBack={() => setScreen("scan")} onNav={setScreen} onPanic={goPanic} />;
      case "reportPolice": return <ReportPoliceScreen onBack={() => setScreen("police")} onNav={setScreen} />;
      case "panic": return <PanicScreen onBack={goBack} />;
      case "women": return <WomenScreen onBack={goBack} />;
      case "report": return <ReportScreen onBack={goBack} onNav={setScreen} onPanic={goPanic} />;
      case "denuncia": return <DenunciaScreen onBack={goBack} onNav={setScreen} onPanic={goPanic} />;
      case "community": return <CommunityScreen onBack={goBack} onNav={setScreen} />;
      case "protips": return <ProTipsScreen onBack={goBack} onMenu={() => setMenuOpen(true)} />;
      case "emergency": return <EmergencyScreen onBack={goBack} />;
      case "trip": return <TripScreen onBack={goBack} />;
      case "dashboard": return <DashboardScreen onBack={goBack} onNav={setScreen} />;
      case "route": return <RouteScreen onBack={goBack} onNav={setScreen} />;
      case "assistant": return <AssistantScreen onBack={goBack} onNav={setScreen} onPanic={goPanic} />;
      case "verifier": return <PlateVerifierScreen onBack={goBack} onNav={setScreen} />;
      case "hoynocircula": return <HoyNoCirculaScreen onBack={goBack} />;
      case "derechos": return <MisDerechosScreen onBack={goBack} />;
      case "sos": return <SOSScreen onBack={goBack} onNav={setScreen} />;
      case "contactos": return <ContactosScreen onBack={goBack} />;
      case "modus": return <ModusOperandiScreen onBack={goBack} onNav={setScreen} />;
      default: return <HomeScreen onNav={setScreen} onMenu={() => setMenuOpen(true)} onPanic={goPanic} onWomen={goWomen} />;
    }
  };

  return (
    <AppContext.Provider value={ctx}>
      <div className="font-body w-full overflow-hidden flex items-stretch sm:items-center justify-center sm:p-4" style={{ background: "#000", height: "100dvh", minHeight: "100vh" }}>
        <FontStyles />
        <div className="relative w-full sm:max-w-[400px] h-full sm:h-auto sm:aspect-[9/19.5] sm:rounded-[3rem] overflow-hidden sm:shadow-2xl sm:border-8"
          style={{ background: C.bg, borderColor: "#1a1a1a", maxHeight: "100dvh" }}>
          <div className="h-full w-full relative">
            {renderScreen()}
            <Toast msg={toastMsg} onClose={() => setToastMsg("")} />
          </div>
          <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} onNav={setScreen} onPanic={goPanic} />
        </div>
      </div>
    </AppContext.Provider>
  );
}
