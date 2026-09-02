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
  // Mode: 'main' (Ramadhan green), 'haid' (Feminine pink theme), or 'sholat' (Mosque emerald theme)
  const [loginMode, setLoginMode] = useState<'main' | 'haid' | 'sholat'>('main');

  // Main login credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Haid login credentials
  const [haidUsername, setHaidUsername] = useState('');
  const [haidPassword, setHaidPassword] = useState('');

  // Sholat login credentials
  const [sholatUsername, setSholatUsername] = useState('sholat');
  const [sholatPassword, setSholatPassword] = useState('istiqomah');

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
    } else if (cleanUser === 'sholat' && cleanPass === 'istiqomah') {
      onLogin({
        username: 'sholat',
        role: 'sholat',
        name: 'Petugas Presensi Sholat',
      });
    } else {
      setError('Username atau Password salah! Periksa kembali akun Anda.');
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
    } else if (cleanUser === 'sholat' && cleanPass === 'istiqomah') {
      onLogin({
        username: 'sholat',
        role: 'sholat',
        name: 'Petugas Presensi Sholat',
      });
    } else if (cleanUser === 'admin' && cleanPass === 'admin') {
      onLogin({
        username: 'admin',
        role: 'admin',
        name: 'Administrator Asrama',
      });
    } else {
      setError('Username atau Password salah! Periksa kembali akun Anda.');
    }
  };

  // Sholat Login Submit
  const handleSholatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = sholatUsername.trim().toLowerCase();
    const cleanPass = sholatPassword.trim();

    if (cleanUser === 'sholat' && cleanPass === 'istiqomah') {
      onLogin({
        username: 'sholat',
        role: 'sholat',
        name: 'Petugas Presensi Sholat',
      });
    } else if (cleanUser === 'admin' && cleanPass === 'admin') {
      onLogin({
        username: 'admin',
        role: 'admin',
        name: 'Administrator Asrama',
      });
    } else {
      setError('Username atau Password salah! Periksa kembali akun Anda.');
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
        <div className="relative z-10 max-w-sm w-full space-y-4 bg-white/95 p-5 sm:p-6 rounded-3xl shadow-[0_15px_40px_rgba(244,114,182,0.18)] border border-pink-200 backdrop-blur-md">
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
          <div className="text-center space-y-2">
            <div className="relative inline-block">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-pink-300/50 via-rose-200/60 to-pink-300/50 rounded-2xl blur-md animate-pulse" />
              <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 text-white shadow-md border border-pink-100 [animation:softPulseGlow_3s_ease-in-out_infinite]">
                <Droplets className="w-7 h-7 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight font-sans">
                  Pencatatan Haid
                </h2>
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40" />
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="h-[1px] w-5 bg-gradient-to-r from-transparent to-pink-300 rounded-full" />
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-100 text-pink-700 border border-pink-200 tracking-wider">
                  PORTAL SANTRIWATI
                </span>
                <div className="h-[1px] w-5 bg-gradient-to-l from-transparent to-pink-300 rounded-full" />
              </div>
              <p className="text-[11.5px] text-slate-600 font-medium mt-1 max-w-xs mx-auto">
                Pencatatan Udzur Syar'i, Pemantauan Haid & Masa Suci Fiqih Syafi'i
              </p>
            </div>
          </div>

          {/* Form Login Soft Pink */}
          <form onSubmit={handleHaidSubmit} className="space-y-3 pt-1">
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 shadow-xs animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Username Petugas Haid
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={haidUsername}
                  onChange={(e) => setHaidUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-pink-50/60 border border-pink-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all shadow-xs"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={haidPassword}
                  onChange={(e) => setHaidPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-pink-50/60 border border-pink-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all shadow-xs"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 hover:from-pink-600 hover:to-rose-500 active:scale-98 text-white font-black text-xs sm:text-sm shadow-[0_4px_12px_rgba(244,114,182,0.35)] border border-pink-200 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Droplets className="w-4 h-4 text-pink-100" />
              <span>Masuk Portal Haid & Suci</span>
              <ArrowRight className="w-4 h-4 text-pink-100" />
            </button>

            {/* Shortcut to Sholat Login from Haid */}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setLoginMode('sholat');
              }}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Beralih ke Presensi Sholat</span>
            </button>
          </form>

          {/* Sweet Footer Note */}
          <div className="pt-2.5 border-t border-pink-100 text-center space-y-0.5">
            <p className="text-[10.5px] text-pink-800 flex items-center justify-center gap-1 font-semibold">
              <HeartPulse className="w-3 h-3 text-rose-500" />
              <span>Portal Terproteksi Khusus Ustadzah & Siswi</span>
            </p>
            <p className="text-[10px] text-slate-500">
              SMP / SMA SRT 1 Kediri
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: HALAMAN LOGIN KHUSUS PRESENSI SHOLAT BERJAMAAH (TEMA ISLAMIC MOSQUE)
  // =========================================================================
  if (loginMode === 'sholat') {
    return (
      <div className="relative min-h-screen flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#021814] via-[#042d25] to-[#01140e] text-slate-100 overflow-hidden select-none">
        {/* Starry Ambiance */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 -right-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

          {stars.slice(0, 25).map((star) => (
            <div
              key={star.id}
              style={{
                position: 'absolute',
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                backgroundColor: star.color,
                opacity: star.opacity,
                borderRadius: '50%',
                boxShadow: `0 0 ${star.size * 2}px ${star.color}`,
              }}
            />
          ))}
        </div>

        {/* Sholat Card Container */}
        <div className="relative z-10 max-w-sm w-full space-y-4 bg-slate-900/95 p-5 sm:p-6 rounded-3xl shadow-[0_20px_50px_rgba(4,45,37,0.8)] border border-emerald-500/30 backdrop-blur-md">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoginMode('main');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-800/80 hover:bg-slate-750 text-emerald-300 border border-emerald-600/40 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 text-emerald-400" />
            <span>Kembali ke Login Utama</span>
          </button>

          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="relative inline-block">
              <div className="w-13 h-13 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Clock className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-serif text-emerald-400 tracking-wider">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Presensi Sholat Berjamaah
              </h2>
              <p className="text-[11.5px] text-emerald-200/80 mt-0.5">
                Portal Petugas Musyrif & Pengecekan Kedisiplinan Ibadah Sholat Santri
              </p>
            </div>
          </div>

          {/* Form Login Sholat */}
          <form onSubmit={handleSholatSubmit} className="space-y-3 pt-1">
            {error && (
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/70 text-red-200 text-xs font-semibold flex items-start gap-2 shadow-md">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black text-emerald-300 uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={sholatUsername}
                  onChange={(e) => setSholatUsername(e.target.value)}
                  placeholder="Masukkan username sholat"
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-emerald-500/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-emerald-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={sholatPassword}
                  onChange={(e) => setSholatPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-emerald-500/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black text-xs sm:text-sm shadow-[0_0_16px_rgba(16,185,129,0.35)] border border-emerald-400/40 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Clock className="w-4 h-4 text-emerald-200" />
              <span>Masuk Portal Presensi Sholat</span>
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-2.5 border-t border-slate-800 text-center space-y-0.5">
            <p className="text-[10.5px] text-emerald-400/90 font-medium">
              Sistem Otomatisasi Absensi Scanner & Pemantauan Masbuq
            </p>
            <p className="text-[10px] text-slate-500">
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
            transform: translateX(250px) translateY(-120px) rotate(-32deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          55% {
            opacity: 1;
          }
          100% {
            transform: translateX(-450px) translateY(300px) rotate(-32deg);
            opacity: 0;
          }
        }
        @keyframes loginShootingStar2 {
          0% {
            transform: translateX(180px) translateY(-80px) rotate(-38deg);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          45% {
            opacity: 0.9;
          }
          100% {
            transform: translateX(-380px) translateY(260px) rotate(-38deg);
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
        @keyframes lunarBreathingGlow {
          0% {
            filter: drop-shadow(0 0 10px rgba(254, 240, 138, 0.35)) drop-shadow(0 0 25px rgba(251, 191, 36, 0.2));
            opacity: 0.82;
            transform: scale(0.97);
          }
          50% {
            filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 50px rgba(251, 191, 36, 0.75)) drop-shadow(0 0 80px rgba(245, 158, 11, 0.45));
            opacity: 1;
            transform: scale(1.03);
          }
          100% {
            filter: drop-shadow(0 0 10px rgba(254, 240, 138, 0.35)) drop-shadow(0 0 25px rgba(251, 191, 36, 0.2));
            opacity: 0.82;
            transform: scale(0.97);
          }
        }
        @keyframes starPendantGlow {
          0%, 100% {
            filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.5));
            transform: rotate(-2deg);
          }
          50% {
            filter: drop-shadow(0 0 18px rgba(254, 240, 138, 0.95));
            transform: rotate(2deg);
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

      {/* Deep Celestial Night Sky Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-[#020b17] via-[#04172a] to-[#010e1b]">
        {/* Celestial Cosmic Nebulae Dust */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-15" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -left-28 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-28 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />

        {/* Top-Left Hanging Celestial Star Pendant */}
        <div className="absolute -top-1 left-4 sm:left-12 flex flex-col items-center origin-top pointer-events-none [animation:starPendantGlow_5s_ease-in-out_infinite]">
          <div className="w-[1.5px] h-28 sm:h-40 bg-gradient-to-b from-amber-500/30 via-amber-300/60 to-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          <div className="relative -mt-1 flex items-center justify-center">
            {/* 8-Point Sparkling Golden Star */}
            <svg viewBox="0 0 40 40" className="w-9 h-9 sm:w-11 sm:h-11 text-amber-200 fill-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]">
              <path d="M20 0 L23 14 L37 17 L23 20 L20 34 L17 20 L3 17 L17 14 Z" />
              <circle cx="20" cy="17" r="3" className="fill-white" />
            </svg>
          </div>
        </div>

        {/* Top-Right Glowing Celestial Crescent Moon with Breathing Glow (Terang -> Agak Terang -> Terang) */}
        <div className="absolute top-4 right-4 sm:top-8 sm:right-12 pointer-events-none [animation:lunarBreathingGlow_6s_ease-in-out_infinite]">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
            {/* Textured Moon Sphere Glow Body */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-amber-100/30 border border-amber-200/20 overflow-hidden shadow-2xl opacity-90">
              {/* Moon surface craters texture */}
              <div className="absolute top-3 left-4 w-3.5 h-3.5 rounded-full bg-black/30 blur-xs" />
              <div className="absolute top-7 left-7 w-5 h-5 rounded-full bg-black/25 blur-xs" />
              <div className="absolute bottom-4 left-3 w-4 h-4 rounded-full bg-black/35 blur-xs" />
              <div className="absolute top-5 right-5 w-3 h-3 rounded-full bg-black/20 blur-xs" />
            </div>

            {/* Glowing Golden Crescent overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full text-amber-200 fill-amber-200/90 drop-shadow-[0_0_18px_rgba(251,191,36,0.95)]">
                <path d="M78 18 C52 18 32 38 32 64 C32 76 37 87 45 95 C25 90 10 72 10 50 C10 24 30 4 56 4 C64 4 72 7 78 12 Z" />
              </svg>
            </div>

            {/* Small Luminous Star near Moon */}
            <div className="absolute -top-1 -left-2">
              <Sparkles className="w-5 h-5 text-amber-100 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>
        </div>

        {/* Shooting Stars / Meteors */}
        <div className="absolute top-10 right-28 w-40 h-0.5 bg-gradient-to-l from-amber-200 via-yellow-100 to-transparent pointer-events-none [animation:loginShootingStar_5s_ease-out_infinite_1s]" />
        <div className="absolute top-28 right-8 w-32 h-0.5 bg-gradient-to-l from-cyan-200 via-teal-100 to-transparent pointer-events-none [animation:loginShootingStar2_7s_ease-out_infinite_3.8s]" />

        {/* Golden Constellations (Rasi Bintang) spanning across the background sky */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-85" viewBox="0 0 800 1000" preserveAspectRatio="none" fill="none">
          {/* Left Upper Constellation (Ursa Major / Bintang Biduk) */}
          <g className="stroke-amber-300/50" strokeWidth="1.2" strokeDasharray="3 3">
            <line x1="60" y1="120" x2="130" y2="170" />
            <line x1="130" y1="170" x2="200" y2="140" />
            <line x1="200" y1="140" x2="270" y2="210" />
            <line x1="270" y1="210" x2="230" y2="290" />
            <line x1="230" y1="290" x2="160" y2="270" />
            <line x1="160" y1="270" x2="130" y2="170" />
          </g>
          {/* Left Upper Star Nodes */}
          <circle cx="60" cy="120" r="3.5" className="fill-amber-200" />
          <circle cx="130" cy="170" r="4" className="fill-amber-100 shadow-[0_0_10px_#fef08a]" />
          <circle cx="200" cy="140" r="3" className="fill-amber-300" />
          <circle cx="270" cy="210" r="4.5" className="fill-yellow-200 animate-pulse" />
          <circle cx="230" cy="290" r="3.5" className="fill-amber-200" />
          <circle cx="160" cy="270" r="3.5" className="fill-amber-100" />

          {/* Left Lower Constellation (Scorpius / Gurita Bintang) */}
          <g className="stroke-teal-300/45" strokeWidth="1.2" strokeDasharray="3 3">
            <line x1="30" y1="420" x2="90" y2="480" />
            <line x1="90" y1="480" x2="140" y2="460" />
            <line x1="140" y1="460" x2="80" y2="570" />
            <line x1="80" y1="570" x2="120" y2="650" />
            <line x1="120" y1="650" x2="50" y2="730" />
            <line x1="50" y1="730" x2="80" y2="800" />
          </g>
          <circle cx="30" cy="420" r="3.5" className="fill-teal-200" />
          <circle cx="90" cy="480" r="4" className="fill-amber-200" />
          <circle cx="140" cy="460" r="3" className="fill-yellow-100" />
          <circle cx="80" cy="570" r="4" className="fill-teal-100 animate-pulse" />
          <circle cx="120" cy="650" r="3.5" className="fill-amber-200" />
          <circle cx="50" cy="730" r="4" className="fill-teal-200" />
          <circle cx="80" cy="800" r="3.5" className="fill-amber-300" />

          {/* Right Upper Constellation (Cassiopeia / W-Shape) */}
          <g className="stroke-amber-300/50" strokeWidth="1.2" strokeDasharray="3 3">
            <line x1="530" y1="130" x2="590" y2="180" />
            <line x1="590" y1="180" x2="650" y2="140" />
            <line x1="650" y1="140" x2="710" y2="200" />
            <line x1="710" y1="200" x2="770" y2="150" />
          </g>
          <circle cx="530" cy="130" r="3.5" className="fill-amber-200" />
          <circle cx="590" cy="180" r="4" className="fill-yellow-100" />
          <circle cx="650" cy="140" r="3" className="fill-amber-300" />
          <circle cx="710" cy="200" r="4.5" className="fill-yellow-200 animate-pulse" />
          <circle cx="770" cy="150" r="3.5" className="fill-amber-100" />

          {/* Right Middle Constellation (Orion Belt & Shield) */}
          <g className="stroke-amber-300/50" strokeWidth="1.2" strokeDasharray="3 3">
            <line x1="620" y1="460" x2="720" y2="490" />
            <line x1="720" y1="490" x2="750" y2="590" />
            <line x1="750" y1="590" x2="640" y2="570" />
            <line x1="640" y1="570" x2="620" y2="460" />
            {/* Belt */}
            <line x1="660" y1="525" x2="685" y2="530" />
            <line x1="685" y1="530" x2="710" y2="535" />
          </g>
          <circle cx="620" cy="460" r="4" className="fill-amber-200 animate-pulse" />
          <circle cx="720" cy="490" r="3.5" className="fill-teal-100" />
          <circle cx="750" cy="590" r="4" className="fill-amber-100" />
          <circle cx="640" cy="570" r="3.5" className="fill-yellow-200" />
          <circle cx="660" cy="525" r="2.5" className="fill-amber-300" />
          <circle cx="685" cy="530" r="3" className="fill-yellow-100" />
          <circle cx="710" cy="535" r="2.5" className="fill-amber-300" />

          {/* Right Lower Constellation (Centaurus / Pegasus) */}
          <g className="stroke-teal-300/45" strokeWidth="1.2" strokeDasharray="3 3">
            <line x1="660" y1="710" x2="750" y2="760" />
            <line x1="750" y1="760" x2="710" y2="850" />
            <line x1="710" y1="850" x2="630" y2="820" />
            <line x1="630" y1="820" x2="660" y2="710" />
          </g>
          <circle cx="660" cy="710" r="3.5" className="fill-teal-200" />
          <circle cx="750" cy="760" r="4" className="fill-amber-200 animate-pulse" />
          <circle cx="710" cy="850" r="3.5" className="fill-yellow-100" />
          <circle cx="630" cy="820" r="3.5" className="fill-teal-100" />
        </svg>

        {/* Twinkling Stars Scattered Across Sky */}
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
                className="w-full h-full fill-current drop-shadow-[0_0_6px_currentColor]"
              >
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
            ) : (
              <div
                className="w-full h-full rounded-full shadow-[0_0_4px_currentColor]"
                style={{ backgroundColor: star.color }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Login Frame Container (Seamless Cosmic Glassmorphism matching reference image) */}
      <div
        className="relative z-10 max-w-sm w-full space-y-4 p-5 sm:p-6 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] border border-amber-400/30 backdrop-blur-md overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(3, 20, 32, 0.55) 0%, rgba(2, 28, 38, 0.78) 35%, rgba(2, 22, 29, 0.92) 70%, rgba(1, 15, 20, 0.98) 100%)',
        }}
      >
        {/* Header Branding (Circular Gold Medallion Logo & Gold Typography) */}
        <div className="relative z-10 text-center space-y-2">
          {/* Triple Gold-Rimmed Center Medallion Emblem */}
          <div className="relative inline-block">
            {/* Outer Radiant Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/40 via-teal-300/30 to-yellow-300/40 rounded-full blur-md animate-pulse" />
            
            {/* Outer Gold Bezel */}
            <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.6)]">
              {/* Inner Gold Bezel Ring */}
              <div className="p-0.5 rounded-full bg-gradient-to-b from-amber-700 via-amber-400 to-amber-800">
                {/* Deep Emerald-Teal Emblem Core */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-b from-[#064e3b] via-[#022c22] to-[#011a14] border border-amber-300/60 shadow-inner flex items-center justify-center p-1.5">
                  <img
                    src="/assets/logo.svg"
                    alt="Logo Puasaku"
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* PUASAKU Golden Headline */}
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fff6d6] via-[#ffd966] to-[#df9b13] tracking-[0.18em] font-serif drop-shadow-[0_2px_10px_rgba(251,191,36,0.45)]">
              PUASAKU
            </h2>
            
            {/* SRT 1 KEDIRI Subtitle */}
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="text-[11px] sm:text-xs font-bold text-amber-300 tracking-[0.25em]">
                SRT 1 KEDIRI
              </span>
            </div>

            {/* Description Text */}
            <p className="text-[11px] text-amber-100/85 font-normal mt-1 max-w-xs mx-auto leading-relaxed">
              Sistem Informasi Pencatatan & Verifikasi Amalan Puasa Siswa
            </p>

            {/* Glowing Golden Horizon Line */}
            <div className="relative mt-2.5 mb-0.5 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_6px_#fef08a]" />
            </div>
          </div>
        </div>

        {/* Form Login */}
        <form onSubmit={handleMainSubmit} className="space-y-3 pt-0.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/70 text-red-200 text-xs font-semibold flex items-start gap-2 shadow-md animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Mini Ramadan Desert Line with Walking Camel */}
          <div className="relative pt-0.5 pb-0.5 px-1 overflow-hidden" title="Unta Berjalan di Bawah Langit Ramadhan">
            <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full shadow-[0_0_6px_rgba(251,191,36,0.4)]" />

            <div
              className="absolute bottom-[1px] pointer-events-none origin-bottom [animation:camelWalkTrack_14s_easeInOutSine_infinite]"
            >
              <div className="[animation:camelGait_0.65s_ease-in-out_infinite]">
                <svg
                  viewBox="0 0 44 36"
                  className="w-4.5 h-3.5 text-amber-300 fill-current drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                >
                  <path d="M38 6.5c0-1.8-2-3-3.6-2-1.2.8-1 2.5-1 3.8l-2.4 4.5c-1.3-.4-2.8-1.2-4.5-1.2-2 0-3.8 1-4.8 2.2-1.4-1-3-1.6-4.6-1.3-2.2.3-3.8 1.8-4.3 3.8h-.8c-.8 0-1.5.8-1.5 1.8 0 1.2.4 2.4 1 3.2l-.5 7c0 .8.6 1.5 1.5 1.5.8 0 1.4-.6 1.5-1.4l.5-6.2h3.2l.5 6.2c.1.8.7 1.4 1.5 1.4.8 0 1.5-.7 1.5-1.5l-.5-7c1.8-.4 3.5-1.5 4.4-3l.5 8.5c0 .8.6 1.5 1.5 1.5.8 0 1.4-.6 1.5-1.4l.5-7h2.8l.5 7c.1.8.7 1.4 1.5 1.4.8 0 1.5-.7 1.5-1.5l-.7-8.2c1.5-1.8 1.8-4.4.7-6.6l-.3-3.8c.8-1 2.2-2.2 2.2-3.8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* USERNAME Field (Neon Cyan/Teal Stroke Pill Container) */}
          <div>
            <label className="block text-[11px] font-black text-amber-300/95 uppercase tracking-[0.15em] mb-1">
              USERNAME
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-300">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#022228]/60 border-2 border-teal-400/80 rounded-xl text-white placeholder-teal-300/40 focus:bg-[#021b20]/90 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-300 transition-all shadow-[0_0_12px_rgba(20,184,166,0.2)]"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* PASSWORD Field (Neon Cyan/Teal Stroke Pill Container) */}
          <div>
            <label className="block text-[11px] font-black text-amber-300/95 uppercase tracking-[0.15em] mb-1">
              PASSWORD
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-300">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#022228]/60 border-2 border-teal-400/80 rounded-xl text-white placeholder-teal-300/40 focus:bg-[#021b20]/90 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-300 transition-all shadow-[0_0_12px_rgba(20,184,166,0.2)]"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Button: Masuk ke Sistem (Gradient Teal-Emerald to Olive-Amber) */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0d5959] via-[#0e6955] to-[#786118] hover:from-[#116e6e] hover:via-[#138068] hover:to-[#8c711c] text-white font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(20,184,166,0.25)] border border-teal-300/50 hover:border-amber-300 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-2.5 active:scale-98"
          >
            <span>Masuk ke Sistem</span>
            <ArrowRight className="w-4 h-4 text-amber-200" />
          </button>

          {/* Button: Pencatatan Haid (Gradient Wine-Crimson with Rose Glow) & Button: Presensi Sholat */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setLoginMode('haid');
              }}
              className="w-full py-2 px-2.5 rounded-xl text-[11.5px] font-black bg-gradient-to-r from-[#6b1435] via-[#881337] to-[#b91c5c] hover:from-[#801840] hover:via-[#9f1642] hover:to-[#cf2068] text-pink-100 border border-pink-400/60 shadow-[0_0_16px_rgba(244,114,182,0.25)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Droplets className="w-3.5 h-3.5 text-pink-300 shrink-0" />
              <span>Catat Haid</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setLoginMode('sholat');
              }}
              className="w-full py-2 px-2.5 rounded-xl text-[11.5px] font-black bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#0f766e] hover:from-[#065f46] hover:via-[#059669] hover:to-[#115e59] text-emerald-100 border border-emerald-400/60 shadow-[0_0_16px_rgba(16,185,129,0.25)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>Presensi Sholat</span>
            </button>
          </div>
        </form>

        {/* Action Shortcuts: Prayer Times, Wisdom & PWA Install */}
        <div className="space-y-1.5 pt-0.5">
          {onOpenPrayerModal && (
            <button
              type="button"
              onClick={onOpenPrayerModal}
              className="w-full py-2 px-3 rounded-xl text-[11.5px] font-black flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-950/90 via-[#033c2a] to-emerald-950/90 hover:from-emerald-900 hover:to-emerald-900 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.12)] transition-all cursor-pointer backdrop-blur-xs"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Jadwal Sholat & Imsakiyah Kediri</span>
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            </button>
          )}

          {onOpenWisdomModal && (
            <button
              type="button"
              onClick={onOpenWisdomModal}
              className="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 bg-[#021f26]/80 hover:bg-[#032e38] text-teal-200 border border-teal-700/60 shadow-xs transition-all cursor-pointer backdrop-blur-xs"
            >
              <Moon className="w-3 h-3 text-amber-300 fill-amber-300/30" />
              <span>Mutiara Hikmah Puasa</span>
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            </button>
          )}

          {onOpenSurahsModal && (
            <button
              type="button"
              onClick={onOpenSurahsModal}
              className="w-full py-1.5 px-3 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 bg-[#021f26]/80 hover:bg-[#032e38] text-amber-200 border border-teal-500/50 shadow-xs transition-all cursor-pointer backdrop-blur-xs"
            >
              <BookOpen className="w-3 h-3 text-amber-300" />
              <span>Juz 'Amma, Yasin, Dzikir & Doa</span>
              <span className="text-[9.5px] px-1 py-0.1 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Lengkap
              </span>
            </button>
          )}

          {!isPwaInstalled && onInstallPwa && (
            <button
              type="button"
              onClick={onInstallPwa}
              className="w-full py-2 px-3 rounded-xl text-[11.5px] font-black flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 text-emerald-950 shadow-[0_0_12px_rgba(251,191,36,0.25)] border border-amber-300 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pasang Aplikasi PUASAKU (PWA)</span>
              <Sparkles className="w-3 h-3 text-emerald-950 animate-pulse" />
            </button>
          )}
        </div>

        {/* Clean Footer Info */}
        <div className="pt-2.5 border-t border-teal-900/60 text-center space-y-0.5">
          <p className="text-[10px] text-teal-300/90 flex items-center justify-center gap-1 font-medium">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            Portal Terproteksi • SMP / SMA SRT 1 Kediri
          </p>
          <p className="text-[10px] text-teal-400/80 flex items-center justify-center gap-1 font-medium">
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

