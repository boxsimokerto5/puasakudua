import React, { useMemo, useRef, useState, useEffect } from 'react';
import { UserSession, AdminTabType, AdminSettings } from '../types';
import { CityLocation } from '../utils/prayerTimes';
import { PrayerTimeHeaderPill } from './PrayerTimeHeaderPill';
import { getTheme } from '../utils/themeConfig';
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
  Droplets,
  HeartPulse,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface HeaderNavbarProps {
  user: UserSession;
  onLogout: () => void;
  adminSettings?: AdminSettings;
  colorTheme?: string;
  schoolName?: string;
  schoolSubName?: string;
  activeSessionTitle?: string;
  activeSessionDate?: string;
  activeAdminTab?: AdminTabType;
  onSelectAdminTab?: (tab: AdminTabType) => void;
  isSupabaseConnected?: boolean;
  onOpenSupabaseConfig?: () => void;
  onInstallPwa?: () => void;
  isPwaInstalled?: boolean;
  onOpenWisdomModal?: () => void;
  onOpenPrayerModal?: () => void;
  onOpenSurahsModal?: (tab?: 'juz_amma' | 'yasin' | 'tahlil' | 'sholawat' | 'mahalul_qiyam' | 'dzikir_sholat' | 'doa_harian' | 'tata_cara_sholat') => void;
  haidActiveCount?: number;
  onOpenHaidNotification?: () => void;
  selectedCity?: CityLocation;
  hasUpdate?: boolean;
  isUpdating?: boolean;
  onApplyUpdate?: () => void;
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
  adminSettings,
  colorTheme,
  schoolName,
  schoolSubName,
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
  haidActiveCount = 0,
  onOpenHaidNotification,
  selectedCity,
  hasUpdate = false,
  isUpdating = false,
  onApplyUpdate,
}) => {
  const isAdmin = user.role === 'admin';
  const isPenginput = user.role === 'penginput';
  const isPengecek = user.role === 'pengecek';
  const isHaidRole = user.role === 'haid';
  const isSholatRole = user.role === 'sholat';

  const activeThemeId = adminSettings?.colorTheme || colorTheme;
  const theme = getTheme(activeThemeId);
  const displaySchoolName = adminSettings?.schoolName || schoolName || "SMP-SMA TAHFIDZ AL-QUR'AN";
  const displaySchoolSubName = adminSettings?.schoolSubName || schoolSubName || 'SR 1 KEDIRI';

  // Navigation slider scroll management
  const navSliderRef = useRef<HTMLDivElement>(null);
  const quickToolsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    if (navSliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navSliderRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  };

  useEffect(() => {
    checkScrollability();
    const timer1 = setTimeout(checkScrollability, 100);
    const timer2 = setTimeout(checkScrollability, 400);
    const timer3 = setTimeout(checkScrollability, 1000);
    window.addEventListener('resize', checkScrollability);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('resize', checkScrollability);
    };
  }, []);

  // Mouse drag-to-scroll helper for nav tabs
  useEffect(() => {
    const slider = navSliderRef.current;
    if (!slider) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      slider.classList.add('cursor-grabbing');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      slider.classList.remove('cursor-grabbing');
    };

    const handleMouseUp = () => {
      isDown = false;
      slider.classList.remove('cursor-grabbing');
      checkScrollability();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5;
      slider.scrollLeft = scrollLeft - walk;
      checkScrollability();
    };

    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mouseleave', handleMouseLeave);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mousemove', handleMouseMove);

    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Ensure active tab is smoothly visible in the slider
  useEffect(() => {
    if (navSliderRef.current && activeAdminTab) {
      const activeButton = navSliderRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
      setTimeout(checkScrollability, 350);
    }
  }, [activeAdminTab]);

  const handleScrollNav = (direction: 'left' | 'right') => {
    if (navSliderRef.current) {
      const scrollAmount = 220;
      navSliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollability, 300);
    }
  };

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
    <header className={`relative ${theme.colors.headerGradientClass} text-white shadow-xl ${theme.colors.headerBorderClass} border-b sticky top-0 z-40 overflow-hidden`}>
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
        <div className={`absolute -top-10 left-1/4 w-80 h-24 ${theme.colors.headerGlowClass} rounded-full blur-2xl`} />
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
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/40 border border-amber-400/60 p-1 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.25)] shrink-0">
                  <img src="/assets/logo.svg" alt="Logo Puasaku" className="w-full h-full object-contain drop-shadow-sm" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <h1 className="text-sm sm:text-base lg:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-wide font-sans drop-shadow-[0_1px_3px_rgba(251,191,36,0.3)] truncate">
                    PUASAKU
                  </h1>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black bg-black/40 text-amber-300 border border-amber-400/40 shadow-xs shrink-0 max-w-[120px] truncate" title={displaySchoolSubName}>
                    {displaySchoolSubName}
                  </span>
                </div>
                <p className="hidden sm:block text-[10.5px] text-amber-200/90 font-medium -mt-0.5 truncate" title={displaySchoolName}>
                  {isHaidRole ? 'Portal Pencatatan Haid & Suci Santriwati' : displaySchoolName}
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

              {/* Always Visible Refresh / Update Button */}
              {onApplyUpdate && (
                <button
                  type="button"
                  onClick={onApplyUpdate}
                  disabled={isUpdating}
                  title={hasUpdate ? 'Pembaruan versi baru tersedia! Klik untuk memuat ulang' : 'Segarkan / Reload Aplikasi'}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0 active:scale-95 ${
                    hasUpdate
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 border-amber-300 ring-2 ring-amber-400/50 animate-pulse font-black'
                      : 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-200 hover:text-white border-emerald-600/60'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : hasUpdate ? 'text-emerald-950 animate-spin' : 'text-emerald-300'}`} />
                  <span className="hidden xs:inline">
                    {isUpdating ? 'Memuat...' : hasUpdate ? 'Update' : 'Refresh'}
                  </span>
                  {hasUpdate && (
                    <span className="w-2 h-2 rounded-full bg-red-500 ring-1 ring-white animate-ping shrink-0" />
                  )}
                </button>
              )}

              {/* User Chip */}
              <div
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl border text-[11px] sm:text-xs font-bold shadow-xs ${
                  isAdmin
                    ? 'bg-purple-950/90 border-purple-500/70 text-purple-200'
                    : isHaidRole
                    ? 'bg-rose-950/90 border-rose-500/70 text-rose-200'
                    : isSholatRole
                    ? 'bg-emerald-950/90 border-emerald-500/70 text-emerald-300'
                    : isPenginput
                    ? 'bg-amber-950/90 border-amber-500/70 text-amber-200'
                    : 'bg-emerald-950/90 border-emerald-600/70 text-emerald-200'
                }`}
              >
                {isAdmin ? (
                  <KeyRound className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-300 shrink-0" />
                ) : isHaidRole ? (
                  <Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 shrink-0" />
                ) : isSholatRole ? (
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300 shrink-0" />
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

          {/* Navigation Tabs - Smooth Horizontal Slider Segmented Control */}
          {onSelectAdminTab && (
            <div className="relative w-full lg:w-auto flex items-center group/nav">
              {/* Left Scroll Arrow (Appears when content can be scrolled left) */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => handleScrollNav('left')}
                  className="absolute -left-1.5 sm:-left-3 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-950/95 border-2 border-amber-400 text-amber-300 flex items-center justify-center shadow-lg hover:bg-emerald-800 transition-all cursor-pointer backdrop-blur-md active:scale-90"
                  title="Geser tab ke kiri"
                  aria-label="Geser tab ke kiri"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                </button>
              )}

              <nav className="w-full bg-emerald-950/90 p-1 rounded-xl border border-emerald-700/60 shadow-inner backdrop-blur-xs overflow-hidden">
                <div
                  ref={navSliderRef}
                  onScroll={checkScrollability}
                  className="flex items-center gap-1 overflow-x-auto touch-pan-x overscroll-x-contain no-scrollbar scroll-smooth py-0.5 px-0.5 select-none"
                >
                  {/* Dedicated Petugas Haid View (Only the 3 Haid & Suci tabs) */}
                  {isHaidRole ? (
                    <>
                      {/* Catat Haid Tab */}
                      <button
                        type="button"
                        data-active={activeAdminTab === 'catat_haid'}
                        onClick={() => onSelectAdminTab('catat_haid')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                          activeAdminTab === 'catat_haid'
                            ? 'bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 text-white shadow-[0_2px_12px_rgba(244,114,182,0.45)] ring-1 ring-pink-200 font-black'
                            : 'text-pink-300 hover:text-white hover:bg-pink-900/40'
                        }`}
                      >
                        <Droplets className="w-3.5 h-3.5 text-pink-200 shrink-0" />
                        <span>Catat Haid</span>
                      </button>

                      {/* Daftar Haid Tab */}
                      <button
                        type="button"
                        data-active={activeAdminTab === 'daftar_haid'}
                        onClick={() => onSelectAdminTab('daftar_haid')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                          activeAdminTab === 'daftar_haid'
                            ? 'bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 text-white shadow-[0_2px_12px_rgba(244,114,182,0.45)] ring-1 ring-pink-200 font-black'
                            : 'text-pink-300 hover:text-white hover:bg-pink-900/40'
                        }`}
                      >
                        <HeartPulse className="w-3.5 h-3.5 text-pink-200 shrink-0" />
                        <span>Daftar Haid</span>
                      </button>

                      {/* Daftar Suci Tab */}
                      <button
                        type="button"
                        data-active={activeAdminTab === 'daftar_suci'}
                        onClick={() => onSelectAdminTab('daftar_suci')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                          activeAdminTab === 'daftar_suci'
                            ? 'bg-gradient-to-r from-teal-500 via-emerald-500 to-pink-500 text-white shadow-[0_2px_12px_rgba(20,184,166,0.35)] ring-1 ring-pink-200 font-black'
                            : 'text-pink-200 hover:text-white hover:bg-emerald-800/70'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                        <span>Daftar Suci</span>
                      </button>
                    </>
                  ) : isSholatRole ? (
                    <>
                      {/* Dedicated Petugas Sholat View */}
                      <button
                        type="button"
                        data-active={activeAdminTab === 'sholat'}
                        onClick={() => onSelectAdminTab('sholat')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                          activeAdminTab === 'sholat'
                            ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white shadow-[0_2px_12px_rgba(16,185,129,0.45)] ring-1 ring-emerald-300 font-black'
                            : 'text-emerald-300 hover:text-white hover:bg-emerald-900/40'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                        <span>Presensi Sholat Berjamaah</span>
                      </button>

                      <button
                        type="button"
                        data-active={activeAdminTab === 'calendar'}
                        onClick={() => onSelectAdminTab('calendar')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                          activeAdminTab === 'calendar'
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md ring-1 ring-teal-300 font-black'
                            : 'text-teal-300 hover:text-white hover:bg-emerald-800/70'
                        }`}
                      >
                        <CalendarCheck className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                        <span>Kalender</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {isAdmin && (
                        <button
                          type="button"
                          data-active={activeAdminTab === 'admin'}
                          onClick={() => onSelectAdminTab('admin')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                            activeAdminTab === 'admin'
                              ? 'bg-purple-600 text-white shadow-md ring-1 ring-purple-400'
                              : 'text-emerald-300 hover:text-white hover:bg-emerald-800/60'
                          }`}
                        >
                          <Sliders className="w-3.5 h-3.5 shrink-0" />
                          <span>Admin</span>
                        </button>
                      )}

                      {/* Presensi Sholat Tab for Admin / General */}
                      <button
                        type="button"
                        data-active={activeAdminTab === 'sholat'}
                        onClick={() => onSelectAdminTab('sholat')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                          activeAdminTab === 'sholat'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-1 ring-emerald-300 font-black'
                            : 'text-emerald-300 hover:text-white hover:bg-emerald-800/60'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                        <span>Presensi Sholat</span>
                      </button>

                      {(isAdmin || isPenginput) && (
                        <button
                          type="button"
                          data-active={activeAdminTab === 'input'}
                          onClick={() => onSelectAdminTab('input')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                            activeAdminTab === 'input'
                              ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
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
                          data-active={activeAdminTab === 'checker'}
                          onClick={() => onSelectAdminTab('checker')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                            activeAdminTab === 'checker'
                              ? 'bg-amber-500 text-emerald-950 shadow-md font-black ring-1 ring-amber-300'
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
                        data-active={activeAdminTab === 'raport'}
                        onClick={() => onSelectAdminTab('raport')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
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
                        data-active={activeAdminTab === 'calendar'}
                        onClick={() => onSelectAdminTab('calendar')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                          activeAdminTab === 'calendar'
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md ring-1 ring-teal-300 font-black'
                            : 'text-teal-300 hover:text-white hover:bg-emerald-800/70'
                        }`}
                      >
                        <CalendarCheck className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                        <span>Kalender</span>
                      </button>

                      {/* Notifikasi Haid (Sejajar dengan Kalender) */}
                      {onOpenHaidNotification && (
                        <button
                          type="button"
                          onClick={onOpenHaidNotification}
                          title="Lihat Daftar Santriwati yang Sedang Haid"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-500 hover:to-rose-400 text-white shadow-md ring-1 ring-pink-300/80 border border-pink-400/50"
                        >
                          <HeartPulse className="w-3.5 h-3.5 text-pink-200 shrink-0" />
                          <span>Notifikasi Haid</span>
                          {haidActiveCount > 0 && (
                            <span className="bg-white text-rose-700 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs leading-none">
                              {haidActiveCount}
                            </span>
                          )}
                        </button>
                      )}

                      {/* Catat Haid Tab for Admin */}
                      {isAdmin && (
                        <button
                          type="button"
                          data-active={activeAdminTab === 'catat_haid'}
                          onClick={() => onSelectAdminTab('catat_haid')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                            activeAdminTab === 'catat_haid'
                              ? 'bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 text-white shadow-[0_2px_12px_rgba(244,114,182,0.45)] ring-1 ring-pink-200 font-black'
                              : 'text-pink-300 hover:text-white hover:bg-pink-900/40'
                          }`}
                        >
                          <Droplets className="w-3.5 h-3.5 text-pink-200 shrink-0" />
                          <span>Catat Haid</span>
                        </button>
                      )}

                      {/* Daftar Haid Tab for Admin */}
                      {isAdmin && (
                        <button
                          type="button"
                          data-active={activeAdminTab === 'daftar_haid'}
                          onClick={() => onSelectAdminTab('daftar_haid')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                            activeAdminTab === 'daftar_haid'
                              ? 'bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 text-white shadow-[0_2px_12px_rgba(244,114,182,0.45)] ring-1 ring-pink-200 font-black'
                              : 'text-pink-300 hover:text-white hover:bg-pink-900/40'
                          }`}
                        >
                          <HeartPulse className="w-3.5 h-3.5 text-pink-200 shrink-0" />
                          <span>Daftar Haid</span>
                        </button>
                      )}

                      {/* Daftar Suci Tab for Admin */}
                      {isAdmin && (
                        <button
                          type="button"
                          data-active={activeAdminTab === 'daftar_suci'}
                          onClick={() => onSelectAdminTab('daftar_suci')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                            activeAdminTab === 'daftar_suci'
                              ? 'bg-gradient-to-r from-teal-500 via-emerald-500 to-pink-500 text-white shadow-[0_2px_12px_rgba(20,184,166,0.35)] ring-1 ring-pink-200 font-black'
                              : 'text-pink-200 hover:text-white hover:bg-emerald-800/70'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                          <span>Daftar Suci</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </nav>

              {/* Right Scroll Arrow (Appears when content can be scrolled right) */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => handleScrollNav('right')}
                  className="absolute -right-1.5 sm:-right-3 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-950/95 border-2 border-amber-400 text-amber-300 flex items-center justify-center shadow-lg hover:bg-emerald-800 transition-all cursor-pointer backdrop-blur-md active:scale-90"
                  title="Geser tab ke kanan"
                  aria-label="Geser tab ke kanan"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                </button>
              )}
            </div>
          )}

          {/* Quick Islamic Tools & Desktop Actions Bar */}
          <div
            ref={quickToolsRef}
            className="flex items-center justify-start sm:justify-end gap-1.5 sm:gap-2 overflow-x-auto touch-pan-x overscroll-x-contain no-scrollbar scroll-smooth py-0.5 w-full sm:w-auto"
          >
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



