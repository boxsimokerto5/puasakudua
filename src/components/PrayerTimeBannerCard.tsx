import React, { useState, useEffect } from 'react';
import {
  CityLocation,
  INDONESIA_CITIES,
  getPrayerLiveStatus,
} from '../utils/prayerTimes';
import {
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Sparkles,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Maximize2,
  BookOpen,
} from 'lucide-react';

interface PrayerTimeBannerCardProps {
  onOpenModal: () => void;
  onOpenSurahsModal?: () => void;
  city?: CityLocation;
}

export const PrayerTimeBannerCard: React.FC<PrayerTimeBannerCardProps> = ({
  onOpenModal,
  onOpenSurahsModal,
  city = INDONESIA_CITIES[0],
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { schedule, items, nextPrayer } = getPrayerLiveStatus(now, city);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#022c20] via-[#043d2c] to-[#02281c] border border-amber-400/40 shadow-lg text-white">
      {/* Subtle Pattern & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Bar */}
      <div className="relative z-10 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Location & Active/Next Info */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-xs text-amber-300 font-bold">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{city.name}</span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-emerald-300 font-medium">Menuju</span>
            <span className="font-black text-amber-200 flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
              {nextPrayer.name} ({nextPrayer.time} WIB)
            </span>
          </div>
        </div>

        {/* Center: Live Digital Countdown */}
        <div className="flex items-center gap-2 bg-emerald-950/90 border border-amber-400/50 px-3 py-1 rounded-xl shadow-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-medium text-emerald-300 hidden sm:inline">Tersisa:</span>
          <span className="text-sm sm:text-base font-mono font-black text-amber-300 tracking-wider">
            {nextPrayer.formattedCountdown}
          </span>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0 flex-wrap">
          {/* Quick Surat Pendek, Yasin & Tahlil Popup Trigger */}
          {onOpenSurahsModal && (
            <button
              type="button"
              onClick={onOpenSurahsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-teal-500/20 via-emerald-400/25 to-teal-500/20 hover:from-teal-500/40 hover:to-emerald-400/40 text-emerald-100 hover:text-white border border-emerald-400/50 shadow-xs transition-all cursor-pointer"
              title="Buka Pop-up Juz 'Amma, Surat Yasin, Tahlil, Mahalul Qiyam, Dzikir Sholat & Doa Harian"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>Surat, Yasin, Dzikir & Doa</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 transition-colors cursor-pointer"
            title={isExpanded ? 'Sembunyikan jadwal' : 'Lihat semua waktu sholat'}
          >
            <span>{isExpanded ? 'Ringkas' : '8 Waktu'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onOpenModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 text-emerald-950 border border-amber-300 shadow-xs transition-all cursor-pointer"
            title="Buka Jadwal Lengkap & Doa Berbuka"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden xs:inline">Jadwal</span>
            <Sparkles className="w-3 h-3 text-emerald-950 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Expandable Horizontal 8-Times Strip */}
      {isExpanded && (
        <div className="relative z-10 px-4 sm:px-6 pb-3 pt-1 border-t border-emerald-800/60 bg-emerald-950/50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2">
            {items.map((item) => (
              <div
                key={item.key}
                className={`p-2 rounded-xl border text-center transition-all ${
                  item.isNext
                    ? 'bg-amber-400/20 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/50'
                    : 'bg-emerald-950/60 border-emerald-800/60'
                }`}
              >
                <div className="text-[10px] font-bold text-emerald-300 truncate">{item.name}</div>
                <div className="text-xs sm:text-sm font-mono font-black text-amber-200 mt-0.5">
                  {item.time}
                </div>
                {item.isNext && (
                  <span className="inline-block mt-1 text-[9px] font-bold bg-amber-400 text-emerald-950 px-1.5 py-0.2 rounded-full">
                    Berikutnya
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
