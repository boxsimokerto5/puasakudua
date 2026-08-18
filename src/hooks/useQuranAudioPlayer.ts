import { useState, useEffect, useRef, useCallback } from 'react';
import { ShortSurah, SurahVerse } from '../data/shortSurahs';

export type PlayMode = 'full_surah' | 'verse_by_verse';
export type MaleVoiceStyle = 'male_deep' | 'male_warm' | 'male_natural' | 'custom';

interface UseQuranAudioPlayerProps {
  surah: ShortSurah;
  onVerseChange?: (verseNumber: number) => void;
}

export function getVerseAudioUrl(surahNumber: number, verseNumber: number): string {
  if (surahNumber === 255) {
    // Ayat Kursi is Surah 2, Verse 255
    return 'https://everyayah.com/data/Alafasy_128kbps/002255.mp3';
  }
  const sNum = String(surahNumber).padStart(3, '0');
  const vNum = String(verseNumber).padStart(3, '0');
  return `https://everyayah.com/data/Alafasy_128kbps/${sNum}${vNum}.mp3`;
}

export function useQuranAudioPlayer({ surah, onVerseChange }: UseQuranAudioPlayerProps) {
  const [playMode, setPlayMode] = useState<PlayMode>('verse_by_verse');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0);
  const [isSpeakingTranslation, setIsSpeakingTranslation] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [audioError, setAudioError] = useState<boolean>(false);
  const [readTranslation, setReadTranslation] = useState<boolean>(true);
  
  // Voice engine & tuning state
  const [installedVoices, setInstalledVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [maleVoiceStyle, setMaleVoiceStyle] = useState<MaleVoiceStyle>('male_deep');
  const [customPitch, setCustomPitch] = useState<number>(0.72); // Deep baritone male pitch
  const [customRate, setCustomRate] = useState<number>(0.85); // Calm respectful pace

  const fullAudioRef = useRef<HTMLAudioElement | null>(null);
  const verseAudioRef = useRef<HTMLAudioElement | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  // Load and refresh available speech voices from browser/device
  const loadVoices = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setInstalledVoices(voices);

        // Auto select best Indonesian voice if none selected yet
        if (!selectedVoiceURI) {
          // Look for male Indonesian first
          const idMale = voices.find((v) => {
            const isId = v.lang.startsWith('id') || v.lang.startsWith('ms');
            const name = v.name.toLowerCase();
            return isId && (name.includes('ardi') || name.includes('male') || name.includes('pria') || name.includes('2') || name.includes('david'));
          });
          // Look for any Indonesian voice
          const idAny = voices.find((v) => v.lang.startsWith('id') || v.name.toLowerCase().includes('indonesia'));
          // Look for Malay voice
          const msAny = voices.find((v) => v.lang.startsWith('ms'));

          if (idMale) setSelectedVoiceURI(idMale.voiceURI);
          else if (idAny) setSelectedVoiceURI(idAny.voiceURI);
          else if (msAny) setSelectedVoiceURI(msAny.voiceURI);
          else setSelectedVoiceURI(voices[0].voiceURI);
        }
      }
    }
  }, [selectedVoiceURI]);

  useEffect(() => {
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [loadVoices]);

  // Stop everything
  const stopAll = useCallback(() => {
    isCancelledRef.current = true;
    if (fullAudioRef.current) {
      fullAudioRef.current.pause();
      fullAudioRef.current.currentTime = 0;
    }
    if (verseAudioRef.current) {
      verseAudioRef.current.pause();
      verseAudioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsSpeakingTranslation(false);
  }, []);

  // Reset when surah changes
  useEffect(() => {
    stopAll();
    setCurrentVerseIndex(0);
    setCurrentTime(0);
    setDuration(0);
    setAudioError(false);
  }, [surah.number, stopAll]);

  // Clean on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  // Speech synthesis for Indonesian translation with male resonance tuning
  const speakIndonesianTranslation = useCallback(
    (text: string, onEnd: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onEnd();
        return;
      }

      window.speechSynthesis.cancel();

      // Clean text for natural spoken flow
      const cleanText = text
        .replace(/["'()]/g, '')
        .replace(/\b(yaitu|artinya|dan|maka|sesungguhnya)\b/gi, '$1,');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'id-ID';

      // Pitch & speed parameters
      if (maleVoiceStyle === 'male_deep') {
        utterance.pitch = 0.70; // Heavy male tone (lowers vocal formant)
        utterance.rate = 0.84; // Calm, respectful pace
      } else if (maleVoiceStyle === 'male_warm') {
        utterance.pitch = 0.78; // Warm baritone male tone
        utterance.rate = 0.88;
      } else if (maleVoiceStyle === 'male_natural') {
        utterance.pitch = 0.88;
        utterance.rate = 0.90;
      } else {
        utterance.pitch = customPitch;
        utterance.rate = customRate;
      }

      // Assign selected voice
      if (selectedVoiceURI) {
        const matched = installedVoices.find((v) => v.voiceURI === selectedVoiceURI);
        if (matched) {
          utterance.voice = matched;
        }
      } else {
        const idVoice = installedVoices.find(
          (v) => v.lang.startsWith('id') || v.name.toLowerCase().includes('indonesia')
        );
        if (idVoice) utterance.voice = idVoice;
      }

      let ended = false;
      utterance.onend = () => {
        if (!ended) {
          ended = true;
          setIsSpeakingTranslation(false);
          if (!isCancelledRef.current) {
            onEnd();
          }
        }
      };

      utterance.onerror = () => {
        if (!ended) {
          ended = true;
          setIsSpeakingTranslation(false);
          if (!isCancelledRef.current) {
            onEnd();
          }
        }
      };

      setIsSpeakingTranslation(true);
      window.speechSynthesis.speak(utterance);
    },
    [maleVoiceStyle, customPitch, customRate, selectedVoiceURI, installedVoices]
  );

  // Play verse by verse step
  const playVerseStep = useCallback(
    (verseIdx: number) => {
      if (isCancelledRef.current) return;
      if (verseIdx >= surah.verses.length) {
        // Completed all verses
        setIsPlaying(false);
        setCurrentVerseIndex(0);
        return;
      }

      setCurrentVerseIndex(verseIdx);
      const verse = surah.verses[verseIdx];
      if (onVerseChange) {
        onVerseChange(verse.number);
      }

      const verseAudioUrl = getVerseAudioUrl(surah.number, verse.number);

      if (!verseAudioRef.current) {
        verseAudioRef.current = new Audio();
      }

      const audio = verseAudioRef.current;
      audio.src = verseAudioUrl;

      const handleVerseEnded = () => {
        audio.removeEventListener('ended', handleVerseEnded);
        audio.removeEventListener('error', handleVerseError);

        if (isCancelledRef.current) return;

        if (readTranslation && verse.translation) {
          // Read translation in male voice
          speakIndonesianTranslation(verse.translation, () => {
            if (!isCancelledRef.current) {
              setTimeout(() => {
                if (!isCancelledRef.current) {
                  playVerseStep(verseIdx + 1);
                }
              }, 500);
            }
          });
        } else {
          // Direct next verse
          setTimeout(() => {
            if (!isCancelledRef.current) {
              playVerseStep(verseIdx + 1);
            }
          }, 600);
        }
      };

      const handleVerseError = () => {
        audio.removeEventListener('ended', handleVerseEnded);
        audio.removeEventListener('error', handleVerseError);
        console.warn('Verse audio error, skipping to translation');
        if (readTranslation && verse.translation) {
          speakIndonesianTranslation(verse.translation, () => {
            playVerseStep(verseIdx + 1);
          });
        } else {
          playVerseStep(verseIdx + 1);
        }
      };

      audio.addEventListener('ended', handleVerseEnded);
      audio.addEventListener('error', handleVerseError);

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Play error:', err);
          handleVerseError();
        });
    },
    [surah, readTranslation, speakIndonesianTranslation, onVerseChange]
  );

  // Play specific verse
  const playSpecificVerse = useCallback(
    (verseIdx: number) => {
      stopAll();
      isCancelledRef.current = false;
      setPlayMode('verse_by_verse');
      setIsPlaying(true);
      playVerseStep(verseIdx);
    },
    [stopAll, playVerseStep]
  );

  // Preview male voice sample
  const previewVoice = useCallback(
    (sampleText?: string) => {
      stopAll();
      const text =
        sampleText ||
        'Bismillah. Dengan nama Allah Yang Maha Pengasih, lagi Maha Penyayang.';
      speakIndonesianTranslation(text, () => {});
    },
    [stopAll, speakIndonesianTranslation]
  );

  // Toggle playback
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAll();
    } else {
      isCancelledRef.current = false;
      setIsPlaying(true);

      if (playMode === 'full_surah') {
        if (!fullAudioRef.current) {
          fullAudioRef.current = new Audio();
        }
        const fullAudio = fullAudioRef.current;
        fullAudio.src = surah.audioUrl;
        fullAudio.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
        };
        fullAudio.ontimeupdate = () => {
          setCurrentTime(fullAudio.currentTime);
          if (fullAudio.duration && !isNaN(fullAudio.duration)) {
            setDuration(fullAudio.duration);
          }
        };
        fullAudio.onloadedmetadata = () => {
          if (fullAudio.duration && !isNaN(fullAudio.duration)) {
            setDuration(fullAudio.duration);
          }
        };
        fullAudio.onerror = () => {
          if (surah.fallbackAudioUrl && fullAudio.src !== surah.fallbackAudioUrl) {
            fullAudio.src = surah.fallbackAudioUrl;
            fullAudio.play().catch(() => {
              setAudioError(true);
              setIsPlaying(false);
            });
          } else {
            setAudioError(true);
            setIsPlaying(false);
          }
        };
        fullAudio.play().catch(() => {
          setAudioError(true);
          setIsPlaying(false);
        });
      } else {
        // Verse by verse mode starting from current or 0
        playVerseStep(currentVerseIndex);
      }
    }
  }, [isPlaying, playMode, surah, currentVerseIndex, playVerseStep, stopAll]);

  const seekFullAudio = useCallback((secs: number) => {
    if (fullAudioRef.current) {
      fullAudioRef.current.currentTime = secs;
      setCurrentTime(secs);
    }
  }, []);

  return {
    isPlaying,
    playMode,
    setPlayMode,
    currentVerseIndex,
    isSpeakingTranslation,
    currentTime,
    duration,
    audioError,
    readTranslation,
    setReadTranslation,
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
  };
}
