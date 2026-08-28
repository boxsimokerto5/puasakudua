import React, { useState, useMemo } from 'react';
import { Student, HaidRecord } from '../types';
import {
  analyzeFiqhHaid,
  getTodayDateStr,
  calculateDaysBetween,
  FIQH_CONSTANTS,
} from '../utils/fiqhHaid';
import {
  HeartPulse,
  Search,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  Droplets,
  Plus,
  Sparkles,
  User,
  Trash2,
  Edit3,
  X,
  Printer,
  ShieldAlert,
  Info,
  CalendarDays,
  LayoutGrid,
  List,
  Sparkle,
} from 'lucide-react';
import { playScanSuccessSound } from '../utils/audioNotification';

interface DaftarHaidViewProps {
  students: Student[];
  haidRecords: HaidRecord[];
  currentUserName: string;
  onFinishHaid: (recordId: string, endDate: string, endTime: string, mandiNotes?: string) => void;
  onUpdateHaidRecord: (record: HaidRecord) => void;
  onDeleteHaidRecord: (recordId: string) => void;
  onNavigateToCatatHaid: () => void;
  onNavigateToDaftarSuci: () => void;
}

export const DaftarHaidView: React.FC<DaftarHaidViewProps> = ({
  students = [],
  haidRecords = [],
  currentUserName = '',
  onFinishHaid,
  onUpdateHaidRecord,
  onDeleteHaidRecord,
  onNavigateToCatatHaid,
  onNavigateToDaftarSuci,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Modal for finishing haid (Mandi Wajib)
  const [targetFinishRecord, setTargetFinishRecord] = useState<HaidRecord | null>(null);
  const [finishDate, setFinishDate] = useState<string>(getTodayDateStr());
  const [finishTime, setFinishTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [finishNotes, setFinishNotes] = useState<string>('Telah mandi besar/bersuci dan siap sholat/puasa');

  // Modal for editing record
  const [targetEditRecord, setTargetEditRecord] = useState<HaidRecord | null>(null);
  const [editStartDate, setEditStartDate] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Active Haid Records
  const activeRecords = useMemo(() => {
    return haidRecords.filter((r) => r.status === 'haid_aktif');
  }, [haidRecords]);

  // Unique Classes among female students
  const classes = useMemo(() => {
    const set = new Set<string>();
    activeRecords.forEach((r) => {
      if (r.studentClass) set.add(r.studentClass.trim());
    });
    return Array.from(set).sort();
  }, [activeRecords]);

  // Filtered Active Records
  const filteredRecords = useMemo(() => {
    return activeRecords.filter((r) => {
      const matchClass = selectedClass === 'SEMUA' || r.studentClass === selectedClass;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.studentName.toLowerCase().includes(q) ||
        r.studentNik.toLowerCase().includes(q) ||
        r.studentClass.toLowerCase().includes(q);
      return matchClass && matchSearch;
    });
  }, [activeRecords, selectedClass, searchQuery]);

  // Stats Breakdown
  const stats = useMemo(() => {
    let awal = 0;
    let normal = 0;
    let ghalib = 0;
    let lanjutan = 0;
    let istihadhah = 0;

    activeRecords.forEach((r) => {
      const fiqh = analyzeFiqhHaid(r.startDate);
      if (fiqh.isExceedingMax) {
        istihadhah++;
      } else if (fiqh.stage === 'awal') {
        awal++;
      } else if (fiqh.stage === 'ghalib') {
        ghalib++;
      } else if (fiqh.stage === 'lanjutan' || fiqh.stage === 'maksimal') {
        lanjutan++;
      } else {
        normal++;
      }
    });

    return {
      total: activeRecords.length,
      awal,
      normal,
      ghalib,
      lanjutan,
      istihadhah,
    };
  }, [activeRecords]);

  // Handle Finish Submit
  const handleConfirmFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFinishRecord) return;
    onFinishHaid(targetFinishRecord.id, finishDate, finishTime, finishNotes);
    playScanSuccessSound();
    setTargetFinishRecord(null);
  };

  // Handle Edit Submit
  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEditRecord) return;
    const updated: HaidRecord = {
      ...targetEditRecord,
      startDate: editStartDate,
      notes: editNotes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    onUpdateHaidRecord(updated);
    playScanSuccessSound();
    setTargetEditRecord(null);
  };

  // Helper to find student avatar
  const getStudentPhoto = (studentId: number) => {
    const s = students.find((st) => st.id === studentId);
    return s?.foto;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-3.5 sm:space-y-4 animate-in fade-in duration-200">
      {/* Header Banner - Slim, Compact & Proportional */}
      <div className="bg-gradient-to-r from-rose-800 via-pink-800 to-rose-900 text-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-sm border border-rose-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/25 shrink-0 shadow-inner">
            <HeartPulse className="w-5 h-5 text-rose-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Daftar Santriwati Sedang Haid (Udzur Syar'i)
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/40 text-rose-100 border border-rose-400/40">
                {activeRecords.length} Aktif
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-rose-200 leading-tight mt-0.5">
              Pemantauan masa haid aktif, perhitungan hari berjalan fiqih, dan konfirmasi mandi suci.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto print:hidden">
          <button
            type="button"
            onClick={onNavigateToCatatHaid}
            className="px-3 py-1.5 rounded-lg text-xs font-black bg-white hover:bg-rose-50 text-rose-900 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Catat Haid</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToDaftarSuci}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Daftar Suci</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-700 hover:bg-rose-600 text-white border border-rose-500/40 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            title="Cetak Rekapitulasi"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards - Slim, Compact, Tight Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        <div className="bg-white border border-rose-200 rounded-xl p-2.5 sm:p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
            Total Sedang Haid
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-rose-950">
              {stats.total}
            </span>
            <span className="text-[10px] text-slate-500">santriwati</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
            Masa Awal (Hari 1)
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.awal}
            </span>
            <span className="text-[10px] text-slate-500">santriwati</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            Ghalib (Hari 6-7)
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-amber-900">
              {stats.ghalib}
            </span>
            <span className="text-[10px] text-slate-500">pantau suci</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">
            Lanjutan (Hari 8-15)
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-orange-900">
              {stats.lanjutan}
            </span>
            <span className="text-[10px] text-slate-500">santriwati</span>
          </div>
        </div>

        <div className={`rounded-xl p-2.5 sm:p-3 shadow-2xs border ${
          stats.istihadhah > 0
            ? 'bg-red-50 border-red-300 ring-1 ring-red-400'
            : 'bg-white border-slate-200'
        }`}>
          <span className={`text-[10px] font-black uppercase tracking-wider block ${
            stats.istihadhah > 0 ? 'text-red-800' : 'text-slate-500'
          }`}>
            Istihadhah (&gt;15 Hari)
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-xl sm:text-2xl font-black ${
              stats.istihadhah > 0 ? 'text-red-950' : 'text-slate-700'
            }`}>
              {stats.istihadhah}
            </span>
            <span className="text-[10px] text-slate-500">{stats.istihadhah > 0 ? 'Wajib Mandi' : 'Aman'}</span>
          </div>
        </div>
      </div>

      {/* Filter & View Mode Bar - Slim */}
      <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none shrink-0"
          >
            <option value="SEMUA">Semua Kelas ({activeRecords.length})</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Cari santriwati haid..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-rose-500 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'card'
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="Tampilan Kartu"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="Tampilan Tabel"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content: Card or Table View */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-black text-slate-800">
            Alhamdulillah, Tidak Ada Santriwati Sedang Haid
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedClass !== 'SEMUA'
              ? 'Tidak ada santriwati yang sesuai dengan filter pencarian.'
              : 'Semua santriwati saat ini dalam keadaan suci dan siap mengikuti puasa serta sholat berjamaah.'}
          </p>
        </div>
      ) : viewMode === 'card' ? (
        /* CARD VIEW: Tight, Compact Bento Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {filteredRecords.map((record) => {
            const photo = getStudentPhoto(record.studentId);
            const fiqh = analyzeFiqhHaid(record.startDate);
            const progressPercent = Math.min(100, Math.round((fiqh.dayCount / 15) * 100));

            return (
              <div
                key={record.id}
                className={`bg-white border rounded-xl p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between gap-2.5 transition-all ${
                  fiqh.isExceedingMax
                    ? 'border-red-400 bg-red-50/30 ring-1 ring-red-300'
                    : fiqh.dayCount >= 6 && fiqh.dayCount <= 7
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200 hover:border-rose-300'
                }`}
              >
                {/* Top Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {photo ? (
                        <img
                          src={photo}
                          alt={record.studentName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {record.studentName.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate leading-tight">
                          {record.studentName}
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          {record.studentClass} • NIK: {record.studentNik || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Day Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 border uppercase tracking-wider ${fiqh.badgeBg} ${fiqh.badgeColor} ${fiqh.badgeBorder}`}
                    >
                      Hari ke-{fiqh.dayCount}
                    </span>
                  </div>

                  {/* Fiqh Progress Bar (Scale 1 to 15 days) */}
                  <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-150">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-700">{fiqh.stageTitle}</span>
                      <span className="text-slate-500 font-medium">{fiqh.dayCount}/15 Hari</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          fiqh.isExceedingMax
                            ? 'bg-red-600'
                            : fiqh.dayCount >= 6
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Fiqh Details & Warning */}
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Mulai:</span>
                      <span className="font-semibold text-slate-800">
                        {record.startDate} {record.startTime && `(${record.startTime})`}
                      </span>
                    </div>
                    {record.bloodColor && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Warna Darah:</span>
                        <span className="font-semibold capitalize text-slate-800">
                          {record.bloodColor}
                        </span>
                      </div>
                    )}
                    {record.notes && (
                      <p className="text-[10px] text-slate-500 italic bg-white p-1.5 rounded border border-slate-150">
                        💬 "{record.notes}"
                      </p>
                    )}

                    {/* Istihadhah Alert */}
                    {fiqh.isExceedingMax && (
                      <div className="p-1.5 rounded bg-red-100 text-red-900 border border-red-200 text-[10px] font-medium leading-tight">
                        ⚠️ <strong>Istihadhah:</strong> Darah &gt;15 hari. Wajib mandi wajib dan thaharah sholat/puasa.
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Quick Action: Konfirmasi Selesai / Mandi Wajib */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetEditRecord(record);
                        setEditStartDate(record.startDate);
                        setEditNotes(record.notes || '');
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
                      title="Edit Data"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteHaidRecord(record.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs transition-colors cursor-pointer"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetFinishRecord(record);
                      setFinishDate(getTodayDateStr());
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selesai & Mandi</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW: Compact, Slim rows */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Santriwati</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3">Tanggal Mulai</th>
                  <th className="py-2.5 px-3">Hari Ke-</th>
                  <th className="py-2.5 px-3">Status Fiqih</th>
                  <th className="py-2.5 px-3">Catatan</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => {
                  const fiqh = analyzeFiqhHaid(record.startDate);
                  const photo = getStudentPhoto(record.studentId);

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {photo ? (
                            <img
                              src={photo}
                              alt={record.studentName}
                              className="w-6 h-6 rounded-full object-cover border shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {record.studentName.charAt(0)}
                            </div>
                          )}
                          <span className="font-bold text-slate-900">{record.studentName}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-600">{record.studentClass}</td>
                      <td className="py-2 px-3 font-semibold text-rose-800">
                        {record.startDate} {record.startTime && `(${record.startTime})`}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${fiqh.badgeBg} ${fiqh.badgeColor} border ${fiqh.badgeBorder}`}>
                          Hari {fiqh.dayCount}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[11px] font-medium text-slate-700">
                          {fiqh.stageTitle}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-500 max-w-xs truncate">
                        {record.notes || '-'}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetFinishRecord(record);
                              setFinishDate(getTodayDateStr());
                            }}
                            className="px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mandi Wajib</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteHaidRecord(record.id)}
                            className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Selesai & Mandi Wajib */}
      {targetFinishRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Konfirmasi Selesai Haid & Mandi Wajib
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Santriwati: <strong>{targetFinishRecord.studentName}</strong> ({targetFinishRecord.studentClass})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTargetFinishRecord(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmFinish} className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Mulai Haid: {targetFinishRecord.startDate}</span>
                  <span>Durasi: {calculateDaysBetween(targetFinishRecord.startDate, finishDate)} Hari</span>
                </div>
                <p className="text-[10px] text-emerald-800 leading-snug">
                  Setelah konfirmasi ini disimpan, status santriwati otomatis beralih ke <strong>Daftar Suci</strong> dan siap mengikuti ibadah puasa serta sholat.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                    Tanggal Bersih / Mandi:
                  </label>
                  <input
                    type="date"
                    value={finishDate}
                    onChange={(e) => setFinishDate(e.target.value)}
                    max={getTodayDateStr()}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                    Jam Mandi:
                  </label>
                  <input
                    type="time"
                    value={finishTime}
                    onChange={(e) => setFinishTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                  Catatan Tambahan (Opsional):
                </label>
                <input
                  type="text"
                  value={finishNotes}
                  onChange={(e) => setFinishNotes(e.target.value)}
                  placeholder="Catatan..."
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTargetFinishRecord(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Suci & Mandi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Record */}
      {targetEditRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-black text-slate-900">
                Edit Catatan Haid: {targetEditRecord.studentName}
              </h3>
              <button
                type="button"
                onClick={() => setTargetEditRecord(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                  Tanggal Mulai Keluar Darah:
                </label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                  Catatan / Keluhan:
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTargetEditRecord(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
