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
      setCurrentIndex((prev) => {
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

  const handleNextWisdom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % FASTING_WISDOM_LIST.length);
    setIsCopied(false);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in cursor-pointer select-none"
    >
      {/* Modal Keyframes for Ramadan Ambience */}
      <style>{`
        @keyframes wisdomLantern {
          0%, 100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }
      `}</style>

      {/* Main Glassmorphic Ramadan Card (Slim & Single Screen) */}
      <div
        onClick={onClose}
        className="relative w-full max-w-md bg-gradient-to-b from-[#022319] via-[#033425] to-[#011710] border border-amber-400/50 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white overflow-hidden my-auto cursor-pointer animate-in zoom-in-95 duration-200"
      >
        {/* Subtle Background Geometric Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {/* Ambient Top Glows */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Hanging Lantern Decoration on Top Left */}
        <div className="absolute -top-1 left-4 flex flex-col items-center origin-top pointer-events-none [animation:wisdomLantern_5s_ease-in-out_infinite]">
          <div className="w-0.5 h-8 bg-gradient-to-b from-amber-600/40 via-amber-400/60 to-amber-300" />
          <div className="w-3.5 h-5 rounded-b-lg rounded-t-xs bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)] flex items-center justify-center">
            <div className="w-1 h-2 bg-yellow-100 rounded-full animate-pulse shadow-[0_0_4px_#fef08a]" />
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-700/60 transition-colors cursor-pointer shadow-md"
          title="Tutup & Lanjutkan"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header - Slim & Compact */}
        <div className="relative z-10 pt-4 px-4 sm:px-5 text-center space-y-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/40 shadow-xs backdrop-blur-xs">
            <Moon className="w-3 h-3 text-amber-300 fill-amber-300/30" />
            <span>Mutiara Hikmah Puasa</span>
            <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          <h2 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-tight leading-snug">
            {currentWisdom.title}
          </h2>

          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs bg-gradient-to-r ${currentWisdom.badgeColor}`}
            >
              <BookOpen className="w-2.5 h-2.5" />
              {currentWisdom.categoryLabel}
            </span>
            {userName && (
              <span className="text-[10px] text-emerald-300/80 truncate max-w-[200px]">
                • untuk {userName}
              </span>
            )}
          </div>
        </div>

        {/* Modal Body: Slim & Compact Content */}
        <div className="relative z-10 p-3.5 sm:p-4 space-y-2.5">
          {/* Arabic Verse / Hadith Container */}
          {currentWisdom.arabic && (
            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-center shadow-inner">
              <p
                className="text-sm sm:text-base font-serif text-amber-200 leading-relaxed font-bold tracking-wide"
                dir="rtl"
              >
                {currentWisdom.arabic}
              </p>
            </div>
          )}

          {/* Translation Quote Box */}
          <div className="relative p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-900/50 via-emerald-950/70 to-emerald-900/40 border border-amber-400/30 shadow-xs">
            <p className="text-[11px] sm:text-xs text-emerald-50 leading-relaxed italic">
              "{currentWisdom.translation}"
            </p>

            <div className="mt-2 pt-1.5 border-t border-emerald-800/80 flex items-center justify-between text-[10px] text-amber-300/90 font-semibold">
              <span className="truncate pr-2">📚 {currentWisdom.source}</span>
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 shrink-0">
                <HeartHandshake className="w-2.5 h-2.5 text-amber-400" />
                Shahih
              </span>
            </div>
          </div>

          {/* Explanation / Tafsir Singkat */}
          <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-[10px] sm:text-[11px] text-emerald-200/95 leading-relaxed">
            <strong className="text-amber-300 font-bold block mb-0.5">💡 Renungan Hikmah:</strong>
            {currentWisdom.explanation}
          </div>

          {/* Hourly Auto-Rotation Info */}
          <div className="flex items-center justify-between text-[10px] text-emerald-400/90 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-800/60">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-amber-400" />
              Ganti otomatis tiap jam
            </span>
            <span className="text-amber-300 font-bold">
              {minutesToNextHour}m lagi ({currentIndex + 1}/{FASTING_WISDOM_LIST.length})
            </span>
          </div>
        </div>

        {/* Modal Footer: Action Buttons & Touch Hint */}
        <div className="relative z-10 px-3.5 sm:px-4 py-2.5 border-t border-emerald-800/60 bg-emerald-950/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {/* Shuffle/Next Button */}
            <button
              type="button"
              onClick={handleNextWisdom}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 hover:border-amber-400/60 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Lihat kata mutiara hikmah lainnya"
            >
              <Shuffle className="w-3 h-3 text-amber-300" />
              <span>Ganti</span>
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 hover:border-amber-400/60 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Salin kata mutiara ini"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-amber-300" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>

          {/* Dismiss button & touch hint */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 text-emerald-950 border border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.35)] transition-all cursor-pointer active:scale-95"
          >
            <span>Tutup</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-950" />
          </button>
        </div>

        {/* Bottom subtle dismiss hint */}
        <div className="bg-emerald-950/90 py-1 text-center border-t border-emerald-900/60">
          <p className="text-[9.5px] text-emerald-400/70 font-medium">
            ✨ Sentuh di mana saja untuk menutup
          </p>
        </div>
      </div>
    </div>
  );
};

