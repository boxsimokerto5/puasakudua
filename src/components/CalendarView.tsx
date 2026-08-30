import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Sparkles,
  Printer,
  Calendar as CalendarIcon,
  CheckCircle2,
  CheckSquare,
  Edit3,
  Plus,
  Trash2,
  MapPin,
  Clock,
  AlertCircle,
  Star,
  BookOpen,
} from 'lucide-react';
import {
  CalendarDayData,
  SchoolCalendarEvent,
  DEFAULT_SCHOOL_EVENTS,
  generateMonthCalendarDays,
  formatDateToIso,
  DAY_NAMES_ID,
  analyzeDayFastingAndEvents,
} from '../utils/hijriCalendar';
import { FastingSession, Student, UserSession } from '../types';

interface CalendarViewProps {
  sessions: FastingSession[];
  students: Student[];
  user: UserSession;
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateSessionForDate: (dateStr: string, title: string) => void;
  onNavigateToTab: (tab: 'input' | 'checker' | 'raport' | 'admin') => void;
}

const STORAGE_EVENTS_KEY = 'PUASAKU_SCHOOL_EVENTS_V1';
const HILAL_OFFSET_KEY = 'PUASAKU_HILAL_OFFSET_V1';

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  students,
  user,
  activeSessionId,
  onSelectSession,
  onCreateSessionForDate,
  onNavigateToTab,
}) => {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => today.getMonth()); // 0-11

  // Hilal offset adjustment (-2 to +2 days)
  const [hilalOffset, setHilalOffset] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(HILAL_OFFSET_KEY);
      return saved !== null ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Selected Day for Detail Below Calendar
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => formatDateToIso(today));

  // School Events State
  const [events, setEvents] = useState<SchoolCalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EVENTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SCHOOL_EVENTS;
  });

  // Modal / Form state for adding custom school event
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<SchoolCalendarEvent['category']>('ramadhan');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('Masjid / Aula SRT 1 Kediri');
  const [newEventDescription, setNewEventDescription] = useState('');

  // Save events to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events));
    } catch {
      // ignore
    }
  }, [events]);

  // Generate calendar days for the active month
  const calendarDays = useMemo(() => {
    return generateMonthCalendarDays(currentYear, currentMonth, hilalOffset);
  }, [currentYear, currentMonth, hilalOffset]);

  // Hijri Month Range displayed in current Gregorian Month
  const currentMonthHijriRange = useMemo(() => {
    const currentMonthDays = calendarDays.filter((d) => d.isCurrentMonth);
    if (currentMonthDays.length === 0) return '';
    const firstHijri = currentMonthDays[0].hijri;
    const lastHijri = currentMonthDays[currentMonthDays.length - 1].hijri;

    if (firstHijri.monthName === lastHijri.monthName) {
      return `${firstHijri.monthName.toUpperCase()} ${firstHijri.year} H`;
    }
    return `${firstHijri.monthName.toUpperCase()} – ${lastHijri.monthName.toUpperCase()} ${lastHijri.year} H`;
  }, [calendarDays]);

  // Map sessions by date
  const sessionByDate = useMemo(() => {
    const map: Record<string, FastingSession> = {};
    for (const s of sessions) {
      map[s.date] = s;
    }
    return map;
  }, [sessions]);

  // Map events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, SchoolCalendarEvent[]> = {};
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [events]);

  // Selected Day details
  const selectedDayData = useMemo(() => {
    const match = calendarDays.find((d) => d.dateStr === selectedDateStr);
    if (match) return match;

    const parsedDate = new Date(`${selectedDateStr}T12:00:00`);
    const analysis = analyzeDayFastingAndEvents(parsedDate, hilalOffset);
    return {
      date: parsedDate,
      dateStr: selectedDateStr,
      dayOfMonth: parsedDate.getDate(),
      dayOfWeek: parsedDate.getDay(),
      dayName: DAY_NAMES_ID[parsedDate.getDay()],
      pasaran: { name: 'Wage', neptu: 4 },
      hijriDayArabic: '١',
      isCurrentMonth: true,
      isToday: selectedDateStr === formatDateToIso(today),
      isFriday: parsedDate.getDay() === 5,
      isSunday: parsedDate.getDay() === 0,
      isHoliday: parsedDate.getDay() === 0,
      ...analysis,
    };
  }, [selectedDateStr, calendarDays, hilalOffset, today]);

  const selectedDaySession = useMemo(() => {
    return sessionByDate[selectedDateStr];
  }, [sessionByDate, selectedDateStr]);

  const selectedDayEvents = useMemo(() => {
    return eventsByDate[selectedDateStr] || [];
  }, [eventsByDate, selectedDateStr]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDateStr(formatDateToIso(now));
  };

  const handleCreateSession = () => {
    const formattedDate = new Date(`${selectedDateStr}T12:00:00`).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let defaultTitle = `Puasa ${formattedDate}`;
    if (selectedDayData.fastingTypes.some((f) => f.id === 'ramadhan')) {
      defaultTitle = `Puasa Ramadhan (${selectedDayData.hijri.day} Ramadhan 1447 H)`;
    } else if (selectedDayData.fastingTypes.length > 0) {
      defaultTitle = `${selectedDayData.primaryFasting.name} - ${formattedDate}`;
    }

    onCreateSessionForDate(selectedDateStr, defaultTitle);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEv: SchoolCalendarEvent = {
      id: `evt-${Date.now()}`,
      date: selectedDateStr,
      title: newEventTitle.trim(),
      category: newEventCategory,
      time: newEventTime.trim() || undefined,
      location: newEventLocation.trim() || undefined,
      description: newEventDescription.trim() || undefined,
    };

    setEvents((prev) => [newEv, ...prev]);
    setNewEventTitle('');
    setNewEventDescription('');
    setNewEventTime('');
    setShowAddEventModal(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-2.5 sm:space-y-3.5 animate-in fade-in duration-200 print:m-0 print:p-0">
      {/* ========================================================================= */}
      {/* 1. CLEAN CALENDAR CONTAINER (SLIM, TIGHT & PROPORTIONAL)                 */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-2xs overflow-hidden print:border-none print:shadow-none">
        
        {/* Navigation & Month Title Header (Slim & Compact) */}
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white">
          {/* Month & Hijri Subtitle */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 transition-colors cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 transition-colors cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 leading-tight">
                <span>{MONTH_NAMES_ID[currentMonth]} {currentYear}</span>
              </h2>
              <p className="text-[10px] sm:text-[11px] font-bold text-emerald-700 leading-tight">
                {currentMonthHijriRange}
              </p>
            </div>
          </div>

          {/* Quick Actions (Bulan Ini & Cetak) */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto print:hidden">
            <button
              type="button"
              onClick={handleGoToToday}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
            >
              <Sun className="w-3 h-3 text-amber-500" />
              <span>Hari Ini</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Cetak Kalender"
            >
              <Printer className="w-3 h-3" />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid Matrix (Compact & Tight) */}
        <div className="p-2 sm:p-3 overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-thin">
          <div className="min-w-[320px]">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
            {DAY_NAMES_ID.map((name, idx) => {
              const isSunday = idx === 0;
              const isFriday = idx === 5;

              return (
                <div
                  key={name}
                  className={`py-1 text-center text-[10px] sm:text-xs font-bold rounded-md select-none uppercase tracking-wider ${
                    isSunday
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : isFriday
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                      : 'bg-slate-50 text-slate-700 border border-slate-100'
                  }`}
                >
                  <span className="hidden sm:inline">{name === 'Ahad' ? 'Minggu' : name}</span>
                  <span className="sm:hidden">{name === 'Ahad' ? 'Min' : name.substring(0, 3)}</span>
                </div>
              );
            })}
          </div>

          {/* Grid of 35 or 42 Days (Proportional Height) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((day) => {
              const isSelected = day.dateStr === selectedDateStr;
              const daySession = sessionByDate[day.dateStr];
              const dayEvents = eventsByDate[day.dateStr] || [];
              const isRamadanDay = day.fastingTypes.some((f) => f.id === 'ramadhan');

              // Colors
              let cellBg = 'bg-white border-slate-200 hover:border-slate-300';
              let dateNumColor = 'text-slate-800';

              if (!day.isCurrentMonth) {
                cellBg = 'bg-slate-50/40 border-slate-100 opacity-30';
                dateNumColor = 'text-slate-300';
              } else if (day.isHoliday || day.isSunday) {
                dateNumColor = 'text-red-600';
                if (day.isHaramFasting) {
                  cellBg = 'bg-red-50/40 border-red-200';
                }
              } else if (day.isFriday) {
                dateNumColor = 'text-emerald-700';
              } else if (isRamadanDay) {
                cellBg = 'bg-emerald-50/20 border-emerald-100';
              }

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className={`min-h-[58px] sm:min-h-[72px] md:min-h-[78px] p-1 sm:p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between select-none ${cellBg} ${
                    isSelected
                      ? 'ring-1.5 ring-emerald-500 border-emerald-500 bg-emerald-50/40 shadow-2xs'
                      : ''
                  } ${
                    day.isToday && !isSelected
                      ? 'ring-1.5 ring-amber-400 border-amber-400'
                      : ''
                  }`}
                >
                  {/* Top: Gregorian Day & Hijri Date */}
                  <div className="flex items-start justify-between">
                    <div className="leading-none">
                      <span className={`text-xs sm:text-base font-bold ${dateNumColor}`}>
                        {day.dayOfMonth}
                      </span>
                      {day.isCurrentMonth && (
                        <span className="block text-[8px] sm:text-[9px] text-slate-400 italic">
                          {day.pasaran.name}
                        </span>
                      )}
                    </div>

                    {day.isCurrentMonth && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 font-sans">
                        {day.hijri.day}
                      </span>
                    )}
                  </div>

                  {/* Middle: Badges for Fasting / Holiday */}
                  <div className="my-0.5 space-y-0.5 overflow-hidden">
                    {/* Fasting Badge */}
                    {day.isCurrentMonth && day.fastingTypes.length > 0 && !day.isHaramFasting && (
                      <div
                        className={`px-1 py-0.2 rounded text-[7.5px] sm:text-[8.5px] font-bold truncate flex items-center gap-0.5 leading-tight ${
                          isRamadanDay
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-teal-100 text-teal-900'
                        }`}
                        title={day.primaryFasting.name}
                      >
                        {isRamadanDay ? (
                          <Moon className="w-2 h-2 text-emerald-700 shrink-0" />
                        ) : (
                          <Sparkles className="w-2 h-2 text-teal-700 shrink-0" />
                        )}
                        <span className="truncate hidden sm:inline">
                          {isRamadanDay ? `Ramadhan ${day.hijri.day}` : day.primaryFasting.name.replace('Puasa Sunnah ', '')}
                        </span>
                      </div>
                    )}

                    {/* Haram Fasting Badge */}
                    {day.isHaramFasting && day.isCurrentMonth && (
                      <div className="px-1 py-0.2 rounded bg-red-100 text-red-800 text-[7.5px] sm:text-[8.5px] font-bold truncate leading-tight">
                        Haram
                      </div>
                    )}

                    {/* Holiday Label */}
                    {day.isCurrentMonth && day.holidayName && (
                      <div className="px-1 py-0.2 rounded bg-red-50 text-red-700 text-[7.5px] sm:text-[8.5px] font-bold truncate leading-tight">
                        {day.holidayName}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Session indicator or Today tag */}
                  <div className="flex items-center justify-between text-[7.5px] sm:text-[8.5px] leading-tight">
                    {daySession ? (
                      <span className="w-full text-center px-0.5 py-0.2 rounded bg-purple-100 text-purple-900 font-bold truncate">
                        Sesi Ada
                      </span>
                    ) : day.isToday ? (
                      <span className="w-full text-center px-0.5 py-0.2 rounded bg-amber-300 text-amber-950 font-bold uppercase tracking-tighter">
                        Hari Ini
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KETERANGAN & DETAIL DI BAWAH KALENDER (Compact, Slim & Tidy)          */}
      {/* ========================================================================= */}
      <div className="space-y-2.5 sm:space-y-3">
        {/* A. Legenda Warna Kalender (Slim) */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-700">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="font-medium">Minggu/Libur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="font-medium">Ramadhan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="font-medium">Puasa Sunnah</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="font-medium">Sesi Terjadwal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="font-medium">Hari Haram</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
              <span>* Kemenag RI (MABIMS)</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <span>Dibuat oleh</span>
                <strong className="text-emerald-800 font-bold">eccko developer</strong>
              </span>
            </div>
          </div>
        </div>

        {/* B. Detail Tanggal Terpilih (Slim & Compact Card) */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs space-y-2.5 text-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {selectedDayData.dayName}, {selectedDayData.dayOfMonth} {MONTH_NAMES_ID[selectedDayData.date.getMonth()]} {selectedDayData.date.getFullYear()}
                </h3>
                <span className="text-[11px] italic text-slate-400">
                  ({selectedDayData.pasaran.name})
                </span>
                {selectedDayData.isToday && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-300 text-amber-950 text-[9px] font-black">
                    Hari Ini
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-emerald-700 mt-0.2">
                {selectedDayData.hijri.formatted} ({selectedDayData.hijri.formattedArabic})
              </p>
            </div>

            {/* Quick Sesi Action for Teachers/Admin */}
            <div className="flex items-center gap-1.5">
              {selectedDaySession ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSession(selectedDaySession.id);
                      onNavigateToTab('input');
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Form Input</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSession(selectedDaySession.id);
                      onNavigateToTab('checker');
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <CheckSquare className="w-3 h-3" />
                    <span>Ceklist</span>
                  </button>
                </div>
              ) : (
                user.role === 'admin' && (
                  <button
                    type="button"
                    onClick={handleCreateSession}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Buat Sesi Puasa Baru (Khusus Admin)"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Buat Sesi</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Fasting Details & Niat (Compact) */}
          {selectedDayData.fastingTypes.length > 0 ? (
            <div className="space-y-2">
              {selectedDayData.fastingTypes.map((ft) => (
                <div
                  key={ft.id}
                  className={`p-2.5 sm:p-3 rounded-lg border ${
                    ft.id === 'ramadhan'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : ft.category === 'haram'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-teal-50/50 border-teal-200'
                  } space-y-1.5`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1">
                      {ft.id === 'ramadhan' ? <Moon className="w-3.5 h-3.5 text-emerald-700" /> : <Sparkles className="w-3.5 h-3.5 text-teal-700" />}
                      {ft.name}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-white border border-slate-200 text-slate-700">
                      {ft.category.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {ft.description}
                  </p>

                  {/* Niat Puasa */}
                  {ft.niatArabic && (
                    <div className="mt-1 pt-1.5 border-t border-slate-200/80 space-y-0.5 bg-white p-2 sm:p-2.5 rounded-md border border-slate-100">
                      <p className="font-arabic text-right text-sm sm:text-base text-slate-900 leading-relaxed">
                        {ft.niatArabic}
                      </p>
                      <p className="text-[11px] italic text-emerald-700 font-medium">
                        {ft.niatLatin}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        "{ft.niatArti}"
                      </p>
                    </div>
                  )}

                  {/* Dalil */}
                  {ft.dalil && (
                    <p className="text-[10px] text-slate-500 italic">
                      {ft.dalil}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-slate-50 text-[11px] text-slate-500">
              Tidak ada anjuran puasa khusus pada hari ini (Hari biasa / Mubah).
            </div>
          )}

          {/* School Events if Any */}
          {selectedDayEvents.length > 0 && (
            <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Agenda Kegiatan Sekolah ({selectedDayEvents.length})
              </h4>
              <div className="space-y-1">
                {selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-amber-950">{ev.title}</span>
                      {ev.time && <span className="text-slate-500 ml-2 text-[11px]">({ev.time})</span>}
                    </div>
                    {(user.role === 'admin' || user.role === 'penginput') && (
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
