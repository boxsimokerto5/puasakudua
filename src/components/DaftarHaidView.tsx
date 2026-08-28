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
import { CrystalSnowEffect } from './CrystalSnowEffect';

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
    <div className="relative max-w-6xl mx-auto space-y-4 sm:space-y-5 animate-pink-fade-in animate-pink-aura p-2 sm:p-4 rounded-3xl bg-gradient-to-b from-[#fff5f8]/70 via-[#fef2f6]/50 to-[#fce7f3]/40">
      {/* Floating Soft Crystal Snow Effect */}
      <CrystalSnowEffect count={18} />

      {/* Header Banner - Sweet Soft Pink Theme */}
      <div className="relative z-10 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_25px_rgba(244,114,182,0.25)] border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-hidden">
        {/* Soft decorative background circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-pink-300/20 blur-lg pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 shrink-0 shadow-inner">
            <HeartPulse className="w-6 h-6 text-pink-50" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Daftar Santriwati Sedang Haid (Udzur Syar'i)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/25 text-pink-50 border border-white/30 backdrop-blur-xs shadow-2xs">
                {activeRecords.length} Aktif
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-pink-100/90 leading-tight mt-0.5">
              Pemantauan masa haid aktif, perhitungan hari berjalan fiqih, dan konfirmasi mandi suci.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex items-center gap-2 self-end sm:self-auto print:hidden">
          <button
            type="button"
            onClick={onNavigateToCatatHaid}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-white hover:bg-pink-50 text-pink-800 transition-all flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Catat Haid</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToDaftarSuci}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/90 hover:bg-emerald-500 text-white border border-emerald-300/40 transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Daftar Suci</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Cetak Rekapitulasi"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards - Soft Pastel Glow */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        <div className="bg-white/95 backdrop-blur-xs border border-pink-100 rounded-2xl p-3 sm:p-3.5 shadow-[0_4px_16px_rgba(244,114,182,0.06)]">
          <span className="text-[10px] font-bold text-pink-700 uppercase tracking-wider block">
            Total Sedang Haid
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.total}
            </span>
            <span className="text-[10px] text-slate-500">santriwati</span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xs border border-pink-100/80 rounded-2xl p-3 sm:p-3.5 shadow-[0_4px_16px_rgba(244,114,182,0.06)]">
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

        <div className="bg-white/95 backdrop-blur-xs border border-pink-100/80 rounded-2xl p-3 sm:p-3.5 shadow-[0_4px_16px_rgba(244,114,182,0.06)]">
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

        <div className="bg-white/95 backdrop-blur-xs border border-pink-100/80 rounded-2xl p-3 sm:p-3.5 shadow-[0_4px_16px_rgba(244,114,182,0.06)]">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
            Lanjutan (Hari 8-15)
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-rose-900">
              {stats.lanjutan}
            </span>
            <span className="text-[10px] text-slate-500">santriwati</span>
          </div>
        </div>

        <div className={`rounded-2xl p-3 sm:p-3.5 shadow-2xs border ${
          stats.istihadhah > 0
            ? 'bg-red-50/90 border-red-200 ring-1 ring-red-300'
            : 'bg-white/95 backdrop-blur-xs border-pink-100'
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

      {/* Filter & View Mode Bar - Soft Pastel */}
      <div className="relative z-10 bg-white/95 backdrop-blur-xs border border-pink-100 rounded-2xl p-3 shadow-[0_4px_16px_rgba(244,114,182,0.06)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none shrink-0"
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
              className="w-full pl-8 pr-3 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-400 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-pink-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'card'
                ? 'bg-pink-100 text-pink-800 border border-pink-300'
                : 'text-slate-500 hover:bg-pink-50'
            }`}
            title="Tampilan Kartu"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-pink-100 text-pink-800 border border-pink-300'
                : 'text-slate-500 hover:bg-pink-50'
            }`}
            title="Tampilan Tabel"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content: Card or Table View */}
      {filteredRecords.length === 0 ? (
        <div className="relative z-10 bg-white/95 backdrop-blur-xs border border-pink-100 rounded-2xl p-8 text-center space-y-2.5 shadow-[0_4px_16px_rgba(244,114,182,0.06)]">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <Sparkles className="w-6 h-6" />
          </div>
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
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
          {filteredRecords.map((record) => {
            const photo = getStudentPhoto(record.studentId);
            const fiqh = analyzeFiqhHaid(record.startDate);
            const progressPercent = Math.min(100, Math.round((fiqh.dayCount / 15) * 100));

            return (
              <div
                key={record.id}
                className={`bg-white/95 backdrop-blur-xs border rounded-2xl p-4 shadow-[0_4px_16px_rgba(244,114,182,0.06)] flex flex-col justify-between gap-3 transition-all hover:shadow-md ${
                  fiqh.isExceedingMax
                    ? 'border-red-300 bg-red-50/40 ring-1 ring-red-300'
                    : fiqh.dayCount >= 6 && fiqh.dayCount <= 7
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-pink-100 hover:border-pink-300'
                }`}
              >
                {/* Top Info */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {photo ? (
                        <img
                          src={photo}
                          alt={record.studentName}
                          className="w-10 h-10 rounded-full object-cover border border-pink-200 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center shrink-0 border border-pink-200">
                          {record.studentName.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate leading-tight">
                          {record.studentName}
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          {record.studentClass} • NIK: {record.studentNik || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Day Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 border uppercase tracking-wider ${fiqh.badgeBg} ${fiqh.badgeColor} ${fiqh.badgeBorder}`}
                    >
                      Hari ke-{fiqh.dayCount}
                    </span>
                  </div>

                  {/* Fiqh Progress Bar (Scale 1 to 15 days) */}
                  <div className="space-y-1 bg-pink-50/40 p-2.5 rounded-xl border border-pink-100">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-700">{fiqh.stageTitle}</span>
                      <span className="text-slate-500 font-medium">{fiqh.dayCount}/15 Hari</span>
                    </div>
                    <div className="w-full bg-pink-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          fiqh.isExceedingMax
                            ? 'bg-red-500'
                            : fiqh.dayCount >= 6
                            ? 'bg-amber-400'
                            : 'bg-gradient-to-r from-pink-500 to-rose-400'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Fiqh Details & Warning */}
                  <div className="space-y-1.5 text-[11px] text-slate-600">
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
                      <p className="text-[10px] text-slate-500 italic bg-pink-50/30 p-2 rounded-lg border border-pink-100">
                        💬 "{record.notes}"
                      </p>
                    )}

                    {/* Istihadhah Alert */}
                    {fiqh.isExceedingMax && (
                      <div className="p-2 rounded-xl bg-red-100 text-red-900 border border-red-200 text-[10px] font-medium leading-tight">
                        ⚠️ <strong>Istihadhah:</strong> Darah &gt;15 hari. Wajib mandi wajib dan thaharah sholat/puasa.
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Quick Action: Konfirmasi Selesai / Mandi Wajib */}
                <div className="pt-2.5 border-t border-pink-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetEditRecord(record);
                        setEditStartDate(record.startDate);
                        setEditNotes(record.notes || '');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 text-xs transition-colors cursor-pointer"
                      title="Edit Data"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteHaidRecord(record.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 text-xs transition-colors cursor-pointer"
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
                    className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
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
        <div className="relative z-10 bg-white/95 backdrop-blur-xs border border-pink-100 rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(244,114,182,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-pink-50/60 text-[11px] uppercase tracking-wider text-slate-600 border-b border-pink-100">
                <tr>
                  <th className="py-3 px-3.5">Santriwati</th>
                  <th className="py-3 px-3.5">Kelas</th>
                  <th className="py-3 px-3.5">Tanggal Mulai</th>
                  <th className="py-3 px-3.5">Hari Ke-</th>
                  <th className="py-3 px-3.5">Status Fiqih</th>
                  <th className="py-3 px-3.5">Catatan</th>
                  <th className="py-3 px-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filteredRecords.map((record) => {
                  const fiqh = analyzeFiqhHaid(record.startDate);
                  const photo = getStudentPhoto(record.studentId);

                  return (
                    <tr key={record.id} className="hover:bg-pink-50/40 transition-colors">
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2">
                          {photo ? (
                            <img
                              src={photo}
                              alt={record.studentName}
                              className="w-7 h-7 rounded-full object-cover border border-pink-200 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 font-bold text-[10px] flex items-center justify-center shrink-0 border border-pink-200">
                              {record.studentName.charAt(0)}
                            </div>
                          )}
                          <span className="font-bold text-slate-900">{record.studentName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-slate-600">{record.studentClass}</td>
                      <td className="py-2.5 px-3.5 font-semibold text-rose-700">
                        {record.startDate} {record.startTime && `(${record.startTime})`}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${fiqh.badgeBg} ${fiqh.badgeColor} border ${fiqh.badgeBorder}`}>
                          Hari {fiqh.dayCount}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="text-[11px] font-medium text-slate-700">
                          {fiqh.stageTitle}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[11px] text-slate-500 max-w-xs truncate">
                        {record.notes || '-'}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetFinishRecord(record);
                              setFinishDate(getTodayDateStr());
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mandi Wajib</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteHaidRecord(record.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-pink-100 space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
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

            <form onSubmit={handleConfirmFinish} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Mulai Haid: {targetFinishRecord.startDate}</span>
                  <span>Durasi: {calculateDaysBetween(targetFinishRecord.startDate, finishDate)} Hari</span>
                </div>
                <p className="text-[10px] text-emerald-800 leading-snug">
                  Setelah konfirmasi ini disimpan, status santriwati otomatis beralih ke <strong>Daftar Suci</strong> dan siap mengikuti ibadah puasa serta sholat.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                    Tanggal Bersih / Mandi:
                  </label>
                  <input
                    type="date"
                    value={finishDate}
                    onChange={(e) => setFinishDate(e.target.value)}
                    max={getTodayDateStr()}
                    className="w-full px-2.5 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-emerald-400 focus:outline-none"
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
                    className="w-full px-2.5 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-400 focus:outline-none"
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
                  className="w-full px-2.5 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setTargetFinishRecord(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-pink-50 border border-pink-200 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-pink-100 space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
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

            <form onSubmit={handleConfirmEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                  Tanggal Mulai Keluar Darah:
                </label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-pink-400 focus:outline-none"
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
                  className="w-full px-2.5 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setTargetEditRecord(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-pink-50 border border-pink-200 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
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
