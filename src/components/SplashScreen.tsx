import React, { useEffect, useState, useMemo } from 'react';
import { Sparkles, ArrowRight, Moon } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

interface StarParticle {
  id: number;
  top: number; // percentage
  left: number; // percentage
  size: number; // px
  opacity: number;
  duration: number; // seconds
  delay: number; // seconds
  color: string; // color class or hex
  isSparkle?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 2400,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  // Generate organic Ramadan stars field
  const stars = useMemo<StarParticle[]>(() => {
    const starList: StarParticle[] = [];
    const colors = [
      '#fef08a', // amber/yellow 200
      '#fde047', // yellow 300
      '#ffffff', // bright white
      '#6ee7b7', // emerald 300
      '#fbbf24', // amber 400
    ];

    // Generate 45 varied background twinkling stars
    for (let i = 0; i < 48; i++) {
      const isSparkle = i % 7 === 0;
      starList.push({
        id: i,
        top: Math.random() * 95,
        left: Math.random() * 96 + 2,
        size: isSparkle ? Math.random() * 8 + 8 : Math.random() * 3.5 + 1.5,
        opacity: Math.random() * 0.6 + 0.35,
        duration: Math.random() * 2.5 + 1.5,
        delay: Math.random() * 2,
        color: colors[i % colors.length],
        isSparkle,
      });
    }
    return starList;
  }, []);

  useEffect(() => {
    // Smooth progress timer
    const intervalTime = 30;
    const step = 100 / (durationMs / intervalTime);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    // Trigger fade out slightly before finish
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(0, durationMs - 400));

    // Finish splash screen
    const finishTimer = setTimeout(() => {
      onFinish();
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onFinish, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between py-10 px-6 bg-gradient-to-b from-[#022319] via-[#032f22] to-[#01140e] text-white transition-opacity duration-500 cursor-pointer select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Dynamic Keyframes for Ramadan Twinkling Stars & Shooting Star */}
      <style>{`
        @keyframes twinkleStar {
          0%, 100% {
            opacity: 0.15;
            transform: scale(0.7) translateY(0px);
          }
          50% {
            opacity: 1;
            transform: scale(1.3) translateY(-2px);
            filter: drop-shadow(0 0 6px currentColor);
          }
        }
        @keyframes shootingStar {
          0% {
            transform: translateX(0) translateY(0) rotate(-35deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          60% {
            opacity: 1;
          }
          100% {
            transform: translateX(-400px) translateY(300px) rotate(-35deg);
            opacity: 0;
          }
        }
        @keyframes gentleSway {
          0%, 100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }
        @keyframes moonGlow {
          0%, 100% {
            filter: drop-shadow(0 0 15px rgba(253, 224, 71, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 28px rgba(253, 224, 71, 0.75));
          }
        }
      `}</style>

      {/* Atmospheric Starry Night Background with Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Deep Islamic Geometric Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px] opacity-10" />

        {/* Ambient Top Lantern & Crescent Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-8 sm:right-16 text-amber-300/80 pointer-events-none [animation:moonGlow_4s_ease-in-out_infinite]">
          {/* Subtle Crescent Moon */}
          <Moon className="w-8 h-8 sm:w-10 sm:h-10 text-amber-200 fill-amber-300/20" />
        </div>

        {/* Ramadan Hanging Lanterns on Left & Right */}
        <div
          className="absolute -top-2 left-6 sm:left-14 flex flex-col items-center origin-top pointer-events-none [animation:gentleSway_6s_ease-in-out_infinite]"
        >
          <div className="w-0.5 h-16 sm:h-24 bg-gradient-to-b from-amber-600/40 via-amber-400/60 to-amber-300" />
          <div className="w-5 h-7 sm:w-6 sm:h-8 rounded-b-xl rounded-t-sm bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.6)] flex items-center justify-center">
            <div className="w-2 h-3.5 bg-yellow-100 rounded-full animate-pulse shadow-[0_0_8px_#fef08a]" />
          </div>
        </div>

        <div
          className="absolute -top-2 right-16 sm:right-28 hidden sm:flex flex-col items-center origin-top pointer-events-none [animation:gentleSway_5s_ease-in-out_infinite_1s]"
        >
          <div className="w-0.5 h-12 bg-gradient-to-b from-amber-600/40 via-amber-400/60 to-amber-300" />
          <div className="w-4 h-6 rounded-b-lg rounded-t-xs bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)] flex items-center justify-center">
            <div className="w-1.5 h-2.5 bg-yellow-100 rounded-full animate-pulse shadow-[0_0_6px_#fef08a]" />
          </div>
        </div>

        {/* Shooting Star effect */}
        <div
          className="absolute top-8 right-10 w-28 h-0.5 bg-gradient-to-l from-amber-200 via-yellow-100 to-transparent pointer-events-none [animation:shootingStar_3.5s_ease-out_infinite_1.2s]"
        />

        {/* Twinkling Starry Field */}
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
              animation: `twinkleStar ${star.duration}s ease-in-out infinite ${star.delay}s`,
            }}
            className="pointer-events-none flex items-center justify-center"
          >
            {star.isSparkle ? (
              // 4-point Islamic Diamond Star
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full fill-current drop-shadow-[0_0_6px_currentColor]"
              >
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
            ) : (
              // Circular glowing star dot
              <div
                className="w-full h-full rounded-full shadow-[0_0_4px_currentColor]"
                style={{ backgroundColor: star.color }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Top institution tag */}
      <div className="relative z-10 text-center animate-fade-in pt-1">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold tracking-widest uppercase bg-emerald-900/80 text-amber-300 border border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.2)] backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          Sekolah Rakyat Terpadu
        </span>
      </div>

      {/* Center Brand / Logo & Name */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full space-y-6">
        {/* Animated Logo Container */}
        <div className="relative group">
          {/* Ambient Gold & Emerald Glow Ring */}
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/30 via-emerald-400/40 to-yellow-300/30 rounded-full blur-2xl animate-pulse" />

          {/* Golden Ring Border */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-2.5 bg-gradient-to-b from-emerald-800/80 via-emerald-950/90 to-[#021811] border-2 border-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.35)] flex items-center justify-center">
            <img
              src="/assets/logo.svg"
              alt="Logo Puasaku SRT 1 Kediri"
              className="w-full h-full object-contain drop-shadow-xl transform transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-4xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 drop-shadow-[0_2px_10px_rgba(251,191,36,0.4)] font-sans">
            PUASAKU
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1.5px] w-6 bg-gradient-to-r from-transparent via-amber-400 to-amber-300 rounded-full" />
            <p className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-emerald-200 uppercase">
              SRT 1 KEDIRI
            </p>
            <div className="h-[1.5px] w-6 bg-gradient-to-l from-transparent via-amber-400 to-amber-300 rounded-full" />
          </div>
          <p className="text-[11px] text-emerald-300/90 font-medium pt-1">
            Sistem Informasi Pencatatan & Verifikasi Amalan Puasa Siswa
          </p>
        </div>

        {/* Progress Loading Indicator */}
        <div className="w-44 sm:w-56 space-y-2 pt-2">
          <div className="h-2 w-full bg-emerald-950/90 rounded-full overflow-hidden border border-amber-400/40 p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 rounded-full transition-all duration-75 ease-out shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Footer & Skip prompt */}
      <div className="relative z-10 text-center space-y-2 pb-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="inline-flex items-center gap-1.5 text-xs text-amber-200/90 hover:text-white transition-all cursor-pointer bg-emerald-900/60 hover:bg-emerald-800/90 px-4 py-1.5 rounded-full border border-amber-400/40 shadow-xs backdrop-blur-xs"
        >
          <span>Masuk Aplikasi</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
        </button>
        <p className="text-[10px] text-emerald-400/80">
          © {new Date().getFullYear()} Sekolah Rakyat Kabupaten Kediri
        </p>
      </div>
    </div>
  );
};
