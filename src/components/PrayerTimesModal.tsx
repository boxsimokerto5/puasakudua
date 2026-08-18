import React, { useState, useEffect } from 'react';
import {
  INDONESIA_CITIES,
  CityLocation,
  getPrayerLiveStatus,
  PrayerItemInfo,
  NextPrayerInfo,
  PrayerSchedule,
} from '../utils/prayerTimes';
import {
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Sparkles,
  X,
  MapPin,
  Clock,
  Volume2,
  Calendar,
  Heart,
  BookOpen,
  Check,
  ChevronRight,
  ShieldCheck,
  SunMedium,
  SunDim,
} from 'lucide-react';

interface PrayerTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity?: CityLocation;
  onCityChange?: (city: CityLocation) => void;
}

export const PrayerTimesModal: React.FC<PrayerTimesModalProps> = ({
  isOpen,
  onClose,
  selectedCity = INDONESIA_CITIES[0],
  onCityChange,
}) => {
  const [currentCity, setCurrentCity] = useState<CityLocation>(selectedCity);
  const [now, setNow] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'jadwal' | 'doa_adab'>('jadwal');

  // Live real-time tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const liveStatus = getPrayerLiveStatus(now, currentCity);
  const { schedule, items, nextPrayer } = liveStatus;

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    const found = INDONESIA_CITIES.find((c) => c.name === cityName) || INDONESIA_CITIES[0];
    setCurrentCity(found);
    if (onCityChange) {
      onCityChange(found);
    }
  };

  const getPrayerIcon = (key: PrayerItemInfo['key']) => {
    switch (key) {
      case 'imsak':
        return <Moon className="w-5 h-5 text-amber-300 fill-amber-300/30" />;
      case 'subuh':
        return <Sunrise className="w-5 h-5 text-amber-300" />;
      case 'terbit':
        return <Sun className="w-5 h-5 text-yellow-300" />;
      case 'dhuha':
        return <SunDim className="w-5 h-5 text-amber-200" />;
      case 'dzuhur':
        return <SunMedium className="w-5 h-5 text-yellow-200" />;
      case 'ashar':
        return <Sunset className="w-5 h-5 text-orange-300" />;
      case 'maghrib':
        return <Moon className="w-5 h-5 text-amber-400 fill-amber-400/40" />;
      case 'isya':
        return <Sparkles className="w-5 h-5 text-cyan-300" />;
      default:
        return <Clock className="w-5 h-5 text-amber-300" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Keyframe animations for glow & stars */}
      <style>{`
        @keyframes prayerPulse {
          0%, 100% {
            box-shadow: 0 0 15px rgba(251, 191, 36, 0.4), inset 0 0 10px rgba(251, 191, 36, 0.2);
          }
          50% {
            box-shadow: 0 0 25px rgba(251, 191, 36, 0.7), inset 0 0 15px rgba(251, 191, 36, 0.35);
          }
        }
        @keyframes prayerLantern {
          0%, 100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }
      `}</style>

      {/* Main Glassmorphic Card */}
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#022319] via-[#033425] to-[#011710] border-2 border-amber-400/50 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-white overflow-hidden my-auto">
        {/* Subtle Geometric Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

        {/* Top Ambient Glow Rings */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Ramadan Hanging Lantern */}
        <div className="absolute -top-1 left-6 flex flex-col items-center origin-top pointer-events-none [animation:prayerLantern_5s_ease-in-out_infinite]">
          <div className="w-0.5 h-12 bg-gradient-to-b from-amber-600/40 via-amber-400/60 to-amber-300" />
          <div className="w-4 h-6 rounded-b-xl rounded-t-xs bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)] flex items-center justify-center">
            <div className="w-1.5 h-2.5 bg-yellow-100 rounded-full animate-pulse shadow-[0_0_6px_#fef08a]" />
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-emerald-950/80 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-700/60 transition-colors cursor-pointer shadow-md"
          title="Tutup Jadwal Sholat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="relative z-10 pt-7 px-6 sm:px-8 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-amber-400/15 text-amber-300 border border-amber-400/40 shadow-xs backdrop-blur-xs">
            <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
            <span>Jadwal Sholat & Imsakiyah Harian</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 font-sans tracking-wide">
            Waktu Sholat & Berbuka Puasa
          </h2>

          {/* Date and Location Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-emerald-200">
            <div className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-700/60 px-3 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>{schedule.dateStr}</span>
              <span className="text-amber-300 font-semibold">• {schedule.hijriDateStr}</span>
            </div>

            {/* City Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-emerald-950/90 border border-amber-400/50 px-3 py-1 rounded-full text-amber-300 font-bold shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={currentCity.name}
                onChange={handleCitySelect}
                aria-label="Pilih Kota Wilayah Waktu Sholat"
                className="bg-transparent text-amber-200 font-bold text-xs focus:outline-none cursor-pointer pr-1"
              >
                {INDONESIA_CITIES.map((c) => (
                  <option key={c.name} value={c.name} className="bg-emerald-950 text-emerald-100">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Hero Countdown Banner */}
        <div className="relative z-10 mx-6 sm:mx-8 mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#044432]/90 to-emerald-950/90 border-2 border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.25)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/50 flex items-center justify-center shadow-inner shrink-0 text-amber-300">
              {getPrayerIcon(nextPrayer.key as any)}
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-start">
                <Clock className="w-3 h-3 text-amber-400" />
                Menuju Waktu Sholat Berikutnya:
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-200 flex items-center gap-2 justify-center sm:justify-start">
                <span>{nextPrayer.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {nextPrayer.time} WIB
                </span>
              </div>
            </div>
          </div>

          {/* Big Live Digital Clock Countdown */}
          <div className="flex flex-col items-center sm:items-end">
            <div className="text-2xl sm:text-3xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-wider drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
              {nextPrayer.formattedCountdown}
            </div>
            <div className="text-[10px] text-emerald-300/90 font-medium">
              Waktu sekarang: {now.toLocaleTimeString('id-ID')} WIB
            </div>
          </div>
        </div>

        {/* Tab Switcher: Jadwal Sholat vs Doa & Adab */}
        <div className="relative z-10 px-6 sm:px-8 mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('jadwal')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'jadwal'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-emerald-950 shadow-md border border-amber-300'
                : 'bg-emerald-950/70 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Jadwal 8 Waktu Lengkap</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('doa_adab')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'doa_adab'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-emerald-950 shadow-md border border-amber-300'
                : 'bg-emerald-950/70 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Doa Buka & Sahur Puasa</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="relative z-10 p-6 sm:p-8 pt-4 space-y-4">
          {activeTab === 'jadwal' ? (
            /* 8-Prayer Grid Display */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {items.map((item) => (
                <div
                  key={item.key}
                  className={`relative p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                    item.isNext
                      ? 'bg-gradient-to-b from-amber-500/30 via-emerald-900/90 to-emerald-950 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.35)] scale-[1.02] z-10'
                      : item.isActive
                      ? 'bg-emerald-900/60 border-emerald-500/70 shadow-sm'
                      : 'bg-emerald-950/60 border-emerald-800/60 hover:border-emerald-700'
                  }`}
                >
                  {item.isNext && (
                    <div className="absolute -top-2 right-2 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400 text-emerald-950 border border-amber-200 shadow-xs animate-pulse">
                      Berikutnya
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-1.5">
                    <div className="p-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60">
                      {getPrayerIcon(item.key)}
                    </div>
                    <span className="text-[10px] font-serif font-bold text-emerald-300/80">
                      {item.arabic}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-emerald-100 flex items-center gap-1">
                      <span>{item.name}</span>
                    </div>
                    <div className="text-lg sm:text-xl font-black font-mono text-amber-200 tracking-tight mt-0.5">
                      {item.time}
                    </div>
                  </div>

                  <div className="text-[10px] text-emerald-300/70 mt-1 line-clamp-1" title={item.description}>
                    {item.description}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Doa Berbuka, Sahur & Adab Sholat */
            <div className="space-y-3.5">
              {/* Doa Berbuka Puasa (Shahih) */}
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-amber-400/40 shadow-inner space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-amber-300">
                  <span>✨ Doa Berbuka Puasa (HR. Abu Dawud no. 2357 - Shahih)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 text-[10px]">Sunnah</span>
                </div>
                <p className="text-right font-serif text-lg text-amber-200 font-bold leading-relaxed pt-1" dir="rtl">
                  ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ
                </p>
                <p className="text-xs text-emerald-100 italic">
                  “Dzahabadh zhoma-u, wabtallatil ‘uruuqu, wa tsabatal ajru in syaa-Allah”
                </p>
                <p className="text-[11px] text-emerald-300/90">
                  Artinya: “Telah hilang rasa haus, telah basah urat-urat nadi, dan telah pasti pahala insya Allah.”
                </p>
              </div>

              {/* Doa Niat Puasa & Sahur */}
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 shadow-inner space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-amber-300">
                  <span>🌙 Niat Puasa Sunnah Senin / Kamis</span>
                </div>
                <p className="text-right font-serif text-base text-amber-200 font-bold leading-relaxed pt-1" dir="rtl">
                  نَوَيْتُ صَوْمَ يَوْمِ الِاثْنَيْنِ / الْخَمِيسِ سُنَّةً لِلَّهِ تَعَالَى
                </p>
                <p className="text-xs text-emerald-100 italic">
                  “Nawaitu shauma yaumal itsnaini / khamisi sunnatan lillaahi ta‘aalaa”
                </p>
                <p className="text-[11px] text-emerald-300/90">
                  Artinya: “Saya niat berpuasa sunnah hari Senin / Kamis karena Allah Ta’ala.”
                </p>
              </div>
            </div>
          )}

          {/* Footer Safety / Kemenag Info */}
          <div className="flex items-center justify-between text-[11px] text-emerald-400/90 bg-emerald-950/60 px-3.5 py-2 rounded-xl border border-emerald-800/60">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Hisab Ephemeris Standar Kemenag RI (+2 menit Ihtiyat)
            </span>
            <span className="text-amber-300 font-bold">Akurasi GPS / Astronomis</span>
          </div>
        </div>

        {/* Modal Footer Button */}
        <div className="relative z-10 px-6 sm:px-8 pb-7 pt-1 flex items-center justify-end border-t border-emerald-800/60 bg-emerald-950/40">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 text-emerald-950 border border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all cursor-pointer"
          >
            <span>Tutup & Kembali</span>
            <ChevronRight className="w-4 h-4 text-emerald-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
