import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Student, FastingSession, FastingStatus } from '../types';
import { getUniqueClasses } from '../data/students';
import { PdfExportModal } from './PdfExportModal';
import { DormCardModal } from './DormCardModal';
import { BarcodeCameraScannerModal } from './BarcodeCameraScannerModal';
import { BlacklistCardModal } from './BlacklistCardModal';
import { validateScannedCard } from '../utils/cardSecurity';
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
  ShieldX,
  ShieldCheck,
  Clock,
  Trash2,
  CreditCard,
  Camera,
  ScanBarcode,
  Volume2,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import {
  playScanSuccessSound,
  playScanErrorSound,
  playQuickChirpSound,
} from '../utils/audioNotification';

interface FastingInputterViewProps {
  students: Student[];
  activeSession: FastingSession;
  onUpdateRecord: (studentId: number, status: FastingStatus, notes?: string) => void;
  onBulkUpdateRecords: (updates: { studentId: number; status: FastingStatus }[]) => void;
  onOpenStudentModal?: () => void;
  onOpenPhotoModal?: () => void;
  onRestore101Records?: () => void;
  isAdmin?: boolean;
  onToggleLockSession?: (sessionId: string, locked: boolean) => void;
  onLogout?: () => void;
  onUpdateStudents?: (updated: Student[]) => void;
}

export const FastingInputterView: React.FC<FastingInputterViewProps> = ({
  students,
  activeSession,
  onUpdateRecord,
  onBulkUpdateRecords,
  onOpenStudentModal,
  onOpenPhotoModal,
  onRestore101Records,
  isAdmin = false,
  onToggleLockSession,
  onLogout,
  onUpdateStudents,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNoteStudentId, setActiveNoteStudentId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isDormCardModalOpen, setIsDormCardModalOpen] = useState<boolean>(false);
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState<boolean>(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState<boolean>(false);
  const [scanToast, setScanToast] = useState<{ studentName: string; time: string; isError?: boolean } | null>(null);
  const [blacklistAlert, setBlacklistAlert] = useState<{
    message: string;
    student: Student | null;
    scannedVersion: number;
    activeVersion: number;
  } | null>(null);
  
  const isLocked = Boolean(activeSession.isLocked);
  const isReadOnly = isLocked && !isAdmin;
  
  // Search dropdown focus state
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const uniqueClasses = useMemo(() => getUniqueClasses(students), [students]);

  // Process barcode input (from scanner or camera)
  const processBarcodeInput = useCallback((code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    // Validate against version blacklist system
    const valResult = validateScannedCard(cleanCode, students);

    // Case 1: Blacklisted Card (Old duplicate / lost card)
    if (valResult.isBlacklisted) {
      playScanErrorSound();
      setBlacklistAlert({
        message: valResult.message,
        student: valResult.student,
        scannedVersion: valResult.scannedVersion,
        activeVersion: valResult.activeVersion,
      });
      setScanToast({
        studentName: `⛔ DITOLAK: KARTU BLACKLIST (V${valResult.scannedVersion})`,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isError: true,
      });
      setTimeout(() => setScanToast(null), 5000);
      setSearchQuery('');
      return;
    }

    // Case 2: Valid Active Card
    if (valResult.isValid && valResult.student) {
      const foundStudent = valResult.student;
      if (isReadOnly) {
        playScanErrorSound();
        alert('Sesi ini terkunci. Tidak dapat menginput data.');
        return;
      }
      onUpdateRecord(foundStudent.id, 'berpuasa');
      playScanSuccessSound();
      const verSuffix = valResult.activeVersion > 1 ? ` (V${valResult.activeVersion} DUPLIKAT)` : '';
      setScanToast({
        studentName: `${foundStudent.nama} (${foundStudent.kelas})${verSuffix}`,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isError: false,
      });
      setTimeout(() => setScanToast(null), 3500);
      setSearchQuery('');
    } else {
      // Unrecognized barcode/card - play error sound feedback
      playScanErrorSound();
      setScanToast({
        studentName: `Kode tidak terdaftar: "${cleanCode}"`,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isError: true,
      });
      setTimeout(() => setScanToast(null), 3500);
    }
  }, [students, isReadOnly, onUpdateRecord]);

  // Handle enter key in search field (USB Barcode Scanner automatically sends Enter after scanning)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim();
      if (!q) return;

      // Always pass the raw code to processBarcodeInput to check for #V suffix or exact ID/NIK
      processBarcodeInput(q);
      e.preventDefault();
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
    playQuickChirpSound();
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
    playQuickChirpSound();
  };

  // Remove / Cancel fasting status from active list
  const handleRemoveFasting = (studentId: number) => {
    if (isReadOnly) return;
    onUpdateRecord(studentId, 'belum_diisi');
    playQuickChirpSound();
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
    <div className="space-y-3 sm:space-y-4">
      {/* Session Lock Banner Alert for Regular Penginput */}
      {isReadOnly && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-200 text-rose-800 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-rose-950 flex items-center gap-2">
                <span>Penginputan Sesi Ini Sedang DIKUNCI oleh Admin</span>
              </h4>
              <p className="text-[11px] text-rose-800 mt-0.5">
                Sesi presensi ini telah dikunci oleh Administrator. Mode <strong>Hanya Lihat (Read-Only)</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Quick Control Banner */}
      {isAdmin && onToggleLockSession && (
        <div className="p-2.5 sm:p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-200 text-purple-800 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-purple-950">
                Mode Administrator Aktif (Akses Penuh Penginputan)
              </p>
              <p className="text-[10.5px] text-purple-800">
                Status: {isLocked ? '🔒 Dikunci untuk Penginput biasa' : '🔓 Terbuka (Penginput bisa mengisi)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleLockSession(activeSession.id, !isLocked)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
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

      {/* Top Banner Stats Cards - 2 Columns on Mobile for Zero-Scroll Compactness */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-gray-100 shadow-xs flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">
              Total Siswa ({selectedClass === 'SEMUA' ? 'Semua' : selectedClass})
            </p>
            <p className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
              {stats.total} <span className="text-xs font-normal text-gray-500 hidden sm:inline">Siswa</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-emerald-100 shadow-xs flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold text-emerald-700 uppercase tracking-wider truncate">
              Siswa Berpuasa
            </p>
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-bold text-emerald-950 leading-tight">
                {stats.berpuasa}
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-600 font-bold">
                ({stats.percentPuasa}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar, Filters & Action Buttons Unified Container */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-2.5 sm:space-y-3">
        {/* Compact Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px] sm:text-xs">
            <span className="font-bold text-gray-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Siswa Berpuasa ({stats.berpuasa}/{stats.total})</span>
            </span>
            <span className="font-bold text-emerald-800">{stats.percentPuasa}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${stats.percentPuasa}%` }}
            />
          </div>
        </div>

        {/* Filter Controls Bar & Actions */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 pt-2 border-t border-gray-100">
          {/* Class Select Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar shrink-0">
            <button
              onClick={() => setSelectedClass('SEMUA')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedClass === 'SEMUA'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua Kelas
            </button>
            {uniqueClasses.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedClass === cls
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Action Buttons - Compact Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 py-0.5">
            {/* Foto Santri (ImgBB Cloud) Button */}
            {onOpenPhotoModal && (
              <button
                type="button"
                onClick={onOpenPhotoModal}
                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs border border-emerald-600/60 cursor-pointer active:scale-95 whitespace-nowrap"
                title="Kelola & Upload Foto Santri ke Cloud ImgBB / Galeri"
              >
                <Camera className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Foto Santri</span>
              </button>
            )}

            {/* Generate & Print Dorm Cards Button */}
            <button
              onClick={() => setIsDormCardModalOpen(true)}
              className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition-all shadow-xs border border-amber-400 cursor-pointer active:scale-95 whitespace-nowrap"
              title="Buat dan Cetak Kartu Puasa Wali Asuh dengan Barcode NIK"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-900 shrink-0" />
              <span>Cetak Kartu</span>
            </button>

            {/* Blacklist Card Menu Button */}
            <button
              onClick={() => setIsBlacklistModalOpen(true)}
              className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition-all shadow-xs border border-rose-500 cursor-pointer active:scale-95 whitespace-nowrap"
              title="Lihat Daftar Kartu Blacklist & Cetak Ulang Kartu Hilang/Rusak"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-200 shrink-0" />
              <span>Blacklist Card</span>
            </button>

            {/* Quick Restore 101 Records Button */}
            {onRestore101Records && (
              <button
                type="button"
                onClick={onRestore101Records}
                className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
                title="Pulihkan Data Presensi 101 Santri (27 Agustus 2026)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Pulihkan 101 Siswa</span>
              </button>
            )}

            {/* Scan with Camera Button */}
            {!isReadOnly && (
              <button
                onClick={() => setIsCameraScannerOpen(true)}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
                title="Buka Kamera untuk Scan Barcode Kartu Santri"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                <span>Scan Kamera</span>
              </button>
            )}

            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="px-2.5 py-1 bg-emerald-900 hover:bg-emerald-950 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer whitespace-nowrap"
              title="Cetak/Unduh Laporan Rekapitulasi PDF"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              <span>PDF Rekap</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer whitespace-nowrap"
                title="Keluar dari akun / Halaman Input"
              >
                <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        </div>

        {/* Floating Scan Toast on Top Center */}
        {scanToast && (
          <div
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[92%] sm:w-auto px-4 py-3 text-white rounded-2xl shadow-2xl border-2 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-md ${
              scanToast.isError
                ? 'bg-gradient-to-r from-rose-900 via-rose-950 to-red-950 border-rose-400'
                : 'bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 border-amber-400'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  scanToast.isError
                    ? 'bg-rose-500/20 border-rose-400/50'
                    : 'bg-amber-400/20 border-amber-300/40'
                }`}
              >
                {scanToast.isError ? (
                  <AlertTriangle className="w-4 h-4 text-rose-300" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-[11px] font-bold flex items-center gap-1 ${
                    scanToast.isError ? 'text-rose-300' : 'text-amber-300'
                  }`}
                >
                  <span>{scanToast.isError ? '✕ Gagal Scan' : '✓ Berhasil Scan'}</span>
                  <span className="font-mono text-[10px] opacity-80">({scanToast.time})</span>
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-white truncate">
                  {scanToast.studentName}
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0 ${
                scanToast.isError
                  ? 'bg-rose-700 text-white border border-rose-400/50'
                  : 'bg-emerald-600/90 text-white border border-emerald-400/40'
              }`}
            >
              {scanToast.isError ? 'Tidak Terdaftar' : '✓ Berpuasa'}
            </span>
          </div>
        )}

        {/* Search Bar with Live Suggestions Dropdown */}
        <div className="pt-1.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              Input Siswa Berpuasa (Cari / Scan Barcode NIK)
            </label>
            <span className="text-[10px] text-emerald-700 font-semibold hidden sm:inline">
              ✨ Scanner USB / Kamera Aktif
            </span>
          </div>

          <div ref={searchContainerRef} className="relative">
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
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
                placeholder="Ketik nama, NIK, atau scan kartu santri di sini..."
                className="w-full pl-9 pr-20 py-2 text-xs sm:text-sm bg-emerald-50/40 border border-emerald-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all shadow-xs"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      if (searchInputRef.current) searchInputRef.current.focus();
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsCameraScannerOpen(true)}
                  className="p-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-all cursor-pointer"
                  title="Scan via Kamera"
                >
                  <ScanBarcode className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Auto-Suggest Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-emerald-200 rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 bg-emerald-900 text-white text-[10.5px] font-bold flex justify-between items-center">
                  <span>Hasil Pencarian ({searchSuggestions.length})</span>
                  <span className="text-emerald-300 font-normal text-[10px]">
                    {isReadOnly ? 'Hanya Lihat' : 'Klik untuk tandai puasa'}
                  </span>
                </div>

                {searchSuggestions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">
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
                        className={`p-2.5 sm:p-3 transition-colors flex items-center justify-between gap-2 ${
                          isFasting ? 'bg-emerald-50/70 hover:bg-emerald-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div
                          onClick={() => {
                            if (!isFasting) {
                              handleMarkPuasaFromSuggest(s.id);
                            }
                          }}
                          className={`flex items-center gap-2.5 flex-1 min-w-0 ${
                            !isReadOnly && !isFasting ? 'cursor-pointer' : ''
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-md font-bold text-[11px] flex items-center justify-center shrink-0 ${
                              isFasting
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {s.no}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-gray-900 text-xs truncate">{s.nama}</p>
                              {isFasting && (
                                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-extrabold bg-emerald-600 text-white shrink-0">
                                  ✓ Puasa
                                </span>
                              )}
                            </div>
                            <p className="text-[10.5px] text-gray-500">
                              Kelas: <strong className="text-emerald-800">{s.kelas}</strong>
                              {s.jenisKelamin && ` • ${s.jenisKelamin}`}
                              {s.nik && ` • NIK: ${s.nik}`}
                            </p>
                          </div>
                        </div>

                        {/* Direct Action Buttons inside Dropdown */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isFasting ? (
                            <button
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => handleToggleStatusFromSuggest(s.id, 'berpuasa')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                                isReadOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                              } bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-xs`}
                              title="Batalkan status puasa"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Batal</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => handleMarkPuasaFromSuggest(s.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                                isReadOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                              } bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs`}
                            >
                              <Plus className="w-3 h-3" />
                              <span>Tandai</span>
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
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 shrink-0" />
            <span>
              Siswa Berpuasa Terinput ({displayedStudents.length} Siswa)
            </span>
          </h3>

          {displayedStudents.length > 0 && !isReadOnly && (
            <button
              onClick={handleBulkResetAll}
              className="px-2 py-0.5 sm:py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition-all flex items-center gap-1 cursor-pointer"
              title="Batalkan semua siswa yang sudah diinput puasa di kelas ini"
            >
              <Trash2 className="w-3 h-3" />
              <span>Reset Semua</span>
            </button>
          )}
        </div>

        {displayedStudents.length === 0 ? (
          <div className="p-6 sm:p-8 text-center space-y-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl w-10 h-10 mx-auto flex items-center justify-center border border-emerald-100 shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-800">
              Belum Ada Siswa yang Diinput Berpuasa
            </p>
            <p className="text-[11px] text-gray-500 max-w-sm mx-auto leading-normal">
              Ketik nama, NIK, atau scan kartu pada kolom pencarian di atas untuk menandai siswa berpuasa hari ini.
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
                  className="p-2.5 sm:p-3 transition-colors hover:bg-emerald-50/40 bg-emerald-50/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-600 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {s.no || index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                          {s.nama}
                        </h4>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200">
                          {s.kelas}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                            s.jenisKelamin === 'Perempuan'
                              ? 'bg-pink-50 text-pink-700 border border-pink-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {s.jenisKelamin === 'Perempuan' ? 'P' : 'L'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9.5px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ✓ Berpuasa
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10.5px] text-gray-500 mt-0.5">
                        {s.nik && <span>NIK: {s.nik}</span>}
                        {s.namaIbu && <span>• Ibu: {s.namaIbu}</span>}
                      </div>

                      {/* Display Note if exists */}
                      {hasNote && (
                        <div className="mt-1 text-[10.5px] text-amber-800 bg-amber-50 border border-amber-200 rounded p-1 inline-flex items-center gap-1">
                          <Bookmark className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>
                            <strong>Catatan:</strong> {record.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fasting Status Controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      disabled={isReadOnly}
                      onClick={() => handleRemoveFasting(s.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                        isReadOnly ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                      } bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 shadow-xs active:scale-95`}
                      title="Batalkan tanda puasa untuk siswa ini"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-800" />
                      <span>Batal Puasa</span>
                    </button>

                    {/* Notes Button */}
                    <button
                      disabled={isReadOnly}
                      onClick={() => {
                        setActiveNoteStudentId(s.id);
                        setNoteText(record?.notes || '');
                      }}
                      className={`p-1.5 rounded-lg border text-xs transition-all ${
                        hasNote
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                      title={hasNote ? 'Edit catatan siswa' : 'Tambah catatan'}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
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

      {/* View Footer Note */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-200/60">
        <span className="text-[11px] text-slate-500">
          Form Input Status Puasa Siswa • SRT 1 Kediri
        </span>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <span>Dibuat oleh</span>
          <span className="font-bold text-emerald-800">eccko developer</span>
        </div>
      </div>

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
          onUpdateStudents={onUpdateStudents}
          onOpenPhotoModal={onOpenPhotoModal}
        />
      )}

      {/* Blacklist Card & Reissue History Modal */}
      {isBlacklistModalOpen && (
        <BlacklistCardModal
          isOpen={isBlacklistModalOpen}
          onClose={() => setIsBlacklistModalOpen(false)}
          students={students}
          onUpdateStudents={(upd) => {
            if (onUpdateStudents) onUpdateStudents(upd);
          }}
          onOpenPhotoModal={onOpenPhotoModal}
        />
      )}

      {/* Warning Popup when a Blacklisted Card is Scanned */}
      {blacklistAlert && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border-4 border-rose-600 overflow-hidden space-y-4 p-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 shrink-0 shadow-inner">
                <ShieldX className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-black text-rose-900 leading-tight">
                  ALARM: KARTU TER-BLACKLIST / HANGUS!
                </h3>
                <p className="text-xs text-rose-700 font-semibold">
                  Kartu ini tidak sah & tidak dapat digunakan untuk presensi/berbuka.
                </p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-2 text-xs text-rose-950">
              <p className="font-bold text-rose-900">
                {blacklistAlert.message}
              </p>
              {blacklistAlert.student && (
                <div className="bg-white/90 p-3 rounded-lg border border-rose-200 space-y-1 text-slate-800">
                  <div className="flex items-center gap-2">
                    <strong>Santri:</strong>
                    <span className="font-black text-slate-900">{blacklistAlert.student.nama}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-bold text-slate-700">
                      {blacklistAlert.student.kelas}
                    </span>
                  </div>
                  <p>
                    <strong>Versi Kartu yang Di-scan:</strong>{' '}
                    <span className="text-rose-700 font-black bg-rose-100 px-1.5 py-0.2 rounded">
                      V{blacklistAlert.scannedVersion} (HANGUS / SUDAH DIGANTI)
                    </span>
                  </p>
                  <p>
                    <strong>Versi Resmi yang Berlaku:</strong>{' '}
                    <span className="text-emerald-800 font-black bg-emerald-100 px-1.5 py-0.2 rounded">
                      V{blacklistAlert.activeVersion} (DUPLIKAT AKTIF)
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Petunjuk Petugas:</strong> Minta santri untuk menyerahkan kartu lama ini untuk diamankan agar tidak disalahgunakan oleh teman asrama lainnya.
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setBlacklistAlert(null);
                  setIsBlacklistModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Buka Menu Blacklist</span>
              </button>
              <button
                type="button"
                onClick={() => setBlacklistAlert(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all shadow-sm cursor-pointer"
              >
                Saya Mengerti (Tutup)
              </button>
            </div>
          </div>
        </div>
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


