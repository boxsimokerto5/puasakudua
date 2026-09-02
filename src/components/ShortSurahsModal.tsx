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
import { SHOLAWAT_DATA, SholawatItem } from '../data/sholawatData';
import {
  SHOLAT_GUIDE_DATA,
  SHOLAT_GUIDE_CATEGORIES,
  SholatGuideItem,
  SholatCategory,
} from '../data/sholatGuideData';
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
  ChevronDown,
  ChevronUp,
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
  Compass,
  Flame,
  Music,
} from 'lucide-react';

interface ShortSurahsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'juz_amma' | 'yasin' | 'tahlil' | 'sholawat' | 'mahalul_qiyam' | 'dzikir_sholat' | 'doa_harian' | 'tata_cara_sholat';
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
  // Main Module Tab: Juz 'Amma, Surat Yasin, Tahlil, Sholawat, Mahalul Qiyam, Dzikir Sholat, Doa Harian, or Tata Cara Sholat
  const [mainTab, setMainTab] = useState<'juz_amma' | 'yasin' | 'tahlil' | 'sholawat' | 'mahalul_qiyam' | 'dzikir_sholat' | 'doa_harian' | 'tata_cara_sholat'>(initialTab);

  // Juz Amma Selected Surah
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Makkiyyah' | 'Madaniyyah'>('all');
  
  // Tahlil section filter & digital tasbih state
  const [tahlilSectionFilter, setTahlilSectionFilter] = useState<'all' | 'tawasul' | 'surat' | 'dzikir' | 'doa'>('all');
  const [tasbihCounts, setTasbihCounts] = useState<Record<number, number>>({});
  const [copiedTahlilId, setCopiedTahlilId] = useState<number | null>(null);
  const [isWholeTahlilCopied, setIsWholeTahlilCopied] = useState<boolean>(false);

  // Sholawat state & filter
  const [sholawatCategoryFilter, setSholawatCategoryFilter] = useState<'all' | 'hajat' | 'fadhilah' | 'wirid' | 'syiir' | 'ziarah'>('all');
  const [sholawatViewMode, setSholawatViewMode] = useState<'cards' | 'compact_list'>('cards');
  const [expandedSholawatId, setExpandedSholawatId] = useState<number | null>(null);
  const [sholawatCounts, setSholawatCounts] = useState<Record<number, number>>({});
  const [copiedSholawatId, setCopiedSholawatId] = useState<number | null>(null);
  const [isSholawatWholeCopied, setIsSholawatWholeCopied] = useState<boolean>(false);

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

  // Tata Cara Sholat category filter & expand state
  const [sholatCategoryFilter, setSholatCategoryFilter] = useState<'all' | SholatCategory>('all');
  const [expandedSholatId, setExpandedSholatId] = useState<string | null>('bacaan_lengkap_sholat');
  const [copiedSholatId, setCopiedSholatId] = useState<string | null>(null);

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

  // Audio Hook integration
  const {
    isPlaying,
    playMode,
    setPlayMode,
    currentVerseIndex,
    isSpeakingTranslation,
    currentTime,
    duration,
    installedVoices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    maleVoiceStyle,
    setMaleVoiceStyle,
    customPitch,
    setCustomPitch,
    customRate,
    setCustomRate,
    previewVoice,
    togglePlay,
    playSpecificVerse,
    stopAll,
  } = useQuranAudioPlayer({
    surah: currentSurah,
    onVerseChange: () => {
      if (activeVerseRef.current) {
        activeVerseRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    },
  });

  // Filtered Surahs List for Juz Amma
  const filteredSurahs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SHORT_SURAHS_DATA.filter((s) => {
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.arabicName.includes(q) ||
        s.translation.toLowerCase().includes(q) ||
        s.number.toString().includes(q);
      const matchType = typeFilter === 'all' || s.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [searchQuery, typeFilter]);

  // Filtered Tahlil Data
  const filteredTahlil = useMemo<TahlilItem[]>(() => {
    if (tahlilSectionFilter === 'all') return TAHLIL_DATA;
    return TAHLIL_DATA.filter((item) => item.section === tahlilSectionFilter);
  }, [tahlilSectionFilter]);

  // Filtered Mahalul Qiyam Data
  const filteredMahalulQiyam = useMemo<MahalulQiyamVerse[]>(() => {
    if (mqSectionFilter === 'all') return MAHALUL_QIYAM_DATA;
    return MAHALUL_QIYAM_DATA.filter((item) => item.section === mqSectionFilter);
  }, [mqSectionFilter]);

  // Filtered Dzikir Sholat Data
  const filteredDzikirSholat = useMemo<DzikirSholatItem[]>(() => {
    if (dzikirSectionFilter === 'all') return DZIKIR_SHOLAT_DATA;
    return DZIKIR_SHOLAT_DATA.filter((item) => item.section === dzikirSectionFilter);
  }, [dzikirSectionFilter]);

  // Filtered Daily Prayers Data
  const filteredDoaHarian = useMemo<DailyPrayer[]>(() => {
    let list = DAILY_PRAYERS_DATA;
    if (doaCategoryFilter !== 'all') {
      list = list.filter((p) => p.category === doaCategoryFilter);
    }
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.latin.toLowerCase().includes(q) ||
          p.translation.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [doaCategoryFilter, searchQuery]);

  // Filtered Sholawat Data
  const filteredSholawat = useMemo<SholawatItem[]>(() => {
    let list = SHOLAWAT_DATA;
    if (sholawatCategoryFilter !== 'all') {
      list = list.filter((s) => s.category === sholawatCategoryFilter);
    }
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.arabicTitle.includes(q) ||
          s.numberFormatted.includes(q) ||
          s.latin.toLowerCase().includes(q) ||
          s.translation.toLowerCase().includes(q) ||
          s.fadhilah.toLowerCase().includes(q) ||
          (s.source && s.source.toLowerCase().includes(q)) ||
          s.categoryLabel.toLowerCase().includes(q) ||
          (s.benefits && s.benefits.some((b) => b.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [sholawatCategoryFilter, searchQuery]);

  // Filtered Tata Cara Sholat Data
  const filteredSholatGuide = useMemo<SholatGuideItem[]>(() => {
    let list = SHOLAT_GUIDE_DATA;
    if (sholatCategoryFilter !== 'all') {
      list = list.filter((item) => item.category === sholatCategoryFilter);
    }
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.arabicTitle && item.arabicTitle.includes(q)) ||
          item.summary.toLowerCase().includes(q) ||
          item.categoryLabel.toLowerCase().includes(q) ||
          (item.rakaat && item.rakaat.toLowerCase().includes(q)) ||
          (item.waktuPelaksanaan && item.waktuPelaksanaan.toLowerCase().includes(q)) ||
          (item.steps &&
            item.steps.some(
              (s) =>
                s.title.toLowerCase().includes(q) ||
                (s.latin && s.latin.toLowerCase().includes(q)) ||
                (s.translation && s.translation.toLowerCase().includes(q))
            )) ||
          (item.doaKhusus &&
            (item.doaKhusus.title.toLowerCase().includes(q) ||
              item.doaKhusus.latin.toLowerCase().includes(q) ||
              item.doaKhusus.translation.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [sholatCategoryFilter, searchQuery]);

  // Reset audio & view on tab / surah change
  const handleSelectSurah = (surahNumber: number) => {
    stopAll();
    setSelectedSurahNumber(surahNumber);
    setMobileViewTab('reader');
    if (versesContainerRef.current) {
      versesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Next and Previous Surahs for Juz Amma
  const currentIndex = SHORT_SURAHS_DATA.findIndex((s) => s.number === selectedSurahNumber);
  const prevSurah = currentIndex > 0 ? SHORT_SURAHS_DATA[currentIndex - 1] : null;
  const nextSurah = currentIndex < SHORT_SURAHS_DATA.length - 1 ? SHORT_SURAHS_DATA[currentIndex + 1] : null;

  // Handle Tab Switch
  const handleTabChange = (newTab: 'juz_amma' | 'yasin' | 'tahlil' | 'sholawat' | 'mahalul_qiyam' | 'dzikir_sholat' | 'doa_harian' | 'tata_cara_sholat') => {
    stopAll();
    setMainTab(newTab);
    setSearchQuery('');
    if (versesContainerRef.current) {
      versesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Synchronize initialTab prop change
  useEffect(() => {
    if (initialTab) {
      setMainTab(initialTab);
    }
  }, [initialTab]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Copy Single Verse
  const handleCopyVerse = (verse: SurahVerse) => {
    const text = `📖 *Surat ${currentSurah.name} : Ayat ${verse.number}*\n\n${verse.arabic}\n\n_${verse.latin}_\n\n"${verse.translation}"\n\n(Sekolah Rakyat Terintegrasi 1 Kediri)`;
    navigator.clipboard.writeText(text);
    setCopiedVerseNumber(verse.number);
    setTimeout(() => setCopiedVerseNumber(null), 2000);
  };

  // Copy Whole Surah (Juz Amma / Yasin)
  const handleCopyWholeSurah = () => {
    let text = `📖 *SURAT ${currentSurah.name.toUpperCase()} (${currentSurah.arabicName})*\n`;
    text += `Golongan: ${currentSurah.type} • Jumlah: ${currentSurah.totalVerses} Ayat\n`;
    text += `Arti: "${currentSurah.translation}"\n\n`;

    if (currentSurah.bismillah) {
      text += `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\n`;
    }

    currentSurah.verses.forEach((v) => {
      text += `[${v.number}] ${v.arabic}\n`;
      text += `${v.latin}\n`;
      text += `"${v.translation}"\n\n`;
    });

    text += `(Aplikasi Ramadhan Sekolah Rakyat Terintegrasi 1 Kediri)`;
    navigator.clipboard.writeText(text);
    setIsWholeSurahCopied(true);
    setTimeout(() => setIsWholeSurahCopied(false), 2500);
  };

  // Copy Single Tahlil Item
  const handleCopyTahlilItem = (item: TahlilItem) => {
    let text = `✨ *${item.title.toUpperCase()}*\n`;
    if (item.count) text += `(${item.count})\n`;
    text += `\n${item.arabic}\n\n`;
    text += `_${item.latin}_\n\n`;
    text += `"${item.translation}"\n\n(Rangkaian Tahlil & Doa Arwah)`;
    navigator.clipboard.writeText(text);
    setCopiedTahlilId(item.id);
    setTimeout(() => setCopiedTahlilId(null), 2000);
  };

  // Copy Whole Tahlil
  const handleCopyWholeTahlil = () => {
    let text = `📿 *SUSUNAN BACAAN TAHLIL & DOA ARWAH LENGKAP*\n`;
    text += `Sekolah Rakyat Terintegrasi 1 Kediri\n\n`;

    TAHLIL_DATA.forEach((item) => {
      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      text += `${item.id}. *${item.title.toUpperCase()}* ${item.count ? `(${item.count})` : ''}\n\n`;
      text += `${item.arabic}\n\n`;
      text += `${item.latin}\n\n`;
      text += `"${item.translation}"\n\n`;
    });

    navigator.clipboard.writeText(text);
    setIsWholeTahlilCopied(true);
    setTimeout(() => setIsWholeTahlilCopied(false), 2500);
  };

  // Copy Single Mahalul Qiyam Verse
  const handleCopyMqItem = (item: MahalulQiyamVerse) => {
    let text = `🌹 *MAHALUL QIYAM - BAIT ${item.id}*\n\n`;
    text += `${item.arabic}\n\n`;
    text += `_${item.latin}_\n\n`;
    text += `"${item.translation}"\n\n(Maulid Simtudduror & Ad-Diba'i)`;
    navigator.clipboard.writeText(text);
    setCopiedMqId(item.id);
    setTimeout(() => setCopiedMqId(null), 2000);
  };

  // Copy Whole Mahalul Qiyam
  const handleCopyWholeMq = () => {
    let text = `🌹 *SYAIR MAHALUL QIYAM LENGKAP (MAULID NABI SAW)*\n`;
    text += `Maulid Simtudduror & Ad-Diba'i\n\n`;

    MAHALUL_QIYAM_DATA.forEach((item) => {
      text += `[Bait ${item.id}${item.isReff ? ' - Salam Reff' : ''}]\n`;
      text += `${item.arabic}\n`;
      text += `${item.latin}\n`;
      text += `"${item.translation}"\n\n`;
    });

    navigator.clipboard.writeText(text);
    setIsMqWholeCopied(true);
    setTimeout(() => setIsMqWholeCopied(false), 2500);
  };

  // Copy Single Dzikir Sholat Item
  const handleCopyDzikirItem = (item: DzikirSholatItem) => {
    let text = `📿 *${item.title.toUpperCase()}*\n`;
    if (item.countLabel) text += `(${item.countLabel})\n`;
    text += `\n${item.arabic}\n\n`;
    text += `_${item.latin}_\n\n`;
    text += `"${item.translation}"\n\n`;
    if (item.fadhilah) text += `Keutamaan: ${item.fadhilah}\n\n`;
    text += `(Dzikir & Doa Ba'da Sholat Fardhu)`;
    navigator.clipboard.writeText(text);
    setCopiedDzikirId(item.id);
    setTimeout(() => setCopiedDzikirId(null), 2000);
  };

  // Copy Whole Dzikir Sholat
  const handleCopyWholeDzikir = () => {
    let text = `🕌 *DZIKIR & DOA SESUDAH SHOLAT FARDHU LENGKAP*\n`;
    text += `Sekolah Rakyat Terintegrasi 1 Kediri\n\n`;

    DZIKIR_SHOLAT_DATA.forEach((item) => {
      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      text += `${item.id}. *${item.title.toUpperCase()}* ${item.countLabel ? `(${item.countLabel})` : ''}\n\n`;
      text += `${item.arabic}\n\n`;
      text += `${item.latin}\n\n`;
      text += `"${item.translation}"\n\n`;
    });

    navigator.clipboard.writeText(text);
    setIsDzikirWholeCopied(true);
    setTimeout(() => setIsDzikirWholeCopied(false), 2500);
  };

  // Copy Single Doa Harian
  const handleCopyDoaItem = (item: DailyPrayer) => {
    let text = `🤲 *${item.title.toUpperCase()}*\n`;
    text += `Kategori: ${item.categoryName}\n\n`;
    text += `${item.arabic}\n\n`;
    text += `_${item.latin}_\n\n`;
    text += `"${item.translation}"\n\n`;
    if (item.adab) text += `Adab/Petunjuk: ${item.adab}\n\n`;
    text += `(Kumpulan Doa Harian Santri)`;
    navigator.clipboard.writeText(text);
    setCopiedDoaId(item.id);
    setTimeout(() => setCopiedDoaId(null), 2000);
  };

  // Copy Single Panduan Sholat Item
  const handleCopySholatGuideItem = (item: SholatGuideItem) => {
    let text = `🕌 *PANDUAN SHOLAT: ${item.title.toUpperCase()}*\n`;
    if (item.arabicTitle) text += `${item.arabicTitle}\n`;
    text += `Kategori: ${item.categoryLabel}`;
    if (item.rakaat) text += ` • Rakaat: ${item.rakaat}`;
    if (item.waktuPelaksanaan) text += ` • Waktu: ${item.waktuPelaksanaan}`;
    text += `\n\nRingkasan:\n${item.summary}\n\n`;

    if (item.niat) {
      text += `*--- LAFAL NIAT SHOLAT ---*\n`;
      if (item.niat.munfarid) {
        text += `[Sendiri / Munfarid]:\n${item.niat.munfarid.arabic}\n_${item.niat.munfarid.latin}_\n"${item.niat.munfarid.translation}"\n\n`;
      }
      if (item.niat.imam) {
        text += `[Sebagai Imam]:\n${item.niat.imam.arabic}\n_${item.niat.imam.latin}_\n"${item.niat.imam.translation}"\n\n`;
      }
      if (item.niat.makmum) {
        text += `[Sebagai Makmum]:\n${item.niat.makmum.arabic}\n_${item.niat.makmum.latin}_\n"${item.niat.makmum.translation}"\n\n`;
      }
    }

    if (item.steps && item.steps.length > 0) {
      text += `*--- URUTAN GERAKAN & BACAAN ---*\n`;
      item.steps.forEach((step) => {
        text += `${step.title}\n`;
        if (step.postureDescription) text += `Posisi: ${step.postureDescription}\n`;
        if (step.arabic) text += `${step.arabic}\n`;
        if (step.latin) text += `_${step.latin}_\n`;
        if (step.translation) text += `"${step.translation}"\n`;
        if (step.note) text += `Catatan: ${step.note}\n`;
        text += `\n`;
      });
    }

    if (item.doaKhusus) {
      text += `*--- ${item.doaKhusus.title.toUpperCase()} ---*\n`;
      text += `${item.doaKhusus.arabic}\n\n_${item.doaKhusus.latin}_\n\n"${item.doaKhusus.translation}"\n\n`;
    }

    if (item.ketentuanKhusus && item.ketentuanKhusus.length > 0) {
      text += `*--- KETENTUAN / SYARAT & RUKUN ---*\n`;
      item.ketentuanKhusus.forEach((k) => {
        text += `• ${k}\n`;
      });
      text += `\n`;
    }

    if (item.keutamaan) {
      text += `Keutamaan: ${item.keutamaan}\n\n`;
    }

    text += `(Aplikasi PUASAKU - SMP/SMA SRT 1 Kediri)`;

    navigator.clipboard.writeText(text);
    setCopiedSholatId(item.id);
    setTimeout(() => setCopiedSholatId(null), 2000);
  };

  const handleToggleSholatExpand = (id: string) => {
    setExpandedSholatId((prev) => (prev === id ? null : id));
  };

  // Sholawat Copy & Counter handlers
  const handleCopySholawat = (item: SholawatItem) => {
    let text = `🌟 *${item.numberFormatted} - ${item.title.toUpperCase()}*\n`;
    text += `Kategori: ${item.categoryLabel}\n`;
    if (item.source) text += `Sumber/Sanad: ${item.source}\n`;
    text += `Fadhilah: ${item.fadhilah}\n\n`;
    text += `*Teks Arab:*\n${item.arabic}\n\n`;
    text += `*Transliterasi Latin:*\n_${item.latin}_\n\n`;
    text += `*Arti / Terjemahan:*\n"${item.translation}"\n\n`;

    if (item.benefits && item.benefits.length > 0) {
      text += `*Keutamaan & Cara Pengamalan:*\n`;
      item.benefits.forEach((b) => {
        text += `• ${b}\n`;
      });
      text += `\n`;
    }

    text += `(Aplikasi PUASAKU - SMP/SMA SRT 1 Kediri)`;

    navigator.clipboard.writeText(text);
    setCopiedSholawatId(item.id);
    setTimeout(() => setCopiedSholawatId(null), 2000);
  };

  const handleCopyWholeSholawat = () => {
    let text = `✨ *KUMPULAN SHOLAWAT NABI MUHAMMAD SAW LENGKAP* ✨\n`;
    text += `Koleksi Bacaan Sholawat Masyhur, Fadhilah Hajat, Wirid Rezeki & Qasidah Nabawiyyah\n\n`;
    text += `========================================\n\n`;

    filteredSholawat.forEach((item) => {
      text += `[${item.numberFormatted}] ${item.title.toUpperCase()}\n`;
      text += `Kategori: ${item.categoryLabel} • Fadhilah: ${item.fadhilah}\n\n`;
      text += `${item.arabic}\n\n`;
      text += `_${item.latin}_\n\n`;
      text += `"${item.translation}"\n\n`;
      text += `----------------------------------------\n\n`;
    });

    text += `(Aplikasi PUASAKU - SMP/SMA SRT 1 Kediri)`;

    navigator.clipboard.writeText(text);
    setIsSholawatWholeCopied(true);
    setTimeout(() => setIsSholawatWholeCopied(false), 2000);
  };

  const handleIncrementSholawat = (id: number) => {
    setSholawatCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleResetSholawat = (id: number) => {
    setSholawatCounts((prev) => ({
      ...prev,
      [id]: 0,
    }));
  };

  const handleToggleSholawatExpand = (id: number) => {
    setExpandedSholawatId((prev) => (prev === id ? null : id));
  };

  // Tasbih & Counter helpers
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopAll();
          onClose();
        }
      }}
    >
      <div
        className="bg-[#faf8f5] border border-amber-300/80 rounded-2xl w-full max-w-5xl h-[92vh] sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================= */}
        {/* TOP HEADER: Branding, Main Tabs & Global Controls */}
        {/* ========================================================= */}
        <div className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-[#032a1f] via-[#043d2c] to-[#022319] border-b border-emerald-700/50 flex flex-wrap items-center justify-between gap-2 shrink-0 relative overflow-hidden text-white">
          {/* Ramadan Starry Night Background */}
          <RamadanStarryBackdrop variant="emerald" showCrescent={true} />

          {/* Logo & Main Tabs (Compact with Small Icons) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap relative z-10">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.3)]">
              <BookOpen className="w-3.5 h-3.5" />
            </div>

            {/* Navigation Tabs Pill (Small Icons, Compact Spacing) */}
            <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-emerald-600/40 overflow-x-auto touch-pan-x overscroll-x-contain max-w-[calc(100vw-70px)] sm:max-w-none shadow-md backdrop-blur-xs scrollbar-thin scroll-smooth select-none">
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
                onClick={() => handleTabChange('sholawat')}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  mainTab === 'sholawat'
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 text-white shadow-xs ring-1 ring-amber-300/60 font-black'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                <span>Sholawat</span>
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

              <button
                type="button"
                onClick={() => handleTabChange('tata_cara_sholat')}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  mainTab === 'tata_cara_sholat'
                    ? 'bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-700 text-white shadow-xs ring-1 ring-amber-300/60 font-black'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-white/5'
                }`}
              >
                <Compass className="w-3 h-3 text-amber-300 shrink-0" />
                <span>Tata Cara Sholat</span>
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
                className={`px-1.5 py-0.5 rounded cursor-pointer ${arabicFontSize === 'sm' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Ukuran Font Kecil"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setArabicFontSize('md')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${arabicFontSize === 'md' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Ukuran Font Sedang"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setArabicFontSize('lg')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${arabicFontSize === 'lg' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
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
        {/* AUDIO PLAYER BAR (For Juz 'Amma & Yasin) - Soft Warm Theme */}
        {/* ========================================================= */}
        {(mainTab === 'juz_amma' || mainTab === 'yasin') && (
          <div className="px-3 sm:px-4 py-2 bg-[#f4efe6] border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
            {/* Play/Pause & Mode */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Jeda Audio' : 'Putar Murottal'}</span>
              </button>

              <div className="hidden sm:flex items-center bg-white rounded-lg p-0.5 border border-amber-200 text-xs shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPlayMode('full_surah')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    playMode === 'full_surah' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full Surat
                </button>
                <button
                  type="button"
                  onClick={() => setPlayMode('per_verse')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    playMode === 'per_verse' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Per Ayat + Arti
                </button>
              </div>
            </div>

            {/* Audio Progress / Info */}
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-900 bg-emerald-100/90 px-2.5 py-0.5 rounded-lg border border-emerald-300 font-bold">
                <Headphones className="w-3 h-3 text-emerald-700" />
                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {isSpeakingTranslation && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded border border-amber-400 animate-pulse">
                  <Mic className="w-3 h-3 text-amber-800" />
                  Membaca Arti...
                </span>
              )}

              {/* Voice Tuning Popover Trigger */}
              <button
                type="button"
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className={`p-1.5 px-2.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  showVoiceSettings
                    ? 'bg-amber-400 text-slate-950 border-amber-500 font-black'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border-amber-200 shadow-2xs'
                }`}
                title="Pengaturan Suara Penerjemah"
              >
                <Sliders className="w-3 h-3 text-amber-700" />
                <span className="hidden md:inline">Suara Terjemah</span>
              </button>
            </div>
          </div>
        )}

        {/* Voice Setting Pop-down Tray */}
        {showVoiceSettings && (mainTab === 'juz_amma' || mainTab === 'yasin') && (
          <div className="px-4 py-2.5 bg-[#fbf8f2] border-b border-amber-300/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-amber-900 font-bold flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-amber-700" />
                Karakter Suara:
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-amber-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMaleVoiceStyle('deep_male')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    maleVoiceStyle === 'deep_male' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-600'
                  }`}
                >
                  👨 Pria Merdu
                </button>
                <button
                  type="button"
                  onClick={() => setMaleVoiceStyle('standard')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    maleVoiceStyle === 'standard' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-600'
                  }`}
                >
                  Standard
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={previewVoice}
              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3 h-3 text-amber-700" />
              Tes Suara
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN BODY CONTENT AREA */}
        {/* ========================================================= */}
        <div className="flex-1 flex overflow-hidden relative bg-[#faf8f5]">

          {/* ========================================================= */}
          {/* TAB 1: JUZ 'AMMA (SURAT PENDEK - NUANSA TERANG LEMBUT)   */}
          {/* ========================================================= */}
          {mainTab === 'juz_amma' && (
            <>
              {/* Left Sidebar: Surahs Directory (Soft Light Aesthetic) */}
              <div
                className={`w-full md:w-72 lg:w-80 bg-[#f8f5ee] border-r border-amber-200/80 flex flex-col ${
                  mobileViewTab === 'list' ? 'flex' : 'hidden md:flex'
                }`}
              >
                {/* Search Box */}
                <div className="p-2.5 border-b border-amber-200/80 bg-white/70">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari surat / arti..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 bg-white border border-amber-200/90 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-emerald-500 shadow-2xs"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
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
                            ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-600'
                            : 'bg-white hover:bg-emerald-50/70 text-slate-800 border border-amber-200/60 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 font-black'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {surah.number}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-black truncate leading-tight">{surah.name}</h4>
                            <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                              {surah.translation} • {surah.totalVerses} Ayat
                            </p>
                          </div>
                        </div>

                        <span className={`text-base font-arabic font-bold shrink-0 ml-2 ${isSelected ? 'text-amber-300' : 'text-emerald-800'}`}>
                          {surah.arabicName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Pane: Verse Reader (Nuansa Terang Lembut) */}
              <div
                ref={versesContainerRef}
                className={`flex-1 overflow-y-auto p-3 sm:p-5 bg-gradient-to-b from-[#faf8f5] via-[#f6f2ea] to-[#f0ebe0] custom-scrollbar ${
                  mobileViewTab === 'reader' ? 'flex flex-col' : 'hidden md:flex flex-col'
                }`}
              >
                {/* Mobile Back to List Button */}
                <div className="md:hidden mb-3">
                  <button
                    type="button"
                    onClick={() => setMobileViewTab('list')}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Daftar Surat ({SHORT_SURAHS_DATA.length})</span>
                  </button>
                </div>

                {/* ========================================================= */}
                {/* SURAH BANNER CARD (Bingkai / Frame Ornamen Presisi & Pas) */}
                {/* ========================================================= */}
                <div className="py-5 px-4 sm:py-6 sm:px-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#043e2e] to-emerald-950 border-2 border-amber-400/80 shadow-md mb-3.5 relative overflow-hidden text-white flex flex-col items-center justify-center text-center">
                  {/* Subtle Celestial Backdrop */}
                  <RamadanStarryBackdrop variant="emerald" showCrescent={true} />

                  {/* Ornate Frame Outer Line */}
                  <div className="absolute inset-1.5 border border-amber-300/30 rounded-xl pointer-events-none" />

                  <div className="relative z-10 w-full flex flex-col items-center justify-center text-center space-y-2">
                    {/* Centered Category Pill Badge */}
                    <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/50 text-amber-200 text-xs font-bold shadow-2xs backdrop-blur-xs leading-none mx-auto text-center">
                      <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
                      <span className="leading-normal">
                        Surat ke-{currentSurah.number} • Golongan {currentSurah.type} • {currentSurah.totalVerses} Ayat
                      </span>
                    </div>

                    {/* Main Latin Title - Perfectly Centered & Symmetrical */}
                    <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide font-sans drop-shadow-xs text-center mx-auto">
                      Surat {currentSurah.name}
                    </h2>

                    {/* Arabic Calligraphic Title in an Ornate Frame Box */}
                    <div className="inline-flex items-center justify-center my-0.5 px-6 py-1.5 rounded-xl bg-white/10 border border-amber-300/40 backdrop-blur-xs mx-auto shadow-inner">
                      <p className="text-2xl sm:text-3xl font-arabic font-bold text-amber-200 leading-normal text-center">
                        سُورَةُ {currentSurah.arabicName}
                      </p>
                    </div>

                    {/* Surah Meaning & Info */}
                    <p className="text-xs sm:text-sm text-emerald-100/90 font-medium text-center mx-auto max-w-lg leading-relaxed">
                      Artinya: <span className="text-white font-semibold">"{currentSurah.translation}"</span>
                    </p>

                    {/* Action Bar (Salin Seluruh Surat) */}
                    <div className="flex items-center justify-center gap-2 pt-1 mx-auto">
                      <button
                        type="button"
                        onClick={handleCopyWholeSurah}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-300/40 shadow-2xs transition-all cursor-pointer backdrop-blur-xs"
                      >
                        {isWholeSurahCopied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                        <span>{isWholeSurahCopied ? 'Tersalin!' : `Salin Seluruh Surat ${currentSurah.name}`}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bismillah Header (Soft Light Card) */}
                {currentSurah.bismillah && (
                  <div className="py-3.5 px-4 my-2 text-center border border-amber-200/80 bg-white/85 rounded-xl shadow-2xs flex flex-col items-center justify-center">
                    <p className="text-2xl sm:text-3xl font-arabic text-amber-950 leading-relaxed font-bold text-center">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                    <p className="text-xs text-slate-500 mt-1 italic font-sans text-center">
                      Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.
                    </p>
                  </div>
                )}

                {/* Verses List (Nuansa Terang Lembut, Crystal Clear) */}
                <div className="space-y-3.5 my-2">
                  {currentSurah.verses.map((verse, idx) => {
                    const isCurrentVerse = currentVerseIndex === idx && isPlaying;
                    return (
                      <div
                        key={verse.number}
                        ref={isCurrentVerse ? activeVerseRef : null}
                        className={`p-4 sm:p-5 rounded-2xl transition-all shadow-xs ${
                          isCurrentVerse
                            ? 'bg-emerald-50/95 border-2 border-emerald-500 shadow-md ring-2 ring-emerald-300/50'
                            : 'bg-white border border-amber-200/70 hover:border-emerald-300 hover:shadow-md'
                        }`}
                      >
                        {/* Top Verse Bar */}
                        <div className="flex items-center justify-between mb-3 border-b border-amber-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-mono font-bold flex items-center justify-center">
                              {verse.number}
                            </span>
                            {isCurrentVerse && (
                              <span className="text-[10px] font-bold text-emerald-900 bg-emerald-200/90 px-2 py-0.5 rounded border border-emerald-400 animate-pulse">
                                Sedang Dibaca
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => playSpecificVerse(idx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 cursor-pointer"
                              title="Putar Ayat Ini"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyVerse(verse)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-800 hover:bg-amber-50 border border-slate-200 cursor-pointer"
                              title="Salin Teks Ayat"
                            >
                              {copiedVerseNumber === verse.number ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Arabic Text (Deep Sharp Charcoal for Maximum Comfort) */}
                        <p
                          className={`text-right font-arabic font-bold text-slate-900 ${getArabicSizeClass()}`}
                          dir="rtl"
                        >
                          {verse.arabic}
                        </p>

                        {/* Latin Transliteration */}
                        {showLatin && (
                          <p className="text-xs sm:text-sm font-sans font-semibold text-emerald-800 mt-2.5 leading-relaxed">
                            {verse.latin}
                          </p>
                        )}

                        {/* Indonesian Translation */}
                        {showTranslation && (
                          <p className="text-xs sm:text-sm font-sans text-slate-600 mt-1.5 leading-relaxed">
                            {verse.translation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Surah Navigation Footer */}
                <div className="flex items-center justify-between pt-4 mt-6 border-t border-amber-200">
                  {prevSurah ? (
                    <button
                      type="button"
                      onClick={() => handleSelectSurah(prevSurah.number)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-xs font-bold text-slate-700 border border-amber-200 shadow-2xs cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{prevSurah.name}</span>
                    </button>
                  ) : <div />}

                  {nextSurah ? (
                    <button
                      type="button"
                      onClick={() => handleSelectSurah(nextSurah.number)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-xs font-bold text-slate-700 border border-amber-200 shadow-2xs ml-auto cursor-pointer"
                    >
                      <span>{nextSurah.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-700" />
                    </button>
                  ) : <div />}
                </div>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SURAT YASIN (83 AYAT LENGKAP - NUANSA TERANG LEMBUT) */}
          {/* ========================================================= */}
          {mainTab === 'yasin' && (
            <div
              ref={versesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gradient-to-b from-[#faf8f5] via-[#f6f2ea] to-[#f0ebe0] custom-scrollbar flex flex-col text-slate-800"
            >
              {/* Yasin Header Banner (Ornate Symmetrical Frame) */}
              <div className="py-5 px-4 sm:py-6 sm:px-6 rounded-2xl bg-gradient-to-r from-[#2c1202] via-[#4d2303] to-[#250f01] border-2 border-amber-400/80 shadow-md mb-3.5 relative overflow-hidden text-white flex flex-col items-center justify-center text-center">
                {/* Ramadan Starry Sky Backdrop */}
                <RamadanStarryBackdrop variant="amber" showCrescent={true} />

                {/* Ornate Frame Outer Line */}
                <div className="absolute inset-1.5 border border-amber-300/30 rounded-xl pointer-events-none" />

                <div className="relative z-10 w-full flex flex-col items-center justify-center text-center space-y-2">
                  <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/50 text-amber-200 text-xs font-bold shadow-2xs backdrop-blur-xs leading-none mx-auto text-center">
                    <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse shrink-0" />
                    <span className="leading-normal">🌙 Berkah Malam Ramadhan • Jantung Al-Qur'an (Qalbul Qur'an) ✨</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide font-sans drop-shadow-xs text-center mx-auto">
                    Surat Yasin
                  </h2>

                  <div className="inline-flex items-center justify-center my-0.5 px-6 py-1.5 rounded-xl bg-white/10 border border-amber-300/40 backdrop-blur-xs mx-auto shadow-inner">
                    <p className="text-2xl sm:text-3xl font-arabic font-bold text-amber-200 leading-normal text-center">
                      سُورَةُ يسٓ
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-amber-100/90 font-medium text-center mx-auto max-w-lg leading-relaxed">
                    "Yasin" • Surah ke-36 • Golongan Makkiyyah • 83 Ayat
                  </p>

                  <div className="flex items-center justify-center gap-2 pt-1 mx-auto">
                    <button
                      type="button"
                      onClick={handleCopyWholeSurah}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-300/40 shadow-2xs transition-all cursor-pointer backdrop-blur-xs"
                    >
                      {isWholeSurahCopied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                      <span>{isWholeSurahCopied ? 'Tersalin!' : 'Salin Seluruh Surat Yasin'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bismillah Header (Soft Light Card) */}
              <div className="py-3.5 px-4 my-2 text-center border border-amber-200/80 bg-white/85 rounded-xl shadow-2xs flex flex-col items-center justify-center">
                <p className="text-2xl sm:text-3xl font-arabic text-amber-950 leading-relaxed font-bold text-center">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <p className="text-xs text-slate-500 mt-1 italic font-sans text-center">
                  Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.
                </p>
              </div>

              {/* Verses List (Nuansa Terang Lembut) */}
              <div className="space-y-3.5 my-2">
                {SURAH_YASIN_DATA.verses.map((verse, idx) => {
                  const isCurrentVerse = currentVerseIndex === idx && isPlaying;
                  return (
                    <div
                      key={verse.number}
                      ref={isCurrentVerse ? activeVerseRef : null}
                      className={`p-4 sm:p-5 rounded-2xl transition-all shadow-xs ${
                        isCurrentVerse
                          ? 'bg-amber-50/95 border-2 border-amber-500 shadow-md ring-2 ring-amber-300/50'
                          : 'bg-white border border-amber-200/70 hover:border-amber-400 hover:shadow-md'
                      }`}
                    >
                      {/* Top Verse Bar */}
                      <div className="flex items-center justify-between mb-3 border-b border-amber-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-xs font-mono font-bold flex items-center justify-center">
                            {verse.number}
                          </span>
                          {isCurrentVerse && (
                            <span className="text-[10px] font-bold text-amber-950 bg-amber-200 px-2 py-0.5 rounded border border-amber-400 animate-pulse">
                              Sedang Dibaca
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => playSpecificVerse(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-800 hover:bg-amber-50 border border-slate-200 cursor-pointer"
                            title="Putar Ayat Ini"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyVerse(verse)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-800 hover:bg-amber-50 border border-slate-200 cursor-pointer"
                            title="Salin Teks Ayat"
                          >
                            {copiedVerseNumber === verse.number ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Arabic Text (Deep Sharp Charcoal) */}
                      <p
                        className={`text-right font-arabic font-bold text-slate-900 ${getArabicSizeClass()}`}
                        dir="rtl"
                      >
                        {verse.arabic}
                      </p>

                      {/* Latin Transliteration */}
                      {showLatin && (
                        <p className="text-xs sm:text-sm font-sans font-semibold text-amber-900 mt-2.5 leading-relaxed">
                          {verse.latin}
                        </p>
                      )}

                      {/* Indonesian Translation */}
                      {showTranslation && (
                        <p className="text-xs sm:text-sm font-sans text-slate-600 mt-1.5 leading-relaxed">
                          {verse.translation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: TAHLIL & DOA ARWAH LENGKAP (NUANSA TERANG LEMBUT) */}
          {/* ========================================================= */}
          {mainTab === 'tahlil' && (
            <div
              ref={versesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gradient-to-b from-[#faf8f5] via-[#f6f2ea] to-[#f0ebe0] custom-scrollbar flex flex-col text-slate-800"
            >
              {/* Tahlil Header Banner (Ornate Symmetrical Frame - Pas & Elegan) */}
              <div className="py-5 px-4 sm:py-6 sm:px-6 rounded-2xl bg-gradient-to-br from-[#02202a] via-[#043e50] to-[#021c25] border-2 border-cyan-400/80 shadow-lg mb-3.5 relative overflow-hidden text-white flex flex-col items-center justify-center text-center">
                <RamadanStarryBackdrop variant="cyan" showCrescent={true} />

                {/* Ornate Frame Double Border */}
                <div className="absolute inset-1.5 sm:inset-2 border border-cyan-300/40 rounded-xl pointer-events-none" />
                <div className="absolute inset-2.5 sm:inset-3 border border-cyan-400/20 rounded-lg pointer-events-none" />

                <div className="relative z-10 w-full flex flex-col items-center justify-center text-center space-y-2 max-w-2xl mx-auto px-1 sm:px-2">
                  {/* Top Badge: Susunan Bacaan & Doa Khusus Arwah */}
                  <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-400/20 border border-cyan-300/60 text-cyan-200 text-xs font-bold shadow-xs backdrop-blur-xs leading-none mx-auto text-center">
                    <BookMarked className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                    <span className="leading-normal">Susunan Bacaan & Doa Khusus Arwah</span>
                  </div>

                  {/* Main Title Latin */}
                  <h2 className="text-lg sm:text-2xl font-black text-cyan-200 tracking-wide font-sans drop-shadow-sm text-center mx-auto">
                    Tahlil & Doa Khusus Arwah
                  </h2>

                  {/* Arabic Calligraphy in a Dedicated Frame Box */}
                  <div className="inline-flex items-center justify-center my-1 px-6 sm:px-8 py-1.5 rounded-xl bg-slate-950/40 border border-cyan-300/50 backdrop-blur-xs shadow-inner mx-auto">
                    <p className="text-xl sm:text-3xl font-arabic font-bold text-cyan-100 leading-normal drop-shadow-xs text-center">
                      تَرْتِيْبُ التَّهْلِيْلِ وَالدُّعَاءِ لِلأَمْوَاتِ
                    </p>
                  </div>

                  {/* Subtitle Description */}
                  <p className="text-xs sm:text-sm text-cyan-100/90 font-medium leading-relaxed max-w-xl mx-auto text-center">
                    Tawasul Al-Fatihah • Surat Pilihan • Dzikir & Tahlil • Doa Khusus Ahli Kubur / Arwah
                  </p>

                  {/* Section Filter Pills */}
                  <div className="flex items-center justify-center gap-1.5 pt-2 flex-wrap text-xs mx-auto">
                    <button
                      type="button"
                      onClick={() => setTahlilSectionFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        tahlilSectionFilter === 'all'
                          ? 'bg-cyan-400 text-slate-950 font-black shadow-xs ring-1 ring-cyan-200'
                          : 'bg-white/15 text-cyan-100 hover:bg-white/25 border border-white/20'
                      }`}
                    >
                      Semua ({TAHLIL_DATA.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTahlilSectionFilter('tawasul')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        tahlilSectionFilter === 'tawasul'
                          ? 'bg-cyan-400 text-slate-950 font-black shadow-xs ring-1 ring-cyan-200'
                          : 'bg-white/15 text-cyan-100 hover:bg-white/25 border border-white/20'
                      }`}
                    >
                      1. Tawasul Fatihah
                    </button>
                    <button
                      type="button"
                      onClick={() => setTahlilSectionFilter('surat')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        tahlilSectionFilter === 'surat'
                          ? 'bg-cyan-400 text-slate-950 font-black shadow-xs ring-1 ring-cyan-200'
                          : 'bg-white/15 text-cyan-100 hover:bg-white/25 border border-white/20'
                      }`}
                    >
                      2. Surat Pilihan
                    </button>
                    <button
                      type="button"
                      onClick={() => setTahlilSectionFilter('dzikir')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        tahlilSectionFilter === 'dzikir'
                          ? 'bg-cyan-400 text-slate-950 font-black shadow-xs ring-1 ring-cyan-200'
                          : 'bg-white/15 text-cyan-100 hover:bg-white/25 border border-white/20'
                      }`}
                    >
                      3. Dzikir & Tahlil
                    </button>
                    <button
                      type="button"
                      onClick={() => setTahlilSectionFilter('doa')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        tahlilSectionFilter === 'doa'
                          ? 'bg-cyan-400 text-slate-950 font-black shadow-xs ring-1 ring-cyan-200'
                          : 'bg-white/15 text-cyan-100 hover:bg-white/25 border border-white/20'
                      }`}
                    >
                      4. Doa Tahlil
                    </button>
                  </div>

                  {/* Salin Seluruh Teks Tahlil Button */}
                  <div className="flex items-center justify-center gap-2 pt-1.5">
                    <button
                      type="button"
                      onClick={handleCopyWholeTahlil}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 text-xs font-bold flex items-center gap-1.5 border border-cyan-300/50 shadow-2xs transition-all cursor-pointer backdrop-blur-xs"
                    >
                      {isWholeTahlilCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isWholeTahlilCopied ? 'Tersalin!' : 'Salin Seluruh Rangkaian Tahlil & Doa'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tahlil Items List (Nuansa Terang Lembut) */}
              <div className="space-y-3.5 my-2">
                {filteredTahlil.map((item) => {
                  const currentCount = tasbihCounts[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-cyan-200/70 hover:border-cyan-400/80 hover:shadow-md transition-all shadow-xs"
                    >
                      {/* Item Header */}
                      <div className="flex items-center justify-between mb-3 border-b border-cyan-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-cyan-100 border border-cyan-300 text-cyan-950 text-xs font-mono font-bold flex items-center justify-center">
                            {item.id}
                          </span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-slate-800">{item.title}</h4>
                            {item.count && (
                              <span className="text-[10px] text-cyan-900 font-bold bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                                {item.count}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Interactive Tasbih Counter Button (if dzikir) */}
                          {item.section === 'dzikir' && (
                            <div className="flex items-center gap-1 bg-cyan-50/80 px-2.5 py-1 rounded-xl border border-cyan-200">
                              <button
                                type="button"
                                onClick={() => handleIncrementTasbih(item.id)}
                                className="flex items-center gap-1 text-xs font-bold text-cyan-950 hover:text-cyan-700 cursor-pointer"
                              >
                                <Plus className="w-3 h-3 text-cyan-700" />
                                <span>Hitung: {currentCount}</span>
                              </button>
                              {currentCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleResetTasbih(item.id)}
                                  className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-800 hover:bg-cyan-50 border border-slate-200 cursor-pointer"
                            title="Salin Bacaan Ini"
                          >
                            {copiedTahlilId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Arabic Text (Deep Sharp Charcoal) */}
                      <p
                        className={`text-right font-arabic font-bold text-slate-900 whitespace-pre-line ${getArabicSizeClass()}`}
                        dir="rtl"
                      >
                        {item.arabic}
                      </p>

                      {/* Latin Transliteration */}
                      {showLatin && (
                        <p className="text-xs sm:text-sm font-sans font-semibold text-cyan-900 mt-2.5 leading-relaxed">
                          {item.latin}
                        </p>
                      )}

                      {/* Indonesian Translation */}
                      {showTranslation && (
                        <p className="text-xs sm:text-sm font-sans text-slate-600 mt-1.5 leading-relaxed">
                          {item.translation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: KUMPULAN SHOLAWAT NABI SAW (LENGKAP, RAPI & INDAH)   */}
          {/* ========================================================= */}
          {mainTab === 'sholawat' && (
            <div
              ref={versesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gradient-to-b from-[#faf8f5] via-[#f5f0e6] to-[#ece5d8] custom-scrollbar flex flex-col text-slate-800"
            >
              {/* Sholawat Header Banner (Ornate Symmetrical Frame) */}
              <div className="py-5 px-4 sm:py-6 sm:px-6 rounded-2xl bg-gradient-to-r from-[#03281d] via-[#054633] to-[#022118] border-2 border-amber-400/80 shadow-md mb-3.5 relative overflow-hidden text-white flex flex-col items-center justify-center text-center">
                {/* Ramadan Starry Sky Backdrop */}
                <RamadanStarryBackdrop variant="emerald" showCrescent={true} />

                {/* Ornate Frame Outer Line */}
                <div className="absolute inset-1.5 border border-amber-300/30 rounded-xl pointer-events-none" />

                <div className="relative z-10 w-full flex flex-col items-center justify-center text-center space-y-2 max-w-2xl mx-auto">
                  <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400/20 via-emerald-500/25 to-amber-400/20 border border-amber-300/50 text-amber-200 text-xs font-bold shadow-2xs backdrop-blur-xs leading-none mx-auto text-center">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                    <span className="leading-normal">✨ Kumpulan Sholawat & Qasidah Nabawiyyah Terlengkap 🌙</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide font-sans drop-shadow-xs text-center mx-auto">
                    Kumpulan Sholawat Nabi SAW
                  </h2>

                  <p className="text-2xl sm:text-3xl font-arabic font-bold text-amber-200/90 text-center tracking-wide leading-relaxed mx-auto">
                    مَجْمُوْعَةُ الصَّلَوَاتِ عَلَى خَيْرِ الْبَرِيَّةِ ﷺ
                  </p>

                  <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl mx-auto leading-relaxed font-sans text-center">
                    Koleksi sholawat mutabaroh: Sholawat Haji, Nariyah, Asyghil, Bahriyyah, Busyro, Al-Fatih, Tarhim, Tibbil Qulub, Nuridzati, Nuril Anwar, Tanpo Waton, Ziarah Wali, Munjiyat, Ibrahimiyyah, Jibril, Badar, dan Nahdliyyah.
                  </p>

                  {/* Summary Badges & Copy All Button */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 mx-auto">
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-300/40 shadow-xs">
                      {filteredSholawat.length} Sholawat Tersedia
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyWholeSholawat}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-400/40 transition-all cursor-pointer shadow-xs"
                      title="Salin Semua Sholawat Beserta Arti & Fadhilah"
                    >
                      {isSholawatWholeCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Semua Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-300" />
                          <span>Salin Seluruh Sholawat</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="bg-white/95 rounded-2xl p-3 border border-amber-200/80 shadow-xs mb-3.5 space-y-2.5">
                {/* Search & View Mode Switcher */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="relative w-full sm:flex-1">
                    <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nomor (001), judul sholawat, teks latin, atau fadhilah..."
                      className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-emerald-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 bg-[#faf8f5] text-slate-800 placeholder-slate-400"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-emerald-50 p-1 rounded-xl border border-emerald-200 shrink-0 w-full sm:w-auto justify-center">
                    <button
                      type="button"
                      onClick={() => setSholawatViewMode('cards')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        sholawatViewMode === 'cards'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      Mode Baca Lengkap
                    </button>
                    <button
                      type="button"
                      onClick={() => setSholawatViewMode('compact_list')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        sholawatViewMode === 'compact_list'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      Mode Daftar (001 - 018)
                    </button>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
                  <button
                    type="button"
                    onClick={() => setSholawatCategoryFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                      sholawatCategoryFilter === 'all'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    Semua ({SHOLAWAT_DATA.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSholawatCategoryFilter('hajat')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                      sholawatCategoryFilter === 'hajat'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    🤲 Hajat & Rezeki
                  </button>
                  <button
                    type="button"
                    onClick={() => setSholawatCategoryFilter('fadhilah')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                      sholawatCategoryFilter === 'fadhilah'
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    💖 Pelapang & Kesembuhan
                  </button>
                  <button
                    type="button"
                    onClick={() => setSholawatCategoryFilter('wirid')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                      sholawatCategoryFilter === 'wirid'
                        ? 'bg-indigo-700 text-white shadow-xs'
                        : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                  >
                    📿 Wirid & Keutamaan
                  </button>
                  <button
                    type="button"
                    onClick={() => setSholawatCategoryFilter('syiir')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                      sholawatCategoryFilter === 'syiir'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
                    }`}
                  >
                    📜 Qasidah & Syi'ir
                  </button>
                  <button
                    type="button"
                    onClick={() => setSholawatCategoryFilter('ziarah')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                      sholawatCategoryFilter === 'ziarah'
                        ? 'bg-cyan-700 text-white shadow-xs'
                        : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200'
                    }`}
                  >
                    🕌 Ziarah Auliya
                  </button>
                </div>
              </div>

              {/* Sholawat Cards Content */}
              {filteredSholawat.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-amber-200 text-slate-500">
                  <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
                  <p className="font-bold text-slate-700">Tidak ada sholawat yang sesuai pencarian</p>
                  <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci nama sholawat lain atau reset filter kategori.</p>
                </div>
              ) : sholawatViewMode === 'compact_list' ? (
                /* Compact List View (Mirrors the mobile book style in the uploaded screenshot, elevated with modern elegance) */
                <div className="space-y-2.5">
                  {filteredSholawat.map((item) => {
                    const isExpanded = expandedSholawatId === item.id;
                    const count = sholawatCounts[item.id] || 0;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-gradient-to-r from-[#032e22] via-[#054b37] to-[#032b1f] border border-emerald-600/70 shadow-sm overflow-hidden text-white transition-all"
                      >
                        {/* Compact Clickable Row Header */}
                        <div
                          onClick={() => handleToggleSholawatExpand(item.id)}
                          className="px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition-all select-none"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Number Badge (001, 002...) */}
                            <div className="w-11 h-9 rounded-xl bg-emerald-950/80 border border-amber-300/40 flex items-center justify-center text-amber-300 font-mono font-bold text-xs shrink-0 shadow-inner">
                              {item.numberFormatted}
                            </div>

                            {/* Title & Category */}
                            <div className="min-w-0">
                              <h4 className="text-sm sm:text-base font-bold text-white truncate tracking-wide">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-emerald-200/90 truncate font-sans">
                                  {item.categoryLabel}
                                </span>
                                {item.source && (
                                  <span className="hidden sm:inline-block text-[10px] text-amber-300/80 truncate">
                                    • {item.source}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {count > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-emerald-950">
                                {count}x
                              </span>
                            )}
                            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Full Reading Content */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 bg-[#faf8f5] text-slate-800 border-t border-emerald-700/40 space-y-4">
                            {/* Arabic Title & Fadhilah Box */}
                            <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              <div>
                                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                                  🌟 Fadhilah & Keutamaan
                                </span>
                                <p className="text-xs sm:text-sm text-slate-700 mt-1 font-sans leading-relaxed">
                                  {item.fadhilah}
                                </p>
                              </div>
                              <span className="font-arabic text-lg sm:text-xl font-bold text-amber-900 shrink-0 self-end sm:self-center">
                                {item.arabicTitle}
                              </span>
                            </div>

                            {/* Arabic Text (High Contrast & Clear) */}
                            <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                              <p
                                className={`text-right font-arabic font-bold text-slate-900 whitespace-pre-line ${getArabicSizeClass()}`}
                                dir="rtl"
                              >
                                {item.arabic}
                              </p>
                            </div>

                            {/* Latin Transliteration */}
                            {showLatin && (
                              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                                  Transliterasi Latin:
                                </span>
                                <p className="text-xs sm:text-sm font-sans font-semibold text-emerald-950 leading-relaxed whitespace-pre-line">
                                  {item.latin}
                                </p>
                              </div>
                            )}

                            {/* Indonesian Translation */}
                            {showTranslation && (
                              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                  Terjemahan Bahasa Indonesia:
                                </span>
                                <p className="text-xs sm:text-sm font-sans text-slate-700 leading-relaxed whitespace-pre-line">
                                  {item.translation}
                                </p>
                              </div>
                            )}

                            {/* Benefits List */}
                            {item.benefits && item.benefits.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-xs font-bold text-emerald-900 block">
                                  Mutiara Hikmah & Pengamalan:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {item.benefits.map((b, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80"
                                    >
                                      <span className="text-amber-500 font-bold shrink-0">•</span>
                                      <span>{b}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Action Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                              {/* Digital Tasbih / Counter */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleIncrementSholawat(item.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Hitung Wirid</span>
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-950/40 text-amber-200 text-[11px] font-mono">
                                    {count}x
                                  </span>
                                </button>

                                {count > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleResetSholawat(item.id)}
                                    className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 cursor-pointer text-xs"
                                    title="Reset Hitungan"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Copy Button */}
                              <button
                                type="button"
                                onClick={() => handleCopySholawat(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition-all cursor-pointer"
                              >
                                {copiedSholawatId === item.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">Tersalin!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Salin Sholawat</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Full Card Reading View (Rich, Spaced, and Beautiful) */
                <div className="space-y-4">
                  {filteredSholawat.map((item) => {
                    const count = sholawatCounts[item.id] || 0;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-white border border-amber-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden"
                      >
                        {/* Card Header */}
                        <div className="px-4 py-3.5 bg-gradient-to-r from-[#03291d] via-[#054330] to-[#022218] text-white flex flex-wrap items-center justify-between gap-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-8 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 font-mono font-bold text-xs shrink-0 shadow-inner">
                              {item.numberFormatted}
                            </div>
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                                  {item.categoryLabel}
                                </span>
                                {item.source && (
                                  <span className="text-[11px] text-amber-200/80 truncate">
                                    • {item.source}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Calligraphic Arabic Title */}
                            <span className="font-arabic text-base sm:text-lg font-bold text-amber-200">
                              {item.arabicTitle}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 sm:p-5 space-y-4">
                          {/* Fadhilah Notice Box */}
                          <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-xs sm:text-sm text-amber-950 leading-relaxed font-sans">
                              <span className="font-bold">Keutamaan: </span>
                              {item.fadhilah}
                            </div>
                          </div>

                          {/* Arabic Text (Prominent, High Contrast) */}
                          <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f5] border border-emerald-100 shadow-inner">
                            <p
                              className={`text-right font-arabic font-bold text-slate-900 whitespace-pre-line ${getArabicSizeClass()}`}
                              dir="rtl"
                            >
                              {item.arabic}
                            </p>
                          </div>

                          {/* Latin Transliteration */}
                          {showLatin && (
                            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                                Transliterasi Latin:
                              </span>
                              <p className="text-xs sm:text-sm font-sans font-semibold text-emerald-950 leading-relaxed whitespace-pre-line">
                                {item.latin}
                              </p>
                            </div>
                          )}

                          {/* Indonesian Translation */}
                          {showTranslation && (
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                Arti & Terjemahan:
                              </span>
                              <p className="text-xs sm:text-sm font-sans text-slate-700 leading-relaxed whitespace-pre-line">
                                {item.translation}
                              </p>
                            </div>
                          )}

                          {/* Benefits Bullets */}
                          {item.benefits && item.benefits.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-xs font-bold text-slate-700 block">
                                Mutiara Faedah & Amalan:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {item.benefits.map((b, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2 text-xs text-slate-600 bg-[#fbf9f6] p-2 rounded-lg border border-slate-200"
                                  >
                                    <span className="text-amber-500 font-bold shrink-0">•</span>
                                    <span>{b}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Footer */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            {/* Interactive Digital Tasbih */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleIncrementSholawat(item.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Hitung Wirid</span>
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-950/40 text-amber-200 text-[11px] font-mono">
                                  {count}x
                                </span>
                              </button>

                              {count > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleResetSholawat(item.id)}
                                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 cursor-pointer text-xs"
                                  title="Reset Hitungan"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Copy Button */}
                            <button
                              type="button"
                              onClick={() => handleCopySholawat(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition-all cursor-pointer"
                            >
                              {copiedSholawatId === item.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700">Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Salin Sholawat</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: MAHALUL QIYAM LENGKAP (NUANSA TERANG LEMBUT)       */}
          {/* ========================================================= */}
          {mainTab === 'mahalul_qiyam' && (
            <div
              ref={versesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gradient-to-b from-[#faf8f5] via-[#f6f2ea] to-[#f0ebe0] custom-scrollbar flex flex-col text-slate-800"
            >
              {/* Mahalul Qiyam Header Banner (Ornate Symmetrical Frame) */}
              <div className="py-5 px-4 sm:py-6 sm:px-6 rounded-2xl bg-gradient-to-r from-[#380816] via-[#5e1026] to-[#300612] border-2 border-amber-400/80 shadow-md mb-3.5 relative overflow-hidden text-white flex flex-col items-center justify-center text-center">
                {/* Ramadan Starry Sky Backdrop */}
                <RamadanStarryBackdrop variant="rose" showCrescent={true} />

                {/* Ornate Frame Outer Line */}
                <div className="absolute inset-1.5 border border-amber-300/30 rounded-xl pointer-events-none" />

                <div className="relative z-10 w-full flex flex-col items-center justify-center text-center space-y-2">
                  <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400/20 via-rose-500/25 to-amber-400/20 border border-amber-300/50 text-amber-200 text-xs font-bold shadow-2xs backdrop-blur-xs leading-none mx-auto text-center">
                    <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse shrink-0" />
                    <span className="leading-normal">🌙 Nuansa Berkah Ramadhan • Maulid Simtudduror & Ad-Diba'i ✨</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide font-sans drop-shadow-xs text-center mx-auto">
                    Mahalul Qiyam
                  </h2>

                  <div className="inline-flex items-center justify-center my-0.5 px-6 py-1.5 rounded-xl bg-white/10 border border-amber-300/40 backdrop-blur-xs mx-auto shadow-inner">
                    <p className="text-2xl sm:text-3xl font-arabic font-bold text-amber-200 leading-normal text-center">
                      مَحَلُّ الْقِيَامِ الشَّرِيْفِ
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-rose-100/90 max-w-lg mx-auto leading-relaxed font-medium text-center">
                    Bait Qasidah & Shalawat Berdiri Menyambut Kelahiran Baginda Nabi Muhammad SAW Penuh Cinta & Ketakziman
                  </p>

                  {/* Section Filter Pills for Mahalul Qiyam */}
                  <div className="flex items-center justify-center gap-1.5 pt-1.5 flex-wrap text-xs mx-auto">
                    <button
                      type="button"
                      onClick={() => setMqSectionFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        mqSectionFilter === 'all'
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'bg-white/15 text-rose-100 hover:bg-white/25 border border-white/20'
                      }`}
                    >
                      Semua Bait ({MAHALUL_QIYAM_DATA.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMqSectionFilter('salam')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        mqSectionFilter === 'salam'
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'bg-white/15 text-rose-100 hover:bg-white/25 border border-white/20'
                      }`}
                    >
                      1. Yaa Nabi Salam
                    </button>
                    <button
                      type="button"
                      onClick={() => setMqSectionFilter('pujian')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        mqSectionFilter === 'pujian'
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'bg-white/15 text-rose-100 hover:bg-white/25 border border-white/20'
                      }`}
                    >
                      2. Asyroqol Badru
                    </button>
                    <button
                      type="button"
                      onClick={() => setMqSectionFilter('syauq')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        mqSectionFilter === 'syauq'
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'bg-white/15 text-rose-100 hover:bg-white/25 border border-white/20'
                      }`}
                    >
                      3. Kerinduan Alam
                    </button>
                    <button
                      type="button"
                      onClick={() => setMqSectionFilter('marhaban')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        mqSectionFilter === 'marhaban'
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'bg-white/15 text-rose-100 hover:bg-white/25 border border-white/20'
                      }`}
                    >
                      4. Marhaban
                    </button>
                    <button
                      type="button"
                      onClick={() => setMqSectionFilter('doa')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        mqSectionFilter === 'doa'
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'bg-white/15 text-rose-100 hover:bg-white/25 border border-white/20'
                      }`}
                    >
                      5. Doa Penutup
                    </button>
                  </div>

                  {/* Salin Seluruh Teks Mahalul Qiyam Button */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyWholeMq}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-bold flex items-center gap-1.5 border border-amber-300/40 shadow-2xs transition-all cursor-pointer backdrop-blur-xs"
                    >
                      {isMqWholeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isMqWholeCopied ? 'Tersalin!' : 'Salin Seluruh Syair Mahalul Qiyam'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Verses of Mahalul Qiyam (Nuansa Terang Lembut) */}
              <div className="space-y-3.5 my-2">
                {filteredMahalulQiyam.map((item) => {
                  const currentCount = mqCounts[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl transition-all shadow-xs ${
                        item.isReff
                          ? 'bg-gradient-to-br from-amber-50 via-rose-50/70 to-amber-50 border-2 border-amber-400 shadow-sm'
                          : 'bg-white border border-rose-200/70 hover:border-rose-300 hover:shadow-md'
                      }`}
                    >
                      {/* Top Verse Bar */}
                      <div className="flex items-center justify-between mb-3 border-b border-rose-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${
                              item.isReff
                                ? 'bg-amber-400 text-slate-950 font-black shadow-2xs'
                                : 'bg-rose-100 border border-rose-300 text-rose-900'
                            }`}
                          >
                            {item.id}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                              {item.isReff && <Sparkles className="w-3 h-3 text-amber-600" />}
                              Bait ke-{item.id} {item.isReff ? '• Salam Utama (Reff)' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Shalawat Clicker Counter for Mahalul Qiyam */}
                          <div className="flex items-center gap-1 bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-200">
                            <button
                              type="button"
                              onClick={() => handleIncrementMq(item.id)}
                              className="flex items-center gap-1 text-xs font-bold text-amber-950 hover:text-amber-700 cursor-pointer"
                              title="Hitung Bacaan Bait Ini"
                            >
                              <Plus className="w-3 h-3 text-amber-700" />
                              <span>Lantun: {currentCount}x</span>
                            </button>
                            {currentCount > 0 && (
                              <button
                                type="button"
                                onClick={() => handleResetMq(item.id)}
                                className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                                title="Reset Hitungan"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyMqItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-800 hover:bg-rose-50 border border-slate-200 cursor-pointer"
                            title="Salin Bait Ini"
                          >
                            {copiedMqId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Arabic Text (Centered and Balanced for Qasidah / Syair) */}
                      <p
                        className={`text-right sm:text-center font-arabic font-bold text-slate-900 whitespace-pre-line ${getArabicSizeClass()}`}
                        dir="rtl"
                      >
                        {item.arabic}
                      </p>

                      {/* Latin Transliteration */}
                      {showLatin && (
                        <p className="text-xs sm:text-sm font-sans font-semibold text-rose-950 mt-2.5 text-left sm:text-center whitespace-pre-line leading-relaxed">
                          {item.latin}
                        </p>
                      )}

                      {/* Indonesian Translation */}
                      {showTranslation && (
                        <p className="text-xs sm:text-sm font-sans text-slate-600 mt-1.5 text-left sm:text-center whitespace-pre-line leading-relaxed italic">
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
          {/* TAB 5: DZIKIR & DOA SESUDAH SHOLAT FARDHU (TERANG LEMBUT) */}
          {/* ========================================================= */}
          {mainTab === 'dzikir_sholat' && (
            <div
              ref={versesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gradient-to-b from-[#faf8f5] via-[#f5f2eb] to-[#efebe2] custom-scrollbar flex flex-col text-slate-800"
            >
              {/* Dzikir Sholat Header Banner */}
              <div className="py-5 px-4 sm:py-6 sm:px-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border border-emerald-700/50 shadow-md mb-3.5 relative overflow-hidden text-white flex flex-col items-center justify-center text-center">
                <RamadanStarryBackdrop variant="emerald" showCrescent={true} />
                <div className="absolute top-0 right-0 opacity-10 font-arabic text-8xl select-none pointer-events-none p-2 text-emerald-200">
                  أَذْكَارُ الصَّلَاةِ
                </div>
                
                <div className="relative z-10 w-full flex flex-col items-center justify-center text-center space-y-2">
                  <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold shadow-2xs backdrop-blur-xs leading-none mx-auto text-center">
                    <Layers className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="leading-normal">Wirid & Doa Ba'da Sholat Fardhu</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide font-sans drop-shadow-xs text-center mx-auto">
                    Dzikir & Doa Sesudah Sholat
                  </h2>
                  
                  <div className="inline-flex items-center justify-center my-0.5 px-6 py-1.5 rounded-xl bg-white/10 border border-amber-300/40 backdrop-blur-xs mx-auto shadow-inner">
                    <p className="text-2xl sm:text-3xl font-arabic font-bold text-emerald-100 leading-normal text-center">
                      أَذْكَارُ وَأَدْعِيَةُ بَعْدَ الصَّلَاةِ الْمَكْتُوبَةِ
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl mx-auto leading-relaxed font-medium text-center">
                    Susunan bacaan istighfar, ayat kursi, tasbih 33x, dan doa memohon keselamatan dunia-akhirat sesuai Sunnah Rasulullah SAW
                  </p>

                  {/* Section Filter Pills for Dzikir Sholat */}
                  <div className="flex items-center justify-center gap-1.5 pt-1.5 flex-wrap text-xs mx-auto">
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
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyWholeDzikir}
                      className="px-3 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-bold flex items-center gap-1.5 border border-amber-300/40 shadow-2xs transition-all cursor-pointer backdrop-blur-xs"
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

          {/* ========================================================= */}
          {/* TAB 6: DOA-DOA HARIAN LENGKAP (TERANG LEMBUT)             */}
          {/* ========================================================= */}
          {mainTab === 'doa_harian' && (
            <div
              ref={versesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gradient-to-b from-[#faf8f5] via-[#f5f2eb] to-[#efebe2] custom-scrollbar flex flex-col text-slate-800"
            >
              {/* Doa Harian Header Banner */}
              <div className="py-5 px-4 sm:py-6 sm:px-6 rounded-2xl bg-gradient-to-r from-teal-950 via-emerald-900 to-teal-900 border border-teal-700/50 shadow-md mb-3.5 relative overflow-hidden text-white flex flex-col items-center justify-center text-center">
                <RamadanStarryBackdrop variant="teal" showCrescent={true} />
                <div className="absolute top-0 right-0 opacity-10 font-arabic text-8xl select-none pointer-events-none p-2 text-emerald-200">
                  الأَدْعِيَةُ
                </div>
                
                <div className="relative z-10 w-full flex flex-col items-center justify-center text-center space-y-2">
                  <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold shadow-2xs backdrop-blur-xs leading-none mx-auto text-center">
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="leading-normal">Kumpulan Doa Pilihan Santri & Umat Islam</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide font-sans drop-shadow-xs text-center mx-auto">
                    Doa-Doa Harian Lengkap
                  </h2>
                  
                  <div className="inline-flex items-center justify-center my-0.5 px-6 py-1.5 rounded-xl bg-white/10 border border-teal-300/40 backdrop-blur-xs mx-auto shadow-inner">
                    <p className="text-2xl sm:text-3xl font-arabic font-bold text-teal-100 leading-normal text-center">
                      الأَدْعِيَةُ الْيَوْمِيَّةُ الْمَأْثُورَةُ
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-teal-100/90 max-w-xl mx-auto leading-relaxed font-medium text-center">
                    Kumpulan doa sehari-hari bersumber dari Al-Qur'an dan Sunnah Rasulullah SAW lengkap dengan adab, teks Arab, Latin, dan Terjemahan
                  </p>

                  {/* Category Filter Pills for Doa Harian */}
                  <div className="flex items-center justify-center gap-1.5 pt-1.5 flex-wrap text-xs mx-auto">
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
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

          {/* ========================================================= */}
          {/* TAB 7: PANDUAN LENGKAP TATA CARA SHOLAT & FIKIH IBADAH */}
          {/* ========================================================= */}
          {mainTab === 'tata_cara_sholat' && (
            <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 custom-scrollbar bg-[#faf8f5]">
              {/* Header Banner */}
              <div className="py-5 px-4 sm:py-6 sm:px-6 rounded-2xl bg-gradient-to-r from-[#03281d] via-[#043e2d] to-[#022017] text-white border border-emerald-700/60 shadow-md relative overflow-hidden flex flex-col items-center justify-center text-center">
                <RamadanStarryBackdrop variant="emerald" showCrescent={true} />
                <div className="relative z-10 w-full flex flex-col items-center justify-center text-center space-y-2 max-w-2xl mx-auto">
                  <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-bold shadow-2xs backdrop-blur-xs leading-none mx-auto text-center">
                    <Compass className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="leading-normal">Panduan Praktis & Fikih Ibadah Terpadu</span>
                  </div>

                  <h3 className="text-lg sm:text-2xl font-black text-amber-200 tracking-wide font-sans text-center mx-auto">
                    Panduan Tata Cara Sholat & Fikih Ibadah
                  </h3>

                  <p className="text-xs sm:text-sm text-emerald-200/90 max-w-xl mx-auto leading-relaxed text-center">
                    Panduan lengkap gerakan, bacaan rukun, lafal niat sholat fardhu & sunnah, wudhu, tayamum, serta sujud sahwi / tilawah / syukur sesuai sunnah Rasulullah SAW.
                  </p>

                  <div className="flex items-center justify-center gap-2 pt-1 mx-auto">
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-300/40">
                      {filteredSholatGuide.length} Materi Panduan Tersedia
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Filter Chips & Search Bar */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x overscroll-x-contain pb-1 scrollbar-thin scroll-smooth select-none">
                  {SHOLAT_GUIDE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSholatCategoryFilter(cat.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        sholatCategoryFilter === cat.id
                          ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-md ring-1 ring-emerald-400 font-black'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      <span>{cat.iconEmoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari panduan sholat, lafal niat, bacaan iftitah, sujud, rukun..."
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sholat Guides List */}
              <div className="space-y-4 my-2">
                {filteredSholatGuide.map((item) => {
                  const isExpanded = expandedSholatId === item.id;
                  const isCopied = copiedSholatId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                        isExpanded
                          ? 'bg-white border-emerald-400/80 shadow-md ring-1 ring-emerald-300/40'
                          : 'bg-white/90 border-slate-200 hover:border-emerald-300 hover:bg-white'
                      }`}
                    >
                      {/* Card Header Accordion Trigger */}
                      <div
                        onClick={() => handleToggleSholatExpand(item.id)}
                        className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none bg-gradient-to-r from-transparent via-emerald-50/20 to-transparent hover:bg-emerald-50/40 transition-colors"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300/60">
                              {item.categoryLabel}
                            </span>
                            {item.rakaat && (
                              <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300/60">
                                🕌 {item.rakaat}
                              </span>
                            )}
                            {item.waktuPelaksanaan && (
                              <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200">
                                ⏰ {item.waktuPelaksanaan}
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline justify-between gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                              {item.title}
                            </h4>
                            {item.arabicTitle && (
                              <span className="text-sm sm:text-base font-arabic font-bold text-emerald-800" dir="rtl">
                                {item.arabicTitle}
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {item.summary}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleCopySholatGuideItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 cursor-pointer transition-colors"
                            title="Salin Seluruh Panduan Ini"
                          >
                            {isCopied ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleSholatExpand(item.id)}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 bg-emerald-50 border border-emerald-200 cursor-pointer transition-colors"
                            title={isExpanded ? 'Tutup Detail' : 'Buka Detail Lengkap'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Detailed Content */}
                      {isExpanded && (
                        <div className="px-4 sm:px-6 pb-5 pt-1 space-y-4 border-t border-emerald-100 bg-slate-50/40">
                          {/* 1. Niat Sholat Section */}
                          {item.niat && (
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center gap-2 border-b border-emerald-200/80 pb-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                <h5 className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-wider">
                                  Lafal Niat Sholat
                                </h5>
                              </div>

                              <div className="grid grid-cols-1 gap-3">
                                {item.niat.munfarid && (
                                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        Niat Sholat Sendiri (Munfarid)
                                      </span>
                                    </div>
                                    <p
                                      className={`text-right font-arabic font-bold text-slate-900 whitespace-pre-line ${getArabicSizeClass()}`}
                                      dir="rtl"
                                    >
                                      {item.niat.munfarid.arabic}
                                    </p>
                                    {showLatin && (
                                      <p className="text-xs sm:text-sm font-sans font-semibold text-emerald-800 leading-relaxed">
                                        {item.niat.munfarid.latin}
                                      </p>
                                    )}
                                    {showTranslation && (
                                      <p className="text-xs sm:text-sm font-sans text-slate-600 leading-relaxed italic">
                                        "{item.niat.munfarid.translation}"
                                      </p>
                                    )}
                                  </div>
                                )}

                                {item.niat.imam && (
                                  <div className="p-3.5 rounded-xl bg-white border border-teal-200 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                        Niat Sebagai Imam
                                      </span>
                                    </div>
                                    <p
                                      className={`text-right font-arabic font-bold text-slate-900 whitespace-pre-line ${getArabicSizeClass()}`}
                                      dir="rtl"
                                    >
                                      {item.niat.imam.arabic}
                                    </p>
                                    {showLatin && (
                                      <p className="text-xs sm:text-sm font-sans font-semibold text-teal-800 leading-relaxed">
                                        {item.niat.imam.latin}
                                      </p>
                                    )}
                                    {showTranslation && (
                                      <p className="text-xs sm:text-sm font-sans text-slate-600 leading-relaxed italic">
                                        "{item.niat.imam.translation}"
                                      </p>
                                    )}
                                  </div>
                                )}

                                {item.niat.makmum && (
                                  <div className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                        Niat Sebagai Makmum (Berjamaah)
                                      </span>
                                    </div>
                                    <p
                                      className={`text-right font-arabic font-bold text-slate-900 whitespace-pre-line ${getArabicSizeClass()}`}
                                      dir="rtl"
                                    >
                                      {item.niat.makmum.arabic}
                                    </p>
                                    {showLatin && (
                                      <p className="text-xs sm:text-sm font-sans font-semibold text-amber-900 leading-relaxed">
                                        {item.niat.makmum.latin}
                                      </p>
                                    )}
                                    {showTranslation && (
                                      <p className="text-xs sm:text-sm font-sans text-slate-600 leading-relaxed italic">
                                        "{item.niat.makmum.translation}"
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* 2. Step-by-Step Gerakan & Bacaan Section */}
                          {item.steps && item.steps.length > 0 && (
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center gap-2 border-b border-emerald-200/80 pb-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                <h5 className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-wider">
                                  Urutan Langkah & Bacaan
                                </h5>
                              </div>

                              <div className="space-y-3">
                                {item.steps.map((step) => (
                                  <div
                                    key={step.stepNumber}
                                    className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-2.5 hover:border-emerald-300 transition-colors"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <h6 className="text-xs sm:text-sm font-black text-slate-800">
                                        {step.title}
                                      </h6>
                                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold flex items-center justify-center shrink-0">
                                        {step.stepNumber}
                                      </span>
                                    </div>

                                    {step.postureDescription && (
                                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                                        <strong>Posisi/Gerakan:</strong> {step.postureDescription}
                                      </p>
                                    )}

                                    {step.arabic && (
                                      <p
                                        className={`text-right font-arabic font-bold text-slate-900 whitespace-pre-line leading-loose ${getArabicSizeClass()}`}
                                        dir="rtl"
                                      >
                                        {step.arabic}
                                      </p>
                                    )}

                                    {step.latin && showLatin && (
                                      <p className="text-xs sm:text-sm font-sans font-semibold text-emerald-800 leading-relaxed">
                                        {step.latin}
                                      </p>
                                    )}

                                    {step.translation && showTranslation && (
                                      <p className="text-xs sm:text-sm font-sans text-slate-600 leading-relaxed italic">
                                        "{step.translation}"
                                      </p>
                                    )}

                                    {step.note && (
                                      <div className="flex items-start gap-1.5 text-[11px] text-amber-900 font-medium bg-amber-50/90 p-2 rounded-lg border border-amber-200">
                                        <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                        <span><strong>Catatan:</strong> {step.note}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 3. Doa Khusus Section (e.g. Qunut, Doa Sholat Sunnah) */}
                          {item.doaKhusus && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border border-emerald-200 space-y-2.5">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-700" />
                                <h5 className="text-xs sm:text-sm font-black text-emerald-950">
                                  {item.doaKhusus.title}
                                </h5>
                              </div>

                              <p
                                className={`text-right font-arabic font-bold text-slate-900 whitespace-pre-line leading-loose ${getArabicSizeClass()}`}
                                dir="rtl"
                              >
                                {item.doaKhusus.arabic}
                              </p>

                              {showLatin && (
                                <p className="text-xs sm:text-sm font-sans font-semibold text-emerald-800 leading-relaxed">
                                  {item.doaKhusus.latin}
                                </p>
                              )}

                              {showTranslation && (
                                <p className="text-xs sm:text-sm font-sans text-slate-600 leading-relaxed italic">
                                  "{item.doaKhusus.translation}"
                                </p>
                              )}

                              {item.doaKhusus.keutamaan && (
                                <p className="text-[11px] text-emerald-900 bg-white/80 p-2 rounded-lg border border-emerald-100">
                                  <strong>Keutamaan:</strong> {item.doaKhusus.keutamaan}
                                </p>
                              )}
                            </div>
                          )}

                          {/* 4. Ketentuan / Syarat & Rukun Points */}
                          {item.ketentuanKhusus && item.ketentuanKhusus.length > 0 && (
                            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                              <h5 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-teal-700" />
                                <span>Ketentuan, Syarat & Rukun:</span>
                              </h5>
                              <ul className="space-y-1.5 pl-4 list-disc text-xs sm:text-sm text-slate-700 leading-relaxed">
                                {item.ketentuanKhusus.map((k, idx) => (
                                  <li key={idx}>{k}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* 5. Keutamaan Footer Banner */}
                          {item.keutamaan && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm flex items-start gap-2">
                              <Star className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <p>
                                <strong>Keutamaan Ibadah:</strong> {item.keutamaan}
                              </p>
                            </div>
                          )}
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
