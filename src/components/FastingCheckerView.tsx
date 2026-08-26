import React, { useState, useMemo } from 'react';
import { Student, FastingSession, UserSession } from '../types';
import { getUniqueClasses } from '../data/students';
import { PdfExportModal } from './PdfExportModal';
import {
  getStudentLevel,
  generateSahurChecklistPdf,
  generateBerbukaChecklistPdf,
  generateMakanSiangChecklistPdf,
} from '../utils/pdfGenerator';
import {
  Search,
  Printer,
  Utensils,
  Coffee,
  CheckSquare,
  FileText,
  Moon,
  LogOut,
} from 'lucide-react';

interface FastingCheckerViewProps {
  students: Student[];
  activeSession: FastingSession;
  user: UserSession;
  onVerifySession: (verifiedBy: string, verifierNotes?: string) => void;
  onLogout?: () => void;
}

export const FastingCheckerView: React.FC<FastingCheckerViewProps> = ({
  students,
  activeSession,
  user,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'sahur' | 'berbuka' | 'makan_siang'>('sahur');
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Dropdown Level selector for Sahur checklist (SD, SMP, SMA, or SEMUA)
  const [selectedSahurLevel, setSelectedSahurLevel] = useState<'SEMUA' | 'SD' | 'SMP' | 'SMA'>('SEMUA');

  // Dropdown Level selector for Berbuka checklist (SD, SMP, SMA, or SEMUA)
  const [selectedBerbukaLevel, setSelectedBerbukaLevel] = useState<'SEMUA' | 'SD' | 'SMP' | 'SMA'>('SEMUA');

  // Dropdown Level selector for Makan Siang checklist (SD, SMP, SMA, or SEMUA)
  const [selectedMakanSiangLevel, setSelectedMakanSiangLevel] = useState<'SEMUA' | 'SD' | 'SMP' | 'SMA'>('SEMUA');

  // Interactive Checklist toggle sets
  const [checkedSahurIds, setCheckedSahurIds] = useState<Set<number>>(new Set());
  const [checkedBerbukaIds, setCheckedBerbukaIds] = useState<Set<number>>(new Set());
  const [checkedMakanSiangIds, setCheckedMakanSiangIds] = useState<Set<number>>(new Set());

  const uniqueClasses = useMemo(() => getUniqueClasses(students), [students]);

  // Total summary across all students
  const totalStats = useMemo(() => {
    let berpuasa = 0;
    let tidakPuasa = 0;
    let halangan = 0;
    let belumDiisi = 0;

    const records = activeSession?.records || {};

    students.forEach((s) => {
      const rec = records[s.id];
      const status = rec?.status || 'belum_diisi';
      if (status === 'berpuasa') berpuasa++;
      else if (status === 'tidak_puasa') tidakPuasa++;
      else if (status === 'halangan') halangan++;
      else belumDiisi++;
    });

    const total = students.length;
    const percentage = total > 0 ? Math.round((berpuasa / total) * 100) : 0;

    return {
      total,
      berpuasa,
      tidakPuasa,
      halangan,
      belumDiisi,
      percentage,
    };
  }, [students, activeSession?.records]);

  // Filtered student list for Ceklist Sahur (Fasting students)
  const sahurStudentsList = useMemo(() => {
    const records = activeSession?.records || {};
    return students.filter((s) => {
      const rec = records[s.id];
      if (rec?.status !== 'berpuasa') return false;

      // Filter by Level (SD, SMP, SMA, or SEMUA)
      const level = getStudentLevel(s.kelas);
      if (selectedSahurLevel !== 'SEMUA' && level !== selectedSahurLevel) {
        return false;
      }

      const matchClass = selectedClass === 'SEMUA' || s.kelas === selectedClass;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.nama.toLowerCase().includes(q) ||
        s.kelas.toLowerCase().includes(q) ||
        s.nik.includes(q);
      return matchClass && matchSearch;
    });
  }, [students, activeSession?.records, selectedSahurLevel, selectedClass, searchQuery]);

  // Filtered student list for Ceklist Berbuka (Fasting students)
  const fastingStudentsList = useMemo(() => {
    const records = activeSession?.records || {};
    return students.filter((s) => {
      const rec = records[s.id];
      if (rec?.status !== 'berpuasa') return false;

      // Filter by Level (SD, SMP, SMA, or SEMUA)
      const level = getStudentLevel(s.kelas);
      if (selectedBerbukaLevel !== 'SEMUA' && level !== selectedBerbukaLevel) {
        return false;
      }

      const matchClass = selectedClass === 'SEMUA' || s.kelas === selectedClass;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.nama.toLowerCase().includes(q) ||
        s.kelas.toLowerCase().includes(q) ||
        s.nik.includes(q);
      return matchClass && matchSearch;
    });
  }, [students, activeSession?.records, selectedBerbukaLevel, selectedClass, searchQuery]);

  // Filtered student list for Ceklist Makan Siang (Non-fasting students: status != 'berpuasa')
  const makanSiangStudentsList = useMemo(() => {
    const records = activeSession?.records || {};
    return students.filter((s) => {
      const rec = records[s.id];
      const isNonFasting = rec?.status !== 'berpuasa';
      if (!isNonFasting) return false;

      // Filter by Level (SD, SMP, SMA, or SEMUA)
      const level = getStudentLevel(s.kelas);
      if (selectedMakanSiangLevel !== 'SEMUA' && level !== selectedMakanSiangLevel) {
        return false;
      }

      const matchClass = selectedClass === 'SEMUA' || s.kelas === selectedClass;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.nama.toLowerCase().includes(q) ||
        s.kelas.toLowerCase().includes(q) ||
        s.nik.includes(q);
      return matchClass && matchSearch;
    });
  }, [students, activeSession?.records, selectedMakanSiangLevel, selectedClass, searchQuery]);

  // Toggle checklist item handlers
  const toggleSahurCheck = (id: number) => {
    setCheckedSahurIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleBerbukaCheck = (id: number) => {
    setCheckedBerbukaIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMakanSiangCheck = (id: number) => {
    setCheckedMakanSiangIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllSahur = () => {
    if (checkedSahurIds.size === sahurStudentsList.length) {
      setCheckedSahurIds(new Set());
    } else {
      setCheckedSahurIds(new Set(sahurStudentsList.map((s) => s.id)));
    }
  };

  const toggleAllBerbuka = () => {
    if (checkedBerbukaIds.size === fastingStudentsList.length) {
      setCheckedBerbukaIds(new Set());
    } else {
      setCheckedBerbukaIds(new Set(fastingStudentsList.map((s) => s.id)));
    }
  };

  const toggleAllMakanSiang = () => {
    if (checkedMakanSiangIds.size === makanSiangStudentsList.length) {
      setCheckedMakanSiangIds(new Set());
    } else {
      setCheckedMakanSiangIds(new Set(makanSiangStudentsList.map((s) => s.id)));
    }
  };

  return (
    <div className="space-y-2.5">
      {/* View Mode Navigation Tabs & Rekap Report Button */}
      <div className="bg-white p-1.5 rounded-xl border border-gray-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-1">
          {/* TAB SAHUR */}
          <button
            type="button"
            onClick={() => setActiveTab('sahur')}
            className={`flex-1 py-1.5 px-2 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'sahur'
                ? 'bg-indigo-950 text-white shadow-xs ring-1 ring-indigo-400/50'
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-950'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">Sahur</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-indigo-950 font-extrabold ml-0.5 shrink-0">
              {totalStats.berpuasa}
            </span>
          </button>

          {/* TAB BERBUKA */}
          <button
            type="button"
            onClick={() => setActiveTab('berbuka')}
            className={`flex-1 py-1.5 px-2 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'berbuka'
                ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400/50'
                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">Berbuka</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-emerald-950 font-extrabold ml-0.5 shrink-0">
              {totalStats.berpuasa}
            </span>
          </button>

          {/* TAB MAKAN SIANG */}
          <button
            type="button"
            onClick={() => setActiveTab('makan_siang')}
            className={`flex-1 py-1.5 px-2 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'makan_siang'
                ? 'bg-rose-700 text-white shadow-xs ring-1 ring-rose-500/50'
                : 'text-gray-600 hover:bg-rose-50 hover:text-rose-900'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            <span className="truncate">Makan Siang</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-900 font-extrabold ml-0.5 shrink-0">
              {totalStats.total - totalStats.berpuasa}
            </span>
          </button>
        </div>

        {/* Action Buttons: PDF & Logout */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="py-1.5 px-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer shrink-0 border border-emerald-700 hover:border-emerald-500"
            title="Cetak dan Unduh Laporan Rekapitulasi Puasa Lengkap"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">📄 Rekap PDF</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="py-1.5 px-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer shrink-0 border border-red-400"
              title="Keluar dari Akun"
            >
              <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CEKLIST SAHUR (DATA SISWA BERPUASA)               */}
      {/* ======================================================== */}
      {activeTab === 'sahur' && (
        <div className="space-y-2">
          {/* Slim Header Banner Sahur */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-2.5 sm:p-3 rounded-xl shadow-md border border-indigo-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 bg-amber-400 text-indigo-950 rounded-lg shadow-sm shrink-0">
                <Moon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-black text-xs sm:text-sm text-white truncate">
                    Ceklist Santap Sahur
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-indigo-800/80 text-amber-300 border border-indigo-600 shrink-0">
                    Siswa Berpuasa
                  </span>
                </div>
                <p className="text-[10.5px] text-indigo-200 truncate hidden sm:block">
                  Ceklis kehadiran & santap sahur santri sebelum imsak
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
              {/* DROPDOWN UNTUK MEMILIH SD, SMP, SMA PADA CEKLIST SAHUR */}
              <div className="flex items-center gap-1 bg-indigo-950/80 px-2 py-1 rounded-lg border border-indigo-600/50 shadow-inner">
                <span className="text-[11px] font-bold text-indigo-200 shrink-0">
                  Jenjang:
                </span>
                <select
                  value={selectedSahurLevel}
                  onChange={(e) => setSelectedSahurLevel(e.target.value as any)}
                  className="bg-white text-indigo-950 text-[11px] font-black px-2 py-0.5 rounded border border-amber-300 focus:outline-none cursor-pointer"
                >
                  <option value="SEMUA">Semua Jenjang</option>
                  <option value="SD">SD Saja</option>
                  <option value="SMP">SMP Saja</option>
                  <option value="SMA">SMA Saja</option>
                </select>
              </div>

              <button
                type="button"
                onClick={toggleAllSahur}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-900 hover:bg-indigo-800 text-indigo-100 border border-indigo-700 transition-all cursor-pointer flex items-center gap-1"
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {checkedSahurIds.size === sahurStudentsList.length
                    ? 'Reset'
                    : 'Centang Semua'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  generateSahurChecklistPdf(
                    students,
                    activeSession,
                    selectedSahurLevel,
                    user.name,
                    checkedSahurIds
                  )
                }
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-indigo-950 shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak ({selectedSahurLevel})</span>
              </button>
            </div>
          </div>

          {/* Slim Filter Bar & Progress Bar */}
          <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="text-xs font-bold text-gray-700">
                Tercentang Sahur:{' '}
                <span className="text-indigo-800 font-black">
                  {checkedSahurIds.size}
                </span>{' '}
                / {sahurStudentsList.length} Siswa ({selectedSahurLevel})
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="py-1 px-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              >
                <option value="SEMUA">Semua Kelas</option>
                {uniqueClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama..."
                  className="pl-7 pr-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Table List Sahur - Slim Dense Rows */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-indigo-950 text-white text-[10.5px] font-bold uppercase tracking-wider">
                    <th className="py-2 px-3 text-center w-10">Cek</th>
                    <th className="py-2 px-2.5 text-center w-8">No</th>
                    <th className="py-2 px-3">Nama Siswa</th>
                    <th className="py-2 px-2.5">Kelas</th>
                    <th className="py-2 px-2 text-center">L/P</th>
                    <th className="py-2 px-3 text-center">Status Amalan</th>
                    <th className="py-2 px-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {sahurStudentsList.map((s, idx) => {
                    const isChecked = checkedSahurIds.has(s.id);
                    const records = activeSession?.records || {};
                    const rec = records[s.id];

                    return (
                      <tr
                        key={s.id}
                        onClick={() => toggleSahurCheck(s.id)}
                        className={`cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-indigo-50/90 text-indigo-950 font-medium'
                            : 'hover:bg-gray-50 text-gray-800'
                        }`}
                      >
                        <td className="py-1 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSahurCheck(s.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-3.5 h-3.5 text-indigo-600 accent-indigo-600 rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-1 px-2.5 text-center font-mono text-[11px] text-gray-400">
                          {idx + 1}
                        </td>
                        <td className="py-1 px-3 font-bold text-gray-900">
                          <div className="flex items-center gap-1.5">
                            <span>{s.nama}</span>
                            {isChecked && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-indigo-700 text-white rounded font-bold">
                                Sahur ✓
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-1 px-2.5 font-semibold text-gray-600 text-[11px]">{s.kelas}</td>
                        <td className="py-1 px-2 text-center font-bold text-gray-500 text-[11px]">
                          {s.jenisKelamin === 'Perempuan' || s.jenisKelamin?.toLowerCase().startsWith('p') ? 'P' : 'L'}
                        </td>
                        <td className="py-1 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                            Berpuasa ✓
                          </span>
                        </td>
                        <td className="py-1 px-3 text-gray-500 italic text-[11px] truncate max-w-[150px]">
                          {rec?.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}

                  {sahurStudentsList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-xs text-gray-500">
                        Tidak ada siswa yang berpuasa/sahur untuk jenjang{' '}
                        <strong>{selectedSahurLevel}</strong> pada filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CEKLIST BERBUKA (DATA SISWA BERPUASA)             */}
      {/* ======================================================== */}
      {activeTab === 'berbuka' && (
        <div className="space-y-2">
          {/* Slim Header Banner Berbuka */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-2.5 sm:p-3 rounded-xl shadow-md border border-emerald-700 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 bg-amber-400 text-emerald-950 rounded-lg shadow-sm shrink-0">
                <Utensils className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-black text-xs sm:text-sm text-white truncate">
                    Ceklist Berbuka Puasa
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-700/80 text-amber-300 border border-emerald-600 shrink-0">
                    Siswa Berpuasa
                  </span>
                </div>
                <p className="text-[10.5px] text-emerald-200 truncate hidden sm:block">
                  Ceklis kehadiran siswa saat acara buka puasa bersama
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
              {/* DROPDOWN UNTUK MEMILIH SD, SMP, SMA PADA CEKLIST BERBUKA */}
              <div className="flex items-center gap-1 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/50 shadow-inner">
                <span className="text-[11px] font-bold text-emerald-200 shrink-0">
                  Jenjang:
                </span>
                <select
                  value={selectedBerbukaLevel}
                  onChange={(e) => setSelectedBerbukaLevel(e.target.value as any)}
                  className="bg-white text-emerald-950 text-[11px] font-black px-2 py-0.5 rounded border border-amber-300 focus:outline-none cursor-pointer"
                >
                  <option value="SEMUA">Semua Jenjang</option>
                  <option value="SD">SD Saja</option>
                  <option value="SMP">SMP Saja</option>
                  <option value="SMA">SMA Saja</option>
                </select>
              </div>

              <button
                type="button"
                onClick={toggleAllBerbuka}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-emerald-100 border border-emerald-500 transition-all cursor-pointer flex items-center gap-1"
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {checkedBerbukaIds.size === fastingStudentsList.length
                    ? 'Reset'
                    : 'Centang Semua'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  generateBerbukaChecklistPdf(
                    students,
                    activeSession,
                    selectedBerbukaLevel,
                    user.name
                  )
                }
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-emerald-950 shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak ({selectedBerbukaLevel})</span>
              </button>
            </div>
          </div>

          {/* Slim Filter Bar & Progress Bar */}
          <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="text-xs font-bold text-gray-700">
                Tercentang Berbuka:{' '}
                <span className="text-emerald-700 font-black">
                  {checkedBerbukaIds.size}
                </span>{' '}
                / {fastingStudentsList.length} Siswa ({selectedBerbukaLevel})
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="py-1 px-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="SEMUA">Semua Kelas</option>
                {uniqueClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama..."
                  className="pl-7 pr-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Table List Berbuka - Slim Dense Rows */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-emerald-900 text-white text-[10.5px] font-bold uppercase tracking-wider">
                    <th className="py-2 px-3 text-center w-10">Cek</th>
                    <th className="py-2 px-2.5 text-center w-8">No</th>
                    <th className="py-2 px-3">Nama Siswa</th>
                    <th className="py-2 px-2.5">Kelas</th>
                    <th className="py-2 px-2 text-center">L/P</th>
                    <th className="py-2 px-3 text-center">Status Amalan</th>
                    <th className="py-2 px-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {fastingStudentsList.map((s, idx) => {
                    const isChecked = checkedBerbukaIds.has(s.id);
                    const records = activeSession?.records || {};
                    const rec = records[s.id];

                    return (
                      <tr
                        key={s.id}
                        onClick={() => toggleBerbukaCheck(s.id)}
                        className={`cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-emerald-50/90 text-emerald-950 font-medium'
                            : 'hover:bg-gray-50 text-gray-800'
                        }`}
                      >
                        <td className="py-1 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleBerbukaCheck(s.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-3.5 h-3.5 text-emerald-600 accent-emerald-600 rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-1 px-2.5 text-center font-mono text-[11px] text-gray-400">
                          {idx + 1}
                        </td>
                        <td className="py-1 px-3 font-bold text-gray-900">
                          <div className="flex items-center gap-1.5">
                            <span>{s.nama}</span>
                            {isChecked && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-600 text-white rounded font-bold">
                                Berbuka ✓
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-1 px-2.5 font-semibold text-gray-600 text-[11px]">{s.kelas}</td>
                        <td className="py-1 px-2 text-center font-bold text-gray-500 text-[11px]">
                          {s.jenisKelamin === 'Perempuan' || s.jenisKelamin?.toLowerCase().startsWith('p') ? 'P' : 'L'}
                        </td>
                        <td className="py-1 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Berpuasa ✓
                          </span>
                        </td>
                        <td className="py-1 px-3 text-gray-500 italic text-[11px] truncate max-w-[150px]">
                          {rec?.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}

                  {fastingStudentsList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-xs text-gray-500">
                        Tidak ada siswa yang berpuasa untuk jenjang{' '}
                        <strong>{selectedBerbukaLevel}</strong> pada filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CEKLIST MAKAN SIANG (DATA SISWA TIDAK PUASA)      */}
      {/* ======================================================== */}
      {activeTab === 'makan_siang' && (
        <div className="space-y-2">
          {/* Slim Header Banner Makan Siang */}
          <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-pink-950 text-white p-2.5 sm:p-3 rounded-xl shadow-md border border-rose-700 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 bg-amber-400 text-rose-950 rounded-lg shadow-sm shrink-0">
                <Coffee className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-black text-xs sm:text-sm text-white truncate">
                    Ceklist Makan Siang
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-rose-800 text-rose-200 border border-rose-600 shrink-0">
                    Tidak Berpuasa / Halangan
                  </span>
                </div>
                <p className="text-[10.5px] text-rose-200 truncate hidden sm:block">
                  Sajian makan siang bagi anak berhalangan/tidak puasa
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
              {/* DROPDOWN UNTUK MEMILIH SD, SMP, SMA */}
              <div className="flex items-center gap-1 bg-rose-950/60 px-2 py-1 rounded-lg border border-rose-500/50 shadow-inner">
                <span className="text-[11px] font-bold text-rose-200 shrink-0">
                  Jenjang:
                </span>
                <select
                  value={selectedMakanSiangLevel}
                  onChange={(e) => setSelectedMakanSiangLevel(e.target.value as any)}
                  className="bg-white text-rose-950 text-[11px] font-black px-2 py-0.5 rounded border border-amber-300 focus:outline-none cursor-pointer"
                >
                  <option value="SEMUA">Semua Jenjang</option>
                  <option value="SD">SD Saja</option>
                  <option value="SMP">SMP Saja</option>
                  <option value="SMA">SMA Saja</option>
                </select>
              </div>

              <button
                type="button"
                onClick={toggleAllMakanSiang}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-800 hover:bg-rose-700 text-rose-100 border border-rose-600 transition-all cursor-pointer flex items-center gap-1"
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {checkedMakanSiangIds.size === makanSiangStudentsList.length
                    ? 'Reset'
                    : 'Centang Semua'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  generateMakanSiangChecklistPdf(
                    students,
                    activeSession,
                    selectedMakanSiangLevel,
                    user.name
                  )
                }
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-rose-950 shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak ({selectedMakanSiangLevel})</span>
              </button>
            </div>
          </div>

          {/* Slim Filter Bar & Info Bar */}
          <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="text-xs font-bold text-gray-700">
                Tercentang Makan Siang:{' '}
                <span className="text-rose-700 font-black">
                  {checkedMakanSiangIds.size}
                </span>{' '}
                / {makanSiangStudentsList.length} Siswa ({selectedMakanSiangLevel})
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="py-1 px-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600"
              >
                <option value="SEMUA">Semua Kelas</option>
                {uniqueClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama..."
                  className="pl-7 pr-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600"
                />
              </div>
            </div>
          </div>

          {/* Table List Makan Siang - Slim Dense Rows */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-rose-950 text-white text-[10.5px] font-bold uppercase tracking-wider">
                    <th className="py-2 px-3 text-center w-10">Cek</th>
                    <th className="py-2 px-2.5 text-center w-8">No</th>
                    <th className="py-2 px-3">Nama Siswa</th>
                    <th className="py-2 px-2.5">Kelas</th>
                    <th className="py-2 px-2 text-center">L/P</th>
                    <th className="py-2 px-3 text-center">Keterangan</th>
                    <th className="py-2 px-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {makanSiangStudentsList.map((s, idx) => {
                    const isChecked = checkedMakanSiangIds.has(s.id);
                    const records = activeSession?.records || {};
                    const rec = records[s.id];
                    const isHalangan = rec?.status === 'halangan';

                    return (
                      <tr
                        key={s.id}
                        onClick={() => toggleMakanSiangCheck(s.id)}
                        className={`cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-rose-50/90 text-rose-950 font-medium'
                            : 'hover:bg-gray-50 text-gray-800'
                        }`}
                      >
                        <td className="py-1 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleMakanSiangCheck(s.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-3.5 h-3.5 text-rose-600 accent-rose-600 rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-1 px-2.5 text-center font-mono text-[11px] text-gray-400">
                          {idx + 1}
                        </td>
                        <td className="py-1 px-3 font-bold text-gray-900">
                          <div className="flex items-center gap-1.5">
                            <span>{s.nama}</span>
                            {isChecked && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-rose-600 text-white rounded font-bold">
                                Makan ✓
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-1 px-2.5 font-semibold text-gray-600 text-[11px]">{s.kelas}</td>
                        <td className="py-1 px-2 text-center font-bold text-gray-500 text-[11px]">
                          {s.jenisKelamin === 'Perempuan' || s.jenisKelamin?.toLowerCase().startsWith('p') ? 'P' : 'L'}
                        </td>
                        <td className="py-1 px-3 text-center">
                          {isHalangan ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Halangan 🌙
                            </span>
                          ) : rec?.status === 'tidak_puasa' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              Tidak Puasa ✗
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100/80 text-rose-900 border border-rose-200">
                              Belum Input
                            </span>
                          )}
                        </td>
                        <td className="py-1 px-3 text-gray-500 italic text-[11px] truncate max-w-[150px]">
                          {rec?.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}

                  {makanSiangStudentsList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-xs text-gray-500">
                        Tidak ada siswa yang memerlukan makan siang untuk jenjang{' '}
                        <strong>{selectedMakanSiangLevel}</strong> pada filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Slim View Footer Note & Bottom Logout Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-200/80">
        <span className="text-[10.5px] text-slate-500">
          Ceklist Puasa Santri • SRT 1 Kediri
        </span>
        <div className="flex items-center gap-2.5">
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 transition-all flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Keluar dari Akun</span>
            </button>
          )}
          <div className="flex items-center gap-1 text-[10.5px] text-slate-500 font-medium">
            <span>Dibuat oleh</span>
            <span className="font-bold text-emerald-800">eccko developer</span>
          </div>
        </div>
      </div>

      {/* PDF Export Modal (Same robust rekap report as Penginput) */}
      {isPdfModalOpen && (
        <PdfExportModal
          students={students}
          session={activeSession}
          verifierName={user?.name || 'Petugas Pengecek'}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}
    </div>
  );
};
