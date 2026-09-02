import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Student, HaidRecord, HaidBloodColor, FastingSession } from '../types';
import {
  calculateStartDateFromReportedDay,
  analyzeFiqhHaid,
  getTodayDateStr,
  calculateDaysBetween,
  FIQH_CONSTANTS,
  calculateSuciDaysForStudent,
} from '../utils/fiqhHaid';
import { InlineCameraScanner } from './InlineCameraScanner';
import { validateScannedCard } from '../utils/cardSecurity';
import { CrystalSnowEffect } from './CrystalSnowEffect';
import { VirtualizedStudentList } from './VirtualizedStudentList';
import {
  QrCode,
  Search,
  UserCheck,
  Calendar,
  Clock,
  Droplets,
  HeartPulse,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  Info,
  CalendarDays,
  User,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  AlertTriangle,
  Snowflake,
} from 'lucide-react';
import {
  playScanSuccessSound,
  playScanErrorSound,
} from '../utils/audioNotification';

interface HaidScanToast {
  studentId?: number;
  studentName: string;
  studentClass?: string;
  studentNik?: string;
  studentPhoto?: string;
  type: 'valid_ready' | 'active_haid' | 'fiqh_warning' | 'male_rejected' | 'invalid_card' | 'blacklisted';
  badge: string;
  title: string;
  description: string;
  detailBadge?: string;
  suciDays?: number;
  time: string;
  isError: boolean;
}

interface CatatHaidViewProps {
  students?: Student[];
  haidRecords?: HaidRecord[];
  activeSession?: FastingSession;
  currentUserName?: string;
  preselectedStudent?: Student;
  onSaveHaidRecord: (record: HaidRecord, autoUpdateFasting: boolean) => void;
  onNavigateToDaftarHaid: () => void;
  onNavigateToDaftarSuci: () => void;
}

export const CatatHaidView: React.FC<CatatHaidViewProps> = ({
  students = [],
  haidRecords = [],
  activeSession,
  currentUserName = '',
  preselectedStudent,
  onSaveHaidRecord,
  onNavigateToDaftarHaid,
  onNavigateToDaftarSuci,
}) => {
  // Only female students
  const femaleStudents = useMemo(() => {
    return (students || []).filter((s) => s.jenisKelamin === 'Perempuan');
  }, [students]);

  // Selected student state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(preselectedStudent || null);
  const [isFiqhWarningModalOpen, setIsFiqhWarningModalOpen] = useState<boolean>(false);
  const [activeHaidModalInfo, setActiveHaidModalInfo] = useState<{
    student: Student;
    record: HaidRecord;
    currentDay: number;
  } | null>(null);
  const [scanToast, setScanToast] = useState<HaidScanToast | null>(null);
  const scanToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerScanToast = useCallback((toast: HaidScanToast) => {
    if (scanToastTimerRef.current) {
      clearTimeout(scanToastTimerRef.current);
    }
    setScanToast(toast);
    scanToastTimerRef.current = setTimeout(() => {
      setScanToast(null);
    }, 6000);
  }, []);

  useEffect(() => {
    return () => {
      if (scanToastTimerRef.current) {
        clearTimeout(scanToastTimerRef.current);
      }
    };
  }, []);

  // Pre-calculated O(1) status lookup map for all students to prevent repeated date calculations
  const studentStatusMap = useMemo(() => {
    const map = new Map<number, { isCurrentlyHaid: boolean; suciInfo: ReturnType<typeof calculateSuciDaysForStudent> }>();
    
    // Fast sets and completed records map
    const activeHaidSet = new Set<number>();
    const latestCompletedMap = new Map<number, HaidRecord>();

    haidRecords.forEach((r) => {
      if (r.status === 'haid_aktif') {
        activeHaidSet.add(r.studentId);
      } else if (r.status === 'selesai_mandi' && r.endDate) {
        const existing = latestCompletedMap.get(r.studentId);
        if (!existing || !existing.endDate || new Date(r.endDate).getTime() > new Date(existing.endDate).getTime()) {
          latestCompletedMap.set(r.studentId, r);
        }
      }
    });

    const todayStr = getTodayDateStr();

    femaleStudents.forEach((s) => {
      const isCurrentlyHaid = activeHaidSet.has(s.id);
      const latestCompleted = latestCompletedMap.get(s.id);

      let suciInfo: ReturnType<typeof calculateSuciDaysForStudent>;
      if (!latestCompleted || !latestCompleted.endDate) {
        suciInfo = {
          days: 30,
          hasPreviousRecord: false,
          isEligibleNewHaid: true,
          isUnder15Days: false,
          remainingSuciDays: 0,
        };
      } else {
        const days = calculateDaysBetween(latestCompleted.endDate, todayStr);
        const safeDays = Math.max(1, days);
        const isEligibleNewHaid = safeDays >= FIQH_CONSTANTS.MIN_SUCI_DAYS;
        const isUnder15Days = !isEligibleNewHaid;
        const remainingSuciDays = Math.max(0, FIQH_CONSTANTS.MIN_SUCI_DAYS - safeDays);
        suciInfo = {
          days: safeDays,
          lastEndDate: latestCompleted.endDate,
          lastEndTime: latestCompleted.endTime,
          hasPreviousRecord: true,
          isEligibleNewHaid,
          isUnder15Days,
          remainingSuciDays,
          lastRecord: latestCompleted,
        };
      }

      map.set(s.id, { isCurrentlyHaid, suciInfo });
    });

    return map;
  }, [femaleStudents, haidRecords]);

  useEffect(() => {
    if (preselectedStudent) {
      setSelectedStudent(preselectedStudent);
      const checkSuci = calculateSuciDaysForStudent(preselectedStudent.id, haidRecords);
      if (checkSuci.hasPreviousRecord && checkSuci.isUnder15Days) {
        setIsFiqhWarningModalOpen(true);
        playScanErrorSound();
      }
    }
  }, [preselectedStudent, haidRecords]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState<boolean>(false);
  const [scanFeedback, setScanFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  // Form input states
  const [reportedDay, setReportedDay] = useState<number>(1); // e.g. 1 = baru hari ini, 3 = sudah hari ke-3
  const [startDate, setStartDate] = useState<string>(getTodayDateStr());
  const [startTime, setStartTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [bloodColor, setBloodColor] = useState<HaidBloodColor>('merah');
  const [notes, setNotes] = useState<string>('');
  const [recordedBy, setRecordedBy] = useState<string>(currentUserName || 'Ustadzah Pembina');
  const [autoUpdateFasting, setAutoUpdateFasting] = useState<boolean>(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [savedRecordSummary, setSavedRecordSummary] = useState<HaidRecord | null>(null);

  // Filter classes for female students
  const femaleClasses = useMemo(() => {
    const set = new Set<string>();
    femaleStudents.forEach((s) => {
      if (s.kelas) set.add(s.kelas.trim());
    });
    return Array.from(set).sort();
  }, [femaleStudents]);

  // Filtered female students for manual search
  const filteredFemaleStudents = useMemo(() => {
    return femaleStudents.filter((s) => {
      const matchClass = selectedClass === 'SEMUA' || s.kelas === selectedClass;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.nama.toLowerCase().includes(q) ||
        s.nik.toLowerCase().includes(q) ||
        s.kelas.toLowerCase().includes(q);
      return matchClass && matchSearch;
    });
  }, [femaleStudents, selectedClass, searchQuery]);

  // When reported day changes, recalculate start date automatically
  const handleReportedDaySelect = (day: number) => {
    setReportedDay(day);
    const calculatedStart = calculateStartDateFromReportedDay(day, getTodayDateStr());
    setStartDate(calculatedStart);
  };

  // When user manually picks start date, calculate the implied day
  const handleStartDateChange = (newDateStr: string) => {
    setStartDate(newDateStr);
    const today = new Date(getTodayDateStr() + 'T00:00:00');
    const chosen = new Date(newDateStr + 'T00:00:00');
    const diffDays = Math.floor((today.getTime() - chosen.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays >= 1) {
      setReportedDay(diffDays);
    } else {
      setReportedDay(1);
    }
  };

  // Check if selected student is currently already in active haid
  const activeExistingHaid = useMemo(() => {
    if (!selectedStudent) return undefined;
    return haidRecords.find((r) => r.studentId === selectedStudent.id && r.status === 'haid_aktif');
  }, [selectedStudent, haidRecords]);

  // Check purity (Suci) status of the selected student for anti-lie / fiqih validation
  const suciInfo = useMemo(() => {
    if (!selectedStudent) return null;
    return calculateSuciDaysForStudent(selectedStudent.id, haidRecords);
  }, [selectedStudent, haidRecords]);

  // Handle Barcode/QR Scan result with rich pop-up notification
  const handleScanCode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const scanTimeStr =
      new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WIB';

    const validation = validateScannedCard(cleanCode, students);

    // Case 1: Blacklisted card (old version / reported lost)
    if (validation.isBlacklisted) {
      playScanErrorSound();
      const sName = validation.student ? validation.student.nama : `Kartu: "${cleanCode}"`;
      triggerScanToast({
        studentName: sName,
        studentClass: validation.student?.kelas,
        studentNik: validation.student?.nik,
        studentPhoto: validation.student?.foto,
        type: 'blacklisted',
        badge: '⛔ KARTU DINONAKTIFKAN / DIBLOKIR',
        title: 'Kartu Tidak Berlaku (Versi Lama)',
        description: validation.message || 'Kartu ini telah dilaporkan hilang/rusak dan digantikan versi baru.',
        time: scanTimeStr,
        isError: true,
      });
      setScanFeedback({
        message: `⛔ Kartu ditolak: ${validation.message}`,
        isError: true,
      });
      return;
    }

    // Case 2: Unrecognized / Not found card
    if (!validation.isValid || !validation.student) {
      playScanErrorSound();
      triggerScanToast({
        studentName: `Barcode: "${cleanCode}"`,
        type: 'invalid_card',
        badge: '⚠️ KARTU TIDAK DIKENALI',
        title: 'Barcode Santri Tidak Terdaftar',
        description: 'Kartu tidak ditemukan dalam database atau format barcode tidak sesuai.',
        time: scanTimeStr,
        isError: true,
      });
      setScanFeedback({
        message: `⚠️ Kartu tidak dikenali: ${cleanCode}`,
        isError: true,
      });
      return;
    }

    const matchedStudent = validation.student;

    // Case 3: Male student scanned on Catat Haid
    if (matchedStudent.jenisKelamin !== 'Perempuan') {
      playScanErrorSound();
      triggerScanToast({
        studentId: matchedStudent.id,
        studentName: matchedStudent.nama,
        studentClass: matchedStudent.kelas,
        studentNik: matchedStudent.nik,
        studentPhoto: matchedStudent.foto,
        type: 'male_rejected',
        badge: '⛔ DITOLAK: SANTRI LAKI-LAKI',
        title: 'Pencatatan Khusus Santriwati',
        description: `${matchedStudent.nama} adalah santri Laki-laki. Menu Catat Haid khusus untuk santriwati.`,
        time: scanTimeStr,
        isError: true,
      });
      setScanFeedback({
        message: `⚠️ ${matchedStudent.nama} adalah santri Laki-laki. Pencatatan haid khusus untuk santriwati.`,
        isError: true,
      });
      return;
    }

    // Select this student in form
    setSelectedStudent(matchedStudent);
    setSearchQuery('');

    // Check if student is already in active haid
    const existingActive = haidRecords.find((r) => r.studentId === matchedStudent.id && r.status === 'haid_aktif');
    if (existingActive) {
      const currentDay = calculateDaysBetween(existingActive.startDate, getTodayDateStr());
      setActiveHaidModalInfo({
        student: matchedStudent,
        record: existingActive,
        currentDay,
      });
      playScanSuccessSound();
      triggerScanToast({
        studentId: matchedStudent.id,
        studentName: matchedStudent.nama,
        studentClass: matchedStudent.kelas,
        studentNik: matchedStudent.nik,
        studentPhoto: matchedStudent.foto,
        type: 'active_haid',
        badge: '🩸 SEDANG AKTIF MASA HAID',
        title: `Menjalani Haid Hari ke-${currentDay}`,
        description: `Mulai sejak ${existingActive.startDate} (${existingActive.startTime || '00:00'}). Formulir siap diperbarui.`,
        detailBadge: `Hari ke-${currentDay}`,
        time: scanTimeStr,
        isError: false,
      });
      setScanFeedback({
        message: `ℹ️ ${matchedStudent.nama} sedang dalam masa haid (Hari ke-${currentDay}).`,
        isError: false,
      });
      return;
    }

    // Check purity status for anti-lie warning popup immediately
    const checkSuci = calculateSuciDaysForStudent(matchedStudent.id, haidRecords);
    if (checkSuci.hasPreviousRecord && checkSuci.isUnder15Days) {
      playScanErrorSound();
      setIsFiqhWarningModalOpen(true);
      triggerScanToast({
        studentId: matchedStudent.id,
        studentName: matchedStudent.nama,
        studentClass: matchedStudent.kelas,
        studentNik: matchedStudent.nik,
        studentPhoto: matchedStudent.foto,
        type: 'fiqh_warning',
        badge: '⚠️ PERINGATAN: BELUM 15 HARI SUCI',
        title: 'Terindikasi Darah Istihadhah',
        description: `Baru suci ${checkSuci.days} hari (Kurang dari batas minimal 15 hari). Wajib tetap sholat & puasa!`,
        suciDays: checkSuci.days,
        detailBadge: `Baru Suci ${checkSuci.days} Hari`,
        time: scanTimeStr,
        isError: true,
      });
      setScanFeedback({
        message: `⚠️ PERINGATAN: ${matchedStudent.nama} baru menjalani masa suci Hari ke-${checkSuci.days} (Terindikasi alasan tidak valid / Istihadhah).`,
        isError: true,
      });
    } else {
      playScanSuccessSound();
      const suciDesc = checkSuci.hasPreviousRecord
        ? `Masa suci terakhir: ${checkSuci.days} hari lalu (Memenuhi syarat fiqih minimal 15 hari ✅)`
        : 'Riwayat baru / belum ada catatan haid sebelumnya.';
      triggerScanToast({
        studentId: matchedStudent.id,
        studentName: matchedStudent.nama,
        studentClass: matchedStudent.kelas,
        studentNik: matchedStudent.nik,
        studentPhoto: matchedStudent.foto,
        type: 'valid_ready',
        badge: '🌸 TERPINDAI: KARTU SANTRIWATI',
        title: 'Kartu Valid & Siap Dicatat',
        description: suciDesc,
        suciDays: checkSuci.hasPreviousRecord ? checkSuci.days : undefined,
        detailBadge: checkSuci.hasPreviousRecord ? `Suci ${checkSuci.days} Hari` : 'Santriwati Putri',
        time: scanTimeStr,
        isError: false,
      });
      setScanFeedback({
        message: `✅ Terpindai: ${matchedStudent.nama} (${matchedStudent.kelas})`,
        isError: false,
      });
    }
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      playScanErrorSound();
      setScanFeedback({ message: '⚠️ Silakan pilih atau scan kartu santriwati terlebih dahulu.', isError: true });
      return;
    }

    const newRecord: HaidRecord = {
      id: `haid-${Date.now()}-${selectedStudent.id}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.nama,
      studentClass: selectedStudent.kelas,
      studentNik: selectedStudent.nik,
      startDate: startDate,
      startTime: startTime,
      initialInputDay: reportedDay,
      status: 'haid_aktif',
      bloodColor: bloodColor,
      notes: notes.trim() || undefined,
      recordedBy: recordedBy.trim() || 'Ustadzah Pembina',
      recordedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveHaidRecord(newRecord, autoUpdateFasting);
    playScanSuccessSound();
    setSavedRecordSummary(newRecord);
    setIsSuccessModalOpen(true);

    // Reset some form parts
    setNotes('');
  };

  const fiqhAnalysis = useMemo(() => {
    return analyzeFiqhHaid(startDate);
  }, [startDate]);

  const handleSelectStudent = useCallback((s: Student) => {
    setSelectedStudent(s);
    setScanFeedback(null);

    // Check if student is already in active haid
    const existingActive = haidRecords.find((r) => r.studentId === s.id && r.status === 'haid_aktif');
    if (existingActive) {
      const currentDay = calculateDaysBetween(existingActive.startDate, getTodayDateStr());
      setActiveHaidModalInfo({
        student: s,
        record: existingActive,
        currentDay,
      });
      playScanSuccessSound();
      return;
    }

    const status = studentStatusMap.get(s.id);
    if (status?.suciInfo.hasPreviousRecord && status.suciInfo.isUnder15Days) {
      playScanErrorSound();
      setIsFiqhWarningModalOpen(true);
    }
  }, [studentStatusMap, haidRecords]);

  return (
    <div className="relative max-w-6xl mx-auto space-y-3.5 sm:space-y-4 animate-pink-fade-in p-2 sm:p-3 rounded-3xl bg-gradient-to-b from-[#fff5f8] via-[#fef2f6] to-[#fce7f3] border border-pink-100/80 shadow-[0_10px_35px_rgba(244,114,182,0.12)]">
      {/* Salju Kristal Bertebaran (Ringan & Cepat) */}
      <CrystalSnowEffect density={8} />

      {/* Header Banner - Soft Rose Pink with Crystal Shimmer */}
      <div className="relative z-10 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-md border border-pink-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-hidden">
        {/* Subtle background decorative crystal glow */}
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/20 rounded-full pointer-events-none" />

        <div className="flex items-center gap-2.5 sm:gap-3 relative z-10 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white/20 flex items-center justify-center border border-white/40 shrink-0 shadow-inner">
            <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-sm sm:text-xl font-black tracking-tight leading-tight text-white drop-shadow-xs truncate">
                Catat Haid Santriwati
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-white/25 text-white border border-white/30 backdrop-blur-xs flex items-center gap-1 shrink-0">
                <Snowflake className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-pink-100" />
                <span>Fiqih An-Nisa</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-pink-100 leading-tight mt-0.5 font-medium">
              Pencatatan masa haid dan integrasi status puasa.
            </p>
          </div>
        </div>

        {/* Quick Nav Buttons to Other Haid/Suci Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto relative z-10">
          <button
            type="button"
            onClick={onNavigateToDaftarHaid}
            className="flex-1 sm:flex-initial justify-center px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black bg-white/95 hover:bg-white text-pink-700 border border-pink-100 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer touch-manipulation"
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">Daftar Haid ({haidRecords.filter((r) => r.status === 'haid_aktif').length})</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToDaftarSuci}
            className="flex-1 sm:flex-initial justify-center px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-pink-700/80 hover:bg-pink-800 text-white border border-pink-300/40 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer touch-manipulation"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            <span className="truncate">Daftar Suci</span>
          </button>
        </div>
      </div>

      {/* 🌸 FLOATING / EMBEDDED POP-UP NOTIFIKASI HASIL SCAN KARTU HAID */}
      {scanToast && (
        <div
          role="alert"
          aria-live="assertive"
          className={`relative z-30 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border shadow-lg transition-all animate-in zoom-in-95 duration-200 ${
            scanToast.type === 'valid_ready'
              ? 'bg-gradient-to-r from-pink-900 via-rose-900 to-pink-950 text-white border-pink-400/50 shadow-[0_8px_30px_rgba(244,114,182,0.35)]'
              : scanToast.type === 'active_haid'
              ? 'bg-gradient-to-r from-rose-950 via-purple-950 to-pink-950 text-white border-rose-400/60 shadow-[0_8px_30px_rgba(225,29,72,0.35)]'
              : scanToast.type === 'fiqh_warning'
              ? 'bg-gradient-to-r from-amber-950 via-rose-950 to-amber-900 text-white border-amber-400/70 shadow-[0_8px_30px_rgba(245,158,11,0.35)]'
              : 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 text-white border-rose-500/50 shadow-[0_8px_30px_rgba(244,63,94,0.35)]'
          }`}
        >
          <div className="flex items-start sm:items-center justify-between gap-3">
            {/* Left: Avatar / Student Photo */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {scanToast.studentPhoto ? (
                <img
                  src={scanToast.studentPhoto}
                  alt={scanToast.studentName}
                  className="w-12 h-14 object-cover rounded-xl border-2 border-pink-300 shadow-md shrink-0 bg-pink-950"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md border ${
                    scanToast.type === 'valid_ready'
                      ? 'bg-gradient-to-br from-pink-400 to-rose-500 border-pink-200 text-pink-950 font-black'
                      : scanToast.type === 'active_haid'
                      ? 'bg-gradient-to-br from-rose-500 to-pink-600 border-rose-300 text-white font-black'
                      : scanToast.type === 'fiqh_warning'
                      ? 'bg-gradient-to-br from-amber-400 to-rose-500 border-amber-200 text-amber-950 font-black'
                      : 'bg-gradient-to-br from-rose-600 to-slate-800 border-rose-400 text-white font-black'
                  }`}
                >
                  {scanToast.type === 'valid_ready' ? (
                    <Droplets className="w-6 h-6 text-white stroke-[2.5]" />
                  ) : scanToast.type === 'active_haid' ? (
                    <HeartPulse className="w-6 h-6 text-white stroke-[2.5] animate-pulse" />
                  ) : scanToast.type === 'fiqh_warning' ? (
                    <AlertTriangle className="w-6 h-6 text-amber-950 stroke-[2.5]" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-white stroke-[2.5]" />
                  )}
                </div>
              )}

              {/* Middle: Details & Fiqh Context */}
              <div className="min-w-0 flex-1">
                {/* Header Badge & Time */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      scanToast.type === 'valid_ready'
                        ? 'bg-pink-500/30 text-pink-200 border-pink-400/40'
                        : scanToast.type === 'active_haid'
                        ? 'bg-rose-500/30 text-rose-200 border-rose-400/40'
                        : scanToast.type === 'fiqh_warning'
                        ? 'bg-amber-500/30 text-amber-200 border-amber-400/40'
                        : 'bg-rose-500/30 text-rose-200 border-rose-400/40'
                    }`}
                  >
                    {scanToast.badge}
                  </span>
                  <span className="font-mono text-[9px] sm:text-[10px] text-pink-200/75">
                    ({scanToast.time})
                  </span>
                </div>

                {/* Student Name */}
                <h4 className="text-sm sm:text-base font-black text-white truncate drop-shadow-sm mt-0.5 leading-tight">
                  {scanToast.studentName}
                </h4>

                {/* Class & Details Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-pink-100/90 mt-0.5">
                  {scanToast.studentClass && (
                    <span className="font-semibold bg-white/15 px-1.5 py-0.2 rounded border border-white/20">
                      Kelas: <strong className="text-pink-200">{scanToast.studentClass}</strong>
                    </span>
                  )}
                  {scanToast.studentNik && (
                    <span className="font-mono opacity-80 hidden sm:inline">
                      NIK: {scanToast.studentNik}
                    </span>
                  )}
                  {scanToast.detailBadge && (
                    <span
                      className={`font-black px-2 py-0.2 rounded-md ${
                        scanToast.type === 'valid_ready'
                          ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                          : scanToast.type === 'active_haid'
                          ? 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                          : scanToast.type === 'fiqh_warning'
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                          : 'bg-white/10 text-pink-100'
                      }`}
                    >
                      {scanToast.detailBadge}
                    </span>
                  )}
                </div>

                {/* Description / Fiqh Note */}
                <p className="text-[10.5px] sm:text-xs text-pink-100/90 mt-1 leading-tight line-clamp-2">
                  {scanToast.description}
                </p>
              </div>
            </div>

            {/* Right: Close & Status Pill */}
            <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1">
              <button
                type="button"
                onClick={() => setScanToast(null)}
                className="text-pink-200/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup Notifikasi"
              >
                <X className="w-4 h-4" />
              </button>

              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black tracking-wide shadow-xs flex items-center gap-1 ${
                  scanToast.type === 'valid_ready'
                    ? 'bg-emerald-500 text-white'
                    : scanToast.type === 'active_haid'
                    ? 'bg-rose-500 text-white'
                    : scanToast.type === 'fiqh_warning'
                    ? 'bg-amber-500 text-amber-950'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {scanToast.type === 'valid_ready' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SIAP DICATAT</span>
                  </>
                ) : scanToast.type === 'active_haid' ? (
                  <>
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>HAID AKTIF</span>
                  </>
                ) : scanToast.type === 'fiqh_warning' ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>PERINGATAN</span>
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>DITOLAK</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left (Scanner & Picker) - Right (Fiqh Form) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Column: 5 Cols on Desktop - Search & Scan */}
        <div className="lg:col-span-5 space-y-3">
          {/* 1. Scan Card Quick Button */}
          <div className="bg-white/95 backdrop-blur-xs border border-pink-100 rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(244,114,182,0.06)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-pink-500" />
                Scan Kartu Santriwati
              </span>
              <span className="text-[10px] text-pink-600 bg-pink-50 font-bold px-2 py-0.5 rounded-full border border-pink-100">
                QR / Barcode
              </span>
            </div>

            {!isCameraScannerOpen ? (
              <button
                type="button"
                onClick={() => {
                  setScanFeedback(null);
                  setIsCameraScannerOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 active:scale-98 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(244,114,182,0.3)] cursor-pointer touch-manipulation"
              >
                <QrCode className="w-4 h-4 text-white animate-pulse" />
                <span>Buka Kamera Scan Kartu</span>
              </button>
            ) : (
              <div className="space-y-2">
                <InlineCameraScanner
                  isActive={isCameraScannerOpen}
                  onClose={() => setIsCameraScannerOpen(false)}
                  onScanSuccess={(code) => {
                    handleScanCode(code);
                  }}
                  title="Kamera Scanner Kartu Santri"
                  scannerId="catat-haid-scanner-region"
                />
              </div>
            )}

            {/* Scan Feedback Banner */}
            {scanFeedback && (
              <div
                className={`p-2 rounded-xl text-xs font-medium flex items-center justify-between gap-1.5 ${
                  scanFeedback.isError
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                <span>{scanFeedback.message}</span>
                <button
                  type="button"
                  onClick={() => setScanFeedback(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 2. Manual Student Search & Picker (Lightweight Search-on-Demand) */}
          <div className="bg-white/95 backdrop-blur-xs border border-pink-100 rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(244,114,182,0.06)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-pink-500" />
                Cari Santriwati
              </span>
              <span className="text-[10px] text-pink-700 font-bold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                Pencarian Cepat
              </span>
            </div>

            {/* Class Filter & Search input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-pink-50/50 border border-pink-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
              >
                <option value="SEMUA">Semua Kelas Putri</option>
                {femaleClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Ketik nama / NIK / Scan barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const q = searchQuery.trim();
                      if (q) {
                        e.preventDefault();
                        handleScanCode(q);
                      }
                    }
                  }}
                  className="w-full pl-7 pr-7 py-1.5 text-xs bg-pink-50/50 border border-pink-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-pink-400 absolute left-2.5 top-2" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results (Shown only when typing or filtering class) */}
            {searchQuery.trim().length > 0 || selectedClass !== 'SEMUA' ? (
              <div className="space-y-1.5 animate-in fade-in duration-100">
                {filteredFemaleStudents.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400 italic bg-pink-50/30 rounded-xl border border-pink-100">
                    Santriwati dengan kata kunci "{searchQuery}" tidak ditemukan
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 px-1">
                      <span>Hasil ({filteredFemaleStudents.length} santriwati):</span>
                      <span className="text-pink-600 font-medium text-[9px]">⚡ Mode Cepat & Virtual</span>
                    </div>
                    <VirtualizedStudentList
                      students={filteredFemaleStudents}
                      studentStatusMap={studentStatusMap}
                      selectedStudentId={selectedStudent?.id}
                      onSelectStudent={handleSelectStudent}
                      containerHeight={230}
                      itemHeight={52}
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-pink-50/40 border border-dashed border-pink-200 text-center space-y-1">
                <p className="text-xs text-pink-900 font-medium">
                  🔍 Ketik nama atau NIK di atas untuk mencari santriwati
                </p>
                <p className="text-[10px] text-slate-400">
                  Gunakan kamera scan di atas atau ketik pencarian untuk input super cepat & ringan.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 7 Cols on Desktop - Fiqh Form & Analysis */}
        <div className="lg:col-span-7 space-y-3">
          <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-xs border border-pink-100 rounded-2xl p-4 sm:p-5 shadow-[0_4px_16px_rgba(244,114,182,0.06)] space-y-3.5">
            {/* Selected Student Banner */}
            {selectedStudent ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border border-pink-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {selectedStudent.foto ? (
                    <img
                      src={selectedStudent.foto}
                      alt={selectedStudent.nama}
                      className="w-10 h-10 rounded-full object-cover border-2 border-pink-300 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-pink-200 text-pink-800 font-bold text-sm flex items-center justify-center shrink-0">
                      {selectedStudent.nama.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {selectedStudent.nama}
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-pink-200 text-pink-800">
                        {selectedStudent.kelas}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600">
                      NIK: {selectedStudent.nik || '-'} • Ibu: {selectedStudent.namaIbu || '-'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs text-pink-700 hover:text-pink-900 font-bold shrink-0 p-1 cursor-pointer underline"
                  title="Ganti Santri"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-pink-50/40 border border-dashed border-pink-200 text-center space-y-1">
                <UserCheck className="w-6 h-6 text-pink-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  Belum Ada Santriwati yang Dipilih
                </p>
                <p className="text-[11px] text-slate-500">
                  Scan kartu santri atau klik salah satu nama pada daftar di sebelah kiri.
                </p>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PERINGATAN FIQIH / INDIKASI ALASAN PALSU JIKA MASIH MASA SUCI < 15 HARI  */}
            {/* ========================================================================= */}
            {selectedStudent && suciInfo && suciInfo.hasPreviousRecord && suciInfo.isUnder15Days && (
              <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-950 space-y-2.5 shadow-sm animate-in fade-in duration-150">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-black text-rose-950">
                        ⚠️ PERINGATAN FIQIH: TERINDIKASI ALASAN TIDAK VALID / BERBOHONG
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-700 text-white uppercase tracking-wider">
                        Masih Masa Suci Hari ke-{suciInfo.days}
                      </span>
                    </div>
                    <p className="text-xs text-rose-900 leading-relaxed font-medium">
                      Santriwati <strong>{selectedStudent.nama}</strong> tercatat baru suci selama <strong>{suciInfo.days} HARI</strong> (Selesai haid & mandi pada: <strong>{suciInfo.lastEndDate}</strong>).
                    </p>
                  </div>
                </div>

                <div className="bg-white/90 p-2.5 rounded-lg border border-rose-300 text-[11px] text-rose-950 space-y-1.5 leading-snug">
                  <div className="font-bold text-rose-900 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-rose-700" />
                    <span>Kaidah Fiqih Madzhab Syafi'i (Aqallu ath-Thuhr):</span>
                  </div>
                  <p>
                    Masa minimal suci antara dua haid adalah <strong>15 Hari 15 Malam</strong>. Karena baru <strong>{suciInfo.days} hari</strong>, darah yang keluar secara mutlak <strong>BUKAN DARAH HAID</strong>, melainkan <strong>Darah Istihadhah (Penyakit) atau Alasan Palsu</strong> untuk menghindari puasa/sholat.
                  </p>
                  <div className="p-1.5 rounded bg-rose-100/70 border border-rose-300 text-rose-900 font-bold flex items-center justify-between text-xs">
                    <span>Sisa masa suci yang wajib diselesaikan:</span>
                    <span className="text-rose-800 font-black">{suciInfo.remainingSuciDays} hari lagi (hingga genap 15 hari)</span>
                  </div>
                  <p className="text-rose-800 font-bold">
                    👉 Keputusan Syar'i: Santriwati <u>WAJIB TETAP BERPUASA & SHOLAT</u>!
                  </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200">
                  <button
                    type="button"
                    onClick={() => {
                      playScanErrorSound();
                      setSelectedStudent(null);
                      setScanFeedback({
                        message: `❌ Input dibatalkan. ${selectedStudent.nama} masih dalam masa suci Hari ke-${suciInfo.days} (Wajib tetap sholat & puasa).`,
                        isError: true,
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-black bg-rose-700 hover:bg-rose-800 text-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak Input (Wajib Tetap Sholat & Puasa)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNotes((prev) => `[ISTIHADHAH / PENYAKIT]: Keluar darah di masa suci hari ke-${suciInfo.days}. Menurut fiqih wajib tetap sholat & puasa. ${prev}`);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Catat Sebagai Istihadhah (Sakit)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFiqhWarningModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Buka Pop-up Fiqih</span>
                  </button>
                </div>
              </div>
            )}

            {/* Warning if already in active haid */}
            {activeExistingHaid && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Perhatian:</strong> Santriwati ini tercatat sedang dalam masa haid sejak{' '}
                  <strong>{activeExistingHaid.startDate}</strong>. Menyimpan catatan baru akan memperbarui siklus haid aktifnya.
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* FITUR FIQIH: "SANTRIWATI DITANYA: SUDAH HARI KE BERAPA?"                  */}
            {/* ========================================================================= */}
            <div className="p-3 rounded-2xl bg-pink-50/60 border border-pink-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-pink-600" />
                  <span>Kondisi Saat Ini: Santriwati Sedang di Hari Ke-?</span>
                </label>
                <span className="text-[10px] font-bold text-pink-700 bg-white px-2 py-0.5 rounded-full border border-pink-200 shadow-2xs">
                  Hitung Otomatis Fiqih
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-tight">
                Pilih hari berjalan saat santriwati melapor. Sistem akan otomatis menghitung tanggal awal keluar darah ke belakang:
              </p>

              {/* Quick Day Chips 1 to 7 and custom */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleReportedDaySelect(d)}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center cursor-pointer border ${
                      reportedDay === d
                        ? 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white border-pink-500 shadow-xs scale-102'
                        : 'bg-white text-slate-700 hover:bg-pink-50/60 border-pink-100'
                    }`}
                  >
                    <span className="leading-none text-[11px] sm:text-xs">Hari {d}</span>
                    <span className="text-[8px] font-normal opacity-85 mt-0.5">
                      {d === 1 ? 'Hari Ini' : d === 2 ? 'Kemarin' : `${d - 1} hr lalu`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                    Tanggal Mulai Keluar Darah (Start Date):
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    max={getTodayDateStr()}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-pink-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                    Jam Keluar Darah (Perkiraan):
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-pink-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Fiqh Status Live Analysis Box */}
            <div className={`p-3 rounded-2xl border ${fiqhAnalysis.badgeBg} ${fiqhAnalysis.badgeBorder} space-y-1.5`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black ${fiqhAnalysis.badgeColor} flex items-center gap-1`}>
                  <BookOpen className="w-3.5 h-3.5" />
                  Status Fiqih: {fiqhAnalysis.stageTitle}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 border border-pink-200 text-slate-700 shadow-2xs">
                  Durasi: {fiqhAnalysis.dayCount} Hari
                </span>
              </div>
              <p className="text-[11px] text-slate-700 leading-snug">
                {fiqhAnalysis.description}
              </p>
              <p className="text-[10px] font-semibold text-rose-900 leading-snug italic pt-0.5 border-t border-slate-200/60">
                📌 Kaidah: {fiqhAnalysis.fiqhRuling}
              </p>
            </div>

            {/* Blood Color & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                  Warna / Sifat Darah:
                </label>
                <select
                  value={bloodColor}
                  onChange={(e) => setBloodColor(e.target.value as HaidBloodColor)}
                  className="w-full px-2.5 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
                >
                  <option value="merah">Merah (Darah Haid Segar)</option>
                  <option value="hitam">Hitam (Darah Kuat / Ashal)</option>
                  <option value="coklat">Coklat / Kudrah (Kekeruhan)</option>
                  <option value="kuning">Kuning / Shufrah</option>
                  <option value="keruh">Keruh / Berlendir</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                  Nama Ustadzah / Pencatat:
                </label>
                <input
                  type="text"
                  value={recordedBy}
                  onChange={(e) => setRecordedBy(e.target.value)}
                  placeholder="Nama Ustadzah"
                  className="w-full px-2.5 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Keluhan & Catatan Khusus */}
            <div>
              <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                Keluhan / Catatan Medis & Fiqih:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Nyeri haid hari 1-2, minum jamu kunyit asam, istirahat di asrama..."
                className="w-full px-2.5 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              />
            </div>

            {/* Fasting Sync Option */}
            <div className="p-2.5 rounded-xl bg-pink-50/50 border border-pink-200 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-800">
                <input
                  type="checkbox"
                  checked={autoUpdateFasting}
                  onChange={(e) => setAutoUpdateFasting(e.target.checked)}
                  className="w-4 h-4 text-pink-600 rounded border-pink-300 focus:ring-pink-400 cursor-pointer"
                />
                <span className="font-semibold">
                  Otomatis tandai presensi puasa sebagai "Halangan / Udzur Syar'i"
                </span>
              </label>
              <span className="text-[10px] text-pink-700 font-bold hidden sm:inline">
                Raport Tetap Adil
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedStudent(null);
                  setReportedDay(1);
                  setStartDate(getTodayDateStr());
                  setNotes('');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-pink-50 border border-pink-200 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                disabled={!selectedStudent}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:to-rose-600 active:scale-98 disabled:opacity-50 disabled:pointer-events-none text-white transition-all shadow-[0_4px_15px_rgba(244,114,182,0.3)] flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Catatan Haid</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PANDUAN RINGKAS FIQIH HAID (Madzhab Syafi'i)                            */}
      {/* ========================================================================= */}
      <div className="relative z-10 bg-white/95 backdrop-blur-xs border border-pink-100 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_4px_16px_rgba(244,114,182,0.06)] space-y-2.5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-pink-600" />
          <h3 className="text-xs sm:text-sm font-black text-slate-900">
            Panduan Fiqih Haid & Suci Santriwati (Kaidah Madzhab Syafi'i)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-pink-50/60 border border-pink-200/80 space-y-0.5">
            <span className="font-bold text-pink-900 block text-[11px]">1. Batas Minimal Haid</span>
            <p className="text-[10px] text-slate-600 leading-snug">
              Minimal <strong>1 hari 1 malam (24 jam)</strong> secara akumulatif dalam rentang 15 hari.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-0.5">
            <span className="font-bold text-rose-900 block text-[11px]">2. Kebiasaan / Ghalib</span>
            <p className="text-[10px] text-slate-600 leading-snug">
              Umumnya berlangsung selama <strong>6 sampai 7 hari</strong>.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-pink-50/60 border border-pink-200/80 space-y-0.5">
            <span className="font-bold text-pink-900 block text-[11px]">3. Batas Maksimal Haid</span>
            <p className="text-[10px] text-slate-600 leading-snug">
              Maksimal <strong>15 hari 15 malam</strong>. Lewat dari 15 hari adalah <strong>Istihadhah</strong> (Wajib Mandi).
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-0.5">
            <span className="font-bold text-emerald-900 block text-[11px]">4. Minimal Masa Suci</span>
            <p className="text-[10px] text-slate-600 leading-snug">
              Jarak suci antara dua haid minimal <strong>15 hari 15 malam</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* POPUP MODAL: PERINGATAN FIQIH TERINDIKASI ALASAN TIDAK VALID / BERBOHONG */}
      {isFiqhWarningModalOpen && selectedStudent && suciInfo && suciInfo.hasPreviousRecord && suciInfo.isUnder15Days && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-4 sm:pt-8 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border-2 border-rose-500 space-y-3 max-h-[85vh] overflow-y-auto mt-2 sm:mt-4">
            {/* Header with Red Warning Badge */}
            <div className="flex items-start gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                    Peringatan Fiqih Syar'i
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                    Suci Hari ke-{suciInfo.days}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-rose-950 leading-tight">
                  ⚠️ Terindikasi Alasan Tidak Valid / Berbohong
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFiqhWarningModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 touch-manipulation cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Identification from Scanned Card (NIK / Barcode ID) */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              {selectedStudent.foto ? (
                <img
                  src={selectedStudent.foto}
                  alt={selectedStudent.nama}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-100 text-rose-800 font-black text-sm sm:text-base flex items-center justify-center shrink-0 border border-rose-200">
                  {selectedStudent.nama.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                    {selectedStudent.nama}
                  </h4>
                  <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 shrink-0">
                    {selectedStudent.kelas}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  NIK: <strong className="text-slate-900 font-mono">{selectedStudent.nik || '-'}</strong>
                </p>
              </div>
            </div>

            {/* Realtime Purity Status Box */}
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 space-y-1.5 text-xs text-rose-950">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold text-[11px]">Status Masa Suci:</span>
                <span className="px-2 py-0.5 rounded font-black bg-rose-600 text-white text-[10px] sm:text-[11px]">
                  Baru {suciInfo.days} Hari Suci
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className="text-slate-600">Selesai Mandi Terakhir:</span>
                <strong className="text-slate-900">{suciInfo.lastEndDate || '-'}</strong>
              </div>
              <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className="text-slate-600">Sisa Minimal Suci:</span>
                <strong className="text-rose-700 font-black">{suciInfo.remainingSuciDays} hari lagi</strong>
              </div>

              {/* Visual progress */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[9px] sm:text-[10px] text-rose-900 font-medium">
                  <span>Progres Menuju Sah 15 Hari:</span>
                  <span>{Math.min(15, suciInfo.days)} / 15 Hari</span>
                </div>
                <div className="w-full h-1.5 bg-rose-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (suciInfo.days / 15) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Fiqh Explanation */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1 leading-snug">
              <div className="font-black text-amber-900 flex items-center gap-1.5 text-[11px] sm:text-xs">
                <BookOpen className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                <span>Kaidah Fiqih Madzhab Syafi'i:</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-amber-900">
                Jarak suci minimal adalah <strong>15 hari 15 malam</strong>. Karena baru <strong>{suciInfo.days} hari</strong>, darah yang keluar <strong>BUKAN HAID</strong> melainkan <strong>Istihadhah / Alasan Tidak Valid</strong>.
              </p>
              <div className="p-1.5 rounded-xl bg-white/90 border border-amber-300 font-bold text-rose-800 text-[10px] sm:text-[11px]">
                👉 Santriwati <u>WAJIB TETAP SHOLAT & PUASA</u>!
              </div>
            </div>

            {/* Popup Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  playScanErrorSound();
                  setIsFiqhWarningModalOpen(false);
                  setSelectedStudent(null);
                  setScanFeedback({
                    message: `❌ Input dibatalkan. ${selectedStudent.nama} masih dalam masa suci Hari ke-${suciInfo.days} (Wajib tetap sholat & puasa).`,
                    isError: true,
                  });
                }}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 active:scale-98 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >
                <X className="w-4 h-4" />
                <span>Tolak Input (Wajib Tetap Sholat & Puasa)</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFiqhWarningModalOpen(false);
                    setNotes((prev) => `[ISTIHADHAH / PENYAKIT]: Darah keluar di masa suci hari ke-${suciInfo.days}. Menurut fiqih wajib tetap sholat & puasa. ${prev}`.trim());
                  }}
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="truncate">Catat Istihadhah (Sakit)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFiqhWarningModalOpen(false)}
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all cursor-pointer touch-manipulation text-center"
                >
                  Lihat Detail Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: SEDANG DALAM MASA HAID HARI KE-X (Sentuh di mana saja untuk menutup) */}
      {activeHaidModalInfo && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveHaidModalInfo(null)}
          className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-4 sm:pt-8 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer touch-manipulation overscroll-contain overflow-y-auto"
        >
          <div
            onClick={(e) => {
              // Clicking inside also allows dismissal, or user can tap close
              e.stopPropagation();
              setActiveHaidModalInfo(null);
            }}
            className="bg-white rounded-2xl sm:rounded-3xl max-w-xs sm:max-w-sm w-full p-3.5 sm:p-4.5 shadow-2xl border-2 border-pink-300 space-y-2.5 sm:space-y-3 animate-in zoom-in-95 duration-150 relative overflow-hidden cursor-pointer select-none max-h-[85vh] overflow-y-auto mt-2 sm:mt-4"
          >
            {/* Top decorative gradient glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-rose-500/30 rounded-full blur-xl pointer-events-none" />

            {/* Header / Icon */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-sm shrink-0 animate-pulse">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-full border border-pink-200">
                    Status Aktif
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">Sentuh layar ✕</span>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate mt-0.5">
                  {activeHaidModalInfo.student.nama}
                </h3>
              </div>
            </div>

            {/* Main Highlight Box */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-pink-50 via-rose-50 to-pink-100/60 border border-pink-200/90 space-y-1 text-center">
              <p className="text-[10px] font-bold text-pink-900 uppercase tracking-wider">
                Sedang Dalam Masa Haid
              </p>
              <div className="inline-block px-3.5 py-1 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-base sm:text-lg shadow-xs tracking-wide">
                HARI KE-{activeHaidModalInfo.currentDay}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-600 leading-tight">
                Mulai sejak <strong>{activeHaidModalInfo.record.startDate}</strong> ({activeHaidModalInfo.record.startTime || '00:00'})
              </p>
            </div>

            {/* Compact Info Badges */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:text-[11px]">
              <div className="p-1.5 sm:p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[9px]">Kelas:</span>
                <strong className="text-slate-800 font-bold truncate block">{activeHaidModalInfo.student.kelas}</strong>
              </div>
              <div className="p-1.5 sm:p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[9px]">Pencatat:</span>
                <strong className="text-slate-800 font-semibold truncate block">{activeHaidModalInfo.record.recordedBy || 'Ustadzah'}</strong>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-0.5 space-y-1">
              <button
                type="button"
                onClick={() => setActiveHaidModalInfo(null)}
                className="w-full py-2 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 active:scale-98 text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
              >
                <span>Mengerti & Tutup</span>
              </button>
              <p className="text-[9px] text-center text-slate-400 font-medium">
                Sentuh di mana saja untuk menutup
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Confirmation Modal */}
      {isSuccessModalOpen && savedRecordSummary && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-4 sm:pt-8 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-3 mt-2 sm:mt-0">
            <div className="text-center space-y-1">
              <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-700 mx-auto flex items-center justify-center border border-rose-200">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                Catatan Haid Berhasil Disimpan!
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Data masa haid santriwati telah tercatat dalam sistem.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Santriwati:</span>
                <strong className="font-bold text-slate-900">{savedRecordSummary.studentName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kelas:</span>
                <span className="font-semibold">{savedRecordSummary.studentClass}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Mulai:</span>
                <span className="font-bold text-rose-700">{savedRecordSummary.startDate} ({savedRecordSummary.startTime || '00:00'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kondisi Lapor:</span>
                <span className="font-semibold">Hari ke-{savedRecordSummary.initialInputDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pencatat:</span>
                <span className="font-medium">{savedRecordSummary.recordedBy}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setSelectedStudent(null);
                  setReportedDay(1);
                  setStartDate(getTodayDateStr());
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all cursor-pointer touch-manipulation"
              >
                + Catat Lain
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  onNavigateToDaftarHaid();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs touch-manipulation"
              >
                <span>Daftar Haid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
