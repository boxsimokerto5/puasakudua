import React, { useState, useMemo } from 'react';
import { Student, CardReissueRecord } from '../types';
import {
  getCardReissueHistory,
  reissueStudentCard,
  cancelBlacklistRecord,
  validateScannedCard,
  buildCardQrValue,
  getEffectiveCardVersion,
} from '../utils/cardSecurity';
import { StudentCardItem } from './StudentCardItem';
import { exportStudentCardsToPdf } from '../utils/cardPdfGenerator';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Plus,
  Search,
  Printer,
  X,
  CheckCircle2,
  Clock,
  History,
  QrCode,
  Undo2,
  Table,
  LayoutGrid,
  RefreshCw,
  AlertTriangle,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { playScanErrorSound, playScanSuccessSound } from '../utils/audioNotification';

interface BlacklistCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
  onOpenPhotoModal?: (student?: Student) => void;
}

export const BlacklistCardModal: React.FC<BlacklistCardModalProps> = ({
  isOpen,
  onClose,
  students,
  onUpdateStudents,
  onOpenPhotoModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'blacklist_list' | 'reissue_form' | 'test_scanner'>('blacklist_list');
  const [historyRecords, setHistoryRecords] = useState<CardReissueRecord[]>(() => getCardReissueHistory());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'version'>('newest');

  // New Reissue Form State
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentSearchInput, setStudentSearchInput] = useState<string>('');
  const [reissueReason, setReissueReason] = useState<string>('Kartu Asli Hilang di Asrama');
  const [customReason, setCustomReason] = useState<string>('');
  const [reissuedBy, setReissuedBy] = useState<string>('Wali Asuh / Admin');
  const [reissueNotes, setReissueNotes] = useState<string>('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [justReissuedStudent, setJustReissuedStudent] = useState<Student | null>(null);
  const [justReissuedRecord, setJustReissuedRecord] = useState<CardReissueRecord | null>(null);

  // Card Simulator State
  const [simulatorInput, setSimulatorInput] = useState<string>('');
  const [simulatorResult, setSimulatorResult] = useState<ReturnType<typeof validateScannedCard> | null>(null);

  // Single card print state
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Record to cancel modal
  const [recordToCancel, setRecordToCancel] = useState<CardReissueRecord | null>(null);

  // Find student for form
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [selectedStudentId, students]);

  // Student search suggestions for Reissue Form
  const studentSuggestions = useMemo(() => {
    const q = studentSearchInput.toLowerCase().trim();
    if (!q) return [];
    return students
      .filter((s) => s.nama.toLowerCase().includes(q) || s.kelas.toLowerCase().includes(q) || (s.nik && s.nik.includes(q)))
      .slice(0, 8);
  }, [studentSearchInput, students]);

  // Extract unique classes from history records for filter
  const availableClasses = useMemo(() => {
    const set = new Set(historyRecords.map((r) => r.studentClass));
    return Array.from(set).sort();
  }, [historyRecords]);

  // Filtered & sorted blacklist history records
  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = historyRecords.filter((rec) => {
      // Class filter
      if (classFilter !== 'ALL' && rec.studentClass !== classFilter) {
        return false;
      }
      if (!q) return true;
      return (
        rec.studentName.toLowerCase().includes(q) ||
        rec.studentClass.toLowerCase().includes(q) ||
        rec.studentNik.includes(q) ||
        rec.reason.toLowerCase().includes(q) ||
        rec.reissuedBy.toLowerCase().includes(q)
      );
    });

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.reissuedAt).getTime() - new Date(a.reissuedAt).getTime());
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.studentName.localeCompare(b.studentName));
    } else if (sortBy === 'version') {
      result.sort((a, b) => b.newVersion - a.newVersion);
    }

    return result;
  }, [historyRecords, searchQuery, classFilter, sortBy]);

  // Statistics
  const totalReissuedStudentsCount = useMemo(() => {
    const set = new Set(historyRecords.map((r) => r.studentId));
    return set.size;
  }, [historyRecords]);

  const totalBlacklistedCardsCount = historyRecords.length;

  // Handle Reissue Form Submit
  const handleProcessReissue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Silakan pilih santri yang kartunya akan dicetak ulang.');
      return;
    }

    const finalReason = reissueReason === 'Lainnya' ? customReason.trim() : reissueReason;
    if (!finalReason) {
      alert('Silakan pilih atau isi alasan cetak ulang kartu.');
      return;
    }

    try {
      const result = reissueStudentCard({
        studentId: selectedStudent.id,
        reason: finalReason,
        reissuedBy: reissuedBy.trim() || 'Admin / Wali Asuh',
        notes: reissueNotes.trim(),
        students,
      });

      onUpdateStudents(result.updatedStudents);
      setHistoryRecords(getCardReissueHistory());

      const updatedS = result.updatedStudents.find((s) => s.id === selectedStudent.id) || null;
      setJustReissuedStudent(updatedS);
      setJustReissuedRecord(result.newRecord);
      setIsSuccessModalOpen(true);

      // Reset form
      setSelectedStudentId(null);
      setStudentSearchInput('');
      setReissueNotes('');
      setCustomReason('');
    } catch (err: unknown) {
      alert(`Gagal menerbitkan kartu baru: ${String(err)}`);
    }
  };

  // Quick Reissue from blacklist table
  const handleQuickReissueForStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setActiveSubTab('reissue_form');
  };

  // Confirm cancel blacklist
  const handleConfirmCancelBlacklist = () => {
    if (!recordToCancel) return;

    try {
      const result = cancelBlacklistRecord({
        recordId: recordToCancel.id,
        studentId: recordToCancel.studentId,
        students,
      });

      onUpdateStudents(result.updatedStudents);
      setHistoryRecords(result.updatedHistory);
      setRecordToCancel(null);
    } catch (err: unknown) {
      alert(`Gagal membatalkan blacklist: ${String(err)}`);
    }
  };

  // Export single student card
  const handleExportSingleCardPdf = async (student: Student) => {
    setIsExportingPdf(true);
    try {
      await exportStudentCardsToPdf([student]);
    } catch (err: unknown) {
      console.error('Error generating card PDF:', err);
      alert('Gagal menghasilkan file PDF kartu: ' + String(err));
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Run Barcode Simulator
  const handleRunSimulator = (val?: string) => {
    const raw = (val !== undefined ? val : simulatorInput).trim();
    if (!raw) return;

    const res = validateScannedCard(raw, students);
    setSimulatorResult(res);

    if (res.isBlacklisted) {
      playScanErrorSound();
    } else if (res.isValid) {
      playScanSuccessSound();
    } else {
      playScanErrorSound();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[92vh] max-h-[92vh]">
        {/* Modal Top Header - Compact & Clean */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 text-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between relative shrink-0 border-b border-rose-900/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                  Blacklist Card & Duplikat Versi
                </h2>
                <span className="px-2 py-0.2 rounded-full bg-rose-500/25 text-rose-300 border border-rose-400/30 text-[9.5px] font-black uppercase tracking-wider">
                  Anti-Double Intake
                </span>
              </div>
              <p className="text-[11px] text-rose-200/80 leading-tight">
                Kartu lama otomatis <strong>BLACKLIST & HANGUS</strong> saat kartu baru dicetak. Mencegah penyalahgunaan antrean berbuka/sahur.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation & Statistics Ribbon - Tight & Clean */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 sm:px-4 sm:py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 rounded-lg">
            <button
              onClick={() => setActiveSubTab('blacklist_list')}
              className={`px-2.5 py-1.2 rounded-md text-[11.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'blacklist_list'
                  ? 'bg-white text-rose-950 shadow-2xs ring-1 ring-rose-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <History className="w-3.5 h-3.5 text-rose-600" />
              <span>Daftar Riwayat Blacklist</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-extrabold bg-rose-100 text-rose-800">
                {historyRecords.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('reissue_form')}
              className={`px-2.5 py-1.2 rounded-md text-[11.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'reissue_form'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Cetak Versi Baru</span>
            </button>

            <button
              onClick={() => setActiveSubTab('test_scanner')}
              className={`px-2.5 py-1.2 rounded-md text-[11.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'test_scanner'
                  ? 'bg-slate-900 text-amber-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Uji Barcode</span>
            </button>
          </div>

          {/* Quick Stats Ribbon */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <div className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-900 font-bold flex items-center gap-1">
              <ShieldX className="w-3 h-3 text-rose-600" />
              <span>{totalBlacklistedCardsCount} Kartu Blacklist</span>
            </div>
            <div className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{totalReissuedStudentsCount} Santri Duplikat</span>
            </div>
          </div>
        </div>

        {/* Modal Main Body Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50/70">
          {/* TAB 1: BLACKLIST / REISSUE DIRECTORY LIST */}
          {activeSubTab === 'blacklist_list' && (
            <div className="space-y-2.5">
              {/* Filter, Search & View Controls Bar - High Density */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
                {/* Search input */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari santri (Nama, Kelas, NIK, Alasan)..."
                    className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-rose-500 focus:border-rose-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters and View Toggle */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {/* Class Filter */}
                  <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                    <Filter className="w-3 h-3 text-slate-500" />
                    <select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="bg-transparent text-[11px] font-bold text-slate-700 outline-hidden cursor-pointer"
                    >
                      <option value="ALL">Semua Kelas ({historyRecords.length})</option>
                      {availableClasses.map((cls) => {
                        const count = historyRecords.filter((r) => r.studentClass === cls).length;
                        return (
                          <option key={cls} value={cls}>
                            {cls} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-[11px] font-bold text-slate-700 outline-hidden cursor-pointer"
                    >
                      <option value="newest">Terbaru</option>
                      <option value="name">Nama (A-Z)</option>
                      <option value="version">Versi Tertinggi</option>
                    </select>
                  </div>

                  {/* View Mode Toggle: Table vs Cards */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        viewMode === 'table'
                          ? 'bg-white text-rose-950 shadow-2xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Tampilan Tabel Rapat (Muat Banyak Data)"
                    >
                      <Table className="w-3 h-3 text-rose-600" />
                      <span className="hidden sm:inline">Tabel Rapat</span>
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        viewMode === 'cards'
                          ? 'bg-white text-rose-950 shadow-2xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Tampilan Kartu Rapat"
                    >
                      <LayoutGrid className="w-3 h-3 text-rose-600" />
                      <span className="hidden sm:inline">Kartu</span>
                    </button>
                  </div>

                  {/* New Reissue Button */}
                  <button
                    onClick={() => {
                      setSelectedStudentId(null);
                      setActiveSubTab('reissue_form');
                    }}
                    className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-black flex items-center gap-1 transition-all shadow-2xs cursor-pointer ml-auto sm:ml-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Cetak Baru</span>
                  </button>
                </div>
              </div>

              {/* Blacklist List / Table */}
              {filteredRecords.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="text-xs font-black text-slate-800">
                    {searchQuery || classFilter !== 'ALL'
                      ? 'Tidak ada santri yang cocok dengan filter'
                      : 'Belum Ada Riwayat Cetak Ulang Kartu'}
                  </h3>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Santri yang dicetak ulang kartunya karena hilang atau rusak akan otomatis dicatat di daftar blacklist ini.
                  </p>
                </div>
              ) : viewMode === 'table' ? (
                /* === COMPACT DENSE TABLE VIEW (Fits 15-30+ rows smoothly) === */
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100/90 border-b border-slate-200 text-[10.5px] font-black text-slate-600 uppercase tracking-wider">
                          <th className="py-2 px-2.5 w-10 text-center">#</th>
                          <th className="py-2 px-3">Data Santri</th>
                          <th className="py-2 px-3">Status Versi</th>
                          <th className="py-2 px-3">Alasan & Catatan</th>
                          <th className="py-2 px-3">Waktu & Petugas</th>
                          <th className="py-2 px-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredRecords.map((rec, idx) => {
                          const student = students.find((s) => s.id === rec.studentId);
                          const formattedDate = new Date(rec.reissuedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          });

                          return (
                            <tr
                              key={rec.id}
                              className="hover:bg-rose-50/40 transition-colors group"
                            >
                              {/* Row Number / Index */}
                              <td className="py-1.5 px-2.5 text-center text-[11px] font-mono text-slate-400">
                                {idx + 1}
                              </td>

                              {/* Student Info */}
                              <td className="py-1.5 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-[11px] shrink-0 overflow-hidden">
                                    {student?.foto ? (
                                      <img
                                        src={student.foto}
                                        alt={rec.studentName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span>{rec.studentName.charAt(0)}</span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-black text-slate-900 text-[11.5px] leading-tight flex items-center gap-1.5">
                                      <span>{rec.studentName}</span>
                                      <span className="px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black">
                                        {rec.studentClass}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      NIK: {rec.studentNik || '-'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Version Status */}
                              <td className="py-1.5 px-3">
                                <div className="flex flex-col gap-0.5">
                                  <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-rose-800 bg-rose-100 border border-rose-200 px-1.5 py-0.2 rounded-md w-fit">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    <span>Aktif: V{rec.newVersion}</span>
                                  </span>
                                  <span className="text-[9.5px] font-bold text-slate-500 flex items-center gap-1">
                                    <ShieldX className="w-2.5 h-2.5 text-rose-600" />
                                    <span>V{rec.oldVersion} (BLACKLIST)</span>
                                  </span>
                                </div>
                              </td>

                              {/* Reason & Notes */}
                              <td className="py-1.5 px-3 max-w-[240px]">
                                <div className="text-[11px] font-semibold text-slate-800 truncate" title={rec.reason}>
                                  {rec.reason}
                                </div>
                                {rec.notes && (
                                  <div className="text-[10px] text-slate-500 italic truncate" title={rec.notes}>
                                    "{rec.notes}"
                                  </div>
                                )}
                              </td>

                              {/* Date & Issuer */}
                              <td className="py-1.5 px-3 whitespace-nowrap">
                                <div className="text-[10.5px] text-slate-700 flex items-center gap-1 font-medium">
                                  <Clock className="w-2.5 h-2.5 text-slate-400" />
                                  <span>{formattedDate}</span>
                                </div>
                                <div className="text-[9.5px] text-slate-500">
                                  Oleh: <span className="font-semibold text-slate-700">{rec.reissuedBy}</span>
                                </div>
                              </td>

                              {/* Action Buttons */}
                              <td className="py-1.5 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  {/* Print Card Button */}
                                  <button
                                    onClick={() => {
                                      if (student) handleExportSingleCardPdf(student);
                                    }}
                                    disabled={isExportingPdf || !student}
                                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                    title="Cetak PDF Kartu Aktif V..."
                                  >
                                    <Printer className="w-3 h-3" />
                                    <span>Cetak V{rec.newVersion}</span>
                                  </button>

                                  {/* Cancel Blacklist Button */}
                                  <button
                                    onClick={() => setRecordToCancel(rec)}
                                    className="px-1.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                    title="Batalkan blacklist ini & pulihkan santri ke versi sebelumnya"
                                  >
                                    <Undo2 className="w-3 h-3 text-amber-700" />
                                    <span className="hidden sm:inline">Batal</span>
                                  </button>

                                  {/* Increment Version Again Button */}
                                  <button
                                    onClick={() => handleQuickReissueForStudent(rec.studentId)}
                                    className="px-1.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                    title={`Naikkan lagi ke V${rec.newVersion + 1} jika hilang lagi`}
                                  >
                                    <RefreshCw className="w-3 h-3 text-rose-600" />
                                    <span>+V{rec.newVersion + 1}</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer Count */}
                  <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-200 text-[10.5px] font-bold text-slate-500 flex items-center justify-between">
                    <span>
                      Menampilkan <strong>{filteredRecords.length}</strong> dari <strong>{historyRecords.length}</strong> data riwayat blacklist
                    </span>
                    <span className="text-[10px] text-slate-400">
                      💡 Barcode lama otomatis hangus & memicu alarm penolakan
                    </span>
                  </div>
                </div>
              ) : (
                /* === COMPACT CARDS GRID VIEW (3 Columns, dense) === */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {filteredRecords.map((rec) => {
                    const student = students.find((s) => s.id === rec.studentId);
                    const formattedDate = new Date(rec.reissuedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={rec.id}
                        className="bg-white rounded-xl border border-rose-200 p-2.5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-2 relative overflow-hidden"
                      >
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-rose-500 to-amber-500" />

                        <div>
                          {/* Student Header */}
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 overflow-hidden">
                                {student?.foto ? (
                                  <img
                                    src={student.foto}
                                    alt={rec.studentName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{rec.studentName.charAt(0)}</span>
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-900 leading-tight">
                                  {rec.studentName}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                  <span className="font-bold text-emerald-800">{rec.studentClass}</span>
                                  <span>•</span>
                                  <span className="font-mono text-slate-600">{rec.studentNik || '-'}</span>
                                </div>
                              </div>
                            </div>

                            <span className="px-1.5 py-0.2 rounded bg-rose-100 border border-rose-300 text-rose-900 text-[9.5px] font-black shrink-0">
                              V{rec.newVersion} AKTIF
                            </span>
                          </div>

                          {/* Info Box */}
                          <div className="mt-2 bg-rose-50/70 border border-rose-200/80 rounded-lg p-2 space-y-1 text-[11px] text-rose-950">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-rose-800 flex items-center gap-1">
                                <ShieldX className="w-3 h-3 text-rose-600" />
                                <span>Kartu Lama Hangus:</span>
                              </span>
                              <span className="font-black font-mono text-rose-900 bg-rose-200 px-1 py-0.2 rounded text-[9.5px]">
                                V{rec.oldVersion}
                              </span>
                            </div>

                            <div className="text-[10.5px] text-slate-700 line-clamp-1" title={rec.reason}>
                              <span className="font-bold text-slate-900">Alasan: </span>
                              {rec.reason}
                            </div>

                            <div className="flex items-center justify-between text-[9.5px] text-slate-500 pt-1 border-t border-rose-200/50">
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5 text-slate-400" />
                                <span>{formattedDate}</span>
                              </span>
                              <span>Oleh: {rec.reissuedBy}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100">
                          <button
                            onClick={() => {
                              if (student) handleExportSingleCardPdf(student);
                            }}
                            disabled={isExportingPdf || !student}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                            title="Unduh / Cetak PDF Kartu Aktif"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Cetak V{rec.newVersion}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setRecordToCancel(rec)}
                              className="px-1.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer"
                              title="Batalkan blacklist ini"
                            >
                              <Undo2 className="w-3 h-3 text-amber-700" />
                              <span>Batal</span>
                            </button>

                            <button
                              onClick={() => handleQuickReissueForStudent(rec.studentId)}
                              className="px-1.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-md text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer"
                              title="Naikkan ke versi berikutnya"
                            >
                              <RefreshCw className="w-3 h-3 text-rose-600" />
                              <span>+V{rec.newVersion + 1}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REISSUE FORM (CETAK VERSI BERIKUTNYA) - Compact & Clean */}
          {activeSubTab === 'reissue_form' && (
            <div className="max-w-2xl mx-auto space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="space-y-0.5 border-b border-slate-100 pb-2.5">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-rose-600" />
                  <span>Penerbitan Kartu Pengganti (Versi Baru)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pilih santri yang kehilangan kartu. Nomor versi kartu akan dinaikkan otomatis dan kartu lama langsung diblokir di scanner.
                </p>
              </div>

              <form onSubmit={handleProcessReissue} className="space-y-3 text-xs">
                {/* Step 1: Pilih Santri */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider">
                    1. Pilih Santri <span className="text-rose-600">*</span>
                  </label>

                  {!selectedStudent ? (
                    <div className="space-y-1.5">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={studentSearchInput}
                          onChange={(e) => setStudentSearchInput(e.target.value)}
                          placeholder="Ketik Nama, Kelas, atau NIK santri..."
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-rose-500"
                        />
                      </div>

                      {studentSuggestions.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-lg divide-y divide-slate-100 max-h-44 overflow-y-auto">
                          {studentSuggestions.map((s) => {
                            const curVer = getEffectiveCardVersion(s);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setSelectedStudentId(s.id);
                                  setStudentSearchInput('');
                                }}
                                className="w-full p-2 text-left hover:bg-rose-50/80 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                              >
                                <div>
                                  <p className="text-xs font-black text-slate-900">{s.nama}</p>
                                  <p className="text-[10.5px] text-slate-500">
                                    Kelas <span className="font-bold text-emerald-800">{s.kelas}</span> • NIK: {s.nik || '-'}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                                    Saat ini: V{curVer}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Selected Student Card Cardview */
                    <div className="bg-rose-50/60 border border-rose-300 rounded-xl p-2.5 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-white border border-rose-200 flex items-center justify-center font-black text-rose-800 shrink-0 overflow-hidden">
                          {selectedStudent.foto ? (
                            <img
                              src={selectedStudent.foto}
                              alt={selectedStudent.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{selectedStudent.nama.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-slate-900">{selectedStudent.nama}</h4>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9.5px] font-extrabold">
                              {selectedStudent.kelas}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10.5px] mt-0.5">
                            <span className="text-slate-600">Versi Sekarang:</span>
                            <span className="font-black text-rose-800 bg-rose-200 px-1 py-0.2 rounded text-[10px]">
                              V{getEffectiveCardVersion(selectedStudent)}
                            </span>
                            <span className="text-slate-400">&rarr;</span>
                            <span className="font-black text-emerald-800 bg-emerald-200 px-1 py-0.2 rounded text-[10px]">
                              Naik ke: V{getEffectiveCardVersion(selectedStudent) + 1} (DUPLIKAT)
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedStudentId(null)}
                        className="px-2 py-1 rounded-md bg-white border border-slate-300 text-slate-600 text-[11px] font-bold hover:bg-rose-100 hover:text-rose-800 transition-colors cursor-pointer shrink-0"
                      >
                        Ganti
                      </button>
                    </div>
                  )}
                </div>

                {/* Step 2: Alasan Cetak Ulang */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider">
                    2. Alasan Cetak Ulang <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={reissueReason}
                    onChange={(e) => setReissueReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-1.5 focus:ring-rose-500"
                  >
                    <option value="Kartu Asli Hilang di Asrama">Kartu Asli Hilang di Asrama / Kamar</option>
                    <option value="Kartu Rusak / Patah / Terlipat">Kartu Rusak / Patah / Barcode Rusak</option>
                    <option value="Kartu Tertinggal di Rumah">Kartu Tertinggal di Rumah / Luar Pesantren</option>
                    <option value="Kartu Hilang Saat Kegiatan Luar">Kartu Hilang Saat Kegiatan Luar</option>
                    <option value="Lainnya">Alasan Lainnya (Ketik Manual)...</option>
                  </select>

                  {reissueReason === 'Lainnya' && (
                    <input
                      type="text"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Jelaskan alasan kehilangan/penggantian..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:ring-1.5 focus:ring-rose-500 mt-1"
                      required
                    />
                  )}
                </div>

                {/* Step 3: Petugas Pemroses & Catatan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider">
                      3. Musyrif / Admin Pemroses
                    </label>
                    <input
                      type="text"
                      value={reissuedBy}
                      onChange={(e) => setReissuedBy(e.target.value)}
                      placeholder="Nama Petugas..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-1.5 focus:ring-rose-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider">
                      Catatan Tambahan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={reissueNotes}
                      onChange={(e) => setReissueNotes(e.target.value)}
                      placeholder="Contoh: Sudah bayar infaq cetak..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:ring-1.5 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Security Warning Box */}
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-2 text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-amber-900 leading-tight">
                    Kartu lama <strong>(V{selectedStudent ? getEffectiveCardVersion(selectedStudent) : 1})</strong> akan langsung masuk daftar <strong>BLACKLIST</strong> dan ditolak oleh scanner.
                  </p>
                </div>

                {/* Submit Action */}
                <div className="pt-1 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('blacklist_list')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedStudent}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Terbitkan Kartu Versi Baru</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: TEST BARCODE VALIDATION SIMULATOR - Compact */}
          {activeSubTab === 'test_scanner' && (
            <div className="max-w-2xl mx-auto space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="space-y-0.5 border-b border-slate-100 pb-2.5">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-slate-900" />
                  <span>Simulator Pengujian Validasi Barcode</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Uji coba deteksi kartu sah vs kartu lama yang sudah diblacklist.
                </p>
              </div>

              {/* Input Form */}
              <div className="space-y-2.5 text-xs">
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider">
                    Ketik atau Scan Barcode / QR Code
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={simulatorInput}
                      onChange={(e) => setSimulatorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRunSimulator();
                      }}
                      placeholder="Contoh: 3506010203040002#V1 atau 3506010203040002#V2"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold focus:bg-white focus:ring-1.5 focus:ring-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleRunSimulator()}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-black flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Uji</span>
                    </button>
                  </div>
                </div>

                {/* Quick Test Preset Buttons */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500">Preset Coba Cepat:</p>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSimulatorInput('3506010203040002#V1');
                        handleRunSimulator('3506010203040002#V1');
                      }}
                      className="px-2 py-0.8 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      ⛔ Coba Kartu Blacklist V1
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSimulatorInput('3506010203040002#V2');
                        handleRunSimulator('3506010203040002#V2');
                      }}
                      className="px-2 py-0.8 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      ✓ Coba Kartu Sah V2
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const s1 = students[0];
                        const val = s1 ? buildCardQrValue(s1) : '3506010102030001#V1';
                        setSimulatorInput(val);
                        handleRunSimulator(val);
                      }}
                      className="px-2 py-0.8 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      ✓ Coba Kartu Perdana
                    </button>
                  </div>
                </div>

                {/* Simulator Result Box */}
                {simulatorResult && (
                  <div className="pt-1 animate-in fade-in duration-150">
                    {simulatorResult.isBlacklisted ? (
                      <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-950 space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-rose-900 font-black text-xs">
                          <ShieldX className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>ALARM: KARTU BLACKLIST / KADALUARSA DITOLAK!</span>
                        </div>
                        <p className="text-[11px] text-rose-900 leading-relaxed font-semibold">
                          {simulatorResult.message}
                        </p>
                        {simulatorResult.student && (
                          <div className="bg-white/80 p-2 rounded-lg border border-rose-200 text-[10.5px] space-y-0.5 text-slate-800 mt-1">
                            <p>
                              <strong>Nama Pemilik:</strong> {simulatorResult.student.nama} ({simulatorResult.student.kelas})
                            </p>
                            <p>
                              <strong>Versi yang di-scan:</strong> <span className="text-rose-700 font-black">V{simulatorResult.scannedVersion} (HANGUS)</span>
                            </p>
                            <p>
                              <strong>Versi Sah yang Berlaku:</strong> <span className="text-emerald-800 font-black">V{simulatorResult.activeVersion} (AKTIF)</span>
                            </p>
                          </div>
                        )}
                      </div>
                    ) : simulatorResult.isValid ? (
                      <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>SUKSES: KARTU SAH & DITERIMA</span>
                        </div>
                        <p className="text-[11px] text-emerald-900 leading-relaxed font-semibold">
                          {simulatorResult.message}
                        </p>
                        {simulatorResult.student && (
                          <div className="bg-white/80 p-2 rounded-lg border border-emerald-200 text-[10.5px] space-y-0.5 text-slate-800">
                            <p>
                              <strong>Santri:</strong> {simulatorResult.student.nama} — Kelas {simulatorResult.student.kelas}
                            </p>
                            <p>
                              <strong>Versi:</strong> V{simulatorResult.activeVersion} {simulatorResult.activeVersion > 1 ? '(DUPLIKAT RESMI)' : '(PERDANA)'}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Kode Tidak Terdaftar</span>
                        </div>
                        <p className="text-[11px] text-slate-600">{simulatorResult.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer - Compact */}
        <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Puasaku Security • Anti-Kecurangan Antrean Berbuka & Sahur</span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* POPUP SUKSES REISSUE KARTU BARU */}
      {isSuccessModalOpen && justReissuedStudent && justReissuedRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-rose-300 overflow-hidden space-y-3 p-4">
            <div className="text-center space-y-0.5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900">
                Kartu Versi Baru Berhasil Diterbitkan!
              </h3>
              <p className="text-[11px] text-slate-600">
                Kartu lama <strong>Versi {justReissuedRecord.oldVersion}</strong> otomatis masuk <strong>BLACKLIST</strong>.
              </p>
            </div>

            {/* Live Preview Card */}
            <div className="flex justify-center py-1">
              <div className="transform scale-90 origin-center">
                <StudentCardItem
                  student={justReissuedStudent}
                  level={
                    justReissuedStudent.kelas.toUpperCase().includes('SD')
                      ? 'SD'
                      : justReissuedStudent.kelas.toUpperCase().includes('SMA')
                      ? 'SMA'
                      : 'SMP'
                  }
                  onUploadClick={onOpenPhotoModal}
                />
              </div>
            </div>

            {/* Summary Details */}
            <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-2.5 text-xs space-y-1 text-rose-950">
              <p>
                <strong>Santri:</strong> {justReissuedStudent.nama} ({justReissuedStudent.kelas})
              </p>
              <p>
                <strong>Versi Baru (Aktif):</strong> <span className="font-black text-rose-700">V{justReissuedStudent.cardVersion} (DUPLIKAT)</span>
              </p>
              <p>
                <strong>Versi Lama:</strong> <span className="line-through text-slate-500">V{justReissuedRecord.oldVersion}</span> (⛔ BLACKLISTED)
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setActiveSubTab('blacklist_list');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Selesai
              </button>
              <button
                type="button"
                onClick={() => handleExportSingleCardPdf(justReissuedStudent)}
                disabled={isExportingPdf}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-black flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Unduh PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI BATALKAN BLACKLIST */}
      {recordToCancel && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-amber-300 overflow-hidden space-y-3 p-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                <Undo2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                  Batalkan Blacklist Kartu?
                </h3>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  Pemulihan versi kartu santri
                </p>
              </div>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 text-xs space-y-1 text-amber-950">
              <p>
                <strong>Nama Santri:</strong> <span className="font-bold">{recordToCancel.studentName}</span> ({recordToCancel.studentClass})
              </p>
              <p>
                <strong>Status Sekarang:</strong> <span className="font-black text-rose-700">Versi Aktif V{recordToCancel.newVersion}</span> (Versi {recordToCancel.oldVersion} Di-blacklist)
              </p>
              <p>
                <strong>Setelah Dibatalkan:</strong> Santri akan dipulihkan kembali ke <span className="font-black text-emerald-800">Versi {recordToCancel.oldVersion}</span>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRecordToCancel(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelBlacklist}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Ya, Batalkan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
