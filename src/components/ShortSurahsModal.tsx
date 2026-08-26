import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  SHORT_SURAHS_DATA,
  ShortSurah,
  SurahVerse,
} from '../data/shortSurahs';
import { SURAH_YASIN_DATA } from '../data/yasinData';
import { TAHLIL_DATA, TahlilItem } from '../data/tahlilData';
import { MAHALUL_QIYAM_DATA, MahalulQiyamVerse } from '../data/mahalulQiyamData';
import { DAILY_PRAYERS_DATA, DailyPrayer, PrayerCategory } from '../data/dailyPrayersData';
import { DZIKIR_SHOLAT_DATA, DzikirSholatItem } from '../data/dzikirSholatData';
import { useQuranAudioPlayer } from '../hooks/useQuranAudioPlayer';
import {
  BookOpen,
  Search,
  Volume2,
  Play,
  Pause,
  Copy,
  Check,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Headphones,
  Mic,
  Sliders,
  BookMarked,
  Scroll,
  RotateCcw,
  Plus,
  Heart,
  HeartHandshake,
  Info,
  Layers,
  Star,
  Moon,
} from 'lucide-react';

interface ShortSurahsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'juz_amma' | 'yasin' | 'tahlil' | 'mahalul_qiyam' | 'dzikir_sholat' | 'doa_harian';
}

/**
 * Reusable Ramadan Starry Sky Backdrop Component
 * Renders glowing celestial stars, twinkling particles, crescent moon, and festive Ramadan ambiance.
 */
const RamadanStarryBackdrop: React.FC<{
  variant?: 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan' | 'teal';
  showCrescent?: boolean;
}> = ({ variant = 'emerald', showCrescent = true }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Radiant Celestial Halo */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-amber-300/15 via-amber-400/5 to-transparent blur-xl pointer-events-none" />

      {/* Crescent Moon with Star */}
      {showCrescent && (
        <div className="absolute top-2 right-3 sm:right-6 opacity-30 flex items-center gap-1 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
          <div className="relative">
            <Moon className="w-8 h-8 sm:w-11 sm:h-11 text-amber-200 fill-amber-300/30 transform -rotate-12" />
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 fill-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
      )}

      {/* Floating Starlight Particles (Left Section) */}
      <div className="absolute top-2.5 left-4 opacity-80 animate-pulse">
        <Star className="w-3 h-3 text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
      </div>
      <div className="absolute top-6 left-12 opacity-65 animate-pulse" style={{ animationDuration: '3.2s' }}>
        <Sparkles className="w-2.5 h-2.5 text-amber-200" />
      </div>
      <div className="absolute top-3 left-28 opacity-70 animate-pulse" style={{ animationDuration: '2.1s' }}>
        <span className="text-[11px] text-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]">✦</span>
      </div>
      <div className="absolute bottom-3 left-10 opacity-55 animate-pulse" style={{ animationDuration: '3.8s' }}>
        <span className="text-[10px] text-amber-200">✧</span>
      </div>

      {/* Floating Starlight Particles (Center & Right Section) */}
      <div className="absolute top-3 right-20 sm:right-28 opacity-85 animate-pulse" style={{ animationDuration: '2.6s' }}>
        <Star className="w-3 h-3 text-amber-200 fill-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
      </div>
      <div className="absolute top-7 right-12 sm:right-16 opacity-60 animate-pulse" style={{ animationDuration: '3.5s' }}>
        <span className="text-[11px] text-amber-300">★</span>
      </div>
      <div className="absolute bottom-2.5 right-8 opacity-70 animate-pulse" style={{ animationDuration: '2.9s' }}>
        <Sparkles className="w-2.5 h-2.5 text-amber-300" />
      </div>
      <div className="absolute bottom-2 left-1/3 opacity-45 animate-pulse" style={{ animationDuration: '4.2s' }}>
        <span className="text-[10px] text-amber-200">✦</span>
      </div>
      <div className="absolute top-1/2 right-1/3 opacity-40 animate-pulse" style={{ animationDuration: '3.6s' }}>
        <Star className="w-2 h-2 text-amber-300 fill-amber-300" />
      </div>
    </div>
  );
};

export const ShortSurahsModal: React.FC<ShortSurahsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'juz_amma',
}) => {
  // Main Module Tab: Juz 'Amma, Surat Yasin, Tahlil, Mahalul Qiyam, Dzikir Sholat, or Doa Harian
  const [mainTab, setMainTab] = useState<'juz_amma' | 'yasin' | 'tahlil' | 'mahalul_qiyam' | 'dzikir_sholat' | 'doa_harian'>(initialTab);

  // Juz Amma Selected Surah
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Makkiyyah' | 'Madaniyyah'>('all');
  
  // Tahlil section filter & digital tasbih state
  const [tahlilSectionFilter, setTahlilSectionFilter] = useState<'all' | 'tawasul' | 'surat' | 'dzikir' | 'doa'>('all');
  const [tasbihCounts, setTasbihCounts] = useState<Record<number, number>>({});
  const [copiedTahlilId, setCopiedTahlilId] = useState<number | null>(null);
  const [isWholeTahlilCopied, setIsWholeTahlilCopied] = useState<boolean>(false);

  // Mahalul Qiyam section filter & clicker
  const [mqSectionFilter, setMqSectionFilter] = useState<'all' | 'salam' | 'pujian' | 'syauq' | 'marhaban' | 'doa'>('all');
  const [mqCounts, setMqCounts] = useState<Record<number, number>>({});
  const [copiedMqId, setCopiedMqId] = useState<number | null>(null);
  const [isMqWholeCopied, setIsMqWholeCopied] = useState<boolean>(false);

  // Dzikir Sholat section filter & clicker
  const [dzikirSectionFilter, setDzikirSectionFilter] = useState<'all' | 'istighfar_salam' | 'ayat' | 'tasbih33' | 'doa_sholat'>('all');
  const [dzikirCounts, setDzikirCounts] = useState<Record<number, number>>({});
  const [copiedDzikirId, setCopiedDzikirId] = useState<number | null>(null);
  const [isDzikirWholeCopied, setIsDzikirWholeCopied] = useState<boolean>(false);

  // Doa Harian category filter & state
  const [doaCategoryFilter, setDoaCategoryFilter] = useState<'all' | PrayerCategory>('all');
  const [doaCounts, setDoaCounts] = useState<Record<number, number>>({});
  const [copiedDoaId, setCopiedDoaId] = useState<number | null>(null);

  // Mobile tab state for Juz Amma: 'list' (Daftar Surat) or 'reader' (Baca Surat)
  const [mobileViewTab, setMobileViewTab] = useState<'list' | 'reader'>('reader');

  // Display settings
  const [showLatin, setShowLatin] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [arabicFontSize, setArabicFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [copiedVerseNumber, setCopiedVerseNumber] = useState<number | null>(null);
  const [isWholeSurahCopied, setIsWholeSurahCopied] = useState<boolean>(false);

  const versesContainerRef = useRef<HTMLDivElement | null>(null);
  const activeVerseRef = useRef<HTMLDivElement | null>(null);

  // Active Surah object depending on main tab
  const currentSurah = useMemo<ShortSurah>(() => {
    if (mainTab === 'yasin') {
      return SURAH_YASIN_DATA;
    }
    const found = SHORT_SURAHS_DATA.find((s) => s.number === selectedSurahNumber);
    return found || SHORT_SURAHS_DATA[0];
  }, [mainTab, selectedSurahNumber]);

  const currentSurahIndex = useMemo(() => {
    return SHORT_SURAHS_DATA.findIndex((s) => s.number === selectedSurahNumber);
  }, [selectedSurahNumber]);

  // Hook for full surah audio + voice translation
  const {
    isPlaying,
    playMode,
    setPlayMode,
    currentVerseIndex,
    isSpeakingTranslation,
    currentTime,
    duration,
    maleVoiceStyle,
    setMaleVoiceStyle,
    previewVoice,
    togglePlay,
    playSpecificVerse,
    stopAll,
  } = useQuranAudioPlayer({
    surah: currentSurah,
    onVerseChange: () => {
      if (activeVerseRef.current) {
        activeVerseRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },
  });

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen && initialTab) {
      setMainTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Stop audio if modal closes
  useEffect(() => {
    if (!isOpen) {
      stopAll();
    }
  }, [isOpen, stopAll]);

  // ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopAll();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, stopAll]);

  // Filtered Surahs List for Juz Amma
  const filteredSurahs = useMemo(() => {
    return SHORT_SURAHS_DATA.filter((s) => {
      const matchQuery =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.arabicName.includes(searchQuery) ||
        s.translation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'all' || s.type === typeFilter;
      return matchQuery && matchType;
    });
  }, [searchQuery, typeFilter]);

  // Filtered Tahlil Data
  const filteredTahlil = useMemo(() => {
    return TAHLIL_DATA.filter((item) => {
      const matchSection = tahlilSectionFilter === 'all' || item.section === tahlilSectionFilter;
      const matchQuery =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSection && matchQuery;
    });
  }, [tahlilSectionFilter, searchQuery]);

  // Filtered Mahalul Qiyam Data
  const filteredMahalulQiyam = useMemo(() => {
    return MAHALUL_QIYAM_DATA.filter((item) => {
      const matchSection = mqSectionFilter === 'all' || item.section === mqSectionFilter;
      const matchQuery =
        !searchQuery ||
        item.latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.arabic.includes(searchQuery);
      return matchSection && matchQuery;
    });
  }, [mqSectionFilter, searchQuery]);

  // Filtered Dzikir Sholat Data
  const filteredDzikirSholat = useMemo(() => {
    return DZIKIR_SHOLAT_DATA.filter((item) => {
      const matchSection = dzikirSectionFilter === 'all' || item.section === dzikirSectionFilter;
      const matchQuery =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSection && matchQuery;
    });
  }, [dzikirSectionFilter, searchQuery]);

  // Filtered Doa Harian Data
  const filteredDoaHarian = useMemo(() => {
    return DAILY_PRAYERS_DATA.filter((item) => {
      const matchCategory = doaCategoryFilter === 'all' || item.category === doaCategoryFilter;
      const matchQuery =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [doaCategoryFilter, searchQuery]);

  // Next and Previous Surahs for Juz Amma
  const prevSurah = currentSurahIndex > 0 ? SHORT_SURAHS_DATA[currentSurahIndex - 1] : null;
  const nextSurah =
    currentSurahIndex < SHORT_SURAHS_DATA.length - 1
      ? SHORT_SURAHS_DATA[currentSurahIndex + 1]
      : null;

  // Clean audio on close
  useEffect(() => {
    if (!isOpen) {
      stopAll();
    }
  }, [isOpen, stopAll]);

  // Sync initial tab when changed externally
  useEffect(() => {
    if (initialTab) {
      setMainTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (newTab: 'juz_amma' | 'yasin' | 'tahlil' | 'mahalul_qiyam' | 'dzikir_sholat' | 'doa_harian') => {
    stopAll();
    setMainTab(newTab);
    if (versesContainerRef.current) {
      versesContainerRef.current.scrollTop = 0;
    }
  };

  const handleSelectSurah = (surahNumber: number) => {
    stopAll();
    setSelectedSurahNumber(surahNumber);
    setMobileViewTab('reader');
    if (versesContainerRef.current) {
      versesContainerRef.current.scrollTop = 0;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyVerse = (verse: SurahVerse) => {
    const surahName = mainTab === 'yasin' ? 'Yasin' : currentSurah.name;
    const text = `QS. ${surahName}: ${verse.number}\n\n${verse.arabic}\n\n"${verse.latin}"\n\nArtinya: ${verse.translation}`;
    navigator.clipboard.writeText(text);
    setCopiedVerseNumber(verse.number);
    setTimeout(() => setCopiedVerseNumber(null), 2000);
  };

  const handleCopyWholeSurah = () => {
    const surahName = mainTab === 'yasin' ? 'Yasin' : currentSurah.name;
    let text = `📖 *Surat ${surahName} (${currentSurah.arabicName})*\n${currentSurah.type} • ${currentSurah.totalVerses} Ayat • "${currentSurah.translation}"\n\n`;
    if (currentSurah.bismillah) {
      text += `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\n`;
    }
    currentSurah.verses.forEach((v) => {
      text += `(${v.number}) ${v.arabic}\n${v.latin}\n"${v.translation}"\n\n`;
    });
    text += `— *PUASAKU SRT 1 KEDIRI*`;
    navigator.clipboard.writeText(text);
    setIsWholeSurahCopied(true);
    setTimeout(() => setIsWholeSurahCopied(false), 2000);
  };

  const handleCopyTahlilItem = (item: TahlilItem) => {
    const text = `🤲 *${item.title}* (${item.count || ''})\n\n${item.arabic}\n\n"${item.latin}"\n\nArtinya: ${item.translation}\n\n— *PUASAKU SRT 1 KEDIRI*`;
    navigator.clipboard.writeText(text);
    setCopiedTahlilId(item.id);
    setTimeout(() => setCopiedTahlilId(null), 2000);
  };

  const handleCopyWholeTahlil = () => {
    let text = `🤲 *SUSUNAN TAHLIL & DOA ARWAH LENGKAP*\nTradisi Ahlussunnah Wal Jama'ah • Puasaku SRT 1 Kediri\n\n`;
    TAHLIL_DATA.forEach((item) => {
      text += `[${item.id}. ${item.title}] ${item.count ? `(${item.count})` : ''}\n${item.arabic}\n${item.latin}\n"${item.translation}"\n\n`;
    });
    text += `— *PUASAKU SRT 1 KEDIRI*`;
    navigator.clipboard.writeText(text);
    setIsWholeTahlilCopied(true);
    setTimeout(() => setIsWholeTahlilCopied(false), 2000);
  };

  const handleCopyMqItem = (item: MahalulQiyamVerse) => {
    const text = `🌸 *Mahalul Qiyam - Bait ${item.id}*\n\n${item.arabic}\n\n"${item.latin}"\n\nArtinya: ${item.translation}\n\n— *PUASAKU SRT 1 KEDIRI*`;
    navigator.clipboard.writeText(text);
    setCopiedMqId(item.id);
    setTimeout(() => setCopiedMqId(null), 2000);
  };

  const handleCopyDzikirItem = (item: DzikirSholatItem) => {
    let text = `📿 *${item.title}* (${item.countLabel || ''})\n\n${item.arabic}\n\n"${item.latin}"\n\nArtinya: ${item.translation}\n`;
    if (item.fadhilah) {
      text += `\nKeutamaan: ${item.fadhilah}\n`;
    }
    text += `\n— *PUASAKU SRT 1 KEDIRI*`;
    navigator.clipboard.writeText(text);
    setCopiedDzikirId(item.id);
    setTimeout(() => setCopiedDzikirId(null), 2000);
  };

  const handleCopyWholeDzikir = () => {
    let text = `📿 *DZIKIR & DOA SESUDAH SHOLAT FARDHU LENGKAP*\nTradisi Ahlussunnah Wal Jama'ah • Puasaku SRT 1 Kediri\n\n`;
    DZIKIR_SHOLAT_DATA.forEach((item) => {
      text += `[${item.title}]\n${item.arabic}\n${item.latin}\n"${item.translation}"\n\n`;
    });
    text += `— *PUASAKU SRT 1 KEDIRI*`;
    navigator.clipboard.writeText(text);
    setIsDzikirWholeCopied(true);
    setTimeout(() => setIsDzikirWholeCopied(false), 2000);
  };

  const handleCopyDoaItem = (item: DailyPrayer) => {
    let text = `🤲 *${item.title}* [${item.categoryName}]\n\n${item.arabic}\n\n"${item.latin}"\n\nArtinya: ${item.translation}\n`;
    if (item.adab) {
      text += `\nAdab/Catatan: ${item.adab}\n`;
    }
    text += `\n— *PUASAKU SRT 1 KEDIRI*`;
    navigator.clipboard.writeText(text);
    setCopiedDoaId(item.id);
    setTimeout(() => setCopiedDoaId(null), 2000);
  };

  const handleCopyWholeMq = () => {
    let text = `🌸 *MAHALUL QIYAM LENGKAP (مَحَلُّ الْقِيَامِ)*\nSimtudduror & Ad-Diba'i • Puasaku SRT 1 Kediri\n\n`;
    MAHALUL_QIYAM_DATA.forEach((item) => {
      text += `[Bait ${item.id}]\n${item.arabic}\n${item.latin}\n"${item.translation}"\n\n`;
    });
    text += `— *PUASAKU SRT 1 KEDIRI*`;
    navigator.clipboard.writeText(text);
    setIsMqWholeCopied(true);
    setTimeout(() => setIsMqWholeCopied(false), 2000);
  };

  const handleIncrementTasbih = (id: number) => {
    setTasbihCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleResetTasbih = (id: number) => {
    setTasbihCounts((prev) => ({
      ...prev,
      [id]: 0,
    }));
  };

  const handleIncrementMq = (id: number) => {
    setMqCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleResetMq = (id: number) => {
    setMqCounts((prev) => ({
      ...prev,
      [id]: 0,
    }));
  };

  const handleIncrementDzikir = (id: number) => {
    setDzikirCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleResetDzikir = (id: number) => {
    setDzikirCounts((prev) => ({
      ...prev,
      [id]: 0,
    }));
  };

  const handleIncrementDoa = (id: number) => {
    setDoaCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleResetDoa = (id: number) => {
    setDoaCounts((prev) => ({
      ...prev,
      [id]: 0,
    }));
  };

  const getArabicSizeClass = () => {
    switch (arabicFontSize) {
      case 'sm':
        return 'text-xl sm:text-2xl leading-loose';
      case 'lg':
        return 'text-3xl sm:text-4xl leading-loose';
      case 'md':
      default:
        return 'text-2xl sm:text-3xl leading-loose';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopAll();
          onClose();
        }
      }}
    >
      <div
        className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-5xl h-[92vh] sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ========================================================= */}
        {/* TOP HEADER: Branding, Main Tabs & Global Controls */}
        {/* ========================================================= */}
        <div className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-[#032a1f] via-[#043d2c] to-[#022319] border-b border-emerald-700/50 flex flex-wrap items-center justify-between gap-2 shrink-0 relative overflow-hidden">
          {/* Ramadan Starry Night Background */}
          <RamadanStarryBackdrop variant="emerald" showCrescent={true} />

          {/* Logo & Main Tabs (Compact with Small Icons) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap relative z-10">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.3)]">
              <BookOpen className="w-3.5 h-3.5" />
            </div>

            {/* Navigation Tabs Pill (Small Icons, Compact Spacing) */}
            <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-emerald-600/40 overflow-x-auto max-w-[calc(100vw-80px)] sm:max-w-none shadow-md backdrop-blur-xs">
              <button
                type="button"
                onClick={() => handleTabChange('juz_amma')}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  mainTab === 'juz_amma'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-emerald-300 hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-3 h-3 shrink-0" />
                <span>Juz 'Amma</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('yasin')}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  mainTab === 'yasin'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-white/5'
                }`}
              >
                <Scroll className="w-3 h-3 shrink-0" />
                <span>Yasin</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('tahlil')}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  mainTab === 'tahlil'
                    ? 'bg-cyan-700 text-white shadow-xs'
                    : 'text-slate-300 hover:text-cyan-300 hover:bg-white/5'
                }`}
              >
                <BookMarked className="w-3 h-3 shrink-0" />
                <span>Tahlil</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('mahalul_qiyam')}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  mainTab === 'mahalul_qiyam'
                    ? 'bg-gradient-to-r from-rose-700 to-amber-600 text-white shadow-xs ring-1 ring-amber-300/50'
                    : 'text-slate-300 hover:text-rose-300 hover:bg-white/5'
                }`}
              >
                <Heart className="w-3 h-3 text-rose-300 fill-rose-300/40 shrink-0" />
                <span>Mahalul Qiyam</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('dzikir_sholat')}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  mainTab === 'dzikir_sholat'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs ring-1 ring-purple-300/50'
                    : 'text-slate-300 hover:text-indigo-300 hover:bg-white/5'
                }`}
              >
                <Layers className="w-3 h-3 text-indigo-300 shrink-0" />
                <span>Dzikir Sholat</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('doa_harian')}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  mainTab === 'doa_harian'
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xs ring-1 ring-emerald-300/50'
                    : 'text-slate-300 hover:text-teal-300 hover:bg-white/5'
                }`}
              >
                <HeartHandshake className="w-3 h-3 text-teal-300 shrink-0" />
                <span>Doa Harian</span>
              </button>
            </div>
          </div>

          {/* Quick Tools & Close Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto relative z-10">
            {/* Font Size Adjuster */}
            <div className="flex items-center bg-slate-950/60 rounded-lg p-0.5 border border-slate-700/60 text-[11px]">
              <button
                type="button"
                onClick={() => setArabicFontSize('sm')}
                className={`px-1.5 py-0.5 rounded ${arabicFontSize === 'sm' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Ukuran Font Kecil"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setArabicFontSize('md')}
                className={`px-1.5 py-0.5 rounded ${arabicFontSize === 'md' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Ukuran Font Sedang"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setArabicFontSize('lg')}
                className={`px-1.5 py-0.5 rounded ${arabicFontSize === 'lg' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Ukuran Font Besar"
              >
                A+
              </button>
            </div>

            {/* Toggle Latin */}
            <button
              type="button"
              onClick={() => setShowLatin(!showLatin)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                showLatin
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60'
                  : 'bg-slate-950/50 text-slate-400 border-slate-700/50'
              }`}
              title="Tampilkan/Sembunyikan Transliterasi Latin"
            >
              Latin
            </button>

            {/* Toggle Arti */}
            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                showTranslation
                  ? 'bg-amber-950/80 text-amber-300 border-amber-600/60'
                  : 'bg-slate-950/50 text-slate-400 border-slate-700/50'
              }`}
              title="Tampilkan/Sembunyikan Terjemahan Indonesia"
            >
              Arti
            </button>

            {/* Close Modal Button (Distinct & Prominent) */}
            <button
              type="button"
              onClick={() => {
                stopAll();
                onClose();
              }}
              className="p-1.5 px-2 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/50 hover:border-rose-400 transition-all cursor-pointer shadow-xs flex items-center gap-1 font-bold text-xs"
              title="Tutup Jendela (Esc)"
              aria-label="Tutup Pop-up"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Tutup</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* AUDIO PLAYER BAR (For Juz 'Amma & Yasin)                  */}
        {/* ========================================================= */}
        {(mainTab === 'juz_amma' || mainTab === 'yasin') && (
          <div className="px-3 sm:px-4 py-2 bg-slate-950/90 border-b border-emerald-800/40 flex flex-wrap items-center justify-between gap-2 shrink-0">
            {/* Play/Pause & Mode */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Jeda Audio' : 'Putar Murottal'}</span>
              </button>

              <div className="hidden sm:flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPlayMode('full_surah')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    playMode === 'full_surah' ? 'bg-emerald-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Full Surat
                </button>
                <button
                  type="button"
                  onClick={() => setPlayMode('per_verse')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    playMode === 'per_verse' ? 'bg-emerald-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Per Ayat + Arti
                </button>
              </div>
            </div>

            {/* Audio Progress / Info */}
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                <Headphones className="w-3 h-3" />
                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {isSpeakingTranslation && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/50 animate-pulse">
                  <Mic className="w-3 h-3" />
                  Membaca Arti...
                </span>
              )}

              {/* Voice Tuning Popover Trigger */}
              <button
                type="button"
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  showVoiceSettings
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title="Pengaturan Suara Penerjemah"
              >
                <Sliders className="w-3 h-3" />
                <span className="hidden md:inline">Suara Terjemah</span>
              </button>
            </div>
          </div>
        )}

        {/* Voice Setting Pop-down Tray */}
        {showVoiceSettings && (mainTab === 'juz_amma' || mainTab === 'yasin') && (
          <div className="px-4 py-2.5 bg-slate-950 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <Mic className="w-3.5 h-3.5" />
                Karakter Suara:
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMaleVoiceStyle('deep_male')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    maleVoiceStyle === 'deep_male' ? 'bg-amber-600 text-white' : 'text-slate-400'
                  }`}
                >
                  👨 Pria Merdu
                </button>
                <button
                  type="button"
                  onClick={() => setMaleVoiceStyle('standard')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    maleVoiceStyle === 'standard' ? 'bg-amber-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Standard
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={previewVoice}
              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-bold flex items-center gap-1"
            >
              <Volume2 className="w-3 h-3" />
              Tes Suara
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN BODY CONTENT AREA */}
        {/* ========================================================= */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* ========================================= */}
          {/* TAB 1: JUZ 'AMMA (SURAT PENDEK)           */}
          {/* ========================================= */}
          {mainTab === 'juz_amma' && (
            <>
              {/* Left Sidebar: Surahs Directory */}
              <div
                className={`w-full md:w-72 lg:w-80 bg-slate-950/70 border-r border-slate-800 flex flex-col ${
                  mobileViewTab === 'list' ? 'flex' : 'hidden md:flex'
                }`}
              >
                {/* Search Box */}
                <div className="p-2.5 border-b border-slate-800/80">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari surat / arti..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Surahs List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {filteredSurahs.map((surah) => {
                    const isSelected = surah.number === selectedSurahNumber;
                    return (
                      <button
                        key={surah.number}
                        type="button"
                        onClick={() => handleSelectSurah(surah.number)}
                        className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600/90 text-white shadow-md border border-emerald-400/40'
                            : 'hover:bg-slate-900/80 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-white text-emerald-900' : 'bg-slate-900 text-emerald-400 border border-slate-800'
                            }`}
                          >
                            {surah.number}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold truncate leading-tight">{surah.name}</h4>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {surah.translation} • {surah.totalVerses} Ayat
                            </p>
                          </div>
                        </div>

                        <span className={`text-base font-arabic font-bold shrink-0 ml-2 ${isSelected ? 'text-amber-200' : 'text-emerald-400'}`}>
                          {surah.arabicName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Pane: Verse Reader */}
              <div
                ref={versesContainerRef}
                className={`flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-900/60 custom-scrollbar ${
                  mobileViewTab === 'reader' ? 'flex flex-col' : 'hidden md:flex flex-col'
                }`}
              >
                {/* Mobile Back to List Button */}
                <div className="md:hidden mb-3">
                  <button
                    type="button"
                    onClick={() => setMobileViewTab('list')}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Daftar Surat ({SHORT_SURAHS_DATA.length})</span>
                  </button>
                </div>

                {/* Surah Banner Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#043324] via-[#054935] to-[#032a1f] border border-emerald-600/40 shadow-lg mb-4 text-center relative overflow-hidden">
                  <RamadanStarryBackdrop variant="emerald" showCrescent={true} />
                  <div className="absolute top-0 right-0 opacity-10 font-arabic text-7xl select-none pointer-events-none p-2 text-emerald-200">
                    {currentSurah.arabicName}
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide font-sans">
                      {currentSurah.name}
                    </h2>
                    <p className="text-2xl sm:text-3xl font-arabic font-bold text-white mt-1">
                      {currentSurah.arabicName}
                    </p>
                    <p className="text-xs text-emerald-200 mt-1">
                      "{currentSurah.translation}" • {currentSurah.type} • {currentSurah.totalVerses} Ayat
                    </p>

                    <div className="flex items-center justify-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={handleCopyWholeSurah}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 border border-white/20 transition-all cursor-pointer backdrop-blur-xs"
                      >
                        {isWholeSurahCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{isWholeSurahCopied ? 'Tersalin!' : 'Salin Semua Surat'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bismillah Header */}
                {currentSurah.bismillah && (
                  <div className="py-3 my-2 text-center border-y border-emerald-900/60 bg-slate-950/40 rounded-xl">
                    <p className="text-2xl sm:text-3xl font-arabic text-amber-200 leading-relaxed">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 italic font-sans">
                      Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.
                    </p>
                  </div>
                )}

                {/* Verses List */}
                <div className="space-y-4 my-2">
                  {currentSurah.verses.map((verse, idx) => {
                    const isCurrentVerse = currentVerseIndex === idx && isPlaying;
                    return (
                      <div
                        key={verse.number}
                        ref={isCurrentVerse ? activeVerseRef : null}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                          isCurrentVerse
                            ? 'bg-emerald-950/70 border-amber-400/80 shadow-lg shadow-emerald-950/50'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {/* Top Verse Bar */}
                        <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold flex items-center justify-center">
                              {verse.number}
                            </span>
                            {isCurrentVerse && (
                              <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/50 animate-pulse">
                                Sedang Dibaca
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => playSpecificVerse(idx)}
                              className="p-1 rounded-md text-slate-400 hover:text-emerald-300 hover:bg-slate-900"
                              title="Putar Ayat Ini"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyVerse(verse)}
                              className="p-1 rounded-md text-slate-400 hover:text-amber-300 hover:bg-slate-900"
                              title="Salin Teks Ayat"
                            >
                              {copiedVerseNumber === verse.number ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Arabic Text */}
                        <p className={`text-right font-arabic font-normal text-white ${getArabicSizeClass()}`} dir="rtl">
                          {verse.arabic}
                        </p>

                        {/* Latin Transliteration */}
                        {showLatin && (
                          <p className="text-xs sm:text-sm font-sans font-medium text-emerald-300/90 mt-2.5 leading-relaxed">
                            {verse.latin}
                          </p>
                        )}

                        {/* Indonesian Translation */}
                        {showTranslation && (
                          <p className="text-xs sm:text-sm font-sans text-slate-300 mt-1.5 leading-relaxed">
                            {verse.translation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Surah Navigation Footer */}
                <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-800">
                  {prevSurah ? (
                    <button
                      type="button"
                      onClick={() => handleSelectSurah(prevSurah.number)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 text-xs font-bold text-slate-300 border border-slate-800"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>{prevSurah.name}</span>
                    </button>
                  ) : <div />}

                  {nextSurah ? (
                    <button
                      type="button"
                      onClick={() => handleSelectSurah(nextSurah.number)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 text-xs font-bold text-slate-300 border border-slate-800 ml-auto"
                    >
                      <span>{nextSurah.name}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : <div />}
                </div>
              </div>
            </>
          )}

          {/* ========================================= */}
          {/* TAB 2: SURAT YASIN (83 AYAT LENGKAP)      */}
          {/* ========================================= */}
          {mainTab === 'yasin' && (
            <div
              ref={versesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-900/60 custom-scrollbar flex flex-col"
            >
              {/* Yasin Header Banner */}
              <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#221003] via-[#452204] to-[#1d0d02] border-2 border-amber-500/50 shadow-2xl mb-4 text-center relative overflow-hidden">
                {/* Ramadan Starry Sky Backdrop */}
                <RamadanStarryBackdrop variant="amber" showCrescent={true} />

                <div className="absolute top-0 right-0 opacity-10 font-arabic text-8xl select-none pointer-events-none p-2 text-amber-200">
                  يس
                </div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold mb-1.5 shadow-xs backdrop-blur-xs">
                    <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                    <span>🌙 Berkah Malam Ramadhan • Jantung Al-Qur'an (Qalbul Qur'an) ✨</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-wide font-sans drop-shadow-sm">
                    Surat Yasin
                  </h2>
                  <p className="text-3xl sm:text-4xl font-arabic font-bold text-amber-300 mt-1 drop-shadow-md">
                    سُورَةُ يسٓ
                  </p>
                  <p className="text-xs text-amber-200/90 mt-1 font-medium">
                    "Yasin" • Surah ke-36 • Makkiyyah • 83 Ayat
                  </p>

                  <div className="flex items-center justify-center gap-2 mt-3.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleCopyWholeSurah}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-bold flex items-center gap-1.5 border border-amber-300/40 shadow-xs transition-all cursor-pointer backdrop-blur-xs"
                    >
                      {isWholeSurahCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isWholeSurahCopied ? 'Tersalin!' : 'Salin Seluruh Surat Yasin'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bismillah Header */}
              <div className="py-3 my-2 text-center border-y border-amber-900/60 bg-slate-950/40 rounded-xl">
                <p className="text-2xl sm:text-3xl font-arabic text-amber-200 leading-relaxed">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <p className="text-[11px] text-slate-400 mt-1 italic font-sans">
                  Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.
                </p>
              </div>

              {/* Verses List */}
              <div className="space-y-4 my-2">
                {SURAH_YASIN_DATA.verses.map((verse, idx) => {
                  const isCurrentVerse = currentVerseIndex === idx && isPlaying;
                  return (
                    <div
                      key={verse.number}
                      ref={isCurrentVerse ? activeVerseRef : null}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        isCurrentVerse
                          ? 'bg-amber-950/70 border-amber-400/80 shadow-lg shadow-amber-950/50'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-amber-900/50'
                      }`}
                    >
                      {/* Top Verse Bar */}
                      <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold flex items-center justify-center">
                            {verse.number}
                          </span>
                          {isCurrentVerse && (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/50 animate-pulse">
                              Sedang Dibaca
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => playSpecificVerse(idx)}
                            className="p-1 rounded-md text-slate-400 hover:text-amber-300 hover:bg-slate-900"
                            title="Putar Ayat Ini"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyVerse(verse)}
                            className="p-1 rounded-md text-slate-400 hover:text-amber-300 hover:bg-slate-900"
                            title="Salin Teks Ayat"
                          >
                            {copiedVerseNumber === verse.number ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Arabic Text */}
                      <p className={`text-right font-arabic font-normal text-white ${getArabicSizeClass()}`} dir="rtl">
                        {verse.arabic}
                      </p>

                      {/* Latin Transliteration */}
                      {showLatin && (
                        <p className="text-xs sm:text-sm font-sans font-medium text-amber-300/90 mt-2.5 leading-relaxed">
                          {verse.latin}
                        </p>
                      )}

                      {/* Indonesian Translation */}
                      {showTranslation && (
                        <p className="text-xs sm:text-sm font-sans text-slate-300 mt-1.5 leading-relaxed">
                          {verse.translation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB 3: TAHLIL & DOA ARWAH LENGKAP        */}
          {/* ========================================= */}
          {mainTab === 'tahlil' && (
            <div
              ref={versesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-900/60 custom-scrollbar flex flex-col"
            >
              {/* Tahlil Header Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#03242e] via-[#043d4e] to-[#021f29] border border-cyan-600/40 shadow-lg mb-4 text-center relative overflow-hidden">
                <RamadanStarryBackdrop variant="cyan" showCrescent={true} />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-[11px] font-bold mb-1">
                    <BookMarked className="w-3 h-3" />
                    <span>Susunan Bacaan & Doa Khusus Arwah</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-cyan-300 tracking-wide font-sans">
                    Tahlil & Doa Lengkap
                  </h2>
                  <p className="text-xs text-cyan-200 mt-1">
                    Pengantar Tawasul Fatihah • Surat-Surat Pilihan • Rangkaian Dzikir & Shalawat • Doa Arwah
                  </p>

                {/* Section Filter Pills */}
                <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap text-xs">
                  <button
                    type="button"
                    onClick={() => setTahlilSectionFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      tahlilSectionFilter === 'all'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Semua ({TAHLIL_DATA.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTahlilSectionFilter('tawasul')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      tahlilSectionFilter === 'tawasul'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    1. Tawasul Fatihah
                  </button>
                  <button
                    type="button"
                    onClick={() => setTahlilSectionFilter('surat')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      tahlilSectionFilter === 'surat'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    2. Surat Pilihan
                  </button>
                  <button
                    type="button"
                    onClick={() => setTahlilSectionFilter('dzikir')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      tahlilSectionFilter === 'dzikir'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    3. Dzikir & Tahlil
                  </button>
                  <button
                    type="button"
                    onClick={() => setTahlilSectionFilter('doa')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      tahlilSectionFilter === 'doa'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    4. Doa Tahlil
                  </button>
                </div>

                {/* Salin Seluruh Teks Tahlil Button */}
                <div className="flex items-center justify-center gap-2 mt-3.5">
                  <button
                    type="button"
                    onClick={handleCopyWholeTahlil}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 text-xs font-bold flex items-center gap-1.5 border border-cyan-300/40 shadow-xs transition-all cursor-pointer backdrop-blur-xs"
                  >
                    {isWholeTahlilCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isWholeTahlilCopied ? 'Tersalin!' : 'Salin Seluruh Rangkaian Tahlil'}</span>
                  </button>
                </div>
                </div>
              </div>

              {/* Tahlil Items List */}
              <div className="space-y-4 my-2">
                {filteredTahlil.map((item) => {
                  const currentCount = tasbihCounts[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-800/60 transition-all shadow-md"
                    >
                      {/* Item Header */}
                      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-600/40 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center">
                            {item.id}
                          </span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-cyan-300">{item.title}</h4>
                            {item.count && (
                              <p className="text-[10px] text-amber-300 font-bold">{item.count}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Interactive Tasbih Counter Button (if dzikir) */}
                          {item.section === 'dzikir' && (
                            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-cyan-800/40">
                              <button
                                type="button"
                                onClick={() => handleIncrementTasbih(item.id)}
                                className="flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-white cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Hitung: {currentCount}</span>
                              </button>
                              {currentCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleResetTasbih(item.id)}
                                  className="text-slate-500 hover:text-rose-400 ml-1 cursor-pointer"
                                  title="Reset Hitungan"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCopyTahlilItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-slate-800 cursor-pointer"
                            title="Salin Bacaan Ini"
                          >
                            {copiedTahlilId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Arabic Text */}
                      <p className={`text-right font-arabic font-normal text-white whitespace-pre-line ${getArabicSizeClass()}`} dir="rtl">
                        {item.arabic}
                      </p>

                      {/* Latin Transliteration */}
                      {showLatin && (
                        <p className="text-xs sm:text-sm font-sans font-medium text-cyan-300/90 mt-3 leading-relaxed">
                          {item.latin}
                        </p>
                      )}

                      {/* Indonesian Translation */}
                      {showTranslation && (
                        <p className="text-xs sm:text-sm font-sans text-slate-300 mt-2 leading-relaxed">
                          {item.translation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB 4: MAHALUL QIYAM LENGKAP & ELEGAN     */}
          {/* ========================================= */}
          {mainTab === 'mahalul_qiyam' && (
            <div
              ref={versesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-900/60 custom-scrollbar flex flex-col"
            >
              {/* Mahalul Qiyam Header Banner */}
              <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#2e0712] via-[#540f23] to-[#27050f] border-2 border-amber-400/70 shadow-2xl mb-4 text-center relative overflow-hidden">
                {/* Ramadan Starry Sky Backdrop */}
                <RamadanStarryBackdrop variant="rose" showCrescent={true} />

                <div className="absolute top-0 right-0 opacity-10 font-arabic text-8xl select-none pointer-events-none p-2 text-amber-200">
                  مَحَلُّ الْقِيَامِ
                </div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400/20 via-rose-500/25 to-amber-400/20 border border-amber-300/50 text-amber-200 text-xs font-bold mb-1.5 shadow-md backdrop-blur-xs">
                    <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                    <span>🌙 Nuansa Berkah Ramadhan • Maulid Simtudduror & Ad-Diba'i ✨</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-wider font-sans drop-shadow-sm">
                    Mahalul Qiyam
                  </h2>
                  
                  <p className="text-3xl sm:text-4xl font-arabic font-bold text-amber-300 mt-1 drop-shadow-md">
                    مَحَلُّ الْقِيَامِ الشَّرِيْفِ
                  </p>

                  <p className="text-xs text-rose-200/95 mt-1 max-w-lg mx-auto leading-relaxed font-medium">
                    Bait Qasidah & Shalawat Berdiri Menyambut Kelahiran Baginda Nabi Muhammad SAW Penuh Cinta & Ketakziman di Malam Penuh Berkah
                  </p>

                  {/* Section Filter Pills for Mahalul Qiyam */}
                  <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap text-xs">
                    <button
                      type="button"
                      onClick={() => setMqSectionFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        mqSectionFilter === 'all'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-950/70 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      Semua Bait ({MAHALUL_QIYAM_DATA.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMqSectionFilter('salam')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        mqSectionFilter === 'salam'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-950/70 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      1. Yaa Nabi Salam
                    </button>
                    <button
                      type="button"
                      onClick={() => setMqSectionFilter('pujian')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        mqSectionFilter === 'pujian'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-950/70 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      2. Asyroqol Badru
                    </button>
                    <button
                      type="button"
                      onClick={() => setMqSectionFilter('syauq')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        mqSectionFilter === 'syauq'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-950/70 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      3. Kerinduan Alam
                    </button>
                    <button
                      type="button"
                      onClick={() => setMqSectionFilter('marhaban')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        mqSectionFilter === 'marhaban'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-950/70 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      4. Marhaban
                    </button>
                    <button
                      type="button"
                      onClick={() => setMqSectionFilter('doa')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        mqSectionFilter === 'doa'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-950/70 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      5. Doa Penutup
                    </button>
                  </div>

                  {/* Salin Seluruh Teks Mahalul Qiyam Button */}
                  <div className="flex items-center justify-center gap-2 mt-3.5">
                    <button
                      type="button"
                      onClick={handleCopyWholeMq}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-bold flex items-center gap-1.5 border border-amber-300/40 shadow-xs transition-all cursor-pointer backdrop-blur-xs"
                    >
                      {isMqWholeCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isMqWholeCopied ? 'Tersalin!' : 'Salin Seluruh Syair Mahalul Qiyam'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Verses of Mahalul Qiyam */}
              <div className="space-y-4 my-2">
                {filteredMahalulQiyam.map((item) => {
                  const currentCount = mqCounts[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl transition-all shadow-md ${
                        item.isReff
                          ? 'bg-gradient-to-br from-amber-950/80 via-slate-950 to-rose-950/60 border-2 border-amber-400/70 shadow-amber-950/40'
                          : 'bg-slate-950/70 border border-slate-800 hover:border-amber-700/50'
                      }`}
                    >
                      {/* Top Verse Bar */}
                      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${
                              item.isReff
                                ? 'bg-amber-500 text-slate-950 shadow-xs'
                                : 'bg-rose-950 border border-rose-600/40 text-rose-300'
                            }`}
                          >
                            {item.id}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                              {item.isReff && <Sparkles className="w-3 h-3 text-amber-400" />}
                              Bait ke-{item.id} {item.isReff ? '• Salam Utama (Reff)' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Shalawat Clicker Counter for Mahalul Qiyam */}
                          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-amber-800/40">
                            <button
                              type="button"
                              onClick={() => handleIncrementMq(item.id)}
                              className="flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-white cursor-pointer"
                              title="Hitung Bacaan Bait Ini"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Lantun: {currentCount}x</span>
                            </button>
                            {currentCount > 0 && (
                              <button
                                type="button"
                                onClick={() => handleResetMq(item.id)}
                                className="text-slate-500 hover:text-rose-400 ml-1 cursor-pointer"
                                title="Reset Hitungan"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyMqItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-900 border border-slate-800 cursor-pointer"
                            title="Salin Bait Ini"
                          >
                            {copiedMqId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Arabic Text (Centered and Balanced for Qasidah / Syair) */}
                      <p
                        className={`text-right sm:text-center font-arabic font-bold text-white whitespace-pre-line ${getArabicSizeClass()}`}
                        dir="rtl"
                      >
                        {item.arabic}
                      </p>

                      {/* Latin Transliteration */}
                      {showLatin && (
                        <p className="text-xs sm:text-sm font-sans font-medium text-amber-200/95 mt-3 text-left sm:text-center whitespace-pre-line leading-relaxed">
                          {item.latin}
                        </p>
                      )}

                      {/* Indonesian Translation */}
                      {showTranslation && (
                        <p className="text-xs sm:text-sm font-sans text-slate-300 mt-2 text-left sm:text-center whitespace-pre-line leading-relaxed italic">
                          "{item.translation}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: DZIKIR & DOA SESUDAH SHOLAT FARDHU LENGKAP (TERANG LEMBUT) */}
          {/* ========================================================= */}
          {mainTab === 'dzikir_sholat' && (
            <div
              ref={versesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gradient-to-b from-[#faf8f5] via-[#f5f2eb] to-[#efebe2] custom-scrollbar flex flex-col text-slate-800"
            >
              {/* Dzikir Sholat Header Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border border-emerald-700/50 shadow-md mb-3 text-center relative overflow-hidden text-white">
                <RamadanStarryBackdrop variant="emerald" showCrescent={true} />
                <div className="absolute top-0 right-0 opacity-10 font-arabic text-8xl select-none pointer-events-none p-2 text-emerald-200">
                  أَذْكَارُ الصَّلَاةِ
                </div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-bold mb-1 shadow-2xs backdrop-blur-xs">
                    <Layers className="w-3.5 h-3.5 text-amber-300" />
                    <span>Wirid & Doa Ba'da Sholat Fardhu</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide font-sans drop-shadow-xs">
                    Dzikir & Doa Sesudah Sholat
                  </h2>
                  
                  <p className="text-2xl sm:text-3xl font-arabic font-bold text-emerald-100 mt-1 drop-shadow-xs">
                    أَذْكَارُ وَأَدْعِيَةُ بَعْدَ الصَّلَاةِ الْمَكْتُوبَةِ
                  </p>

                  <p className="text-xs text-emerald-100/90 mt-1 max-w-xl mx-auto leading-relaxed">
                    Susunan bacaan istighfar, ayat kursi, tasbih 33x, dan doa memohon keselamatan dunia-akhirat sesuai Sunnah Rasulullah SAW
                  </p>

                {/* Section Filter Pills for Dzikir Sholat */}
                <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap text-xs">
                  <button
                    type="button"
                    onClick={() => setDzikirSectionFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      dzikirSectionFilter === 'all'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white/15 text-emerald-100 hover:bg-white/25 border border-white/20'
                    }`}
                  >
                    Semua ({DZIKIR_SHOLAT_DATA.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDzikirSectionFilter('istighfar_salam')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      dzikirSectionFilter === 'istighfar_salam'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white/15 text-emerald-100 hover:bg-white/25 border border-white/20'
                    }`}
                  >
                    1. Istighfar & Salam
                  </button>
                  <button
                    type="button"
                    onClick={() => setDzikirSectionFilter('ayat')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      dzikirSectionFilter === 'ayat'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white/15 text-emerald-100 hover:bg-white/25 border border-white/20'
                    }`}
                  >
                    2. Ayat Kursi & Surat
                  </button>
                  <button
                    type="button"
                    onClick={() => setDzikirSectionFilter('tasbih33')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      dzikirSectionFilter === 'tasbih33'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white/15 text-emerald-100 hover:bg-white/25 border border-white/20'
                    }`}
                  >
                    3. Tasbih 33x
                  </button>
                  <button
                    type="button"
                    onClick={() => setDzikirSectionFilter('doa_sholat')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      dzikirSectionFilter === 'doa_sholat'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white/15 text-emerald-100 hover:bg-white/25 border border-white/20'
                    }`}
                  >
                    4. Doa Ba'da Sholat
                  </button>
                </div>

                {/* Salin Seluruh Dzikir & Doa Sholat Button */}
                <div className="flex items-center justify-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleCopyWholeDzikir}
                    className="px-3 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-bold flex items-center gap-1.5 border border-amber-300/40 shadow-xs transition-all cursor-pointer backdrop-blur-xs"
                  >
                    {isDzikirWholeCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isDzikirWholeCopied ? 'Tersalin!' : 'Salin Seluruh Rangkaian Dzikir & Doa'}</span>
                  </button>
                </div>
                </div>
              </div>

              {/* Dzikir Sholat Items List (Nuansa Terang Lembut) */}
              <div className="space-y-3.5 my-2">
                {filteredDzikirSholat.map((item) => {
                  const currentCount = dzikirCounts[item.id] || 0;
                  const isTargetReached = item.targetCount ? currentCount >= item.targetCount : false;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl transition-all shadow-xs ${
                        isTargetReached
                          ? 'bg-emerald-50/90 border-2 border-emerald-500 shadow-sm'
                          : 'bg-white border border-amber-200/70 hover:border-amber-400/80 hover:shadow-md'
                      }`}
                    >
                      {/* Dzikir Card Header */}
                      <div className="flex items-center justify-between mb-3 border-b border-amber-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-xs font-mono font-bold flex items-center justify-center">
                            {item.id}
                          </span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-slate-800">{item.title}</h4>
                            {item.countLabel && (
                              <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                {item.countLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Interactive Tasbih Counter Button */}
                          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-all ${
                            isTargetReached 
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-900' 
                              : 'bg-amber-50/80 border-amber-200 text-amber-950 hover:bg-amber-100'
                          }`}>
                            <button
                              type="button"
                              onClick={() => handleIncrementDzikir(item.id)}
                              className="flex items-center gap-1 text-xs font-bold cursor-pointer"
                              title="Klik untuk Menambah Hitungan Dzikir"
                            >
                              <Plus className="w-3 h-3" />
                              <span>
                                {item.targetCount
                                  ? `${currentCount}/${item.targetCount}`
                                  : `Hitung: ${currentCount}`}
                              </span>
                              {isTargetReached && <Check className="w-3 h-3 text-emerald-600 font-bold" />}
                            </button>
                            {currentCount > 0 && (
                              <button
                                type="button"
                                onClick={() => handleResetDzikir(item.id)}
                                className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                                title="Reset Hitungan"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyDzikirItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-800 hover:bg-amber-50 border border-slate-200 cursor-pointer"
                            title="Salin Bacaan Ini"
                          >
                            {copiedDzikirId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Arabic Text (Deep Sharp Charcoal for Maximum Readability) */}
                      <p
                        className={`text-right font-arabic font-bold text-slate-900 whitespace-pre-line ${getArabicSizeClass()}`}
                        dir="rtl"
                      >
                        {item.arabic}
                      </p>

                      {/* Latin Transliteration */}
                      {showLatin && (
                        <p className="text-xs sm:text-sm font-sans font-semibold text-emerald-800 mt-2.5 leading-relaxed">
                          {item.latin}
                        </p>
                      )}

                      {/* Indonesian Translation */}
                      {showTranslation && (
                        <p className="text-xs sm:text-sm font-sans text-slate-600 mt-1.5 leading-relaxed italic">
                          "{item.translation}"
                        </p>
                      )}

                      {/* Fadhilah / Keutamaan (Soft Amber Highlight) */}
                      {item.fadhilah && (
                        <div className="mt-3 pt-2 border-t border-amber-100 flex items-start gap-1.5 text-[11px] text-amber-950 font-medium bg-amber-50/90 px-3 py-2 rounded-xl border border-amber-200/80">
                          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span><strong>Keutamaan & Dalil:</strong> {item.fadhilah}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB 6: DOA-DOA HARIAN LENGKAP (TERANG LEMBUT) */}
          {/* ========================================= */}
          {mainTab === 'doa_harian' && (
            <div
              ref={versesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gradient-to-b from-[#faf8f5] via-[#f5f2eb] to-[#efebe2] custom-scrollbar flex flex-col text-slate-800"
            >
              {/* Doa Harian Header Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-950 via-emerald-900 to-teal-900 border border-teal-700/50 shadow-md mb-3 text-center relative overflow-hidden text-white">
                <RamadanStarryBackdrop variant="teal" showCrescent={true} />
                <div className="absolute top-0 right-0 opacity-10 font-arabic text-8xl select-none pointer-events-none p-2 text-emerald-200">
                  الأَدْعِيَةُ
                </div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-bold mb-1 shadow-2xs backdrop-blur-xs">
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-300" />
                    <span>Kumpulan Doa Pilihan Santri & Umat Islam</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide font-sans drop-shadow-xs">
                    Doa-Doa Harian Lengkap
                  </h2>
                  
                  <p className="text-2xl sm:text-3xl font-arabic font-bold text-teal-100 mt-1 drop-shadow-xs">
                    الأَدْعِيَةُ الْيَوْمِيَّةُ الْمَأْثُورَةُ
                  </p>

                  <p className="text-xs text-teal-100/90 mt-1 max-w-xl mx-auto leading-relaxed">
                    Kumpulan doa sehari-hari bersumber dari Al-Qur'an dan Sunnah Rasulullah SAW lengkap dengan adab, teks Arab, Latin, dan Terjemahan
                  </p>

                {/* Category Filter Pills for Doa Harian */}
                <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap text-xs">
                  <button
                    type="button"
                    onClick={() => setDoaCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      doaCategoryFilter === 'all'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white/15 text-teal-100 hover:bg-white/25 border border-white/20'
                    }`}
                  >
                    Semua ({DAILY_PRAYERS_DATA.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoaCategoryFilter('harian')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      doaCategoryFilter === 'harian'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white/15 text-teal-100 hover:bg-white/25 border border-white/20'
                    }`}
                  >
                    🍽️ Makan & Tidur
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoaCategoryFilter('rumah_safar')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      doaCategoryFilter === 'rumah_safar'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white/15 text-teal-100 hover:bg-white/25 border border-white/20'
                    }`}
                  >
                    🚗 Rumah & Safar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoaCategoryFilter('masjid_ibadah')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      doaCategoryFilter === 'masjid_ibadah'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white/15 text-teal-100 hover:bg-white/25 border border-white/20'
                    }`}
                  >
                    🕌 Wudhu & Ibadah
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoaCategoryFilter('puasa')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      doaCategoryFilter === 'puasa'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white/15 text-teal-100 hover:bg-white/25 border border-white/20'
                    }`}
                  >
                    🌙 Puasa Ramadhan
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoaCategoryFilter('belajar')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      doaCategoryFilter === 'belajar'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white/15 text-teal-100 hover:bg-white/25 border border-white/20'
                    }`}
                  >
                    📚 Belajar & Ujian
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoaCategoryFilter('orangtua_selamat')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      doaCategoryFilter === 'orangtua_selamat'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white/15 text-teal-100 hover:bg-white/25 border border-white/20'
                    }`}
                  >
                    🤲 Orang Tua & Selamat
                  </button>
                </div>
                </div>
              </div>

              {/* Search Bar for Doa (Clean Light Input) */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari doa (misal: sebelum makan, belajar, wudhu, orang tua, sapu jagad)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-amber-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Daily Prayers List (Nuansa Terang Lembut) */}
              <div className="space-y-3.5 my-2">
                {filteredDoaHarian.map((item) => {
                  const currentCount = doaCounts[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-teal-200/70 hover:border-teal-400/80 hover:shadow-md transition-all shadow-xs"
                    >
                      {/* Doa Card Header */}
                      <div className="flex items-center justify-between mb-3 border-b border-teal-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-teal-100 border border-teal-300 text-teal-900 text-xs font-mono font-bold flex items-center justify-center">
                            {item.id}
                          </span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-slate-800">{item.title}</h4>
                            <span className="text-[10px] text-teal-800 font-bold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                              {item.categoryName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Counter Button */}
                          <div className="flex items-center gap-1 bg-teal-50/80 px-2 py-1 rounded-xl border border-teal-200 hover:bg-teal-100 transition-all">
                            <button
                              type="button"
                              onClick={() => handleIncrementDoa(item.id)}
                              className="flex items-center gap-1 text-xs font-bold text-teal-950 cursor-pointer"
                              title="Hitung Bacaan Doa Ini"
                            >
                              <Plus className="w-3 h-3 text-teal-700" />
                              <span>Dibaca: {currentCount}x</span>
                            </button>
                            {currentCount > 0 && (
                              <button
                                type="button"
                                onClick={() => handleResetDoa(item.id)}
                                className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                                title="Reset Hitungan"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyDoaItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-800 hover:bg-teal-50 border border-slate-200 cursor-pointer"
                            title="Salin Doa Ini"
                          >
                            {copiedDoaId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Arabic Text (Deep Sharp Charcoal for Optimal Comfort) */}
                      <p
                        className={`text-right font-arabic font-bold text-slate-900 whitespace-pre-line ${getArabicSizeClass()}`}
                        dir="rtl"
                      >
                        {item.arabic}
                      </p>

                      {/* Latin Transliteration */}
                      {showLatin && (
                        <p className="text-xs sm:text-sm font-sans font-semibold text-teal-800 mt-2.5 leading-relaxed">
                          {item.latin}
                        </p>
                      )}

                      {/* Indonesian Translation */}
                      {showTranslation && (
                        <p className="text-xs sm:text-sm font-sans text-slate-600 mt-1.5 leading-relaxed italic">
                          "{item.translation}"
                        </p>
                      )}

                      {/* Adab / Catatan Penting (Soft Teal/Amber Card) */}
                      {item.adab && (
                        <div className="mt-3 pt-2 border-t border-teal-100 flex items-start gap-1.5 text-[11px] text-teal-950 font-medium bg-teal-50/90 px-3 py-2 rounded-xl border border-teal-200/80">
                          <Info className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                          <span><strong>Adab & Petunjuk:</strong> {item.adab}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
