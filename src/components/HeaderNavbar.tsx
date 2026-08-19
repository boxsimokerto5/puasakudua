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
} from 'lucide-react';

interface HeaderNavbarProps {
  user: UserSession;
  onLogout: () => void;
  activeSessionTitle?: string;
  activeSessionDate?: string;
  activeAdminTab?: 'admin' | 'input' | 'checker' | 'raport';
  onSelectAdminTab?: (tab: 'admin' | 'input' | 'checker' | 'raport') => void;
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & School Title */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-amber-400/20 rounded-xl blur-xs" />
              <div className="relative w-10 h-10 rounded-xl bg-emerald-950/90 border border-amber-400/60 p-1 flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.25)] shrink-0">
                <img src="/assets/logo.svg" alt="Logo Puasaku" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-wide font-sans drop-shadow-[0_1px_4px_rgba(251,191,36,0.3)]">
                  PUASAKU
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black bg-emerald-950/90 text-amber-300 border border-amber-400/40 shadow-xs">
                  SRT 1 KEDIRI
                </span>
              </div>
              <p className="text-[11px] text-emerald-300 font-medium">
                Pencatatan & Verifikasi Amalan Puasa Siswa
              </p>
            </div>
          </div>

          {/* Navigation Tabs for All Roles */}
          {onSelectAdminTab && (
            <div className="flex items-center bg-emerald-950/90 p-1 rounded-xl border border-emerald-700/70 shadow-inner backdrop-blur-xs flex-wrap gap-1">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onSelectAdminTab('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeAdminTab === 'admin'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-emerald-300 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Panel Admin</span>
                </button>
              )}

              {(isAdmin || isPenginput) && (
                <button
                  type="button"
                  onClick={() => onSelectAdminTab('input')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeAdminTab === 'input'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-emerald-300 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Form Input</span>
                </button>
              )}

              {(isAdmin || isPengecek) && (
                <button
                  type="button"
                  onClick={() => onSelectAdminTab('checker')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeAdminTab === 'checker'
                      ? 'bg-amber-500 text-emerald-950 shadow'
                      : 'text-emerald-300 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Ceklist Puasa</span>
                </button>
              )}

              {/* Raport & Sertifikat Imtaq Tab (Accessible to Everyone) */}
              <button
                type="button"
                onClick={() => onSelectAdminTab('raport')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeAdminTab === 'raport'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md ring-2 ring-amber-300/60 font-black'
                    : 'text-amber-300 hover:text-amber-200 hover:bg-emerald-800/80'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                <span>Raport & Piagam</span>
              </button>
            </div>
          )}

          {/* Active Session Badge, Cloud DB Status & Role Info */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-wrap">
            {/* Live Prayer Times Pill */}
            {onOpenPrayerModal && (
              <PrayerTimeHeaderPill onOpenModal={onOpenPrayerModal} city={selectedCity} />
            )}

            {/* Hikmah Puasa Button */}
            {onOpenWisdomModal && (
              <button
                type="button"
                onClick={onOpenWisdomModal}
                title="Buka Kata Mutiara & Hikmah Puasa (Berganti tiap 1 jam)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-amber-400/20 via-yellow-300/25 to-amber-400/20 hover:from-amber-400/40 hover:to-yellow-300/40 text-amber-200 hover:text-white border border-amber-400/50 shadow-xs transition-all cursor-pointer backdrop-blur-xs"
              >
                <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/40" />
                <span className="hidden sm:inline">Hikmah Puasa</span>
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              </button>
            )}

            {/* Surat-Surat Pendek, Yasin, Tahlil, Mahalul Qiyam, Dzikir & Doa Button */}
            {onOpenSurahsModal && (
              <button
                type="button"
                onClick={() => onOpenSurahsModal('juz_amma')}
                title="Buka Juz 'Amma, Surat Yasin, Tahlil, Mahalul Qiyam, Dzikir Sholat & Doa Harian"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-teal-500/20 via-emerald-400/25 to-teal-500/20 hover:from-teal-500/40 hover:to-emerald-400/40 text-emerald-100 hover:text-white border border-emerald-400/50 shadow-xs transition-all cursor-pointer backdrop-blur-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Surat & Yasin</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Dzikir & Doa
                </span>
              </button>
            )}

            {/* Supabase Status Indicator (Display Only, Protected from Edit) */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border select-none backdrop-blur-xs ${
                isSupabaseConnected
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-xs'
                  : 'bg-emerald-950/50 text-emerald-400 border-emerald-700/40'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              {isSupabaseConnected ? (
                <>
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  <span className="hidden md:inline">Supabase Cloud</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3 h-3 text-emerald-400" />
                  <span className="hidden md:inline">Tersimpan</span>
                </>
              )}
            </div>

            {/* PWA Install Button (If not installed) */}
            {!isPwaInstalled && onInstallPwa && (
              <button
                type="button"
                onClick={onInstallPwa}
                title="Pasang aplikasi PUASAKU ke HP/Desktop untuk akses cepat dan offline"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-emerald-950 shadow-sm transition-all border border-amber-300 cursor-pointer animate-pulse"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pasang PWA</span>
              </button>
            )}

            {activeSessionTitle && (
              <div className="hidden 2xl:flex items-center gap-2 bg-emerald-950/70 border border-emerald-700/60 rounded-lg px-3 py-1.5 text-xs text-emerald-200 backdrop-blur-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-emerald-100">{activeSessionTitle}</span>
                {activeSessionDate && (
                  <span className="text-emerald-400 font-mono">({activeSessionDate})</span>
                )}
              </div>
            )}

            {/* Role Badge */}
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 border shadow-xs backdrop-blur-xs ${
                isAdmin
                  ? 'bg-purple-950/80 border-purple-500/70'
                  : isPenginput
                  ? 'bg-amber-950/80 border-amber-500/70'
                  : 'bg-emerald-950/80 border-emerald-600/70'
              }`}
            >
              {isAdmin ? (
                <KeyRound className="w-4 h-4 text-purple-300" />
              ) : isPenginput ? (
                <UserCheck className="w-4 h-4 text-amber-300" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              )}
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">
                  {user.name}
                </p>
                <p className="text-[10px] text-emerald-200 font-medium mt-0.5">
                  {isAdmin
                    ? '👑 Administrator Utama'
                    : isPenginput
                    ? '✍️ Penginput Data'
                    : '🛡️ Petugas Pengecek'}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-red-600/90 text-emerald-100 hover:text-white border border-emerald-700/80 hover:border-red-500 text-xs font-semibold transition-all duration-150 cursor-pointer shadow-xs"
              title="Keluar dari sistem"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};



