import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Student, FastingSession, FastingStatus } from '../types';
import { getUniqueClasses } from '../data/students';
import { PdfExportModal } from './PdfExportModal';
import { DormCardModal } from './DormCardModal';
import { BarcodeCameraScannerModal } from './BarcodeCameraScannerModal';
import {
  CheckCircle2,
  Search,
  RotateCcw,
  UserCheck,
  FileSpreadsheet,
  MessageSquare,
  Sparkles,
  Users,
  Bookmark,
  UserPlus,
  X,
  Plus,
  FileText,
  Lock,
  Unlock,
  ShieldAlert,
  Clock,
  Trash2,
  CreditCard,
  Camera,
  ScanBarcode,
  Volume2
} from 'lucide-react';

interface FastingInputterViewProps {
  students: Student[];
  activeSession: FastingSession;
  onUpdateRecord: (studentId: number, status: FastingStatus, notes?: string) => void;
  onBulkUpdateRecords: (updates: { studentId: number; status: FastingStatus }[]) => void;
  onOpenStudentModal?: () => void;
  isAdmin?: boolean;
  onToggleLockSession?: (sessionId: string, locked: boolean) => void;
}

export const FastingInputterView: React.FC<FastingInputterViewProps> = ({
  students,
  activeSession,
  onUpdateRecord,
  onBulkUpdateRecords,
  onOpenStudentModal,
  isAdmin = false,
  onToggleLockSession,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNoteStudentId, setActiveNoteStudentId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isDormCardModalOpen, setIsDormCardModalOpen] = useState<boolean>(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState<boolean>(false);
  const [scanToast, setScanToast] = useState<{ studentName: string; time: string } | null>(null);
  
  const isLocked = Boolean(activeSession.isLocked);
  const isReadOnly = isLocked && !isAdmin;
  
  // Search dropdown focus state
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const uniqueClasses = useMemo(() => getUniqueClasses(students), [students]);

  // Play subtle feedback beep on barcode scan
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // AudioContext might be blocked or unsupported
    }
  };

  // Process barcode input (from scanner or camera)
  const processBarcodeInput = useCallback((code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    // Look up student by NIK, or fallback by No / ID / raw format
    const foundStudent = students.find((s) => {
      const matchNik = s.nik && s.nik.trim() === cleanCode;
      const matchNoCode = cleanCode === `SRT-${s.no.toString().padStart(4, '0')}`;
      const matchNoRaw = s.no.toString() === cleanCode;
      return matchNik || matchNoCode || matchNoRaw;
    });

    if (foundStudent) {
      if (isReadOnly) {
        alert('Sesi ini terkunci. Tidak dapat menginput data.');
        return;
      }
      onUpdateRecord(foundStudent.id, 'berpuasa');
      playScanBeep();
      setScanToast({
        studentName: `${foundStudent.nama} (${foundStudent.kelas})`,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      setTimeout(() => setScanToast(null), 3500);
      setSearchQuery('');
    }
  }, [students, isReadOnly, onUpdateRecord]);

  // Handle enter key in search field (USB Barcode Scanner automatically sends Enter after scanning)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim();
      if (!q) return;

      // Try exact NIK or ID lookup first
      const exactStudent = students.find(
        (s) => (s.nik && s.nik === q) || s.no.toString() === q || `SRT-${s.no.toString().padStart(4, '0')}` === q
      );

      if (exactStudent) {
        processBarcodeInput(q);
        e.preventDefault();
      } else if (searchSuggestions.length > 0) {
        // Pick first suggestion if available
        handleMarkPuasaFromSuggest(searchSuggestions[0].id);
        e.preventDefault();
      }
    }
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle outside click to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Auto-Suggest List based purely on search query
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    return students
      .filter((s) => {
        const matchClass = selectedClass === 'SEMUA' || s.kelas === selectedClass;
        const matchQuery =
          s.nama.toLowerCase().includes(q) ||
          s.kelas.toLowerCase().includes(q) ||
          (s.nik && s.nik.includes(q)) ||
          s.no.toString() === q;
        return matchClass && matchQuery;
      })
      .slice(0, 15); // Top 15 suggestions
  }, [students, selectedClass, searchQuery]);

  // Displayed students strictly only those who have been recorded as 'berpuasa'
  const displayedStudents = useMemo(() => {
    const records = activeSession?.records || {};

    return students.filter((s) => {
      const matchClass = selectedClass === 'SEMUA' || s.kelas === selectedClass;
      if (!matchClass) return false;

      const record = records[s.id];
      const isFasting = record?.status === 'berpuasa';
      return isFasting;
    });
  }, [students, selectedClass, activeSession?.records]);

  // Overall statistics calculation
  const stats = useMemo(() => {
    let berpuasa = 0;
    let tidakPuasa = 0;
    let halangan = 0;
    let belumDiisi = 0;

    const records = activeSession?.records || {};

    const classStudents =
      selectedClass === 'SEMUA'
        ? students
        : students.filter((s) => s.kelas === selectedClass);

    classStudents.forEach((s) => {
      const rec = records[s.id];
      const status = rec?.status || 'belum_diisi';
      if (status === 'berpuasa') berpuasa++;
      else if (status === 'tidak_puasa') tidakPuasa++;
      else if (status === 'halangan') halangan++;
      else belumDiisi++;
    });

    const total = classStudents.length;
    const percentPuasa = total > 0 ? Math.round((berpuasa / total) * 100) : 0;

    return {
      total,
      berpuasa,
      tidakPuasa,
      halangan,
      belumDiisi,
      percentPuasa,
    };
  }, [students, selectedClass, activeSession?.records]);

  // Mark student as fasting directly from search suggestion
  const handleMarkPuasaFromSuggest = (studentId: number) => {
    if (isReadOnly) return;
    onUpdateRecord(studentId, 'berpuasa');
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Toggle fasting status from search suggestion
  const handleToggleStatusFromSuggest = (studentId: number, currentStatus: FastingStatus) => {
    if (isReadOnly) return;
    const newStatus: FastingStatus = currentStatus === 'berpuasa' ? 'belum_diisi' : 'berpuasa';
    onUpdateRecord(studentId, newStatus);
  };

  // Remove / Cancel fasting status from active list
  const handleRemoveFasting = (studentId: number) => {
    if (isReadOnly) return;
    onUpdateRecord(studentId, 'belum_diisi');
  };

  // Bulk reset all displayed fasting students with confirmation
  const handleBulkResetAll = () => {
    if (isReadOnly || displayedStudents.length === 0) return;
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin membatalkan status puasa untuk seluruh ${displayedStudents.length} siswa di daftar ini?`
    );
    if (confirmed) {
      const updates = displayedStudents.map((s) => ({
        studentId: s.id,
        status: 'belum_diisi' as FastingStatus,
      }));
      onBulkUpdateRecords(updates);
    }
  };

  const handleSaveNote = (studentId: number) => {
    if (isReadOnly) return;
    const records = activeSession?.records || {};
    const currentRecord = records[studentId];
    const currentStatus = currentRecord?.status || 'belum_diisi';
    onUpdateRecord(studentId, currentStatus, noteText);
    setActiveNoteStudentId(null);
    setNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* Session Lock Banner Alert for Regular Penginput */}
      {isReadOnly && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-200 text-rose-800 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-950 flex items-center gap-2">
                <span>Penginputan Sesi Ini Telah DIKUNCI oleh Admin</span>
              </h4>
              <p className="text-xs text-rose-800 mt-0.5">
                Batas waktu penginputan telah selesai atau dikunci oleh Administrator demi menjaga keaslian data. Anda saat ini dalam mode <strong>Hanya Lihat (Read-Only)</strong>.
              </p>
            </div>
          </div>
          {activeSession.inputDeadline && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-100 border border-rose-200 text-rose-900 text-xs font-bold shrink-0 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Batas: {activeSession.inputDeadline} WIB</span>
            </div>
          )}
        </div>
      )}

      {/* Admin Quick Control Banner */}
      {isAdmin && onToggleLockSession && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-200 text-purple-800 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-purple-950">
                Mode Administrator Aktif (Akses Penuh Penginputan)
              </p>
              <p className="text-[11px] text-purple-800">
                Status saat ini: {isLocked ? '🔒 Dikunci untuk Penginput biasa' : '🔓 Terbuka (Penginput bisa mengisi)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleLockSession(activeSession.id, !isLocked)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
              isLocked
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isLocked ? 'Buka Kunci Sesi' : 'Kunci Sesi Ini'}</span>
          </button>
        </div>
      )}

      {/* Top Banner Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Siswa ({selectedClass === 'SEMUA' ? 'Semua Kelas' : selectedClass})
            </p>
            <p className="text-xl font-bold text-gray-900">{stats.total} Siswa</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Siswa Berpuasa Terinput
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-emerald-950">{stats.berpuasa}</span>
              <span className="text-xs text-emerald-600 font-semibold">({stats.percentPuasa}% dari total siswa)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar & Class Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Siswa Terdata Berpuasa ({stats.berpuasa} dari {stats.total} Siswa)
            </span>
            <span className="font-bold text-emerald-800">{stats.percentPuasa}% Berpuasa</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${stats.percentPuasa}%` }}
            />
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-gray-100">
          {/* Class Select Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedClass('SEMUA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedClass === 'SEMUA'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua Kelas
            </button>
            {uniqueClasses.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedClass === cls
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Generate & Print Dorm Cards Button */}
            <button
              onClick={() => setIsDormCardModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm border border-amber-400 cursor-pointer active:scale-95"
              title="Buat dan Cetak Kartu Santri Asrama dengan Barcode NIK (SD Merah, SMP Biru, SMA Abu-abu)"
            >
              <CreditCard className="w-4 h-4 text-slate-900" />
              <span>Cetak Kartu Asrama</span>
            </button>

            {/* Scan with Camera Button */}
            {!isReadOnly && (
              <button
                onClick={() => setIsCameraScannerOpen(true)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                title="Buka Kamera untuk Scan Barcode Kartu Santri"
              >
                <Camera className="w-4 h-4 text-emerald-200" />
                <span>Scan Kamera</span>
              </button>
            )}

            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Cetak/Unduh Laporan Rekapitulasi PDF (SD, SMP, SMA)"
            >
              <FileText className="w-4 h-4 text-emerald-200" />
              <span>PDF Rekapitulasi</span>
            </button>
          </div>
        </div>

        {/* Scan Success Quick Toast Notification */}
        {scanToast && (
          <div className="p-3 bg-emerald-700 text-white rounded-2xl shadow-lg border border-emerald-500 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-bold">⚡ Berhasil Scan Barcode Santri!</p>
                <p className="text-sm font-extrabold text-amber-200">{scanToast.studentName}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-100">
                {scanToast.time}
              </span>
              <p className="text-[10px] text-emerald-200 mt-0.5">Status: Berpuasa</p>
            </div>
          </div>
        )}

        {/* Search Bar with Live Suggestions Dropdown (MURNI INPUT DARI PENCARIAN) */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Input Nama Siswa Berpuasa (Cari & Scan Barcode NIK)
            </label>
            <span className="text-[11px] text-emerald-700 font-semibold hidden sm:inline">
              ✨ Dukungan Scanner USB / Nirkabel & Kamera Aktif
            </span>
          </div>

          <div ref={searchContainerRef} className="relative">
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder="Ketik nama siswa, NIK, atau scan kartu barcode santri di sini..."
                className="w-full pl-10 pr-24 py-3 text-sm bg-emerald-50/40 border-2 border-emerald-200 rounded-2xl focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all shadow-xs"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      if (searchInputRef.current) searchInputRef.current.focus();
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsCameraScannerOpen(true)}
                  className="p-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-all cursor-pointer"
                  title="Scan via Kamera"
                >
                  <ScanBarcode className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Auto-Suggest Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white border border-emerald-200 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto divide-y divide-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 bg-emerald-900 text-white text-[11px] font-bold flex justify-between items-center">
                  <span>Hasil Pencarian Siswa ({searchSuggestions.length})</span>
                  <span className="text-emerald-300 font-normal">
                    {isReadOnly ? 'Mode Hanya Lihat' : 'Klik nama atau tombol untuk menandai puasa'}
                  </span>
                </div>

                {searchSuggestions.length === 0 ? (
                  <div className="p-5 text-center text-xs text-gray-500">
                    Siswa tidak ditemukan dengan kata kunci &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  searchSuggestions.map((s) => {
                    const record = activeSession.records[s.id];
                    const status = record?.status || 'belum_diisi';
                    const isFasting = status === 'berpuasa';

                    return (
                      <div
                        key={s.id}
                        className={`p-3.5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                          isFasting ? 'bg-emerald-50/70 hover:bg-emerald-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div
                          onClick={() => {
                            if (!isFasting) {
                              handleMarkPuasaFromSuggest(s.id);
                            }
                          }}
                          className={`flex items-center gap-3 flex-1 min-w-0 ${
                            !isReadOnly && !isFasting ? 'cursor-pointer' : ''
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                              isFasting
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {s.no}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900 text-xs truncate">{s.nama}</p>
                              {isFasting && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white">
                                  ✓ Sedang Puasa
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Kelas: <strong className="text-emerald-800">{s.kelas}</strong>
                              {s.jenisKelamin && ` • ${s.jenisKelamin}`}
                              {s.nik && ` • NIK: ${s.nik}`}
                            </p>
                          </div>
                        </div>

                        {/* Direct Action Buttons inside Dropdown */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {isFasting ? (
                            <button
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => handleToggleStatusFromSuggest(s.id, 'berpuasa')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                isReadOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                              } bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-xs`}
                              title="Batalkan status puasa"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Batal Puasa</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => handleMarkPuasaFromSuggest(s.id)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                isReadOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                              } bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tandai Puasa</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Student Checklist Table / Selected Fasting List */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>
              Daftar Siswa Berpuasa yang Telah Diinput ({displayedStudents.length} Siswa)
            </span>
          </h3>

          {displayedStudents.length > 0 && !isReadOnly && (
            <button
              onClick={handleBulkResetAll}
              className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              title="Batalkan semua siswa yang sudah diinput puasa di kelas ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Semua</span>
            </button>
          )}
        </div>

        {displayedStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center border border-emerald-100 shadow-xs">
              <UserPlus className="w-7 h-7" />
            </div>
            <p className="text-base font-bold text-gray-800">
              Belum Ada Siswa yang Diinput Berpuasa
            </p>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Ketik nama, NIK, atau nomor urut siswa pada <strong>kolom pencarian di atas</strong> untuk mencari dan menandai siswa yang berpuasa hari ini. Siswa yang terpilih akan tampil di daftar ini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayedStudents.map((s, index) => {
              const records = activeSession?.records || {};
              const record = records[s.id];
              const hasNote = Boolean(record?.notes);

              return (
                <div
                  key={s.id}
                  className="p-4 transition-colors hover:bg-emerald-50/40 bg-emerald-50/15 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  {/* Student Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      {s.no || index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900 text-sm truncate">
                          {s.nama}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200">
                          {s.kelas}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            s.jenisKelamin === 'Perempuan'
                              ? 'bg-pink-50 text-pink-700 border border-pink-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {s.jenisKelamin === 'Perempuan' ? 'P' : 'L'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ✓ Berpuasa
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        {s.nik && <span>NIK: {s.nik}</span>}
                        {s.namaIbu && <span>Ibu: {s.namaIbu}</span>}
                      </div>

                      {/* Display Note if exists */}
                      {hasNote && (
                        <div className="mt-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 inline-flex items-center gap-1.5">
                          <Bookmark className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            <strong>Catatan:</strong> {record.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fasting Status Controls */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      disabled={isReadOnly}
                      onClick={() => handleRemoveFasting(s.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isReadOnly ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                      } bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 shadow-xs active:scale-95`}
                      title="Batalkan tanda puasa untuk siswa ini (keluarkan dari daftar)"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-800" />
                      <span>Batal Puasa</span>
                    </button>

                    {/* Notes Button */}
                    <button
                      disabled={isReadOnly}
                      onClick={() => {
                        setActiveNoteStudentId(s.id);
                        setNoteText(record?.notes || '');
                      }}
                      className={`p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-emerald-100 hover:text-emerald-800 transition-all ${
                        isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      }`}
                      title={isReadOnly ? 'Hanya Lihat' : 'Tambah / Edit Catatan'}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Note Input Modal / Floating Drawer */}
      {activeNoteStudentId !== null && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-gray-100 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Catatan Khusus Puasa Siswa
            </h4>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Keterangan / Alasan (Opsional)
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Contoh: Pulang awal, izin sakit setelah dhuhur, dll..."
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 h-24"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveNoteStudentId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleSaveNote(activeNoteStudentId)}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Input Modal / Floating Drawer */}
      {activeNoteStudentId !== null && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-gray-100 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Catatan Khusus Puasa Siswa
            </h4>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Keterangan / Alasan (Opsional)
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Contoh: Pulang awal, izin sakit setelah dhuhur, dll..."
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 h-24"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveNoteStudentId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleSaveNote(activeNoteStudentId)}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Modal */}
      {isPdfModalOpen && (
        <PdfExportModal
          students={students}
          session={activeSession}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}

      {/* Dorm Student ID Card Modal (with Level Color Schemes & Barcode) */}
      {isDormCardModalOpen && (
        <DormCardModal
          students={students}
          onClose={() => setIsDormCardModalOpen(false)}
        />
      )}

      {/* Camera Barcode Scanner Modal */}
      <BarcodeCameraScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={(code) => {
          processBarcodeInput(code);
        }}
      />
    </div>
  );
};


