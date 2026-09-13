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
  Camera,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  playScanSuccessSound,
  playScanErrorSound,
} from '../utils/audioNotification';

interface CatatHaidViewProps {
  students?: Student[];
  haidRecords?: HaidRecord[];
  activeSession?: FastingSession;
  currentUserName?: string;
  preselectedStudent?: Student;
  onSaveHaidRecord: (record: HaidRecord, autoUpdateFasting: boolean) => void;
  onNavigateToDaftarHaid: () => void;
  onNavigateToDaftarSuci: () => void;
  onFinishHaid?: (recordId: string, endDate: string, endTime: string, mandiNotes?: string) => void;
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
  onFinishHaid,
}) => {
  // Hanya santriwati (Perempuan)
  const femaleStudents = useMemo(() => {
    return (students || []).filter((s) => s.jenisKelamin === 'Perempuan');
  }, [students]);

  // State pencarian & scanner
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState<boolean>(false);

  // Status map O(1) untuk menghitung status haid/suci santriwati secara cepat
  const studentStatusMap = useMemo(() => {
    const map = new Map<
      number,
      {
        isCurrentlyHaid: boolean;
        activeRecord?: HaidRecord;
        currentHaidDay?: number;
        suciInfo: ReturnType<typeof calculateSuciDaysForStudent>;
      }
    >();

    const activeHaidMap = new Map<number, HaidRecord>();
    const latestCompletedMap = new Map<number, HaidRecord>();

    haidRecords.forEach((r) => {
      if (r.status === 'haid_aktif') {
        activeHaidMap.set(r.studentId, r);
      } else if (r.status === 'selesai_mandi' && r.endDate) {
        const existing = latestCompletedMap.get(r.studentId);
        if (!existing || !existing.endDate || new Date(r.endDate).getTime() > new Date(existing.endDate).getTime()) {
          latestCompletedMap.set(r.studentId, r);
        }
      }
    });

    const todayStr = getTodayDateStr();

    femaleStudents.forEach((s) => {
      const activeRecord = activeHaidMap.get(s.id);
      const isCurrentlyHaid = !!activeRecord;
      const currentHaidDay = activeRecord
        ? calculateDaysBetween(activeRecord.startDate, todayStr)
        : undefined;

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

      map.set(s.id, {
        isCurrentlyHaid,
        activeRecord,
        currentHaidDay,
        suciInfo,
      });
    });

    return map;
  }, [femaleStudents, haidRecords]);

  // Daftar kelas perempuan
  const femaleClasses = useMemo(() => {
    const set = new Set<string>();
    femaleStudents.forEach((s) => {
      if (s.kelas) set.add(s.kelas.trim());
    });
    return Array.from(set).sort();
  }, [femaleStudents]);

  // Filter santriwati hasil pencarian
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q && selectedClass === 'SEMUA') {
      return [];
    }

    return femaleStudents.filter((s) => {
      const matchClass = selectedClass === 'SEMUA' || s.kelas === selectedClass;
      const matchQuery =
        !q ||
        s.nama.toLowerCase().includes(q) ||
        s.nik.toLowerCase().includes(q) ||
        (s.kelas && s.kelas.toLowerCase().includes(q));
      return matchClass && matchQuery;
    });
  }, [femaleStudents, selectedClass, searchQuery]);

  // State Pop-up Cerdas (Modal)
  const [activeModalStudent, setActiveModalStudent] = useState<Student | null>(null);

  // Form input states di dalam pop-up (jika belum haid/mulai haid baru)
  const [reportedDay, setReportedDay] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(getTodayDateStr());
  const [startTime, setStartTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [bloodColor, setBloodColor] = useState<HaidBloodColor>('merah');
  const [notes, setNotes] = useState<string>('');
  const [autoUpdateFasting, setAutoUpdateFasting] = useState<boolean>(true);
  const [allowEmergencyInput, setAllowEmergencyInput] = useState<boolean>(false);

  // Selesai Haid / Mandi Wajib state di dalam pop-up (jika siswi sedang haid)
  const [isFinishingHaidMode, setIsFinishingHaidMode] = useState<boolean>(false);
  const [mandiDate, setMandiDate] = useState<string>(getTodayDateStr());
  const [mandiTime, setMandiTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [mandiNotes, setMandiNotes] = useState<string>('Telah mandi besar & bersuci');

  // Pop-up Feedback Khusus (Scan Error, Laki-laki, Kartu Blokir)
  const [scanErrorAlert, setScanErrorAlert] = useState<{
    title: string;
    message: string;
    type: 'male' | 'invalid' | 'blacklisted';
  } | null>(null);

  // Pop-up Sukses Tersimpan
  const [savedSuccessInfo, setSavedSuccessInfo] = useState<{
    studentName: string;
    type: 'new_haid' | 'finish_haid';
    detail: string;
  } | null>(null);

  // Buka pop-up untuk siswi tertentu
  const openStudentModal = useCallback((student: Student) => {
    setActiveModalStudent(student);
    setReportedDay(1);
    setStartDate(getTodayDateStr());
    const now = new Date();
    setStartTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    setBloodColor('merah');
    setNotes('');
    setAllowEmergencyInput(false);
    setIsFinishingHaidMode(false);
    setMandiDate(getTodayDateStr());
    setMandiTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    setMandiNotes('Telah mandi besar & bersuci');

    // Mainkan nada audio sesuai status siswi
    const status = studentStatusMap.get(student.id);
    if (status?.isCurrentlyHaid) {
      playScanSuccessSound();
    } else if (status?.suciInfo.hasPreviousRecord && status.suciInfo.isUnder15Days) {
      playScanErrorSound();
    } else {
      playScanSuccessSound();
    }
  }, [studentStatusMap]);

  // Tangani preselected student dari tab lain jika ada
  useEffect(() => {
    if (preselectedStudent && preselectedStudent.jenisKelamin === 'Perempuan') {
      openStudentModal(preselectedStudent);
    }
  }, [preselectedStudent, openStudentModal]);

  // Tangani scan barcode / QR kartu
  const handleScanCode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const validation = validateScannedCard(cleanCode, students);

    // Kasus 1: Kartu Diblokir / Versi Lama
    if (validation.isBlacklisted) {
      playScanErrorSound();
      setScanErrorAlert({
        title: '⛔ Kartu Dinonaktifkan / Versi Lama',
        message: validation.message || 'Kartu ini telah dilaporkan rusak/hilang dan digantikan versi baru.',
        type: 'blacklisted',
      });
      return;
    }

    // Kasus 2: Kartu Tidak Dikenal
    if (!validation.isValid || !validation.student) {
      playScanErrorSound();
      setScanErrorAlert({
        title: '⚠️ Kartu Tidak Dikenali',
        message: `Barcode "${cleanCode}" tidak terdaftar dalam database santri.`,
        type: 'invalid',
      });
      return;
    }

    const matchedStudent = validation.student;

    // Kasus 3: Santri Laki-laki
    if (matchedStudent.jenisKelamin !== 'Perempuan') {
      playScanErrorSound();
      setScanErrorAlert({
        title: '⛔ Ditolak: Santri Laki-Laki',
        message: `${matchedStudent.nama} (${matchedStudent.kelas}) adalah santri putra. Halaman pencatatan haid khusus untuk santriwati putri.`,
        type: 'male',
      });
      return;
    }

    // Kasus 4: Santriwati Sah -> Langsung Buka Pop-up Cerdas
    setSearchQuery('');
    setIsCameraScannerOpen(false);
    openStudentModal(matchedStudent);
  };

  // Pilih hari ke-.. saat mulai haid
  const handleSelectReportedDay = (day: number) => {
    setReportedDay(day);
    const calculated = calculateStartDateFromReportedDay(day, getTodayDateStr());
    setStartDate(calculated);
  };

  // Simpan Haid Baru
  const handleSaveNewHaid = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeModalStudent) return;

    const newRecord: HaidRecord = {
      id: `haid-${Date.now()}-${activeModalStudent.id}`,
      studentId: activeModalStudent.id,
      studentName: activeModalStudent.nama,
      studentClass: activeModalStudent.kelas,
      studentNik: activeModalStudent.nik,
      startDate: startDate,
      startTime: startTime,
      initialInputDay: reportedDay,
      status: 'haid_aktif',
      bloodColor: bloodColor,
      notes: notes.trim() || undefined,
      recordedBy: currentUserName || 'Ustadzah Pembina',
      recordedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveHaidRecord(newRecord, autoUpdateFasting);
    playScanSuccessSound();
    const sName = activeModalStudent.nama;
    setActiveModalStudent(null);
    setSavedSuccessInfo({
      studentName: sName,
      type: 'new_haid',
      detail: `Mulai haid tercatat sejak ${startDate} (Hari ke-${reportedDay}).`,
    });
  };

  // Selesaikan Haid / Mandi Wajib
  const handleConfirmFinishHaid = (recordId: string) => {
    if (!activeModalStudent) return;
    if (onFinishHaid) {
      onFinishHaid(recordId, mandiDate, mandiTime, mandiNotes);
    }
    playScanSuccessSound();
    const sName = activeModalStudent.nama;
    setActiveModalStudent(null);
    setIsFinishingHaidMode(false);
    setSavedSuccessInfo({
      studentName: sName,
      type: 'finish_haid',
      detail: `Telah mandi wajib pada ${mandiDate} pukul ${mandiTime}. Santriwati kini berada di DAFTAR SUCI.`,
    });
  };

  // Info status siswi yang sedang dibuka di modal
  const activeStudentStatus = activeModalStudent ? studentStatusMap.get(activeModalStudent.id) : null;
  const isStudentActiveHaid = !!activeStudentStatus?.isCurrentlyHaid;
  const activeRecord = activeStudentStatus?.activeRecord;
  const currentHaidDay = activeStudentStatus?.currentHaidDay || 1;
  const suciInfo = activeStudentStatus?.suciInfo;

  return (
    <div className="relative max-w-4xl mx-auto space-y-4 animate-pink-fade-in p-3 sm:p-5 rounded-3xl bg-gradient-to-b from-[#fff5f8] via-[#fdf2f7] to-[#fce7f3] border border-pink-100/80 shadow-[0_10px_35px_rgba(244,114,182,0.1)]">
      {/* Efek Salju Kristal Halus */}
      <CrystalSnowEffect density={6} />

      {/* 🌸 HEADER: Ringkas, Bersih & Ramah Mobile */}
      <div className="relative z-10 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-pink-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 shrink-0 shadow-inner">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight text-white drop-shadow-xs">
                Input & Cek Haid Santriwati
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-xs flex items-center gap-1">
                <Snowflake className="w-2.5 h-2.5 text-pink-100" />
                <span>Fiqih</span>
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-pink-100 mt-0.5 font-medium">
              Cari nama siswi atau scan kartu. Pop-up otomatis mendeteksi status haid atau suci.
            </p>
          </div>
        </div>

        {/* Quick Nav Links */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onNavigateToDaftarHaid}
            className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl text-xs font-bold bg-white/95 hover:bg-white text-pink-700 border border-pink-100 transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer touch-manipulation"
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Daftar Haid ({haidRecords.filter((r) => r.status === 'haid_aktif').length})</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToDaftarSuci}
            className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-700/80 hover:bg-pink-800 text-white border border-pink-300/40 transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer touch-manipulation"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            <span>Daftar Suci</span>
          </button>
        </div>
      </div>

      {/* 🎯 KONTEN UTAMA ULTRA-SEDERHANA: 2 TOMBOL/FITUR UTAMA */}
      <div className="relative z-10 space-y-4">
        {/* 1. TOMBOL BESAR BUKA KAMERA SCAN KARTU */}
        <div className="bg-white/95 backdrop-blur-xs border border-pink-200/80 rounded-2xl p-4 shadow-sm">
          {!isCameraScannerOpen ? (
            <button
              type="button"
              id="btn-buka-kamera-haid"
              onClick={() => setIsCameraScannerOpen(true)}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 active:scale-98 text-white font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-[0_4px_14px_rgba(244,114,182,0.35)] cursor-pointer touch-manipulation"
            >
              <QrCode className="w-5 h-5 text-white animate-pulse" />
              <span>Buka Kamera Scan Kartu</span>
            </button>
          ) : (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-1 border-b border-pink-100">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-pink-500" />
                  Kamera Scanner Kartu Santriwati
                </span>
                <button
                  type="button"
                  onClick={() => setIsCameraScannerOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Tutup Kamera"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <InlineCameraScanner
                isActive={isCameraScannerOpen}
                onClose={() => setIsCameraScannerOpen(false)}
                onScanSuccess={handleScanCode}
                title="Arahkan kamera ke QR / Barcode Kartu Santri"
                scannerId="catat-haid-scanner-region"
              />
              <p className="text-[11px] text-center text-slate-500">
                Arahkan barcode kartu ke dalam kotak fokus. Pop-up siswi akan terbuka otomatis.
              </p>
            </div>
          )}
        </div>

        {/* 2. PENCARIAN SISWA DENGAN AUTOCOMPLETE CEPAT */}
        <div className="bg-white/95 backdrop-blur-xs border border-pink-200/80 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-pink-500" />
              Pencarian Santriwati
            </span>
            <span className="text-[10px] text-pink-700 font-bold bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
              Ketik Nama atau NIK
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            {/* Filter Kelas */}
            <div className="sm:col-span-4">
              <select
                id="select-kelas-haid"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-pink-50/50 border border-pink-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
              >
                <option value="SEMUA">Semua Kelas Putri</option>
                {femaleClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Kolom Pencarian */}
            <div className="sm:col-span-8 relative">
              <input
                id="input-cari-santriwati-haid"
                type="text"
                placeholder="Ketik nama, NIK, atau scan barcode..."
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
                className="w-full pl-8 pr-8 py-2 text-xs bg-pink-50/50 border border-pink-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-pink-400 absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* HASIL PENCARIAN (HANYA MUNCUL SAAT MENCARI ATAU MEMILIH KELAS) */}
          {(searchQuery.trim().length > 0 || selectedClass !== 'SEMUA') && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
                <span>Ditemukan {searchResults.length} Santriwati:</span>
                <span className="text-[10px] text-pink-600 font-normal">
                  Klik nama untuk membuka pop-up status
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic bg-pink-50/30 rounded-xl border border-pink-100">
                  Tidak ditemukan santriwati dengan kata kunci "{searchQuery}"
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 divide-y divide-pink-50">
                  {searchResults.map((student) => {
                    const status = studentStatusMap.get(student.id);
                    const isHaid = status?.isCurrentlyHaid;
                    const haidDay = status?.currentHaidDay;
                    const isSuciUnder15 = status?.suciInfo.hasPreviousRecord && status?.suciInfo.isUnder15Days;

                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => openStudentModal(student)}
                        className="w-full p-2.5 rounded-xl text-left bg-white hover:bg-pink-50/80 active:bg-pink-100 border border-slate-100 hover:border-pink-200 transition-all flex items-center justify-between gap-2.5 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {student.foto ? (
                            <img
                              src={student.foto}
                              alt={student.nama}
                              className="w-9 h-9 rounded-full object-cover border border-pink-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-800 font-black text-xs flex items-center justify-center shrink-0 border border-pink-200">
                              {student.nama.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-slate-900 group-hover:text-pink-700 truncate">
                                {student.nama}
                              </span>
                              <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                                {student.kelas}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">
                              NIK: {student.nik || '-'} {student.namaIbu ? `• Ibu: ${student.namaIbu}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 flex items-center gap-1">
                          {isHaid ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white flex items-center gap-1 shadow-xs">
                              <HeartPulse className="w-3 h-3 animate-pulse" />
                              <span>Haid Hari ke-{haidDay}</span>
                            </span>
                          ) : isSuciUnder15 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-amber-950 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Suci Hari ke-{status?.suciInfo.days}</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>
                                {status?.suciInfo.hasPreviousRecord
                                  ? `Suci ${status.suciInfo.days} Hari`
                                  : 'Belum Haid'}
                              </span>
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-pink-500 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌸 POP-UP CERDAS (MODAL MENYESUAIKAN KONDISI SISWI)                       */}
      {/* ========================================================================= */}
      {activeModalStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={() => setActiveModalStudent(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-pink-100 space-y-4 my-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal: Identitas Siswi */}
            <div className="flex items-start justify-between gap-3 border-b border-pink-100 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                {activeModalStudent.foto ? (
                  <img
                    src={activeModalStudent.foto}
                    alt={activeModalStudent.nama}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-pink-300 shadow-sm shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                    {activeModalStudent.nama.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                      {activeModalStudent.nama}
                    </h3>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800 border border-pink-200">
                      Kelas {activeModalStudent.kelas}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    NIK: {activeModalStudent.nik || '-'} {activeModalStudent.namaIbu ? `• Ibu: ${activeModalStudent.namaIbu}` : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalStudent(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* =================================================================== */}
            {/* KONDISI 1: SISWI SEDANG DALAM MASA HAID AKTIF (ADA DI DAFTAR HAID)  */}
            {/* =================================================================== */}
            {isStudentActiveHaid && activeRecord ? (
              <div className="space-y-3.5">
                {/* Highlight Banner Haid */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-rose-100/70 border border-rose-200 text-center space-y-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-xs">
                    Sedang Dalam Masa Haid
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-rose-700 tracking-tight">
                    HARI KE-{currentHaidDay}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Mulai sejak: <strong>{activeRecord.startDate}</strong> ({activeRecord.startTime || '00:00'})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Dicatat oleh: {activeRecord.recordedBy || 'Ustadzah'}
                  </p>
                </div>

                {/* Info Fiqih Singkat */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                    <span>Ketentuan Fiqih An-Nisa:</span>
                  </div>
                  {currentHaidDay <= 15 ? (
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Masa haid aktif santriwati berjalan normal (Maksimal haid 15 hari). Tidak boleh sholat & puasa.
                    </p>
                  ) : (
                    <p className="text-[11px] text-rose-700 font-bold leading-snug">
                      ⚠️ Telah melebihi 15 hari (Batas maksimal haid). Darah selebihnya adalah darah istihadhah, santriwati wajib mandi besar & kembali beribadah.
                    </p>
                  )}
                </div>

                {/* Pilihan Selesai Haid (Mandi Wajib) */}
                {!isFinishingHaidMode ? (
                  <div className="space-y-2 pt-1">
                    {onFinishHaid && (
                      <button
                        type="button"
                        onClick={() => setIsFinishingHaidMode(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer touch-manipulation"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selesai Haid / Mandi Wajib (Masuk Masa Suci)</span>
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalStudent(null);
                          onNavigateToDaftarHaid();
                        }}
                        className="w-full py-2 px-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <HeartPulse className="w-3.5 h-3.5" />
                        <span>Buka Daftar Haid</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveModalStudent(null)}
                        className="w-full py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Form Konfirmasi Mandi Wajib */
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-2.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900">
                        Konfirmasi Mandi Wajib:
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsFinishingHaidMode(false)}
                        className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-emerald-900 block mb-1">
                          Tanggal Mandi
                        </label>
                        <input
                          type="date"
                          value={mandiDate}
                          onChange={(e) => setMandiDate(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg text-slate-800 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-emerald-900 block mb-1">
                          Jam Mandi
                        </label>
                        <input
                          type="time"
                          value={mandiTime}
                          onChange={(e) => setMandiTime(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg text-slate-800 font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-emerald-900 block mb-1">
                        Catatan
                      </label>
                      <input
                        type="text"
                        value={mandiNotes}
                        onChange={(e) => setMandiNotes(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg text-slate-800"
                        placeholder="Contoh: Sudah mandi & bersuci"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleConfirmFinishHaid(activeRecord.id)}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan & Masukkan ke Daftar Suci</span>
                    </button>
                  </div>
                )}
              </div>
            ) : suciInfo && suciInfo.hasPreviousRecord && suciInfo.isUnder15Days && !allowEmergencyInput ? (
              /* =================================================================== */
              /* KONDISI 2: PERINGATAN FIQIH (SUCI KURANG DARI 15 HARI)              */
              /* =================================================================== */
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-500 text-amber-950 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                      Peringatan Fiqih: Belum 15 Hari Suci
                    </span>
                  </div>

                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    Santriwati baru suci selama <strong>{suciInfo.days} HARI</strong> (Selesai haid: <strong>{suciInfo.lastEndDate}</strong>). Sisa masa suci minimal adalah <strong>{suciInfo.remainingSuciDays} hari lagi</strong>.
                  </p>

                  <div className="p-2 rounded-xl bg-white/90 border border-amber-200 text-[11px] text-amber-950 space-y-1">
                    <span className="font-bold flex items-center gap-1 text-amber-900">
                      <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                      Kaidah Fiqih (Aqallu ath-Thuhr):
                    </span>
                    <p className="leading-snug">
                      Minimal masa suci antara 2 haid adalah 15 hari. Darah yang keluar sebelum 15 hari adalah <strong>Darah Istihadhah (Penyakit)</strong>, bukan haid. Santriwati <strong>WAJIB TETAP SHOLAT & PUASA</strong>!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveModalStudent(null)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-black transition-all shadow-xs cursor-pointer"
                  >
                    Tutup (Wajib Sholat & Puasa)
                  </button>

                  <button
                    type="button"
                    onClick={() => setAllowEmergencyInput(true)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    Catat Khusus / Darurat
                  </button>
                </div>
              </div>
            ) : (
              /* =================================================================== */
              /* KONDISI 3: SIAP DICATAT / BELUM HAID (INPUT FORM RINGKAS)           */
              /* =================================================================== */
              <form onSubmit={handleSaveNewHaid} className="space-y-3.5">
                {/* Banner Status Suci */}
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {suciInfo?.hasPreviousRecord
                        ? `Sedang Masa Suci (Hari ke-${suciInfo.days}) • Siap Dicatat`
                        : 'Santriwati Siap Dicatat Haid'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-600 text-white shrink-0">
                    Status Bersih
                  </span>
                </div>

                {/* 1. Tombol Pill: Haid Hari ke-.. */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                    <span>Mulai Haid Hari Ke- Berapa Saat Ini?</span>
                    <span className="text-[10px] text-pink-600 font-bold">
                      Hari ke-{reportedDay}
                    </span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleSelectReportedDay(day)}
                        className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                          reportedDay === day
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs scale-102 border-transparent'
                            : 'bg-slate-50 hover:bg-pink-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        Hari ke-{day}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    {[5, 6, 7].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleSelectReportedDay(day)}
                        className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                          reportedDay === day
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs border-transparent'
                            : 'bg-slate-50 hover:bg-pink-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        Hari ke-{day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Tanggal & Jam Mulai */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Tanggal Mulai Haid
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-pink-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Jam Keluar Darah
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-pink-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. Warna Darah */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Warna Darah
                  </label>
                  <select
                    value={bloodColor}
                    onChange={(e) => setBloodColor(e.target.value as HaidBloodColor)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  >
                    <option value="merah">Merah Segar</option>
                    <option value="hitam">Kehitaman / Pekat</option>
                    <option value="cokelat">Cokelat</option>
                    <option value="kuning">Kekuningan (Shufrah)</option>
                    <option value="keruh">Keruh (Kudrah)</option>
                  </select>
                </div>

                {/* 4. Catatan Opsional */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Lapor siang, kram perut..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>

                {/* Checkbox Otomatis Update Puasa */}
                <label className="flex items-center gap-2 text-[11px] text-slate-700 bg-pink-50/50 p-2 rounded-xl border border-pink-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoUpdateFasting}
                    onChange={(e) => setAutoUpdateFasting(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Otomatis tandai Tidak Puasa pada absensi puasa hari ini</span>
                </label>

                {/* Tombol Aksi */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveModalStudent(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-black shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Catatan Haid</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚠️ MODAL PERINGATAN SCAN KARTU GAGAL / LAKI-LAKI / DIBLOKIR               */}
      {/* ========================================================================= */}
      {scanErrorAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setScanErrorAlert(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-rose-200 space-y-3 text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              {scanErrorAlert.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {scanErrorAlert.message}
            </p>
            <button
              type="button"
              onClick={() => setScanErrorAlert(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Mengerti & Tutup
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ✅ MODAL KONFIRMASI SUKSES TERSIMPAN                                      */}
      {/* ========================================================================= */}
      {savedSuccessInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSavedSuccessInfo(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-pink-100 space-y-3 text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {savedSuccessInfo.type === 'new_haid'
                  ? 'Catatan Haid Berhasil Disimpan!'
                  : 'Berhasil Masuk Masa Suci!'}
              </h3>
              <p className="text-xs font-bold text-pink-700">
                {savedSuccessInfo.studentName}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {savedSuccessInfo.detail}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSavedSuccessInfo(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
              >
                + Input Lain
              </button>

              <button
                type="button"
                onClick={() => {
                  setSavedSuccessInfo(null);
                  if (savedSuccessInfo.type === 'new_haid') {
                    onNavigateToDaftarHaid();
                  } else {
                    onNavigateToDaftarSuci();
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{savedSuccessInfo.type === 'new_haid' ? 'Daftar Haid' : 'Daftar Suci'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
