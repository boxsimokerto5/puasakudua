import React, { useState, useRef } from 'react';
import { SHORT_SURAHS_DATA, ShortSurah } from '../data/shortSurahs';
import { useQuranAudioPlayer, MaleVoiceStyle } from '../hooks/useQuranAudioPlayer';
import {
  BookOpen,
  Play,
  Pause,
  Copy,
  Check,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Volume2,
  Headphones,
  Mic,
  Sparkles,
  Sliders,
  HelpCircle,
} from 'lucide-react';

interface ShortSurahsDashboardCardProps {
  onOpenModal: () => void;
}

export const ShortSurahsDashboardCard: React.FC<ShortSurahsDashboardCardProps> = ({
  onOpenModal,
}) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showLatin, setShowLatin] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const activeVerseRef = useRef<HTMLDivElement | null>(null);

  const currentSurah: ShortSurah =
    SHORT_SURAHS_DATA.find((s) => s.number === selectedSurahNumber) ||
    SHORT_SURAHS_DATA[0];

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

  const handleSelectSurah = (surahNumber: number) => {
    stopAll();
    setSelectedSurahNumber(surahNumber);
  };

  const handleCopy = () => {
    let text = `📖 *Surat ${currentSurah.name} (${currentSurah.arabicName})*\n${currentSurah.type} • ${currentSurah.totalVerses} Ayat\n\n`;
    if (currentSurah.bismillah) {
      text += `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\n`;
    }
    currentSurah.verses.forEach((v) => {
      text += `(${v.number}) ${v.arabic}\n${v.latin}\n"${v.translation}"\n\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Filter relevant voices (Indonesian, Malay, English or all)
  const idVoices = installedVoices.filter(
    (v) => v.lang.startsWith('id') || v.lang.startsWith('ms') || v.name.toLowerCase().includes('indonesia')
  );
  const displayVoices = idVoices.length > 0 ? idVoices : installedVoices;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#022c20] via-[#033c2a] to-[#011e15] border border-amber-400/40 shadow-lg text-white">
      {/* Ambient Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card Header Bar */}
      <div className="relative z-10 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/70 bg-emerald-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-xs shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-amber-200 tracking-wide">
                Surat-Surat Pendek & Pilihan (Juz 'Amma)
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-900 text-emerald-200 border border-emerald-700/60 hidden sm:inline-block">
                {SHORT_SURAHS_DATA.length} Surat
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80">
              Murottal Syaikh Mishary + Suara Penerjemah Per Ayat
            </p>
          </div>
        </div>

        {/* Action buttons on header */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400/20 via-yellow-300/25 to-amber-400/20 hover:from-amber-400/40 hover:to-yellow-300/40 text-amber-200 hover:text-white border border-amber-400/50 shadow-xs transition-all cursor-pointer"
            title="Buka Tampilan Mushaf Layar Penuh"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Layar Penuh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-700/60 transition-all cursor-pointer"
            title={isExpanded ? 'Sembunyikan Bacaan' : 'Tampilkan Bacaan'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Surah Quick Chips (Horizontal Scrollable) */}
      <div className="relative z-10 px-4 sm:px-6 py-2.5 bg-emerald-950/60 border-b border-emerald-800/60 overflow-x-auto flex items-center gap-1.5 custom-scrollbar">
        {SHORT_SURAHS_DATA.map((surah) => {
          const isSelected = surah.number === currentSurah.number;
          return (
            <button
              key={surah.number}
              type="button"
              onClick={() => handleSelectSurah(surah.number)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-amber-400 text-emerald-950 font-black shadow-md border border-amber-300 scale-105'
                  : 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-700/60 hover:text-white'
              }`}
            >
              <span>{surah.name}</span>
              <span className="text-[10px] opacity-75 font-arabic font-bold">
                {surah.arabicName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Collapsible Reader Area */}
      {isExpanded && (
        <div className="relative z-10 p-4 sm:p-6 space-y-4 animate-in fade-in duration-200">
          {/* Active Surah Info & Audio Control Hub */}
          <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-700/70 flex flex-col gap-3 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-sm font-black text-amber-300 shrink-0">
                  {currentSurah.number === 255 ? '★' : currentSurah.number}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <span>Surat {currentSurah.name}</span>
                    <span className="text-amber-300 font-arabic font-bold text-lg">
                      ({currentSurah.arabicName})
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-300">
                    {currentSurah.type} • {currentSurah.totalVerses} Ayat • "{currentSurah.translation}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Main Play / Pause Button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                    isPlaying
                      ? 'bg-amber-400 text-emerald-950 border border-amber-300 animate-pulse'
                      : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-emerald-950 font-black border border-amber-300'
                  }`}
                  title={
                    isPlaying
                      ? 'Jeda Pemutaran'
                      : playMode === 'verse_by_verse'
                      ? 'Putar Ayat + Terjemahan Suara'
                      : 'Putar Murottal Penuh 1 Surat'
                  }
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>
                    {isPlaying
                      ? isSpeakingTranslation
                        ? 'Suara Penerjemah...'
                        : 'Melantunkan Ayat...'
                      : playMode === 'verse_by_verse'
                      ? 'Putar + Terjemahan'
                      : 'Putar Murottal Full'}
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
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      playMode === 'verse_by_verse'
                        ? 'bg-amber-400 text-emerald-950 font-black shadow-xs'
                        : 'text-emerald-200 hover:text-white'
                    }`}
                    title="Putar ayat demi ayat beserta terjemahan suara merdu"
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
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      playMode === 'full_surah'
                        ? 'bg-amber-400 text-emerald-950 font-black shadow-xs'
                        : 'text-emerald-200 hover:text-white'
                    }`}
                    title="Putar full continuous 1 surat nonstop oleh Syaikh Mishary Alafasy"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Full Surat (Arab)</span>
                  </button>
                </div>

                {/* Male Voice Tone & Engine Toggle */}
                <button
                  type="button"
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    showVoiceSettings
                      ? 'bg-amber-400 text-emerald-950 border-amber-300 font-black'
                      : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60'
                  }`}
                  title="Atur Stok Suara & Karakter Nada Pria"
                >
                  <Mic className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Pilihan Suara</span>
                  <Sliders className="w-3 h-3 ml-0.5 opacity-70" />
                </button>

                {/* Latin Toggle */}
                <button
                  type="button"
                  onClick={() => setShowLatin(!showLatin)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    showLatin
                      ? 'bg-emerald-900 text-amber-300 border-amber-400/40'
                      : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 opacity-60'
                  }`}
                >
                  Latin
                </button>

                {/* Translation Toggle */}
                <button
                  type="button"
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    showTranslation
                      ? 'bg-emerald-900 text-amber-300 border-amber-400/40'
                      : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 opacity-60'
                  }`}
                >
                  Arti
                </button>

                {/* Copy */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition-all cursor-pointer"
                  title="Salin Isi Surat"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
                  <span>{copied ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {/* Voice Tuning & Engine Panel (when toggled) */}
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
                      Stok Mesin Suara Pada Perangkat Anda ({displayVoices.length} suara ditemukan):
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
                    <strong className="text-amber-300">Catatan tentang Stok Suara:</strong> Suara penerjemah disuarakan oleh mesin *Text-to-Speech* pada HP/komputer Anda. Jika bawaan HP Anda masih wanita, mengatur <strong>Preset Nada ke "Pria Bass & Tenang"</strong> (slider 0.65 - 0.75) akan otomatis mengubah resonansi suara menjadi nada bariton pria yang merdu.
                  </div>
                </div>
              </div>
            )}

            {/* Mode Banner / Indicator */}
            {playMode === 'verse_by_verse' ? (
              <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between text-xs text-emerald-200">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span className="font-semibold text-amber-200">
                    Lantunan Arab Mishary Alafasy diikuti Pembacaan Terjemahan Suara Per Ayat
                  </span>
                </div>
                {isPlaying && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-300/40 animate-pulse">
                    {isSpeakingTranslation ? '🎙️ Membacakan Arti...' : `Ayat ${currentVerseIndex + 1}`}
                  </span>
                )}
              </div>
            ) : (
              /* Full Audio Progress Bar */
              <div className="pt-2 border-t border-emerald-800/60 flex items-center gap-3">
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
                <div className="hidden sm:flex items-center gap-1 text-[10px] text-amber-300/90 font-medium pl-1">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Syaikh Mishary Alafasy (Lengkap)</span>
                </div>
              </div>
            )}
          </div>

          {/* Bismillah */}
          {currentSurah.bismillah && (
            <div className="py-2.5 px-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-center">
              <p className="font-arabic text-xl sm:text-2xl text-amber-300 font-bold" dir="rtl">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <p className="text-[11px] text-emerald-300/70 italic mt-0.5">
                "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang"
              </p>
            </div>
          )}

          {/* Verses Container */}
          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
            {currentSurah.verses.map((verse, idx) => {
              const isCurrentVerse =
                isPlaying && playMode === 'verse_by_verse' && currentVerseIndex === idx;

              return (
                <div
                  key={verse.number}
                  ref={isCurrentVerse ? activeVerseRef : null}
                  className={`p-3.5 sm:p-4 rounded-xl transition-all space-y-2 border ${
                    isCurrentVerse
                      ? 'bg-emerald-900/90 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/50'
                      : 'bg-emerald-950/70 border-emerald-800/70 hover:border-emerald-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-900 border border-amber-400/40 flex items-center justify-center text-[11px] font-black text-amber-300">
                        {verse.number}
                      </span>
                      {isCurrentVerse && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-emerald-950 flex items-center gap-1 shadow-xs animate-pulse">
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

                    {/* Per-verse play button */}
                    <button
                      type="button"
                      onClick={() => playSpecificVerse(idx)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isCurrentVerse
                          ? 'bg-amber-400 text-emerald-950 font-black'
                          : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60'
                      }`}
                      title={`Dengarkan Ayat ${verse.number} + Terjemahan Suara`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Dengarkan</span>
                    </button>
                  </div>

                  {/* Arabic */}
                  <div className="text-right py-1">
                    <p className="font-arabic text-xl sm:text-2xl font-bold text-amber-100 leading-loose" dir="rtl">
                      {verse.arabic}{' '}
                      <span className="font-arabic text-amber-400/90 text-sm mx-1">
                        ۝{verse.number}
                      </span>
                    </p>
                  </div>

                  {/* Latin */}
                  {showLatin && (
                    <p className="text-xs sm:text-sm text-amber-300/90 font-medium italic border-t border-emerald-800/50 pt-2">
                      {verse.latin}
                    </p>
                  )}

                  {/* Translation */}
                  {showTranslation && (
                    <p
                      className={`text-xs sm:text-sm leading-relaxed pt-0.5 ${
                        isCurrentVerse && isSpeakingTranslation
                          ? 'text-amber-200 font-semibold bg-amber-400/15 p-2 rounded-lg border border-amber-300/40 shadow-xs'
                          : 'text-emerald-100/90'
                      }`}
                    >
                      {verse.translation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
