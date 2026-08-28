import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Student, HaidRecord, HaidBloodColor, FastingSession } from '../types';
import {
  calculateStartDateFromReportedDay,
  analyzeFiqhHaid,
  getTodayDateStr,
  FIQH_CONSTANTS,
  calculateSuciDaysForStudent,
} from '../utils/fiqhHaid';
import { BarcodeCameraScannerModal } from './BarcodeCameraScannerModal';
import { validateScannedCard } from '../utils/cardSecurity';
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

  // Handle Barcode/QR Scan result
  const handleScanCode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const validation = validateScannedCard(cleanCode, students);

    if (!validation.isValid || !validation.student) {
      playScanErrorSound();
      setScanFeedback({
        message: `⚠️ Kartu tidak dikenali: ${cleanCode}`,
        isError: true,
      });
      return;
    }

    const matchedStudent = validation.student;

    if (matchedStudent.jenisKelamin !== 'Perempuan') {
      playScanErrorSound();
      setScanFeedback({
        message: `⚠️ ${matchedStudent.nama} adalah santri Laki-laki. Pencatatan haid khusus untuk santriwati.`,
        isError: true,
      });
      return;
    }

    setSelectedStudent(matchedStudent);
    setSearchQuery('');

    // Check purity status for anti-lie warning popup immediately
    const checkSuci = calculateSuciDaysForStudent(matchedStudent.id, haidRecords);
    if (checkSuci.hasPreviousRecord && checkSuci.isUnder15Days) {
      playScanErrorSound();
      setIsFiqhWarningModalOpen(true);
      setScanFeedback({
        message: `⚠️ PERINGATAN: ${matchedStudent.nama} baru menjalani masa suci Hari ke-${checkSuci.days} (Terindikasi alasan tidak valid / Istihadhah).`,
        isError: true,
      });
    } else {
      playScanSuccessSound();
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

  return (
    <div className="max-w-6xl mx-auto space-y-3.5 sm:space-y-4 animate-in fade-in duration-200">
      {/* Header Banner - Slim & Proportional */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-pink-900 text-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-sm border border-rose-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/25 shrink-0 shadow-inner">
            <Droplets className="w-5 h-5 text-rose-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Catat Haid Santriwati
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/40 text-rose-100 border border-rose-400/40">
                Fiqih An-Nisa
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-rose-200 leading-tight mt-0.5">
              Pencatatan masa haid, deteksi hari berjalan, dan integrasi otomatis ke status presensi puasa.
            </p>
          </div>
        </div>

        {/* Quick Nav Buttons to Other Haid/Suci Tabs */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={onNavigateToDaftarHaid}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/40 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Daftar Haid ({haidRecords.filter((r) => r.status === 'haid_aktif').length})</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToDaftarSuci}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Daftar Suci</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left (Scanner & Picker) - Right (Fiqh Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Column: 5 Cols on Desktop - Search & Scan */}
        <div className="lg:col-span-5 space-y-3">
          {/* 1. Scan Card Quick Button */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-rose-600" />
                Scan Kartu Santriwati
              </span>
              <span className="text-[10px] text-slate-500 font-medium">QR / Barcode</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setScanFeedback(null);
                setIsCameraScannerOpen(true);
              }}
              className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 active:scale-98 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-white animate-pulse" />
              <span>Buka Kamera Scan Kartu</span>
            </button>

            {/* Scan Feedback Banner */}
            {scanFeedback && (
              <div
                className={`p-2 rounded-lg text-xs font-medium flex items-center justify-between gap-1.5 ${
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

          {/* 2. Manual Student Search & Picker (Filtered for Girls) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-rose-600" />
                Cari Santriwati ({femaleStudents.length})
              </span>
              <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                Khusus Putri
              </span>
            </div>

            {/* Class Filter & Search input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none"
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
                  placeholder="Ketik nama / NIK..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              </div>
            </div>

            {/* Student List Box (Max Height with Slim Scrollbar) */}
            <div className="max-h-[260px] sm:max-h-[300px] overflow-y-auto space-y-1 pr-1">
              {filteredFemaleStudents.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  Santriwati tidak ditemukan
                </div>
              ) : (
                filteredFemaleStudents.map((s) => {
                  const isSelected = selectedStudent?.id === s.id;
                  const isCurrentlyHaid = haidRecords.some(
                    (r) => r.studentId === s.id && r.status === 'haid_aktif'
                  );
                  const itemSuci = calculateSuciDaysForStudent(s.id, haidRecords);

                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedStudent(s);
                        setScanFeedback(null);
                        if (itemSuci.hasPreviousRecord && itemSuci.isUnder15Days) {
                          playScanErrorSound();
                          setIsFiqhWarningModalOpen(true);
                        }
                      }}
                      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 select-none ${
                        isSelected
                          ? 'bg-rose-50/90 border-rose-400 ring-1 ring-rose-400 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 border-slate-150'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {s.foto ? (
                          <img
                            src={s.foto}
                            alt={s.nama}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {s.nama.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                            {s.nama}
                          </p>
                          <p className="text-[10px] text-slate-500 leading-tight">
                            {s.kelas} • NIK: {s.nik || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isCurrentlyHaid ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Sedang Haid
                          </span>
                        ) : itemSuci.hasPreviousRecord && itemSuci.isUnder15Days ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Suci Hari {itemSuci.days}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Suci
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 7 Cols on Desktop - Fiqh Form & Analysis */}
        <div className="lg:col-span-7 space-y-3">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
            {/* Selected Student Banner */}
            {selectedStudent ? (
              <div className="p-3 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {selectedStudent.foto ? (
                    <img
                      src={selectedStudent.foto}
                      alt={selectedStudent.nama}
                      className="w-10 h-10 rounded-full object-cover border-2 border-rose-300 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-rose-200 text-rose-900 font-bold text-sm flex items-center justify-center shrink-0">
                      {selectedStudent.nama.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {selectedStudent.nama}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-200 text-rose-900">
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
                  className="text-xs text-rose-700 hover:text-rose-900 font-bold shrink-0 p-1 cursor-pointer"
                  title="Ganti Santri"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-1">
                <UserCheck className="w-6 h-6 text-slate-400 mx-auto" />
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
            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-rose-700" />
                  <span>Kondisi Saat Ini: Santriwati Sedang di Hari Ke-?</span>
                </label>
                <span className="text-[10px] font-bold text-rose-700 bg-white px-1.5 py-0.2 rounded border border-rose-200">
                  Hitung Otomatis Fiqih
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-tight">
                Pilih hari berjalan saat santriwati melapor. Sistem akan otomatis menghitung tanggal awal keluar darah ke belakang:
              </p>

              {/* Quick Day Chips 1 to 7 and custom */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleReportedDaySelect(d)}
                    className={`py-1.5 px-1 rounded-lg text-xs font-black transition-all flex flex-col items-center justify-center cursor-pointer border ${
                      reportedDay === d
                        ? 'bg-rose-700 text-white border-rose-800 shadow-2xs scale-102'
                        : 'bg-white text-slate-700 hover:bg-rose-100/50 border-slate-200'
                    }`}
                  >
                    <span className="leading-none text-[11px] sm:text-xs">Hari {d}</span>
                    <span className="text-[8px] font-normal opacity-80 mt-0.5">
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
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-1 focus:ring-rose-500 focus:outline-none"
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
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Fiqh Status Live Analysis Box */}
            <div className={`p-2.5 rounded-lg border ${fiqhAnalysis.badgeBg} ${fiqhAnalysis.badgeBorder} space-y-1`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black ${fiqhAnalysis.badgeColor} flex items-center gap-1`}>
                  <BookOpen className="w-3.5 h-3.5" />
                  Status Fiqih: {fiqhAnalysis.stageTitle}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/80 border border-slate-200 text-slate-700">
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
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none"
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
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none"
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
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            {/* Fasting Sync Option */}
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-800">
                <input
                  type="checkbox"
                  checked={autoUpdateFasting}
                  onChange={(e) => setAutoUpdateFasting(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                />
                <span className="font-semibold">
                  Otomatis tandai presensi puasa sebagai "Halangan / Udzur Syar'i"
                </span>
              </label>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                Raport Tetap Adil
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedStudent(null);
                  setReportedDay(1);
                  setStartDate(getTodayDateStr());
                  setNotes('');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                disabled={!selectedStudent}
                className="px-4 py-2 rounded-lg text-xs font-black bg-rose-600 hover:bg-rose-700 active:scale-98 disabled:opacity-50 disabled:pointer-events-none text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
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
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-rose-700" />
          <h3 className="text-xs sm:text-sm font-black text-slate-900">
            Panduan Fiqih Haid & Suci Santriwati (Kaidah Madzhab Syafi'i)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100 space-y-0.5">
            <span className="font-bold text-rose-900 block text-[11px]">1. Batas Minimal Haid</span>
            <p className="text-[10px] text-slate-600 leading-snug">
              Minimal <strong>1 hari 1 malam (24 jam)</strong> secara akumulatif dalam rentang 15 hari.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100 space-y-0.5">
            <span className="font-bold text-amber-900 block text-[11px]">2. Kebiasaan / Ghalib</span>
            <p className="text-[10px] text-slate-600 leading-snug">
              Umumnya berlangsung selama <strong>6 sampai 7 hari</strong>.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-red-50/60 border border-red-100 space-y-0.5">
            <span className="font-bold text-red-900 block text-[11px]">3. Batas Maksimal Haid</span>
            <p className="text-[10px] text-slate-600 leading-snug">
              Maksimal <strong>15 hari 15 malam</strong>. Lewat dari 15 hari adalah <strong>Istihadhah</strong> (Wajib Mandi).
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 space-y-0.5">
            <span className="font-bold text-emerald-900 block text-[11px]">4. Minimal Masa Suci</span>
            <p className="text-[10px] text-slate-600 leading-snug">
              Jarak suci antara dua haid minimal <strong>15 hari 15 malam</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Barcode Camera Scanner Modal */}
      <BarcodeCameraScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={(code) => {
          setIsCameraScannerOpen(false);
          handleScanCode(code);
        }}
      />

      {/* POPUP MODAL: PERINGATAN FIQIH TERINDIKASI ALASAN TIDAK VALID / BERBOHONG */}
      {isFiqhWarningModalOpen && selectedStudent && suciInfo && suciInfo.hasPreviousRecord && suciInfo.isUnder15Days && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border-2 border-rose-500 space-y-3.5 max-h-[92vh] overflow-y-auto">
            {/* Header with Red Warning Badge */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                    Peringatan Fiqih Syar'i
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                    Masa Suci Hari ke-{suciInfo.days}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-rose-950 leading-tight">
                  ⚠️ Terindikasi Alasan Tidak Valid / Berbohong
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFiqhWarningModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Identification from Scanned Card (NIK / Barcode ID) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              {selectedStudent.foto ? (
                <img
                  src={selectedStudent.foto}
                  alt={selectedStudent.nama}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 font-black text-base flex items-center justify-center shrink-0 border border-rose-200">
                  {selectedStudent.nama.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    {selectedStudent.nama}
                  </h4>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 shrink-0">
                    {selectedStudent.kelas}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  NIK / ID Kartu: <strong className="text-slate-900 font-mono">{selectedStudent.nik || '-'}</strong>
                </p>
              </div>
            </div>

            {/* Realtime Purity Status Box */}
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-xs text-rose-950">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Status Masa Suci:</span>
                <span className="px-2 py-0.5 rounded font-black bg-rose-600 text-white text-[11px]">
                  Baru {suciInfo.days} Hari Suci
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Tanggal Selesai Mandi Terakhir:</span>
                <strong className="text-slate-900">{suciInfo.lastEndDate || '-'}</strong>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Sisa Minimal Masa Suci:</span>
                <strong className="text-rose-700 font-black">{suciInfo.remainingSuciDays} hari lagi (hingga genap 15 hari)</strong>
              </div>

              {/* Visual progress */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-rose-900 font-medium">
                  <span>Progres Masa Suci Sah:</span>
                  <span>{Math.min(15, suciInfo.days)} / 15 Hari</span>
                </div>
                <div className="w-full h-2 bg-rose-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (suciInfo.days / 15) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Fiqh Explanation */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1.5 leading-snug">
              <div className="font-black text-amber-900 flex items-center gap-1.5 text-xs">
                <BookOpen className="w-4 h-4 text-amber-800" />
                <span>Kaidah Fiqih Madzhab Syafi'i (Aqallu ath-Thuhr):</span>
              </div>
              <p className="text-[11px] text-amber-900">
                Jarak minimal masa suci antara dua siklus haid adalah <strong>15 hari 15 malam</strong>. Karena santriwati baru suci <strong>{suciInfo.days} hari</strong>, maka secara syar'i darah yang keluar <strong>BUKAN DARAH HAID</strong>, melainkan <strong>Darah Istihadhah (Penyakit)</strong> atau <strong>Terindikasi Alasan Palsu</strong>.
              </p>
              <div className="p-2 rounded-lg bg-white/80 border border-amber-300 font-bold text-rose-800 text-[11px]">
                👉 Ketetapan Hukum Syar'i: Santriwati <u>WAJIB TETAP SHOLAT & WAJIB TETAP BERPUASA</u>!
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
                className="w-full py-2.5 px-3 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 active:scale-98 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Tolak Input (Wajib Tetap Sholat & Puasa)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFiqhWarningModalOpen(false);
                    setNotes((prev) => `[ISTIHADHAH / PENYAKIT]: Darah keluar di masa suci hari ke-${suciInfo.days}. Menurut fiqih wajib tetap sholat & puasa. ${prev}`.trim());
                  }}
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="truncate">Catat Istihadhah (Sakit)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFiqhWarningModalOpen(false)}
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all text-center cursor-pointer"
                >
                  Lihat Detail Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Confirmation Modal */}
      {isSuccessModalOpen && savedRecordSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-xl border border-slate-200 space-y-3.5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 mx-auto flex items-center justify-center border border-rose-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Catatan Haid Berhasil Disimpan!
              </h3>
              <p className="text-xs text-slate-500">
                Data masa haid santriwati telah tercatat dalam sistem asrama putri.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700">
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
                className="w-full py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all cursor-pointer"
              >
                + Catat Santri Lain
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  onNavigateToDaftarHaid();
                }}
                className="w-full py-2 rounded-lg text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <span>Lihat Daftar Haid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
