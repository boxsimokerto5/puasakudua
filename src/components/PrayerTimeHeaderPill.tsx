import React, { useState, useEffect } from 'react';
import {
  INDONESIA_CITIES,
  CityLocation,
  getPrayerLiveStatus,
} from '../utils/prayerTimes';
import { Clock, Moon, Sparkles } from 'lucide-react';

interface PrayerTimeHeaderPillProps {
  onOpenModal: () => void;
  city?: CityLocation;
}

export const PrayerTimeHeaderPill: React.FC<PrayerTimeHeaderPillProps> = ({
  onOpenModal,
  city = INDONESIA_CITIES[0],
}) => {
  const [now, setNow] = useState<Date>(new Date());

  // 1-second interval for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { nextPrayer } = getPrayerLiveStatus(now, city);

  return (
    <button
      type="button"
      onClick={onOpenModal}
      title={`Jadwal Sholat ${city.name}: Menuju ${nextPrayer.name} (${nextPrayer.time} WIB) - Klik untuk jadwal lengkap`}
      className="group relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-[#043d2c] border border-amber-400/40 hover:border-amber-300 text-[11px] sm:text-xs shadow-xs transition-all cursor-pointer select-none backdrop-blur-xs shrink-0"
    >
      {/* Subtle indicator pulse */}
      <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-amber-300" />
      </span>

      {/* Prayer Name & Time */}
      <div className="flex items-center gap-1 font-bold whitespace-nowrap">
        <span className="text-amber-300 flex items-center gap-1">
          <Moon className="w-3 h-3 fill-amber-300/30 text-amber-300 shrink-0" />
          <span>{nextPrayer.name}</span>
        </span>
        <span className="text-emerald-200 font-mono text-[10px] sm:text-[11px] bg-black/30 px-1.5 py-0.5 rounded border border-emerald-700/50">
          {nextPrayer.time}
        </span>
      </div>

      {/* Digital Countdown */}
      <div className="hidden xl:flex items-center gap-1 text-[10px] font-mono font-black text-amber-200 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
        <Clock className="w-3 h-3 text-amber-400" />
        <span>-{nextPrayer.formattedCountdown}</span>
      </div>

      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 opacity-70 group-hover:opacity-100" />
    </button>
  );
};
