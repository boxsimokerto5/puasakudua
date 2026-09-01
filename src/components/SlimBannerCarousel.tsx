import React, { useState, useEffect, useRef } from 'react';
import { AppBanner, DEFAULT_APP_BANNERS } from '../data/bannerData';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CalendarCheck,
  BookOpen,
  Clock,
  HeartHandshake,
  Moon,
  Star,
  ExternalLink,
} from 'lucide-react';

interface SlimBannerCarouselProps {
  onOpenCalendar?: () => void;
  onOpenWisdom?: () => void;
  onOpenPrayer?: () => void;
  onOpenSurah?: () => void;
  customBanners?: AppBanner[];
  schoolName?: string;
}

export const SlimBannerCarousel: React.FC<SlimBannerCarouselProps> = ({
  onOpenCalendar,
  onOpenWisdom,
  onOpenPrayer,
  onOpenSurah,
  customBanners,
  schoolName,
}) => {
  const banners = customBanners && customBanners.length > 0 ? customBanners : DEFAULT_APP_BANNERS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Minimum distance in px to register a swipe
  const minSwipeDistance = 45;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Auto-slide every 6 seconds if not hovered/touched
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, banners.length, currentIndex]);

  // Touch Swipe Handlers for Mobile
  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const handleActionClick = (actionType?: string) => {
    switch (actionType) {
      case 'calendar':
        onOpenCalendar?.();
        break;
      case 'wisdom':
        onOpenWisdom?.();
        break;
      case 'prayer':
        onOpenPrayer?.();
        break;
      case 'surah':
        onOpenSurah?.();
        break;
      default:
        onOpenWisdom?.();
        break;
    }
  };

  const currentBanner = banners[currentIndex];

  const getActionIcon = (actionType?: string) => {
    switch (actionType) {
      case 'calendar':
        return <CalendarCheck className="w-3.5 h-3.5" />;
      case 'wisdom':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'prayer':
        return <Clock className="w-3.5 h-3.5" />;
      case 'surah':
        return <BookOpen className="w-3.5 h-3.5" />;
      default:
        return <ExternalLink className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-md group select-none transition-all duration-300 border border-white/15"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides Container */}
      <div className="relative h-28 sm:h-32 md:h-36 overflow-hidden">
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out bg-gradient-to-r ${banner.bgGradient} ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Decorative Geometric Vector Grid & Stars Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

              {/* Subtle Decorative Islamic Arch Silhouette */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-6">
                <Moon className="w-28 h-28 text-white stroke-1" />
              </div>

              {/* Slide Content Box */}
              <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0 pr-6 sm:pr-12">
                  {/* Badge & School Subtitle */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-white/15 backdrop-blur-md text-amber-300 border border-white/20 shadow-xs">
                      {banner.badge}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-white/70 font-medium truncate hidden xs:inline">
                      {schoolName || banner.tagline}
                    </span>
                  </div>

                  {/* Banner Title */}
                  <h3 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight drop-shadow-sm truncate">
                    {banner.title}
                  </h3>

                  {/* Banner Subtitle / Hadith */}
                  <p className="text-[11px] sm:text-xs text-white/85 line-clamp-1 sm:line-clamp-2 mt-0.5 max-w-2xl leading-snug">
                    {banner.subtitle}
                  </p>
                </div>

                {/* Quick Action Button on Right */}
                {banner.actionText && (
                  <div className="shrink-0 hidden sm:flex items-center">
                    <button
                      type="button"
                      onClick={() => handleActionClick(banner.actionType)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-xs backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      {getActionIcon(banner.actionType)}
                      <span>{banner.actionText}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (Prev/Next) */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous banner"
            className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-md flex items-center justify-center transition-all opacity-70 group-hover:opacity-100 cursor-pointer shadow-sm active:scale-90"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next banner"
            className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-md flex items-center justify-center transition-all opacity-70 group-hover:opacity-100 cursor-pointer shadow-sm active:scale-90"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/25 backdrop-blur-md">
          {banners.map((_, dotIdx) => {
            const isDotActive = dotIdx === currentIndex;
            return (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentIndex(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isDotActive
                    ? 'w-5 h-1.5 bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
