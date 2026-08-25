import React, { useMemo } from 'react';
import { UserSession } from '../types';
import { CityLocation } from '../utils/prayerTimes';
import { PrayerTimeHeaderPill } from './PrayerTimeHeaderPill';
import {
  LogOut,
  ShieldCheck,
  UserCheck,
  Calendar,
  KeyRound,
  Sliders,
  CheckSquare,
  Edit3,
  Database,
  Cloud,
  CloudOff,
  Download,
  Trophy,
  Moon,
  Sparkles,
  BookOpen,
  CalendarCheck,
} from 'lucide-react';

interface HeaderNavbarProps {
  user: UserSession;
  onLogout: () => void;
  activeSessionTitle?: string;
  activeSessionDate?: string;
  activeAdminTab?: 'admin' | 'input' | 'checker' | 'raport' | 'calendar';
  onSelectAdminTab?: (tab: 'admin' | 'input' | 'checker' | 'raport' | 'calendar') => void;
  isSupabaseConnected?: boolean;
  onOpenSupabaseConfig?: () => void;
  onInstallPwa?: () => void;
  isPwaInstalled?: boolean;
  onOpenWisdomModal?: () => void;
  onOpenPrayerModal?: () => void;
  onOpenSurahsModal?: (tab?: 'juz_amma' | 'yasin' | 'tahlil' | 'mahalul_qiyam' | 'dzikir_sholat' | 'doa_harian') => void;
  selectedCity?: CityLocation;
}

interface HeaderStar {
  id: number;
  top: number; // percentage
  left: number; // percentage
  size: number; // px
  color: string;
  duration: number; // seconds
  delay: number; // seconds
  isSparkle?: boolean;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  user,
  onLogout,
  activeSessionTitle,
  activeSessionDate,
  activeAdminTab = 'admin',
  onSelectAdminTab,
  isSupabaseConnected = false,
  onOpenSupabaseConfig,
  onInstallPwa,
  isPwaInstalled = false,
  onOpenWisdomModal,
  onOpenPrayerModal,
  onOpenSurahsModal,
  selectedCity,
}) => {
  const isAdmin = user.role === 'admin';
  const isPenginput = user.role === 'penginput';
  const isPengecek = user.role === 'pengecek';

  // Generate subtle stars for Header background
  const headerStars = useMemo<HeaderStar[]>(() => {
    const list: HeaderStar[] = [];
    const colors = ['#fde047', '#ffffff', '#fef08a', '#6ee7b7', '#f59e0b'];
    for (let i = 0; i < 28; i++) {
      const isSparkle = i % 5 === 0;
      list.push({
        id: i,
        top: Math.random() * 85 + 5,
        left: Math.random() * 96 + 2,
        size: isSparkle ? Math.random() * 5 + 6 : Math.random() * 2.5 + 1.5,
        color: colors[i % colors.length],
        duration: Math.random() * 2 + 1.8,
        delay: Math.random() * 2.5,
        isSparkle,
      });
    }
    return list;
  }, []);

  return (
    <header className="relative bg-gradient-to-r from-[#022319] via-[#033627] to-[#011a12] text-white shadow-xl border-b border-emerald-700/60 sticky top-0 z-40 overflow-hidden">
      {/* Dynamic Keyframes for Header Twinkling Stars & Subtle Shooting Star */}
      <style>{`
        @keyframes headerTwinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.75);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.25);
            filter: drop-shadow(0 0 4px currentColor);
          }
        }
        @keyframes headerShootingStar {
          0% {
            transform: translateX(0) translateY(0) rotate(-25deg);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
          }
          60% {
            opacity: 0.85;
          }
          100% {
            transform: translateX(-350px) translateY(120px) rotate(-25deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Ramadan Starry Night Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Subtle Geometric Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        {/* Ambient Top Glows */}
        <div className="absolute -top-10 left-1/4 w-80 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="absolute -top-10 right-1/4 w-80 h-24 bg-amber-400/10 rounded-full blur-2xl" />

        {/* Subtle Miniature Crescent in Header Sky */}
        <div className="absolute top-1.5 right-6 opacity-30 hidden lg:block">
          <Moon className="w-5 h-5 text-amber-200 fill-amber-300/30 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]" />
        </div>

        {/* Periodic Header Shooting Star */}
        <div className="absolute top-1 right-24 w-20 h-0.5 bg-gradient-to-l from-amber-200 via-yellow-100 to-transparent pointer-events-none [animation:headerShootingStar_5s_ease-out_infinite_2s]" />

        {/* Twinkling Stars */}
        {headerStars.map((star) => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              color: star.color,
              animation: `headerTwinkle ${star.duration}s ease-in-out infinite ${star.delay}s`,
            }}
            className="pointer-events-none flex items-center justify-center"
          >
            {star.isSparkle ? (
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full fill-current drop-shadow-[0_0_4px_currentColor]"
              >
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
            ) : (
              <div
                className="w-full h-full rounded-full shadow-[0_0_3px_currentColor]"
                style={{ backgroundColor: star.color }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Header Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8 py-2">
        {/* Desktop Layout: Single/Double Balanced Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 sm:gap-2.5">
          
          {/* Top Row: Brand on Left, User & Red Logout Button on Right */}
          <div className="flex items-center justify-between gap-2 w-full lg:w-auto">
            {/* Logo & School Title */}
            <div className="flex items-center space-x-2 shrink min-w-0">
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 bg-amber-400/20 rounded-xl blur-xs" />
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-950/90 border border-amber-400/60 p-1 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.25)] shrink-0">
                  <img src="/assets/logo.svg" alt="Logo Puasaku" className="w-full h-full object-contain drop-shadow-sm" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <h1 className="text-sm sm:text-base lg:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-wide font-sans drop-shadow-[0_1px_3px_rgba(251,191,36,0.3)] truncate">
                    PUASAKU
                  </h1>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black bg-emerald-950 text-amber-300 border border-amber-400/40 shadow-xs shrink-0">
                    SRT 1
                  </span>
                </div>
                <p className="hidden sm:block text-[10.5px] text-emerald-300 font-medium -mt-0.5 truncate">
                  Pencatatan & Verifikasi Amalan Puasa
                </p>
              </div>
            </div>

            {/* Always Visible User Profile & Prominent Red Logout Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Supabase Mini Indicator (tablet & desktop) */}
              <button
                type="button"
                onClick={isAdmin && onOpenSupabaseConfig ? onOpenSupabaseConfig : undefined}
                title={
                  isSupabaseConnected
                    ? 'Supabase Cloud Terhubung'
                    : 'Supabase Offline (Lokal)'
                }
                className={`hidden sm:flex p-1.5 rounded-lg border text-xs transition-all ${
                  isSupabaseConnected
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
                    : 'bg-emerald-950/60 text-amber-300 border-amber-500/40'
                }`}
              >
                {isSupabaseConnected ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
              </button>

              {/* User Chip */}
              <div
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl border text-[11px] sm:text-xs font-bold shadow-xs ${
                  isAdmin
                    ? 'bg-purple-950/90 border-purple-500/70 text-purple-200'
                    : isPenginput
                    ? 'bg-amber-950/90 border-amber-500/70 text-amber-200'
                    : 'bg-emerald-950/90 border-emerald-600/70 text-emerald-200'
                }`}
              >
                {isAdmin ? (
                  <KeyRound className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-300 shrink-0" />
                ) : isPenginput ? (
                  <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0" />
                ) : (
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300 shrink-0" />
                )}
                <span className="max-w-[65px] xs:max-w-[85px] sm:max-w-[120px] truncate text-white">{user.name}</span>
              </div>

              {/* UNMISSABLE PROMINENT RED LOGOUT BUTTON ALWAYS VISIBLE */}
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white border border-red-400 text-xs font-bold transition-all cursor-pointer shadow-md hover:shadow-red-600/40 shrink-0"
                title="Keluar dari Akun / Ganti Pengguna"
              >
                <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="font-extrabold tracking-wide">Keluar</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs - Proportional Segmented Control */}
          {onSelectAdminTab && (
            <nav className="w-full lg:w-auto bg-emerald-950/90 p-1 rounded-xl border border-emerald-700/60 shadow-inner backdrop-blur-xs">
              <div className="grid grid-flow-col auto-cols-fr sm:flex sm:flex-wrap items-center gap-1">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onSelectAdminTab('admin')}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      activeAdminTab === 'admin'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-emerald-300 hover:text-white hover:bg-emerald-800/60'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span>Admin</span>
                  </button>
                )}

                {(isAdmin || isPenginput) && (
                  <button
                    type="button"
                    onClick={() => onSelectAdminTab('input')}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      activeAdminTab === 'input'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-emerald-300 hover:text-white hover:bg-emerald-800/60'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5 shrink-0" />
                    <span>Form Input</span>
                  </button>
                )}

                {(isAdmin || isPengecek) && (
                  <button
                    type="button"
                    onClick={() => onSelectAdminTab('checker')}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      activeAdminTab === 'checker'
                        ? 'bg-amber-500 text-emerald-950 shadow-md font-black'
                        : 'text-emerald-300 hover:text-white hover:bg-emerald-800/60'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>Ceklist</span>
                  </button>
                )}

                {/* Raport & Sertifikat Imtaq Tab */}
                <button
                  type="button"
                  onClick={() => onSelectAdminTab('raport')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeAdminTab === 'raport'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md ring-1 ring-amber-300 font-black'
                      : 'text-amber-300 hover:text-amber-200 hover:bg-emerald-800/70'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 shrink-0" />
                  <span>Raport</span>
                </button>

                {/* Kalender Puasa & Hijriah Tab */}
                <button
                  type="button"
                  onClick={() => onSelectAdminTab('calendar')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeAdminTab === 'calendar'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md ring-1 ring-teal-300 font-black'
                      : 'text-teal-300 hover:text-white hover:bg-emerald-800/70'
                  }`}
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                  <span>Kalender</span>
                </button>
              </div>
            </nav>
          )}

          {/* Quick Islamic Tools & Desktop Actions Bar */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* Live Prayer Times Pill */}
            {onOpenPrayerModal && (
              <PrayerTimeHeaderPill onOpenModal={onOpenPrayerModal} city={selectedCity} />
            )}

            {/* Hikmah Puasa Button */}
            {onOpenWisdomModal && (
              <button
                type="button"
                onClick={onOpenWisdomModal}
                title="Buka Kata Mutiara & Hikmah Puasa"
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold bg-amber-400/15 hover:bg-amber-400/30 text-amber-200 hover:text-white border border-amber-400/40 shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Moon className="w-3 h-3 text-amber-300 fill-amber-300/40 shrink-0" />
                <span>Hikmah</span>
                <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
              </button>
            )}

            {/* Dzikir & Doa Button */}
            {onOpenSurahsModal && (
              <button
                type="button"
                onClick={() => onOpenSurahsModal('juz_amma')}
                title="Buka Juz 'Amma, Surat Yasin, Tahlil, Mahalul Qiyam, Dzikir Sholat & Doa Harian"
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold bg-teal-500/15 hover:bg-teal-500/30 text-emerald-200 hover:text-white border border-emerald-400/40 shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-3 h-3 text-amber-300 shrink-0" />
                <span>Dzikir & Doa</span>
              </button>
            )}

            {/* PWA Install Button */}
            {!isPwaInstalled && onInstallPwa && (
              <button
                type="button"
                onClick={onInstallPwa}
                title="Pasang aplikasi PUASAKU"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-emerald-950 shadow-sm border border-amber-300 cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pasang PWA</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};



