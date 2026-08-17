import React, { useState, useEffect, useMemo } from 'react';
import {
  FASTING_WISDOM_LIST,
  FastingWisdom,
  getHourlyWisdomIndex,
} from '../data/fastingWisdom';
import {
  Sparkles,
  Moon,
  X,
  Shuffle,
  Check,
  Copy,
  BookOpen,
  ArrowRight,
  Clock,
  HeartHandshake,
} from 'lucide-react';

interface FastingWisdomModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  roleName?: string;
}

export const FastingWisdomModal: React.FC<FastingWisdomModalProps> = ({
  isOpen,
  onClose,
  userName,
  roleName,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(() => getHourlyWisdomIndex());
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [minutesToNextHour, setMinutesToNextHour] = useState<number>(() => {
    const now = new Date();
    return 60 - now.getMinutes();
  });

  // Keep hourly index in sync and track countdown to next hour
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setMinutesToNextHour(60 - now.getMinutes());
      const hourlyIdx = getHourlyWisdomIndex(now.getTime());
      // If modal just opens, ensure default is current hourly index
      setCurrentIndex((prev) => {
        // If user hasn't manually clicked next recently, keep hourly index
        return (prev === getHourlyWisdomIndex(now.getTime() - 60000)) ? hourlyIdx : prev;
      });
    };

    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // When modal is reopened, reset to current hourly wisdom
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(getHourlyWisdomIndex());
      setIsCopied(false);
    }
  }, [isOpen]);

  const currentWisdom: FastingWisdom = useMemo(() => {
    return FASTING_WISDOM_LIST[currentIndex % FASTING_WISDOM_LIST.length] || FASTING_WISDOM_LIST[0];
  }, [currentIndex]);

  const handleNextWisdom = () => {
    setCurrentIndex((prev) => (prev + 1) % FASTING_WISDOM_LIST.length);
    setIsCopied(false);
  };

  const handleCopy = () => {
    const textToCopy = `✨ *${currentWisdom.title}* (${currentWisdom.categoryLabel})\n\n${
      currentWisdom.arabic ? currentWisdom.arabic + '\n\n' : ''
    }${currentWisdom.translation}\n\n📚 *Sumber*: ${currentWisdom.source}\n💡 *Hikmah*: ${
      currentWisdom.explanation
    }\n\n— *PUASAKU SRT 1 KEDIRI*`;

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Modal Keyframes for Ramadan Ambience */}
      <style>{`
        @keyframes wisdomStarGlow {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
            filter: drop-shadow(0 0 6px #fef08a);
          }
        }
        @keyframes wisdomLantern {
          0%, 100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }
      `}</style>

      {/* Main Glassmorphic Ramadan Card */}
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#022319] via-[#033425] to-[#011710] border-2 border-amber-400/50 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-white overflow-hidden my-auto">
        {/* Subtle Background Geometric Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

        {/* Ambient Top Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Hanging Lantern Decoration on Top Left */}
        <div className="absolute -top-1 left-6 flex flex-col items-center origin-top pointer-events-none [animation:wisdomLantern_5s_ease-in-out_infinite]">
          <div className="w-0.5 h-12 bg-gradient-to-b from-amber-600/40 via-amber-400/60 to-amber-300" />
          <div className="w-4 h-6 rounded-b-xl rounded-t-xs bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)] flex items-center justify-center">
            <div className="w-1.5 h-2.5 bg-yellow-100 rounded-full animate-pulse shadow-[0_0_6px_#fef08a]" />
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-emerald-950/70 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-700/60 transition-colors cursor-pointer shadow-md"
          title="Tutup & Lanjutkan"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="relative z-10 pt-7 px-6 sm:px-8 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-amber-400/15 text-amber-300 border border-amber-400/40 shadow-xs backdrop-blur-xs">
            <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
            <span>Mutiara Hikmah Puasa</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 font-sans tracking-wide">
            {currentWisdom.title}
          </h2>

          <div className="flex items-center justify-center gap-2 pt-0.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white shadow-xs bg-gradient-to-r ${currentWisdom.badgeColor}`}
            >
              <BookOpen className="w-3 h-3" />
              {currentWisdom.categoryLabel}
            </span>
          </div>

          {userName && (
            <p className="text-xs text-emerald-300/90 font-medium">
              Selamat datang, <strong className="text-amber-200">{userName}</strong>{' '}
              {roleName ? `(${roleName})` : ''} • Semoga hari ini penuh berkah!
            </p>
          )}
        </div>

        {/* Modal Body: Content & Hadith */}
        <div className="relative z-10 p-6 sm:p-8 space-y-5">
          {/* Arabic Verse / Hadith Container */}
          {currentWisdom.arabic && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 text-center shadow-inner">
              <p
                className="text-lg sm:text-xl font-serif text-amber-200 leading-relaxed font-bold tracking-wide"
                dir="rtl"
              >
                {currentWisdom.arabic}
              </p>
            </div>
          )}

          {/* Translation Quote Box */}
          <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-900/50 via-emerald-950/70 to-emerald-900/40 border border-amber-400/30 shadow-md">
            <div className="absolute -top-3 left-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-emerald-950 border border-amber-300">
              Terjemahan & Makna
            </div>

            <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed italic pt-1">
              {currentWisdom.translation}
            </p>

            <div className="mt-3 pt-2.5 border-t border-emerald-800/80 flex items-center justify-between text-[11px] text-amber-300/90 font-semibold">
              <span>{currentWisdom.source}</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <HeartHandshake className="w-3 h-3 text-amber-400" />
                Shahih
              </span>
            </div>
          </div>

          {/* Explanation / Tafsir Singkat */}
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-xs text-emerald-200/95 leading-relaxed">
            <strong className="text-amber-300 font-bold block mb-1">💡 Renungan Hikmah:</strong>
            {currentWisdom.explanation}
          </div>

          {/* Hourly Auto-Rotation Info */}
          <div className="flex items-center justify-between text-[11px] text-emerald-400/90 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Berganti otomatis setiap 1 jam
            </span>
            <span className="text-amber-300 font-bold">
              {minutesToNextHour} menit lagi ({currentIndex + 1}/{FASTING_WISDOM_LIST.length})
            </span>
          </div>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="relative z-10 px-6 sm:px-8 pb-7 pt-1 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-emerald-800/60 bg-emerald-950/40">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Shuffle/Next Button */}
            <button
              type="button"
              onClick={handleNextWisdom}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 hover:border-amber-400/60 transition-all cursor-pointer shadow-xs"
              title="Lihat kata mutiara hikmah lainnya"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-300" />
              <span>Hikmah Lainnya</span>
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 hover:border-amber-400/60 transition-all cursor-pointer shadow-xs"
              title="Salin kata mutiara ini"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>

          {/* Close & Continue to App */}
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 text-emerald-950 border border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all cursor-pointer"
          >
            <span>Buka & Lanjutkan Aplikasi</span>
            <ArrowRight className="w-4 h-4 text-emerald-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
