import React, { useState, useMemo, useRef } from 'react';
import { Student } from '../types';
import { getUniqueClasses } from '../data/students';
import { StudentCardItem } from './StudentCardItem';
import { exportStudentCardsToPdf } from '../utils/cardPdfGenerator';
import {
  CreditCard,
  Printer,
  Download,
  Search,
  Filter,
  X,
  CheckSquare,
  Square,
  Sparkles,
  Info,
  Layers,
  ChevronDown,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

interface DormCardModalProps {
  students: Student[];
  onClose: () => void;
  onUpdateStudents?: (newStudents: Student[]) => void;
  onOpenPhotoModal?: (student?: Student) => void;
}

export const DormCardModal: React.FC<DormCardModalProps> = ({
  students,
  onClose,
  onUpdateStudents,
  onOpenPhotoModal,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<'SEMUA' | 'SD' | 'SMP' | 'SMA'>('SEMUA');
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(
    () => new Set(students.map((s) => s.id))
  );
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState<{
    current: number;
    total: number;
    page?: number;
    totalPages?: number;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'print_preview'>('grid');
  const [cardScale, setCardScale] = useState<'normal' | 'compact'>('normal');

  const printAreaRef = useRef<HTMLDivElement>(null);

  const uniqueClasses = useMemo(() => getUniqueClasses(students), [students]);

  // Determine Level from class name helper
  const getStudentLevel = (kelas: string): 'SD' | 'SMP' | 'SMA' => {
    const k = kelas.toUpperCase();
    if (k.includes('SD') || /^[1-6]\b/.test(k) || k.includes('KELAS 1') || k.includes('KELAS 2') || k.includes('KELAS 3') || k.includes('KELAS 4') || k.includes('KELAS 5') || k.includes('KELAS 6')) {
      return 'SD';
    }
    if (k.includes('SMP') || /^[7-9]\b/.test(k) || k.includes('VII') || k.includes('VIII') || k.includes('IX')) {
      return 'SMP';
    }
    if (k.includes('SMA') || k.includes('SMK') || k.includes('MA') || /^(10|11|12)\b/.test(k) || k.includes('X') || k.includes('XI') || k.includes('XII')) {
      return 'SMA';
    }
    // Fallback: Check numeric class
    const match = k.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num >= 1 && num <= 6) return 'SD';
      if (num >= 7 && num <= 9) return 'SMP';
      if (num >= 10 && num <= 12) return 'SMA';
    }
    return 'SMP';
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const level = getStudentLevel(s.kelas);
      const matchLevel = selectedLevel === 'SEMUA' || level === selectedLevel;
      const matchClass = selectedClass === 'SEMUA' || s.kelas === selectedClass;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.nama.toLowerCase().includes(q) ||
        (s.nik && s.nik.includes(q)) ||
        s.kelas.toLowerCase().includes(q) ||
        s.no.toString() === q;

      return matchLevel && matchClass && matchSearch;
    });
  }, [students, selectedLevel, selectedClass, searchQuery]);

  // Handle select all / deselect all
  const handleToggleSelectAll = () => {
    const visibleIds = filteredStudents.map((s) => s.id);
    const allSelected = visibleIds.every((id) => selectedStudentIds.has(id));

    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleToggleStudent = (id: number) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Students ready for printing/export
  const studentsToPrint = useMemo(() => {
    return filteredStudents.filter((s) => selectedStudentIds.has(s.id));
  }, [filteredStudents, selectedStudentIds]);

  // Trigger PDF Generation
  const handleExportPdf = async () => {
    if (studentsToPrint.length === 0) {
      alert('Pilih setidaknya satu siswa untuk dicetak kartunya.');
      return;
    }

    setIsExportingPdf(true);
    setExportProgress({
      current: 0,
      total: studentsToPrint.length,
      page: 1,
      totalPages: Math.ceil(studentsToPrint.length / 8),
    });
    try {
      await exportStudentCardsToPdf(studentsToPrint, (current, total, page, totalPages) => {
        setExportProgress({ current, total, page, totalPages });
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Terjadi kesalahan saat membuat file PDF kartu santri.');
    } finally {
      setIsExportingPdf(false);
      setExportProgress(null);
    }
  };

  // Direct Browser Print
  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-inner">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Cetak & Buat Kartu Puasa Wali Asuh
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-emerald-950 uppercase tracking-wider">
                  QR Code NIK
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Desain kartu santri otomatis dengan QR Code NIK siap scan untuk input cepat amalan puasa wali asuh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Theme Guide Legend */}
        <div className="bg-white px-6 py-2.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              Kode Warna Jenjang:
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 font-bold text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              SD (Merah)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              SMP (Biru)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              SMA (Abu-abu)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Format cetak diatur presisi untuk kartu ID / cetak kertas A4 (8 kartu per lembar).</span>
            </div>

            {onOpenPhotoModal && (
              <button
                type="button"
                onClick={() => onOpenPhotoModal()}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ml-auto"
                title="Kelola & Upload Foto Santri Langsung / Batch"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Upload / Kelola Foto Santri</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
          {/* Level Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
              Jenjang Sekolah
            </label>
            <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-xl">
              {(['SEMUA', 'SD', 'SMP', 'SMA'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedLevel === lvl
                      ? lvl === 'SD'
                        ? 'bg-red-600 text-white shadow-xs'
                        : lvl === 'SMP'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : lvl === 'SMA'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-emerald-700 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
              Pilih Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full py-2 px-3 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="SEMUA">Semua Kelas ({students.length} Siswa)</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls} ({students.filter((s) => s.kelas === cls).length} Siswa)
                </option>
              ))}
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
              Cari Nama / NIK
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama atau NIK..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Selection & Batch Action */}
          <div className="flex flex-col justify-end">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleToggleSelectAll}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer flex-1 justify-center"
              >
                {filteredStudents.length > 0 &&
                filteredStudents.every((s) => selectedStudentIds.has(s.id)) ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                    <span>Batal Pilih Semua</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-gray-500" />
                    <span>Pilih Semua ({filteredStudents.length})</span>
                  </>
                )}
              </button>

              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf || studentsToPrint.length === 0}
                className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  studentsToPrint.length === 0 || isExportingPdf
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{isExportingPdf ? 'Membuat PDF...' : `Unduh PDF (${studentsToPrint.length})`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Summary Info */}
        <div className="px-6 py-2 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-900 font-medium">
          <span>
            Menampilkan <strong>{filteredStudents.length}</strong> siswa | Terpilih untuk dicetak:{' '}
            <strong className="text-emerald-700">{studentsToPrint.length}</strong> kartu
          </span>
          <span className="text-[11px] text-gray-500">
            Klik pada kartu untuk memilih / membatalkan pilihan cetak
          </span>
        </div>

        {/* Cards Grid Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-100/70">
          {filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-gray-500 space-y-2">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">Tidak ada santri ditemukan</p>
              <p className="text-xs text-gray-400">
                Coba ubah filter jenjang, kelas, atau kata kunci pencarian Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudentIds.has(student.id);
                const level = getStudentLevel(student.kelas);

                return (
                  <div
                    key={student.id}
                    onClick={() => handleToggleStudent(student.id)}
                    className={`relative cursor-pointer transition-all duration-200 transform rounded-2xl ${
                      isSelected
                        ? 'ring-3 ring-emerald-600 ring-offset-2 scale-[1.01] shadow-xl'
                        : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-90 shadow'
                    }`}
                  >
                    {/* Checkbox badge overlay */}
                    <div
                      className={`absolute top-2 right-2 z-20 w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-400 text-white'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </div>

                    {/* Single Student Card Component */}
                    <StudentCardItem
                      student={student}
                      level={level}
                      onUploadClick={onOpenPhotoModal ? (s) => onOpenPhotoModal(s) : undefined}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white px-6 py-3.5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-500">
            Total Kartu Terpilih:{' '}
            <strong className="text-emerald-800 text-sm font-bold">{studentsToPrint.length}</strong> Santri
            (estimasi {Math.ceil(studentsToPrint.length / 8)} lembar A4)
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-50"
            >
              Tutup
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf || studentsToPrint.length === 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                studentsToPrint.length === 0 || isExportingPdf
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>
                {isExportingPdf
                  ? exportProgress
                    ? `Merender Kartu ${exportProgress.current} / ${exportProgress.total}...`
                    : 'Sedang Memproses Dokumen PDF...'
                  : `Export PDF Kartu Siap Cetak (${studentsToPrint.length})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* High Performance Export Progress Overlay */}
      {isExportingPdf && exportProgress && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-emerald-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-100 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-bounce shadow-inner">
              <Download className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">
                Membuat PDF Kartu Puasa Wali Asuh...
              </h3>
              <p className="text-xs text-slate-500">
                Merender kartu beresolusi tinggi dengan optimasi kecepatan & kompresi cerdas.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-800">
                  Kartu {exportProgress.current} dari {exportProgress.total}
                </span>
                <span className="text-emerald-600">
                  {Math.round((exportProgress.current / Math.max(1, exportProgress.total)) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 rounded-full transition-all duration-150 ease-out"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((exportProgress.current / Math.max(1, exportProgress.total)) * 100)
                    )}%`,
                  }}
                />
              </div>
              {exportProgress.page && exportProgress.totalPages && (
                <div className="text-[11px] font-semibold text-slate-400">
                  Halaman {exportProgress.page} dari {exportProgress.totalPages}
                </div>
              )}
            </div>

            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 text-[11px] text-emerald-800 text-left flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Akselerasi Multi-Threading:</strong> Kartu diproses secara paralel dengan rendering langsung ke layout kertas A4 (8 kartu/lembar).
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
