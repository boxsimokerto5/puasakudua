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
      className="group relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/90 via-[#043d2c]/90 to-emerald-950/90 hover:from-[#054935] hover:to-[#054935] border border-amber-400/50 hover:border-amber-300 text-xs shadow-[0_0_12px_rgba(251,191,36,0.18)] transition-all cursor-pointer select-none backdrop-blur-xs shrink-0"
    >
      {/* Subtle indicator pulse */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300" />
      </span>

      {/* Prayer Name & Time */}
      <div className="flex items-center gap-1.5 font-bold">
        <span className="text-amber-300 flex items-center gap-1">
          <Moon className="w-3 h-3 fill-amber-300/30 text-amber-300" />
          <span>{nextPrayer.name}</span>
        </span>
        <span className="text-emerald-200 font-mono text-[11px] bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-700/60">
          {nextPrayer.time}
        </span>
      </div>

      {/* Digital Countdown */}
      <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono font-black text-amber-200 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
        <Clock className="w-3 h-3 text-amber-400" />
        <span>-{nextPrayer.formattedCountdown}</span>
      </div>

      <Sparkles className="w-3 h-3 text-amber-300 group-hover:animate-spin" style={{ animationDuration: '4s' }} />
    </button>
  );
};
