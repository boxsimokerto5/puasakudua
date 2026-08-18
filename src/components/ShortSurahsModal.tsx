import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  SHORT_SURAHS_DATA,
  ShortSurah,
  SurahVerse,
} from '../data/shortSurahs';
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
} from 'lucide-react';

interface ShortSurahsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortSurahsModal: React.FC<ShortSurahsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Makkiyyah' | 'Madaniyyah'>('all');
  
  // Mobile tab state: 'list' (Daftar Surat) or 'reader' (Baca Surat)
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

  // Current Selected Surah Index & Data
  const currentSurahIndex = useMemo(() => {
    const idx = SHORT_SURAHS_DATA.findIndex((s) => s.number === selectedSurahNumber);
    return idx !== -1 ? idx : 0;
  }, [selectedSurahNumber]);

  const currentSurah = useMemo<ShortSurah>(() => {
    return SHORT_SURAHS_DATA[currentSurahIndex] || SHORT_SURAHS_DATA[0];
  }, [currentSurahIndex]);

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

  // Filtered Surahs List
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

  // Next and Previous Surahs
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
    const text = `QS. ${currentSurah.name}: ${verse.number}\n\n${verse.arabic}\n\n"${verse.latin}"\n\nArtinya: ${verse.translation}`;
    navigator.clipboard.writeText(text);
    setCopiedVerseNumber(verse.number);
    setTimeout(() => setCopiedVerseNumber(null), 2000);
  };

  const handleCopyWholeSurah = () => {
    let text = `📖 *Surat ${currentSurah.name} (${currentSurah.arabicName})*\n${currentSurah.type} • ${currentSurah.totalVerses} Ayat • "${currentSurah.translation}"\n\n`;
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

  const idVoices = installedVoices.filter(
    (v) => v.lang.startsWith('id') || v.lang.startsWith('ms') || v.name.toLowerCase().includes('indonesia')
  );
  const displayVoices = idVoices.length > 0 ? idVoices : installedVoices;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Main Glassmorphic Modal Card */}
      <div className="relative w-full max-w-5xl h-[94vh] max-h-[850px] bg-gradient-to-b from-[#022319] via-[#033425] to-[#011710] border-2 border-amber-400/50 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-white overflow-hidden flex flex-col my-auto">
        {/* Subtle Geometric Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

        {/* Ambient Top Glow Rings */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header */}
        <div className="relative z-10 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-emerald-800/80 bg-emerald-950/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-emerald-950 flex items-center justify-center shadow-md font-black shrink-0">
              <BookOpen className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-amber-200 tracking-wide font-sans">
                  Mushaf Surat-Surat Pendek (Juz 'Amma)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 hidden sm:inline-block">
                  {SHORT_SURAHS_DATA.length} Surat Lengkap
                </span>
              </div>
              <p className="text-xs text-emerald-300/90 font-medium">
                Dilengkapi Suara Murottal Syaikh Mishary & Suara Penerjemah Per Ayat
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopAll();
              onClose();
            }}
            className="p-2 rounded-xl bg-emerald-900/60 hover:bg-red-500/20 text-emerald-300 hover:text-red-300 border border-emerald-700/60 hover:border-red-400/40 transition-all cursor-pointer shadow-xs"
            title="Tutup Mushaf"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Horizontal Surah Selector Bar */}
        <div className="relative z-10 px-3 sm:px-6 py-2 bg-emerald-950/90 border-b border-emerald-800/80 overflow-x-auto flex items-center gap-1.5 custom-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-amber-300/80 whitespace-nowrap pl-1 pr-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Pilih:</span>
          </span>
          {SHORT_SURAHS_DATA.map((surah) => {
            const isSelected = surah.number === currentSurah.number;
            return (
              <button
                key={surah.number}
                type="button"
                onClick={() => handleSelectSurah(surah.number)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-amber-400 text-emerald-950 font-black shadow-md border border-amber-300'
                    : 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-700/60'
                }`}
              >
                <span>{surah.name}</span>
                <span className="text-[10px] opacity-80 font-arabic">
                  {surah.arabicName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile View Switcher Tab */}
        <div className="md:hidden relative z-10 px-3 py-2 bg-emerald-950/80 border-b border-emerald-800/70 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMobileViewTab('list')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileViewTab === 'list'
                ? 'bg-amber-400 text-emerald-950 shadow-md border border-amber-300'
                : 'bg-emerald-900/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/60'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Daftar Surat ({filteredSurahs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileViewTab('reader')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileViewTab === 'reader'
                ? 'bg-amber-400 text-emerald-950 shadow-md border border-amber-300'
                : 'bg-emerald-900/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="truncate">Baca: {currentSurah.name}</span>
          </button>
        </div>

        {/* Modal Body: 2-Column Split (Sidebar Surah List + Reader Panel) */}
        <div className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar: Surah Selector & Search */}
          <div
            className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-emerald-800/80 bg-emerald-950/40 flex-col shrink-0 ${
              mobileViewTab === 'list' ? 'flex flex-1' : 'hidden md:flex'
            }`}
          >
            {/* Search and Filters */}
            <div className="p-3 sm:p-3.5 border-b border-emerald-800/70 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari surat / arti..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700/70 text-xs text-white placeholder-emerald-400/60 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Makkiyyah / Madaniyyah filter */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTypeFilter('all')}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    typeFilter === 'all'
                      ? 'bg-amber-400 text-emerald-950 font-black shadow-xs'
                      : 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/60'
                  }`}
                >
                  Semua ({SHORT_SURAHS_DATA.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('Makkiyyah')}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    typeFilter === 'Makkiyyah'
                      ? 'bg-amber-400 text-emerald-950 font-black shadow-xs'
                      : 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/60'
                  }`}
                >
                  Makkiyyah
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('Madaniyyah')}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    typeFilter === 'Madaniyyah'
                      ? 'bg-amber-400 text-emerald-950 font-black shadow-xs'
                      : 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/60'
                  }`}
                >
                  Madaniyyah
                </button>
              </div>
            </div>

            {/* Surah List Scroll Area */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredSurahs.map((surah) => {
                const isSelected = surah.number === currentSurah.number;
                return (
                  <button
                    key={surah.number}
                    type="button"
                    onClick={() => handleSelectSurah(surah.number)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-400/25 to-amber-500/15 border-amber-400/70 text-white shadow-xs'
                        : 'bg-emerald-950/30 hover:bg-emerald-900/50 border-transparent text-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          isSelected
                            ? 'bg-amber-400 text-emerald-950'
                            : 'bg-emerald-900/70 text-emerald-300 border border-emerald-700/60'
                        }`}
                      >
                        {surah.number === 255 ? '★' : surah.number}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-bold truncate ${
                            isSelected ? 'text-amber-300 font-black' : 'text-emerald-100'
                          }`}
                        >
                          {surah.name}
                        </p>
                        <p className="text-[10px] text-emerald-400/80 truncate">
                          {surah.translation} • {surah.totalVerses} ayat
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-arabic text-sm font-bold text-amber-200/90">
                        {surah.arabicName}
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredSurahs.length === 0 && (
                <div className="p-6 text-center text-xs text-emerald-400">
                  Tidak ada surat yang cocok dengan pencarian.
                </div>
              )}
            </div>
          </div>

          {/* Right Area: Mushaf Surah Reader Panel */}
          <div
            className={`flex-1 flex-col overflow-hidden bg-[#011d14]/70 ${
              mobileViewTab === 'reader' ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Top Reader Controls & Audio Bar */}
            <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-emerald-800/70 bg-emerald-950/60 flex flex-col gap-2 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                {/* Left: Mobile back to list + Audio Player Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setMobileViewTab('list')}
                    className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-900/80 text-emerald-200 border border-emerald-700/60"
                    title="Kembali ke Daftar Surat"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
                    <span>Daftar</span>
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                      isPlaying
                        ? 'bg-amber-400 text-emerald-950 border border-amber-300 animate-pulse'
                        : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-emerald-950 border border-amber-300'
                    }`}
                    title={
                      isPlaying
                        ? 'Jeda Pemutaran'
                        : playMode === 'verse_by_verse'
                        ? 'Putar Murottal + Terjemahan Suara'
                        : 'Putar Murottal Penuh 1 Surat'
                    }
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>
                      {isPlaying
                        ? isSpeakingTranslation
                          ? 'Suara Penerjemah...'
                          : 'Melantunkan Ayat...'
                        : playMode === 'verse_by_verse'
                        ? 'Putar + Terjemahan'
                        : 'Putar Full Murottal'}
                    </span>
                  </button>

                  {/* Mode Selector */}
                  <div className="flex items-center bg-emerald-900/90 border border-emerald-700/80 rounded-xl p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        stopAll();
                        setPlayMode('verse_by_verse');
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        playMode === 'verse_by_verse'
                          ? 'bg-amber-400 text-emerald-950 font-black shadow-xs'
                          : 'text-emerald-200 hover:text-white'
                      }`}
                      title="Putar ayat demi ayat beserta suara penerjemah"
                    >
                      <Headphones className="w-3 h-3" />
                      <span>Ayat + Arti</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopAll();
                        setPlayMode('full_surah');
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        playMode === 'full_surah'
                          ? 'bg-amber-400 text-emerald-950 font-black shadow-xs'
                          : 'text-emerald-200 hover:text-white'
                      }`}
                      title="Putar full continuous 1 surat nonstop oleh Syaikh Mishary Alafasy"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Full 1 Surat</span>
                    </button>
                  </div>

                  {/* Male Voice Tone & Engine Selector Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      showVoiceSettings
                        ? 'bg-amber-400 text-emerald-950 border-amber-300 font-black'
                        : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60'
                    }`}
                    title="Pilihan Stok Suara & Karakter Nada Pria"
                  >
                    <Mic className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden sm:inline">Pilihan Suara</span>
                    <Sliders className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                </div>

                {/* Right: View Toggles (Latin, Terjemahan, Font Size, Copy) */}
                <div className="flex items-center gap-1.5 flex-wrap ml-auto">
                  {/* Font Size Selector */}
                  <div className="flex items-center bg-emerald-950/80 border border-emerald-700/60 rounded-lg p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setArabicFontSize('sm')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        arabicFontSize === 'sm' ? 'bg-amber-400 text-emerald-950' : 'text-emerald-300 hover:text-white'
                      }`}
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={() => setArabicFontSize('md')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        arabicFontSize === 'md' ? 'bg-amber-400 text-emerald-950' : 'text-emerald-300 hover:text-white'
                      }`}
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => setArabicFontSize('lg')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        arabicFontSize === 'lg' ? 'bg-amber-400 text-emerald-950' : 'text-emerald-300 hover:text-white'
                      }`}
                    >
                      A+
                    </button>
                  </div>

                  {/* Latin Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowLatin(!showLatin)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      showLatin
                        ? 'bg-emerald-900 text-amber-300 border-amber-400/40'
                        : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 opacity-60'
                    }`}
                    title="Tampilkan / Sembunyikan Cara Baca Latin"
                  >
                    Latin
                  </button>

                  {/* Translation Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowTranslation(!showTranslation)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      showTranslation
                        ? 'bg-emerald-900 text-amber-300 border-amber-400/40'
                        : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 opacity-60'
                    }`}
                    title="Tampilkan / Sembunyikan Terjemahan Indonesia"
                  >
                    Arti
                  </button>

                  {/* Copy Whole Surah */}
                  <button
                    type="button"
                    onClick={handleCopyWholeSurah}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 transition-all cursor-pointer shadow-xs"
                    title="Salin Seluruh Isi Surat"
                  >
                    {isWholeSurahCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-300" />
                        <span className="hidden sm:inline">Salin Surat</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Voice Tuning & Engine Selector Panel (when toggled) */}
              {showVoiceSettings && (
                <div className="p-3.5 rounded-xl bg-emerald-900/80 border border-amber-400/40 space-y-3 text-xs animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300 flex items-center gap-1">
                        <Mic className="w-4 h-4 text-amber-400" />
                        Pilihan Preset Nada Pria:
                      </span>
                      <div className="flex items-center gap-1 bg-emerald-950/90 p-0.5 rounded-lg border border-emerald-700/60 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setMaleVoiceStyle('male_deep');
                            setCustomPitch(0.70);
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            maleVoiceStyle === 'male_deep'
                              ? 'bg-amber-400 text-emerald-950 font-black shadow-xs'
                              : 'text-emerald-300 hover:text-white'
                          }`}
                        >
                          Pria Bass & Tenang
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMaleVoiceStyle('male_warm');
                            setCustomPitch(0.78);
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            maleVoiceStyle === 'male_warm'
                              ? 'bg-amber-400 text-emerald-950 font-black shadow-xs'
                              : 'text-emerald-300 hover:text-white'
                          }`}
                        >
                          Pria Hangat
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMaleVoiceStyle('male_natural');
                            setCustomPitch(0.88);
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            maleVoiceStyle === 'male_natural'
                              ? 'bg-amber-400 text-emerald-950 font-black shadow-xs'
                              : 'text-emerald-300 hover:text-white'
                          }`}
                        >
                          Pria Natural
                        </button>
                        <button
                          type="button"
                          onClick={() => setMaleVoiceStyle('custom')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            maleVoiceStyle === 'custom'
                              ? 'bg-amber-400 text-emerald-950 font-black shadow-xs'
                              : 'text-emerald-300 hover:text-white'
                          }`}
                        >
                          Atur Manual
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => previewVoice()}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Dengarkan contoh suara saat ini"
                    >
                      <Volume2 className="w-3.5 h-3.5 fill-current" />
                      <span>Uji Suara Sekarang</span>
                    </button>
                  </div>

                  {/* Voice Engine Selector Dropdown from Device */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] text-emerald-200 font-semibold block mb-1">
                        Stok Mesin Suara Pada Perangkat Anda ({displayVoices.length} suara terdeteksi):
                      </label>
                      <select
                        value={selectedVoiceURI}
                        onChange={(e) => setSelectedVoiceURI(e.target.value)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-950 border border-emerald-700/70 text-xs text-amber-200 focus:outline-hidden focus:border-amber-400"
                      >
                        {displayVoices.map((v) => (
                          <option key={v.voiceURI} value={v.voiceURI} className="bg-emerald-950 text-white">
                            {v.name} ({v.lang}) {v.default ? '★ Default' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Manual Pitch & Speed Sliders */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-200">
                          Frekuensi Nada Pria (Semakin rendah = semakin bass):
                        </span>
                        <span className="font-mono text-amber-300 font-bold">
                          {customPitch.toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.4}
                        max={1.1}
                        step={0.02}
                        value={customPitch}
                        onChange={(e) => {
                          setMaleVoiceStyle('custom');
                          setCustomPitch(parseFloat(e.target.value));
                        }}
                        className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-start gap-2 text-[11px] text-emerald-300/90 leading-relaxed">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300">Penjelasan Stok Suara:</strong> Suara terjemahan diproses secara langsung oleh mesin Text-to-Speech pada sistem browser/HP Anda. Anda dapat memilih stok suara yang terpasang di atas atau menurunkan slider nada ke <strong>0.65 - 0.75 (Pria Bass & Tenang)</strong> agar suara menjadi lebih berat, dalam, dan empuk didengar.
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Slider or Interactive Status Bar */}
              {playMode === 'verse_by_verse' ? (
                <div className="pt-1.5 border-t border-emerald-800/50 flex items-center justify-between text-xs">
                  <span className="text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Lantunan Arab Mishary Alafasy dilanjutkan Pembacaan Terjemahan Suara Per Ayat</span>
                  </span>
                  {isPlaying && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-300/40 animate-pulse text-[11px]">
                      {isSpeakingTranslation ? '🎙️ Membacakan Arti...' : `Ayat ${currentVerseIndex + 1}`}
                    </span>
                  )}
                </div>
              ) : (
                <div className="pt-1.5 border-t border-emerald-800/50 flex items-center gap-2.5">
                  <span className="text-[11px] font-mono text-emerald-300/80 min-w-[32px]">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => seekFullAudio(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <span className="text-[11px] font-mono text-emerald-300/80 min-w-[32px] text-right">
                    {formatTime(duration)}
                  </span>
                  <span className="text-[10px] text-amber-300/80 font-medium pl-1 hidden sm:inline">
                    Syaikh Mishary Alafasy
                  </span>
                </div>
              )}
            </div>

            {/* Verses Scroll Container (The actual reading text) */}
            <div
              ref={versesContainerRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar"
            >
              {/* Surah Header Banner */}
              <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#043d2c] to-emerald-950 border-2 border-amber-400/50 text-center shadow-lg space-y-2 overflow-hidden">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <span>Surat ke-{currentSurah.number}</span>
                  <span>•</span>
                  <span>{currentSurah.type}</span>
                  <span>•</span>
                  <span>{currentSurah.totalVerses} Ayat</span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-arabic font-bold text-amber-200 tracking-wide py-1">
                  {currentSurah.arabicName}
                </h3>
                <h4 className="text-base sm:text-lg font-black text-white font-sans">
                  {currentSurah.name}{' '}
                  <span className="text-xs text-amber-300 font-normal italic">
                    ({currentSurah.translation})
                  </span>
                </h4>
              </div>

              {/* Bismillah Banner if required */}
              {currentSurah.bismillah && (
                <div className="py-3 px-4 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-center shadow-inner">
                  <p className="font-arabic text-2xl sm:text-3xl text-amber-300 font-bold tracking-wide" dir="rtl">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <p className="text-[11px] text-emerald-300/80 italic mt-1">
                    "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang"
                  </p>
                </div>
              )}

              {/* Verses List */}
              <div className="space-y-3 pt-1">
                {currentSurah.verses.map((verse, idx) => {
                  const isVerseCopied = copiedVerseNumber === verse.number;
                  const isCurrentVerse =
                    isPlaying && playMode === 'verse_by_verse' && currentVerseIndex === idx;

                  const arabicSizeClass =
                    arabicFontSize === 'sm'
                      ? 'text-xl sm:text-2xl leading-relaxed'
                      : arabicFontSize === 'lg'
                      ? 'text-3xl sm:text-4xl leading-[2.4]'
                      : 'text-2xl sm:text-3xl leading-[2.1]';

                  return (
                    <div
                      key={verse.number}
                      ref={isCurrentVerse ? activeVerseRef : null}
                      className={`group relative p-4 rounded-2xl transition-all space-y-3 shadow-md border ${
                        isCurrentVerse
                          ? 'bg-emerald-900/95 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                          : 'bg-emerald-950/70 hover:bg-emerald-950/95 border-emerald-800/70 hover:border-amber-400/50'
                      }`}
                    >
                      {/* Verse Header Row (Verse Number, Live Speaking Badge, and Play/Copy buttons) */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-900/90 border border-amber-400/40 flex items-center justify-center text-xs font-black text-amber-300 shadow-xs">
                            {verse.number}
                          </div>
                          {isCurrentVerse && (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-emerald-950 flex items-center gap-1 shadow-xs animate-pulse">
                              {isSpeakingTranslation ? (
                                <>
                                  <Mic className="w-3 h-3" />
                                  <span>Membacakan Arti...</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 h-3" />
                                  <span>Melantunkan Murottal...</span>
                                </>
                              )}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Listen single verse */}
                          <button
                            type="button"
                            onClick={() => playSpecificVerse(idx)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isCurrentVerse
                                ? 'bg-amber-400 text-emerald-950 font-black'
                                : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60'
                            }`}
                            title={`Dengarkan Ayat ${verse.number} + Terjemahan Suara`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Dengarkan</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyVerse(verse)}
                            className="opacity-70 group-hover:opacity-100 p-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-amber-300 border border-emerald-700/60 transition-all cursor-pointer text-xs flex items-center gap-1"
                            title="Salin Ayat Ini"
                          >
                            {isVerseCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Arabic Text */}
                      <div className="text-right py-2 px-1">
                        <p
                          className={`font-arabic font-bold text-amber-100 ${arabicSizeClass}`}
                          dir="rtl"
                        >
                          {verse.arabic}{' '}
                          <span className="font-arabic text-amber-400 text-lg mx-1 inline-block">
                            ۝{verse.number}
                          </span>
                        </p>
                      </div>

                      {/* Latin Transliteration */}
                      {showLatin && (
                        <div className="p-2.5 rounded-xl bg-emerald-900/30 border border-emerald-800/40">
                          <p className="text-xs sm:text-sm text-amber-300/90 font-medium italic leading-relaxed">
                            {verse.latin}
                          </p>
                        </div>
                      )}

                      {/* Indonesian Translation */}
                      {showTranslation && (
                        <div
                          className={`p-2.5 rounded-xl border transition-all ${
                            isCurrentVerse && isSpeakingTranslation
                              ? 'bg-amber-400/15 border-amber-300/60 text-amber-200'
                              : 'bg-black/20 border-emerald-800/30 text-emerald-100/90'
                          }`}
                        >
                          <p className="text-xs sm:text-sm leading-relaxed">
                            <span className="font-bold text-amber-300/80 text-[11px] uppercase tracking-wider block mb-0.5">
                              Artinya:
                            </span>
                            {verse.translation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Navigation Bottom Footer inside reader (Prev / Next Surah) */}
              <div className="pt-4 border-t border-emerald-800/70 flex items-center justify-between gap-3">
                {prevSurah ? (
                  <button
                    type="button"
                    onClick={() => handleSelectSurah(prevSurah.number)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-amber-300" />
                    <span>Sebelumnya: {prevSurah.name}</span>
                  </button>
                ) : (
                  <div />
                )}

                {nextSurah ? (
                  <button
                    type="button"
                    onClick={() => handleSelectSurah(nextSurah.number)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition-all cursor-pointer ml-auto"
                  >
                    <span>Selanjutnya: {nextSurah.name}</span>
                    <ChevronRight className="w-4 h-4 text-amber-300" />
                  </button>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
