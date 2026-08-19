import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  SHORT_SURAHS_DATA,
  ShortSurah,
  SurahVerse,
} from '../data/shortSurahs';
import { SURAH_YASIN_DATA } from '../data/yasinData';
import { TAHLIL_DATA, TahlilItem } from '../data/tahlilData';
import { useQuranAudioPlayer, MaleVoiceStyle } from '../hooks/useQuranAudioPlayer';
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
  List,
  ArrowLeft,
  Headphones,
  Mic,
  Sliders,
  HelpCircle,
  BookMarked,
  Scroll,
  RotateCcw,
  Plus,
} from 'lucide-react';

interface ShortSurahsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'juz_amma' | 'yasin' | 'tahlil';
}

export const ShortSurahsModal: React.FC<ShortSurahsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'juz_amma',
}) => {
  // Main Module Tab: Juz 'Amma, Surat Yasin, or Tahlil
  const [mainTab, setMainTab] = useState<'juz_amma' | 'yasin' | 'tahlil'>(initialTab);

  // Juz Amma Selected Surah
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Makkiyyah' | 'Madaniyyah'>('all');
  
  // Tahlil section filter & digital tasbih state
  const [tahlilSectionFilter, setTahlilSectionFilter] = useState<'all' | 'tawasul' | 'surat' | 'dzikir' | 'doa'>('all');
  const [tasbihCounts, setTasbihCounts] = useState<Record<number, number>>({});
  const [copiedTahlilId, setCopiedTahlilId] = useState<number | null>(null);

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
    seekFullAudio,
  } = useQuranAudioPlayer({
    surah: currentSurah,
    onVerseChange: () => {
      if (activeVerseRef.current) {
        activeVerseRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },
  });

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

  const handleTabChange = (newTab: 'juz_amma' | 'yasin' | 'tahlil') => {
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

  const idVoices = installedVoices.filter(
    (v) => v.lang.startsWith('id') || v.lang.startsWith('ms') || v.name.toLowerCase().includes('indonesia')
  );

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-5xl h-[92vh] sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* ========================================================= */}
        {/* TOP HEADER: Branding, Main Tabs & Global Controls */}
        {/* ========================================================= */}
        <div className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-[#032a1f] via-[#043d2c] to-[#022319] border-b border-emerald-700/50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          
          {/* Logo & Main Tabs (Compact with Small Icons) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <BookOpen className="w-3.5 h-3.5" />
            </div>

            {/* Navigation Tabs Pill (Small Icons) */}
            <div className="flex items-center bg-slate-950/60 p-0.5 rounded-xl border border-emerald-600/40">
              <button
                type="button"
                onClick={() => handleTabChange('juz_amma')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mainTab === 'juz_amma'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-emerald-300 hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Juz 'Amma</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('yasin')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mainTab === 'yasin'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-white/5'
                }`}
              >
                <Scroll className="w-3 h-3" />
                <span>Surat Yasin</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('tahlil')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mainTab === 'tahlil'
                    ? 'bg-cyan-700 text-white shadow-xs'
                    : 'text-slate-300 hover:text-cyan-300 hover:bg-white/5'
                }`}
              >
                <BookMarked className="w-3 h-3" />
                <span>Tahlil & Doa</span>
              </button>
            </div>
          </div>

          {/* Quick Tools & Close Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
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

            {/* Close Modal */}
            <button
              type="button"
              onClick={() => {
                stopAll();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-900/60 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Tutup Jendela"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* AUDIO PLAYER BAR (Only for Juz 'Amma and Yasin) */}
        {/* ========================================================= */}
        {mainTab !== 'tahlil' && (
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
                title="Pengaturan Suara Penerjemah (Nada Berat / Pria)"
              >
                <Sliders className="w-3 h-3" />
                <span className="hidden md:inline">Suara Terjemah</span>
              </button>
            </div>
          </div>
        )}

        {/* Voice Setting Pop-down Tray */}
        {showVoiceSettings && mainTab !== 'tahlil' && (
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
                  <div className="absolute top-0 right-0 opacity-10 font-arabic text-7xl select-none pointer-events-none p-2">
                    {currentSurah.arabicName}
                  </div>
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
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 border border-white/20 transition-all"
                    >
                      {isWholeSurahCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isWholeSurahCopied ? 'Tersalin!' : 'Salin Semua Surat'}</span>
                    </button>
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
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#2a1703] via-[#4d2a04] to-[#241302] border border-amber-600/40 shadow-lg mb-4 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 font-arabic text-8xl select-none pointer-events-none p-2">
                  يس
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Jantung Al-Qur'an (Qalbul Qur'an)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide font-sans">
                  Surat Yasin
                </h2>
                <p className="text-3xl sm:text-4xl font-arabic font-bold text-white mt-1">
                  سُورَةُ يسٓ
                </p>
                <p className="text-xs text-amber-200 mt-1">
                  "Yasin" • Surah ke-36 • Makkiyyah • 83 Ayat
                </p>

                <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyWholeSurah}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold flex items-center gap-1 border border-amber-400/30 transition-all"
                  >
                    {isWholeSurahCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isWholeSurahCopied ? 'Tersalin!' : 'Salin Seluruh Surat Yasin'}</span>
                  </button>
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
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
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
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
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
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
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
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
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
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      tahlilSectionFilter === 'doa'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    4. Doa Tahlil
                  </button>
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
                                className="flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Hitung: {currentCount}</span>
                              </button>
                              {currentCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleResetTasbih(item.id)}
                                  className="text-slate-500 hover:text-rose-400 ml-1"
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-slate-800"
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
        </div>
      </div>
    </div>
  );
};
