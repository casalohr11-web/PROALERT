import { useState, useEffect, useRef, useReducer, createContext, useContext } from "react";
import {
  Menu, Search, Layers, Crosshair, AlertTriangle, Camera, ChevronLeft,
  Star, Phone, FileText, Shield, MapPin, X, ChevronRight, ScanLine,
  Siren, Users, BookOpen, PhoneCall, Image as ImageIcon, Video,
  Send, Sparkles, Heart, Zap, BadgeCheck, Navigation2, ArrowRight,
  Flame, Truck, HeartPulse, Megaphone, Lock, ShieldAlert, Mic,
  MessageCircle, ThumbsUp, Eye, DollarSign, UserX, HelpCircle,
  ShieldOff, Check, Ban, AlertCircle, EyeOff, Plus, Trash2, Edit3,
  Clock, CheckCircle2, Circle, EyeIcon, Footprints, Calculator,
  Award, TrendingUp, UserCheck, Bell, Home, Smile, ThumbsDown
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

const initialState = {
  user: { name: "Tú", zone: "Escandón", level: "Guardián novato", points: 120 },
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
  trip: null, // { destination, eta, sharedWith, startedAt }
  stealthMode: false,
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

// === DETAILED MAP OF CDMX (Escandón / Tacubaya / Nápoles / San Pedro de los Pinos) ===
const MapView = () => (
  <div className="absolute inset-0 overflow-hidden" style={{ background: "#1E2C4A", zIndex: 0 }}>
    {/* Base SVG map */}
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ display: "block", position: "absolute", inset: 0 }}
    >
      <defs>
        <radialGradient id="redZ" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#EF4444" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="amberZ" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="greenZ" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base */}
      <rect width="400" height="900" fill="#1E2C4A" />

      {/* "City blocks" subtle pattern */}
      <g opacity="0.5">
        <rect x="0" y="0" width="100" height="120" fill="#243558" />
        <rect x="115" y="0" width="155" height="160" fill="#243558" />
        <rect x="290" y="0" width="120" height="170" fill="#243558" />
        <rect x="0" y="195" width="105" height="180" fill="#243558" />
        <rect x="120" y="200" width="150" height="170" fill="#243558" />
        <rect x="290" y="195" width="120" height="180" fill="#243558" />
        <rect x="0" y="395" width="105" height="220" fill="#243558" />
        <rect x="120" y="385" width="155" height="80" fill="#243558" />
        <rect x="120" y="480" width="160" height="125" fill="#243558" />
        <rect x="295" y="395" width="115" height="220" fill="#243558" />
        <rect x="0" y="655" width="105" height="130" fill="#243558" />
        <rect x="120" y="660" width="155" height="120" fill="#243558" />
        <rect x="295" y="660" width="115" height="120" fill="#243558" />
      </g>

      {/* Parks (green) */}
      <path d="M 25 100 Q 60 88 100 118 Q 118 152 92 180 Q 55 192 30 168 Q 15 138 25 100 Z" fill="#1F4D38" />
      <path d="M 280 715 L 365 700 L 375 770 L 290 780 Z" fill="#1F4D38" />

      {/* Highway diagonal - Río Becerra */}
      <path d="M -20 510 L 200 460 L 420 420" stroke="#5B6F94" strokeWidth="14" fill="none" />
      <path d="M -20 510 L 200 460 L 420 420" stroke="#475A82" strokeWidth="11" fill="none" />
      <path d="M -20 510 L 200 460 L 420 420" stroke="#F4D03F" strokeWidth="1" fill="none" strokeDasharray="6 6" opacity="0.6" />

      {/* Major vertical avenues */}
      <path d="M 92 0 L 108 900" stroke="#5B6F94" strokeWidth="8" />
      <path d="M 92 0 L 108 900" stroke="#3D5078" strokeWidth="5" />
      <path d="M 268 0 L 290 900" stroke="#5B6F94" strokeWidth="8" />
      <path d="M 268 0 L 290 900" stroke="#3D5078" strokeWidth="5" />

      {/* Major horizontal avenues */}
      <path d="M 0 300 L 400 280" stroke="#5B6F94" strokeWidth="5" />
      <path d="M 0 300 L 400 280" stroke="#3D5078" strokeWidth="3" />
      <path d="M 0 630 L 400 645" stroke="#5B6F94" strokeWidth="5" />
      <path d="M 0 630 L 400 645" stroke="#3D5078" strokeWidth="3" />
      <path d="M 0 800 L 400 815" stroke="#5B6F94" strokeWidth="4" />

      {/* Secondary streets - lighter, more visible */}
      {[60, 140, 175, 210, 235, 350, 385, 410, 545, 565, 595, 685, 720, 755, 825, 860].map((y, i) => (
        <path key={`h-${i}`} d={`M 0 ${y} L 400 ${y - 4}`} stroke="#3D5078" strokeWidth="1.8" />
      ))}
      {[30, 55, 75, 140, 175, 200, 220, 245, 305, 330, 355, 380].map((x, i) => (
        <path key={`v-${i}`} d={`M ${x} 0 L ${x + 6} 900`} stroke="#3D5078" strokeWidth="1.8" />
      ))}

      {/* Zone circles */}
      <ellipse cx="265" cy="295" rx="135" ry="125" fill="url(#redZ)" />
      <ellipse cx="305" cy="500" rx="85" ry="75" fill="url(#amberZ)" />
      <ellipse cx="125" cy="710" rx="165" ry="155" fill="url(#greenZ)" />

      {/* Neighborhood labels - LARGER and BRIGHTER */}
      <text x="55" y="158" fill="#E2E8F0" fontSize="13" fontWeight="800" fontFamily="Saira" letterSpacing="0.5">SAN MIGUEL</text>
      <text x="35" y="174" fill="#E2E8F0" fontSize="13" fontWeight="800" fontFamily="Saira" letterSpacing="0.5">CHAPULTEPEC</text>
      <text x="58" y="188" fill="#CBD5E1" fontSize="10" fontWeight="700" fontFamily="Saira">I SECC</text>

      <text x="215" y="325" fill="#F1F5F9" fontSize="16" fontWeight="800" fontFamily="Saira" letterSpacing="1">ESCANDÓN</text>
      <text x="245" y="345" fill="#CBD5E1" fontSize="12" fontWeight="700" fontFamily="Saira">I SECC</text>

      <text x="30" y="445" fill="#E2E8F0" fontSize="14" fontWeight="800" fontFamily="Saira" letterSpacing="0.5">TACUBAYA</text>

      <text x="295" y="570" fill="#E2E8F0" fontSize="13" fontWeight="800" fontFamily="Saira" letterSpacing="0.5">NÁPOLES</text>
      <text x="285" y="745" fill="#E2E8F0" fontSize="13" fontWeight="800" fontFamily="Saira" letterSpacing="0.5">NÁPOLES</text>

      <text x="55" y="785" fill="#E2E8F0" fontSize="13" fontWeight="800" fontFamily="Saira" letterSpacing="0.5">SAN PEDRO</text>
      <text x="25" y="800" fill="#E2E8F0" fontSize="13" fontWeight="800" fontFamily="Saira" letterSpacing="0.5">DE LOS PINOS</text>

      {/* Landmark labels */}
      <text x="38" y="135" fill="#94A3B8" fontSize="8" fontFamily="DM Sans">Parque Lira</text>
      <text x="195" y="225" fill="#FB923C" fontSize="8" fontFamily="DM Sans" fontWeight="600">Casa Luis Barragán</text>
      <text x="247" y="232" fill="#FB923C" fontSize="8" fontFamily="DM Sans" fontWeight="600">Primos</text>
      <text x="200" y="270" fill="#FB923C" fontSize="8" fontFamily="DM Sans" fontWeight="600">Cardinal Casa de Café</text>
      <text x="172" y="555" fill="#94A3B8" fontSize="8" fontFamily="DM Sans">Metrópoli Patriotismo</text>
      <text x="218" y="455" fill="#94A3B8" fontSize="8" fontFamily="DM Sans">8 DE AGOSTO</text>
      <text x="195" y="640" fill="#94A3B8" fontSize="8" fontFamily="DM Sans" transform="rotate(75 195 640)">Río Becerra</text>
      <text x="350" y="660" fill="#94A3B8" fontSize="8" fontFamily="DM Sans" transform="rotate(75 350 660)">Nebraska</text>
      <text x="335" y="850" fill="#94A3B8" fontSize="8" fontWeight="700" fontFamily="DM Sans">INSURGENTES</text>

      {/* POI markers */}
      <g transform="translate(228, 218)">
        <circle r="7" fill="#FB923C" stroke="#1E2C4A" strokeWidth="1.5" />
        <rect x="-1.5" y="-3" width="0.8" height="6" fill="white" /><rect x="-0.3" y="-3" width="0.8" height="6" fill="white" /><rect x="0.9" y="-3" width="0.8" height="6" fill="white" />
      </g>
      <g transform="translate(305, 220)">
        <circle r="7" fill="#FB923C" stroke="#1E2C4A" strokeWidth="1.5" />
        <circle r="2.2" fill="white" />
      </g>
      <g transform="translate(195, 263)">
        <circle r="7" fill="#FB923C" stroke="#1E2C4A" strokeWidth="1.5" />
        <rect x="-1.8" y="-2.2" width="3.6" height="4" fill="white" rx="0.5" />
      </g>
      <g transform="translate(145, 548)">
        <circle r="7" fill="#A855F7" stroke="#1E2C4A" strokeWidth="1.5" />
        <rect x="-1.8" y="-2.8" width="3.6" height="5.6" fill="white" />
      </g>
      <g transform="translate(167, 650)">
        <circle r="7" fill="#22C55E" stroke="#1E2C4A" strokeWidth="1.5" />
        <rect x="-1.6" y="-2.6" width="3.2" height="5.2" fill="white" rx="0.5" />
      </g>
      <g transform="translate(353, 778)">
        <circle r="8" fill="#94A3B8" stroke="#1E2C4A" strokeWidth="1.5" />
        <text textAnchor="middle" dy="3" fontSize="9" fontWeight="800" fill="white" fontFamily="Saira">P</text>
      </g>

      {/* Highway shields */}
      <g transform="translate(252, 362)">
        <rect width="18" height="18" rx="2.5" fill="#0077BB" stroke="white" strokeWidth="0.5" />
        <text x="9" y="14" textAnchor="middle" fontSize="12" fontWeight="800" fill="white" fontFamily="Saira">4</text>
      </g>
      <g transform="translate(342, 352)">
        <rect width="18" height="18" rx="2.5" fill="#0077BB" stroke="white" strokeWidth="0.5" />
        <text x="9" y="14" textAnchor="middle" fontSize="12" fontWeight="800" fill="white" fontFamily="Saira">3</text>
      </g>
      <g transform="translate(268, 425)">
        <rect width="22" height="18" rx="2.5" fill="#0077BB" stroke="white" strokeWidth="0.5" />
        <text x="11" y="14" textAnchor="middle" fontSize="11" fontWeight="800" fill="white" fontFamily="Saira">4A</text>
      </g>
      <g transform="translate(333, 778)">
        <rect width="18" height="18" rx="2.5" fill="#0077BB" stroke="white" strokeWidth="0.5" />
        <text x="9" y="14" textAnchor="middle" fontSize="12" fontWeight="800" fill="white" fontFamily="Saira">5</text>
      </g>

      {/* Incident markers - bigger and more visible */}
      <g>
        <circle cx="270" cy="270" r="15" fill="#EF4444" stroke="white" strokeWidth="3" />
        <text x="270" y="275" textAnchor="middle" fontSize="12" fontWeight="900" fill="white" fontFamily="Saira">4</text>
      </g>
      <g>
        <circle cx="235" cy="358" r="13" fill="#EF4444" stroke="white" strokeWidth="3" />
        <text x="235" y="363" textAnchor="middle" fontSize="11" fontWeight="900" fill="white" fontFamily="Saira">2</text>
      </g>
      <g>
        <circle cx="305" cy="505" r="13" fill="#FBBF24" stroke="white" strokeWidth="3" />
        <text x="305" y="510" textAnchor="middle" fontSize="11" fontWeight="900" fill="white" fontFamily="Saira">3</text>
      </g>

      {/* User location with pulse */}
      <g>
        <circle cx="195" cy="520" r="22" fill="#0077BB" opacity="0.3">
          <animate attributeName="r" values="14;28;14" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="195" cy="520" r="14" fill="#0077BB" opacity="0.45" />
        <circle cx="195" cy="520" r="11" fill="#0077BB" stroke="white" strokeWidth="3.5" />
      </g>
    </svg>
  </div>
);

// === HOME SCREEN ===
const HomeScreen = ({ onNav, onMenu, onPanic, onWomen }) => (
  <div className="relative h-full overflow-hidden" style={{ background: C.bg }}>
    <MapView />

    <div className="relative z-10 h-full flex flex-col">
      <StatusBar />

      {/* Brand row */}
      <div className="flex items-center justify-between px-4 pt-2 pb-3"
        style={{ background: `linear-gradient(180deg, ${C.bg}F0 0%, ${C.bg}CC 70%, transparent 100%)` }}>
        <Logo size={18} tagline />
        <LogoBadge size={38} />
      </div>

      {/* Search row */}
      <div className="flex items-center gap-2 px-4 pb-3"
        style={{ background: `linear-gradient(180deg, ${C.bg}CC 0%, transparent 100%)` }}>
        <button onClick={onMenu} className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <Menu size={20} color="white" />
        </button>
        <div className="flex-1 flex items-center gap-2 px-4 h-11 rounded-2xl backdrop-blur-md"
          style={{ background: `${C.surface}E6`, border: `1px solid ${C.border}` }}>
          <Search size={16} color={C.muted} />
          <input
            placeholder="¿A dónde vas?"
            className="bg-transparent flex-1 text-white text-sm outline-none font-body placeholder:text-slate-500 min-w-0"
            readOnly
          />
          <button className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: C.pink }}>
            <Mic size={14} color="white" />
          </button>
        </div>
        <button onClick={() => onNav("scan")} className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <Camera size={18} color="white" />
        </button>
      </div>

      {/* Map controls overlay */}
      <div className="flex-1 relative">
        {/* Legend */}
        <div className="absolute top-3 left-4 rounded-2xl px-3 py-2 backdrop-blur-md"
          style={{ background: `${C.surface}CC`, border: `1px solid ${C.border}` }}>
          <p className="font-display font-bold text-[9px] text-white uppercase tracking-widest mb-1.5">Zonas</p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: C.red }} /><span className="text-[10px] text-white font-body">Muchas incidencias</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: C.amber }} /><span className="text-[10px] text-white font-body">Riesgo medio</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: C.green }} /><span className="text-[10px] text-white font-body">Zona segura</span></div>
          </div>
        </div>

        {/* Layers button */}
        <button className="absolute top-3 right-4 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md"
          style={{ background: `${C.surface}CC`, border: `1px solid ${C.border}` }}>
          <Layers size={18} color="white" />
        </button>

        {/* Locate button */}
        <button className="absolute bottom-32 right-4 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
          style={{ background: `${C.surface}E6`, border: `1px solid ${C.border}` }}>
          <Crosshair size={20} color="white" />
        </button>

        {/* Floating women button */}
        <button onClick={onWomen}
          className="absolute bottom-32 left-4 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl"
          style={{ background: C.pink, boxShadow: `0 6px 20px ${C.pink}88`, position: "absolute" }}>
          <div className="absolute inset-0 rounded-full pulse-ring" style={{ background: C.pink, opacity: 0.4 }} />
          <Heart size={20} color="white" fill="white" />
        </button>
      </div>

      <BottomNav active="home" onNav={onNav} />
    </div>
  </div>
);

// === QR SCAN ===
const ScanScreen = ({ onBack, onScanned, onNav, onPanic }) => (
  <div className="relative h-full flex flex-col" style={{ background: C.bg }}>
    <StatusBar />
    <Header onBack={onBack} title="IDENTIFICAR" />
    <div className="px-6 mb-4">
      <p className="text-white text-sm font-body text-center leading-relaxed">
        Escanea el código <span style={{ color: C.orange }} className="font-bold">QR</span> del policía o
        <br />dirígete a su rostro para reconocerlo
      </p>
    </div>
    <div className="flex-1 px-6 flex items-center justify-center">
      <div className="relative w-full aspect-square rounded-3xl overflow-hidden" style={{ background: "#000", border: `2px solid ${C.border}` }}>
        {/* Camera preview placeholder */}
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, ${C.cardHi} 0%, #000 70%)` }}>
          <div className="w-full h-full opacity-30" style={{ backgroundImage: `radial-gradient(circle at 30% 40%, ${C.blue}, transparent 50%)` }} />
        </div>
        {/* Corners */}
        {[
          "top-4 left-4 border-t-4 border-l-4 rounded-tl-2xl",
          "top-4 right-4 border-t-4 border-r-4 rounded-tr-2xl",
          "bottom-4 left-4 border-b-4 border-l-4 rounded-bl-2xl",
          "bottom-4 right-4 border-b-4 border-r-4 rounded-br-2xl",
        ].map((c, i) => <div key={i} className={`absolute w-12 h-12 ${c}`} style={{ borderColor: C.orange }} />)}
        {/* Scanline */}
        <div className="absolute inset-x-8 top-0 bottom-0 overflow-hidden">
          <div className="scanline absolute inset-x-0 h-32" />
        </div>
        {/* Face outline */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="w-32 h-40 rounded-full border-2 border-dashed" style={{ borderColor: C.blue }} />
        </div>
      </div>
    </div>
    <div className="px-6 py-6 flex flex-col gap-3">
      <button
        onClick={onScanned}
        className="w-full py-4 rounded-2xl font-display font-bold text-white text-base flex items-center justify-center gap-2 uppercase tracking-wider"
        style={{ background: C.blue, boxShadow: `0 8px 24px ${C.blue}66` }}
      >
        <Camera size={20} />
        Escanear ahora
      </button>
      <div className="flex gap-2">
        <button className="flex-1 py-3 rounded-2xl font-display font-semibold text-white text-xs uppercase tracking-wider" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          QR
        </button>
        <button className="flex-1 py-3 rounded-2xl font-display font-semibold text-white text-xs uppercase tracking-wider" style={{ background: C.cardHi, border: `1px solid ${C.blue}` }}>
          Reconocimiento facial
        </button>
      </div>
    </div>
    <BottomNav active="scan" onNav={onNav} />
  </div>
);

// === POLICE PROFILE ===
const PoliceProfile = ({ onBack, onNav, onPanic }) => {
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
          <button className="w-full py-3 rounded-2xl font-display font-semibold text-white text-xs uppercase tracking-wider"
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

        <p className="font-display font-bold text-[10px] uppercase tracking-widest text-white mb-3">Evidencia (opcional)</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button className="aspect-video rounded-2xl flex items-center justify-center gap-2" style={{ background: C.card, border: `1px dashed ${C.border}` }}>
            <ImageIcon size={18} color="white" />
            <span className="text-xs font-display font-semibold text-white">Foto</span>
          </button>
          <button className="aspect-video rounded-2xl flex items-center justify-center gap-2" style={{ background: C.card, border: `1px dashed ${C.border}` }}>
            <Video size={18} color="white" />
            <span className="text-xs font-display font-semibold text-white">Video</span>
          </button>
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
  const { state } = useApp();
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
            <button key={mp.n} className="rounded-2xl p-4 flex items-center justify-between" style={{ background: C.card, border: `1px solid ${C.border}` }}>
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

// === PROTIPS ===
const ProTipsScreen = ({ onBack, onMenu }) => {
  const tips = [
    { t: "¿Quién me puede detener?", c: "Conoce tus derechos", icon: Shield, color: C.blue },
    { t: "¿Qué hacer en caso de asalto?", c: "Pasos a seguir", icon: ShieldAlert, color: C.red },
    { t: "¿Me poncharon una llanta?", c: "Posibles fraudes", icon: AlertTriangle, color: C.amber },
    { t: "Cómo evitar fraudes", c: "Modus operandi comunes", icon: Lock, color: C.orange },
    { t: "Cómo hacer tu denuncia", c: "Guía completa", icon: FileText, color: C.green },
    { t: "Manejo defensivo", c: "Conduce con seguridad", icon: Zap, color: C.pink },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="PRO TIPS" />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        <p className="text-xs font-body mb-4" style={{ color: C.muted }}>Información clave para mantenerte seguro</p>
        <div className="flex flex-col gap-2">
          {tips.map((t, i) => {
            const Icon = t.icon;
            return (
              <button key={i} className="rounded-2xl p-4 flex items-center gap-4 text-left" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${t.color}22`, border: `1px solid ${t.color}44` }}>
                  <Icon size={20} color={t.color} />
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-white text-sm">{t.t}</p>
                  <p className="text-[11px] font-body mt-0.5" style={{ color: C.muted }}>{t.c}</p>
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
  const nums = [
    { n: "911", t: "Emergencias", icon: Siren, color: C.red, urgent: true },
    { n: "089", t: "Denuncia anónima", icon: Megaphone, color: C.orange },
    { n: "074", t: "CAPUFE", icon: Truck, color: C.blue },
    { n: "078", t: "Ángeles Verdes", icon: HeartPulse, color: C.green },
    { n: "5658 1112", t: "LOCATEL", icon: Phone, color: C.blue },
    { n: "5395 1111", t: "Cruz Roja", icon: HeartPulse, color: C.red },
    { n: "5683 2222", t: "Protección Civil", icon: Shield, color: C.amber },
    { n: "5684 2124", t: "Policía Federal Caminos", icon: Shield, color: C.blue },
    { n: "5768 3799", t: "Bomberos", icon: Flame, color: C.orange },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <StatusBar />
      <Header onBack={onBack} title="EMERGENCIA" />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        <p className="text-xs font-body mb-4" style={{ color: C.muted }}>Toca para llamar directamente</p>
        <div className="flex flex-col gap-2">
          {nums.map((n, i) => {
            const Icon = n.icon;
            return (
              <button key={i} className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: n.urgent ? `${C.red}1A` : C.card, border: `1px solid ${n.urgent ? C.red : C.border}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${n.color}22` }}>
                  <Icon size={20} color={n.color} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-display font-bold text-white text-sm">{n.t}</p>
                  <p className="font-display font-black text-lg" style={{ color: n.urgent ? C.red : "white" }}>{n.n}</p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.green }}>
                  <Phone size={16} color="white" fill="white" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// === WOMEN EMERGENCY ===
const WomenScreen = ({ onBack }) => (
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
      <button className="w-full py-4 rounded-2xl font-display font-black text-white text-base uppercase tracking-widest"
        style={{ background: C.pink, boxShadow: `0 8px 30px ${C.pink}88` }}>
        Activar alerta
      </button>
    </div>
  </div>
);

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
            <button className="aspect-video rounded-2xl flex items-center justify-center gap-2" style={{ background: C.card, border: `1px dashed ${C.border}` }}>
              <ImageIcon size={18} color="white" />
              <span className="text-xs font-display font-semibold text-white">Foto</span>
            </button>
            <button className="aspect-video rounded-2xl flex items-center justify-center gap-2" style={{ background: C.card, border: `1px dashed ${C.border}` }}>
              <Video size={18} color="white" />
              <span className="text-xs font-display font-semibold text-white">Video</span>
            </button>
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
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
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
    { id: "trip", t: "Compartir Trayecto", icon: Footprints, highlight: !!state.trip },
    { id: "dashboard", t: "Mi Zona", icon: TrendingUp },
    { id: "scan", t: "Identificar Policía", icon: ScanLine },
    { id: "report", t: "Reportar Incidente", icon: FileText },
    { id: "community", t: "Mi Comunidad", icon: Users },
    { id: "denuncia", t: "Mis Denuncias", icon: Shield },
    { id: "protips", t: "Pro Tips", icon: BookOpen },
    { id: "emergency", t: "Números de Emergencia", icon: PhoneCall },
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
        <button onClick={() => { onPanic(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-2"
          style={{ background: C.red, boxShadow: `0 6px 18px ${C.red}55` }}>
          <Siren size={18} color="white" />
          <span className="text-sm font-display font-bold text-white uppercase tracking-wider">Botón de Pánico</span>
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/5">
                <Icon size={18} color={C.blue} />
                <span className="text-sm font-body text-white flex-1">{it.t}</span>
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

// === DASHBOARD (TU ZONA EN NÚMEROS) ===
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
  const [state, dispatch] = useReducer(appReducer, initialState);

  const goPanic = () => setScreen("panic");
  const goWomen = () => setScreen("women");
  const goBack = () => setScreen("home");
  const showToast = (m) => setToastMsg(m);

  const ctx = { state, dispatch, toast: showToast, goNav: setScreen };

  const renderScreen = () => {
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
