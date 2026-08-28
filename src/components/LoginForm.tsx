import React, { useState, useMemo } from 'react';
import { UserSession } from '../types';
import {
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Download,
  Sparkles,
  Moon,
  Clock,
  BookOpen,
  Droplets,
  HeartPulse,
  Heart,
  Flower2,
  ChevronLeft,
  CalendarCheck,
} from 'lucide-react';

interface LoginFormProps {
  onLogin: (session: UserSession) => void;
  error?: string;
  isSupabaseConnected?: boolean;
  onOpenSupabaseConfig?: () => void;
  onInstallPwa?: () => void;
  isPwaInstalled?: boolean;
  onOpenWisdomModal?: () => void;
  onOpenPrayerModal?: () => void;
  onOpenSurahsModal?: () => void;
}

interface StarParticle {
  id: number;
  top: number;
  left: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
  isSparkle?: boolean;
}

interface FloatingPetal {
  id: number;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  error: propError,
  onInstallPwa,
  isPwaInstalled = false,
  onOpenWisdomModal,
  onOpenPrayerModal,
  onOpenSurahsModal,
}) => {
  // Mode: 'main' (Ramadhan green) or 'haid' (Feminine pink theme)
  const [loginMode, setLoginMode] = useState<'main' | 'haid'>('main');

  // Main login credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Haid login credentials
  const [haidUsername, setHaidUsername] = useState('');
  const [haidPassword, setHaidPassword] = useState('');

  const [error, setError] = useState<string | null>(propError || null);

  // Generate organic starry field for Ramadan login ambiance
  const stars = useMemo<StarParticle[]>(() => {
    const list: StarParticle[] = [];
    const colors = ['#fef08a', '#fde047', '#ffffff', '#6ee7b7', '#fbbf24'];

    for (let i = 0; i < 42; i++) {
      const isSparkle = i % 6 === 0;
      list.push({
        id: i,
        top: Math.random() * 95,
        left: Math.random() * 96 + 2,
        size: isSparkle ? Math.random() * 7 + 7 : Math.random() * 3 + 1.5,
        opacity: Math.random() * 0.6 + 0.3,
        duration: Math.random() * 2.5 + 1.8,
        delay: Math.random() * 3,
        color: colors[i % colors.length],
        isSparkle,
      });
    }
    return list;
  }, []);

  // Generate gentle floating flower petals for Pink Haid login ambiance
  const pinkPetals = useMemo<FloatingPetal[]>(() => {
    const list: FloatingPetal[] = [];
    for (let i = 0; i < 26; i++) {
      list.push({
        id: i,
        top: Math.random() * 95,
        left: Math.random() * 94 + 3,
        size: Math.random() * 12 + 10,
        duration: Math.random() * 5 + 4,
        delay: Math.random() * 3,
        rotate: Math.random() * 360,
      });
    }
    return list;
  }, []);

  // Main Login Submit
  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanUser === 'admin' && cleanPass === 'admin') {
      onLogin({
        username: 'admin',
        role: 'admin',
        name: 'Administrator Asrama / Koordinator',
      });
    } else if (cleanUser === 'puasa' && cleanPass === 'puasa') {
      onLogin({
        username: 'puasa',
        role: 'penginput',
        name: 'Petugas Input Data',
      });
    } else if (cleanUser === 'cekpuasa' && cleanPass === 'cekpuasa') {
      onLogin({
        username: 'cekpuasa',
        role: 'pengecek',
        name: 'Petugas Pengecek / Verifikator',
      });
    } else if (cleanUser === 'inputhaid' && cleanPass === 'inputhaid') {
      onLogin({
        username: 'inputhaid',
        role: 'haid',
        name: 'Petugas Catat Haid & Suci',
      });
    } else {
      setError('Username atau Password salah! Pastikan kredensial yang Anda masukkan sesuai.');
    }
  };

  // Pink Haid Login Submit
  const handleHaidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = haidUsername.trim().toLowerCase();
    const cleanPass = haidPassword.trim();

    if (cleanUser === 'inputhaid' && cleanPass === 'inputhaid') {
      onLogin({
        username: 'inputhaid',
        role: 'haid',
        name: 'Petugas Catat Haid & Suci',
      });
    } else if (cleanUser === 'admin' && cleanPass === 'admin') {
      onLogin({
        username: 'admin',
        role: 'admin',
        name: 'Administrator Asrama',
      });
    } else {
      setError('Username atau Password Petugas Haid salah! Gunakan user: inputhaid');
    }
  };

  // =========================================================================
  // VIEW 2: HALAMAN LOGIN KHUSUS PENCATATAN HAID (TEMA SOFT PASTEL PINK MANIS)
  // =========================================================================
  if (loginMode === 'haid') {
    return (
      <div className="relative min-h-screen flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#fff0f5] via-[#ffe4e9] to-[#fce7f3] text-slate-800 overflow-hidden select-none">
        {/* Soft Pink Glow & Floating Animation */}
        <style>{`
          @keyframes pinkFloatSoft {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
              opacity: 0.45;
            }
            50% {
              transform: translateY(-14px) rotate(14deg);
              opacity: 0.85;
            }
          }
          @keyframes softPulseGlow {
            0%, 100% {
              filter: drop-shadow(0 0 12px rgba(244, 114, 182, 0.35));
            }
            50% {
              filter: drop-shadow(0 0 24px rgba(251, 113, 133, 0.6));
            }
          }
        `}</style>

        {/* Soft Pink Ambiance & Floating Petals Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-[radial-gradient(#f472b6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-pink-300/35 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 -right-20 w-80 h-80 bg-rose-200/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-fuchsia-200/40 rounded-full blur-3xl pointer-events-none" />

          {/* Floating Pastel Pink Flowers & Hearts */}
          {pinkPetals.map((petal) => (
            <div
              key={petal.id}
              style={{
                position: 'absolute',
                top: `${petal.top}%`,
                left: `${petal.left}%`,
                width: `${petal.size}px`,
                height: `${petal.size}px`,
                animation: `pinkFloatSoft ${petal.duration}s ease-in-out infinite ${petal.delay}s`,
                transform: `rotate(${petal.rotate}deg)`,
              }}
              className="pointer-events-none text-pink-400/50"
            >
              {petal.id % 2 === 0 ? (
                <Flower2 className="w-full h-full fill-pink-300/40 text-pink-400" />
              ) : (
                <Heart className="w-full h-full fill-rose-300/40 text-rose-400" />
              )}
            </div>
          ))}
        </div>

        {/* Main Soft Pink Card Container */}
        <div className="relative z-10 max-w-md w-full space-y-5 bg-white/90 p-7 sm:p-9 rounded-3xl shadow-[0_15px_40px_rgba(244,114,182,0.18)] border border-pink-200/80 backdrop-blur-md">
          {/* Back Button to Main Login */}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoginMode('main');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 text-pink-600" />
            <span>Kembali ke Login Utama</span>
          </button>

          {/* Header Branding (Tema Manis Santriwati) */}
          <div className="text-center space-y-2.5">
            <div className="relative inline-block">
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-300/50 via-rose-200/60 to-pink-300/50 rounded-3xl blur-md animate-pulse" />
              <div className="relative p-3 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 text-white shadow-md border border-pink-100 [animation:softPulseGlow_3s_ease-in-out_infinite]">
                <Droplets className="w-9 h-9 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400/40" />
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight font-sans">
                  Pencatatan Haid
                </h2>
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400/40" />
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="h-[1.5px] w-6 bg-gradient-to-r from-transparent to-pink-300 rounded-full" />
                <span className="px-3 py-0.5 rounded-full text-[10.5px] font-black bg-pink-100 text-pink-700 border border-pink-200 shadow-xs tracking-wider">
                  PORTAL KHUSUS SANTRIWATI
                </span>
                <div className="h-[1.5px] w-6 bg-gradient-to-l from-transparent to-pink-300 rounded-full" />
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1.5 max-w-xs mx-auto">
                Pencatatan Udzur Syar'i, Pemantauan Haid & Masa Suci Fiqih Syafi'i
              </p>
            </div>
          </div>

          {/* Form Login Soft Pink */}
          <form onSubmit={handleHaidSubmit} className="space-y-3.5 pt-1">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 shadow-xs animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Username Petugas Haid
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={haidUsername}
                  onChange={(e) => setHaidUsername(e.target.value)}
                  placeholder="Masukkan username (inputhaid)"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-pink-50/60 border border-pink-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all shadow-xs"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={haidPassword}
                  onChange={(e) => setHaidPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-pink-50/60 border border-pink-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all shadow-xs"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 hover:from-pink-600 hover:to-rose-500 active:scale-98 text-white font-black text-sm shadow-[0_4px_15px_rgba(244,114,182,0.35)] border border-pink-200 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              <Droplets className="w-4 h-4 text-pink-100" />
              <span>Masuk Portal Haid & Suci</span>
              <ArrowRight className="w-4 h-4 text-pink-100" />
            </button>
          </form>

          {/* Sweet Footer Note */}
          <div className="pt-3 border-t border-pink-100 text-center space-y-1">
            <p className="text-[11px] text-pink-800 flex items-center justify-center gap-1 font-semibold">
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              <span>Portal Terproteksi Khusus Ustadzah & Siswi</span>
            </p>
            <p className="text-[10.5px] text-slate-500">
              SMP / SMA SRT 1 Kediri
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: HALAMAN LOGIN UTAMA (TEMA RAMADHAN EMERALD & GOLD)
  // =========================================================================
  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#021c15] via-[#033123] to-[#01140e] text-white overflow-hidden select-none">
      {/* Dynamic Keyframes for Login Ramadan Sky & Animated Walking Camel */}
      <style>{`
        @keyframes loginTwinkle {
          0%, 100% {
            opacity: 0.15;
            transform: scale(0.75);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
            filter: drop-shadow(0 0 5px currentColor);
          }
        }
        @keyframes loginShootingStar {
          0% {
            transform: translateX(0) translateY(0) rotate(-30deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          60% {
            opacity: 1;
          }
          100% {
            transform: translateX(-400px) translateY(240px) rotate(-30deg);
            opacity: 0;
          }
        }
        @keyframes loginLanternSway {
          0%, 100% {
            transform: rotate(-3.5deg);
          }
          50% {
            transform: rotate(3.5deg);
          }
        }
        @keyframes loginMoonGlow {
          0%, 100% {
            filter: drop-shadow(0 0 16px rgba(253, 224, 71, 0.45));
          }
          50% {
            filter: drop-shadow(0 0 32px rgba(253, 224, 71, 0.8));
          }
        }
        @keyframes camelWalkTrack {
          0% {
            left: 2%;
            transform: scaleX(1) translateY(0px);
          }
          23% {
            transform: scaleX(1) translateY(-0.8px);
          }
          46% {
            left: 88%;
            transform: scaleX(1) translateY(0px);
          }
          49% {
            left: 88%;
            transform: scaleX(-1) translateY(-1.2px);
          }
          51% {
            left: 88%;
            transform: scaleX(-1) translateY(0px);
          }
          74% {
            transform: scaleX(-1) translateY(-0.8px);
          }
          96% {
            left: 2%;
            transform: scaleX(-1) translateY(0px);
          }
          99% {
            left: 2%;
            transform: scaleX(1) translateY(-1.2px);
          }
          100% {
            left: 2%;
            transform: scaleX(1) translateY(0px);
          }
        }
        @keyframes camelGait {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-1.5px) rotate(1.5deg);
          }
          50% {
            transform: translateY(0px) rotate(0deg);
          }
          75% {
            transform: translateY(-1.5px) rotate(-1.5deg);
          }
        }
      `}</style>

      {/* Ramadan Starry Night Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle Geometric Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px] opacity-10" />

        {/* Ambient Top Glow Rings */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Crescent Moon in Top Right */}
        <div className="absolute top-8 right-8 sm:top-12 sm:right-16 text-amber-200 pointer-events-none [animation:loginMoonGlow_4s_ease-in-out_infinite]">
          <Moon className="w-10 h-10 sm:w-14 sm:h-14 text-amber-200 fill-amber-300/25" />
        </div>

        {/* Hanging Ramadan Lanterns */}
        <div className="absolute -top-2 left-6 sm:left-16 flex flex-col items-center origin-top pointer-events-none [animation:loginLanternSway_6s_ease-in-out_infinite]">
          <div className="w-0.5 h-20 sm:h-32 bg-gradient-to-b from-amber-600/40 via-amber-400/60 to-amber-300" />
          <div className="w-6 h-8 sm:w-7 sm:h-10 rounded-b-2xl rounded-t-xs bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.65)] flex items-center justify-center">
            <div className="w-2.5 h-4 bg-yellow-100 rounded-full animate-pulse shadow-[0_0_10px_#fef08a]" />
          </div>
        </div>

        <div className="absolute -top-2 right-24 sm:right-36 hidden md:flex flex-col items-center origin-top pointer-events-none [animation:loginLanternSway_5s_ease-in-out_infinite_1.5s]">
          <div className="w-0.5 h-16 bg-gradient-to-b from-amber-600/40 via-amber-400/60 to-amber-300" />
          <div className="w-5 h-7 rounded-b-xl rounded-t-xs bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)] flex items-center justify-center">
            <div className="w-2 h-3 bg-yellow-100 rounded-full animate-pulse shadow-[0_0_8px_#fef08a]" />
          </div>
        </div>

        {/* Shooting Star */}
        <div className="absolute top-12 right-20 w-32 h-0.5 bg-gradient-to-l from-amber-200 via-yellow-100 to-transparent pointer-events-none [animation:loginShootingStar_4s_ease-out_infinite_1.8s]" />

        {/* Twinkling Stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              color: star.color,
              animation: `loginTwinkle ${star.duration}s ease-in-out infinite ${star.delay}s`,
            }}
            className="pointer-events-none flex items-center justify-center"
          >
            {star.isSparkle ? (
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full fill-current drop-shadow-[0_0_5px_currentColor]"
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

      {/* Main Login Glassmorphic Card Container */}
      <div className="relative z-10 max-w-md w-full space-y-6 bg-gradient-to-b from-emerald-950/85 via-emerald-900/80 to-[#022118]/90 p-8 sm:p-10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.65)] border border-amber-400/35 backdrop-blur-md">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            {/* Ambient Logo Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/30 via-emerald-400/40 to-yellow-300/30 rounded-2xl blur-md animate-pulse" />
            <div className="relative p-2.5 rounded-2xl bg-gradient-to-b from-emerald-800 to-emerald-950 border-2 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <img src="/assets/logo.svg" alt="Logo Puasaku" className="w-14 h-14 object-contain drop-shadow-md" />
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-wider font-sans drop-shadow-[0_2px_8px_rgba(251,191,36,0.35)]">
              PUASAKU
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="h-[1.5px] w-5 bg-gradient-to-r from-transparent to-amber-400/80 rounded-full" />
              <span className="px-3 py-0.5 rounded-full text-[11px] font-black bg-emerald-950/90 text-amber-300 border border-amber-400/50 shadow-xs tracking-widest">
                SRT 1 KEDIRI
              </span>
              <div className="h-[1.5px] w-5 bg-gradient-to-l from-transparent to-amber-400/80 rounded-full" />
            </div>
            <p className="text-xs text-emerald-300/90 font-medium mt-2 max-w-xs mx-auto">
              Sistem Informasi Pencatatan & Verifikasi Amalan Puasa Siswa
            </p>
          </div>
        </div>

        {/* Form Login */}
        <form onSubmit={handleMainSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/70 text-red-200 text-xs font-semibold flex items-start gap-2.5 shadow-md animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Mini Ramadan Desert Line with Walking Camel */}
          <div className="relative pt-1 pb-1 px-1 overflow-hidden" title="Unta Berjalan di Bawah Langit Ramadhan">
            {/* The desert dune / walking track line */}
            <div className="relative w-full h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full shadow-[0_0_6px_rgba(251,191,36,0.4)]" />

            {/* Walking Animated Camel Silhouette */}
            <div
              className="absolute bottom-[2px] pointer-events-none origin-bottom [animation:camelWalkTrack_14s_easeInOutSine_infinite]"
            >
              <div className="[animation:camelGait_0.65s_ease-in-out_infinite]">
                <svg
                  viewBox="0 0 44 36"
                  className="w-5 h-4 sm:w-5.5 sm:h-4.5 text-amber-300 fill-current drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                >
                  <path d="M38 6.5c0-1.8-2-3-3.6-2-1.2.8-1 2.5-1 3.8l-2.4 4.5c-1.3-.4-2.8-1.2-4.5-1.2-2 0-3.8 1-4.8 2.2-1.4-1-3-1.6-4.6-1.3-2.2.3-3.8 1.8-4.3 3.8h-.8c-.8 0-1.5.8-1.5 1.8 0 1.2.4 2.4 1 3.2l-.5 7c0 .8.6 1.5 1.5 1.5.8 0 1.4-.6 1.5-1.4l.5-6.2h3.2l.5 6.2c.1.8.7 1.4 1.5 1.4.8 0 1.5-.7 1.5-1.5l-.5-7c1.8-.4 3.5-1.5 4.4-3l.5 8.5c0 .8.6 1.5 1.5 1.5.8 0 1.4-.6 1.5-1.4l.5-7h2.8l.5 7c.1.8.7 1.4 1.5 1.4.8 0 1.5-.7 1.5-1.5l-.7-8.2c1.5-1.8 1.8-4.4.7-6.6l-.3-3.8c.8-1 2.2-2.2 2.2-3.8z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-amber-300/90 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/70">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin / puasa / cekpuasa"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-emerald-950/70 border border-emerald-700/80 rounded-xl text-white placeholder-emerald-400/50 focus:bg-emerald-950 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-inner"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-amber-300/90 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/70">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-emerald-950/70 border border-emerald-700/80 rounded-xl text-white placeholder-emerald-400/50 focus:bg-emerald-950 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-inner"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-emerald-400/40 hover:border-amber-300/70 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <span>Masuk ke Sistem</span>
            <ArrowRight className="w-4 h-4 text-amber-200" />
          </button>

          {/* Button: Pencatatan Haid (Opens Beautiful Pink Feminine Login View) */}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoginMode('haid');
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-pink-950/90 via-rose-900/90 to-pink-950/90 hover:from-rose-900 hover:via-pink-800 hover:to-rose-900 text-pink-200 border-2 border-pink-400/60 shadow-[0_0_15px_rgba(244,114,182,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Droplets className="w-4 h-4 text-pink-300 shrink-0 animate-bounce" />
            <span>Pencatatan Haid</span>
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40 shrink-0" />
          </button>
        </form>

        {/* Action Shortcuts: Prayer Times, Wisdom & PWA Install */}
        <div className="space-y-2 pt-1">
          {onOpenPrayerModal && (
            <button
              type="button"
              onClick={onOpenPrayerModal}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-900/90 via-[#033c2a] to-emerald-900/90 hover:from-emerald-800 hover:to-emerald-800 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.15)] transition-all cursor-pointer backdrop-blur-xs"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Jadwal Sholat & Imsakiyah Kediri</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            </button>
          )}

          {onOpenWisdomModal && (
            <button
              type="button"
              onClick={onOpenWisdomModal}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-200 border border-emerald-700/60 shadow-xs transition-all cursor-pointer backdrop-blur-xs"
            >
              <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
              <span>Buka Mutiara Hikmah Puasa</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </button>
          )}

          {onOpenSurahsModal && (
            <button
              type="button"
              onClick={onOpenSurahsModal}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 bg-emerald-950/80 hover:bg-emerald-900/90 text-amber-200 border border-emerald-500/50 shadow-xs transition-all cursor-pointer backdrop-blur-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>Juz 'Amma, Yasin, Dzikir Sholat & Doa</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Lengkap
              </span>
            </button>
          )}

          {!isPwaInstalled && onInstallPwa && (
            <button
              type="button"
              onClick={onInstallPwa}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 text-emerald-950 shadow-[0_0_15px_rgba(251,191,36,0.3)] border border-amber-300 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Pasang Aplikasi PUASAKU (PWA di HP)</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-950 animate-pulse" />
            </button>
          )}
        </div>

        {/* Clean Footer Info */}
        <div className="pt-4 border-t border-emerald-800/60 text-center space-y-1.5">
          <p className="text-[11px] text-emerald-400/90 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Portal Terproteksi • SMP / SMA SRT 1 Kediri
          </p>
          <p className="text-[11px] text-emerald-300/80 flex items-center justify-center gap-1 font-medium">
            <span>Dibuat oleh</span>
            <span className="font-bold text-amber-300 tracking-wide hover:text-amber-200 transition-colors">
              eccko developer
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

