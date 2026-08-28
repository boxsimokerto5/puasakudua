import React, { useState, useMemo } from 'react';
import { Student, HaidRecord } from '../types';
import {
  calculateSuciDaysForStudent,
  analyzeFiqhHaid,
  getTodayDateStr,
  FIQH_CONSTANTS,
  SuciInfo,
} from '../utils/fiqhHaid';
import {
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  Droplets,
  Plus,
  HeartPulse,
  User,
  History,
  Printer,
  ChevronRight,
  Info,
  ShieldCheck,
  LayoutGrid,
  List,
  X,
  BookOpen,
  AlertTriangle,
  ShieldAlert,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';

interface DaftarSuciViewProps {
  students?: Student[];
  haidRecords?: HaidRecord[];
  onNavigateToCatatHaid: (preselectedStudent?: Student) => void;
  onNavigateToDaftarHaid: () => void;
}

interface MonitoredSuciStudent {
  student: Student;
  latestRecord: HaidRecord;
  suciInfo: SuciInfo;
}

export const DaftarSuciView: React.FC<DaftarSuciViewProps> = ({
  students = [],
  haidRecords = [],
  onNavigateToCatatHaid,
  onNavigateToDaftarHaid,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);

  // Female Students map
  const femaleStudentsMap = useMemo(() => {
    const map = new Map<number, Student>();
    students.forEach((s) => {
      if (s.jenisKelamin === 'Perempuan') {
        map.set(s.id, s);
      }
    });
    return map;
  }, [students]);

  // Active Haid student IDs
  const activeHaidStudentIds = useMemo(() => {
    const set = new Set<number>();
    haidRecords.forEach((r) => {
      if (r.status === 'haid_aktif') {
        set.add(r.studentId);
      }
    });
    return set;
  }, [haidRecords]);

  // Monitored Suci Students:
  // ONLY students who have a completed haid record (status === 'selesai_mandi')
  // and are not currently active in another haid.
  const monitoredSuciStudents = useMemo<MonitoredSuciStudent[]>(() => {
    const list: MonitoredSuciStudent[] = [];
    const processedStudentIds = new Set<number>();

    // Sort haidRecords by latest completed date
    const completedRecords = haidRecords
      .filter((r) => r.status === 'selesai_mandi' && r.endDate)
      .sort((a, b) => new Date(b.endDate || b.startDate).getTime() - new Date(a.endDate || a.startDate).getTime());

    completedRecords.forEach((record) => {
      if (processedStudentIds.has(record.studentId)) return;
      if (activeHaidStudentIds.has(record.studentId)) return; // Currently active haid

      const student = femaleStudentsMap.get(record.studentId) || {
        id: record.studentId,
        nama: record.studentName,
        kelas: record.studentClass,
        nik: record.studentNik || '',
        jenisKelamin: 'Perempuan' as const,
      };

      const suciInfo = calculateSuciDaysForStudent(record.studentId, haidRecords);

      list.push({
        student,
        latestRecord: record,
        suciInfo,
      });

      processedStudentIds.add(record.studentId);
    });

    return list;
  }, [haidRecords, activeHaidStudentIds, femaleStudentsMap]);

  // Classes among monitored students
  const classes = useMemo(() => {
    const set = new Set<string>();
    monitoredSuciStudents.forEach((item) => {
      if (item.student.kelas) set.add(item.student.kelas.trim());
    });
    return Array.from(set).sort();
  }, [monitoredSuciStudents]);

  // Filtered Monitored Students
  const filteredMonitoredStudents = useMemo(() => {
    return monitoredSuciStudents.filter((item) => {
      const { student } = item;
      const matchClass = selectedClass === 'SEMUA' || student.kelas === selectedClass;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        student.nama.toLowerCase().includes(q) ||
        student.nik.toLowerCase().includes(q) ||
        student.kelas.toLowerCase().includes(q);
      return matchClass && matchSearch;
    });
  }, [monitoredSuciStudents, selectedClass, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => {
    let under15Days = 0; // Masa suci minimal berjalan (1-14 hari) -> Belum sah haid baru
    let eligibleNewHaid = 0; // >= 15 hari -> Sah haid baru

    monitoredSuciStudents.forEach((item) => {
      if (item.suciInfo.isEligibleNewHaid) {
        eligibleNewHaid++;
      } else {
        under15Days++;
      }
    });

    return {
      totalMonitored: monitoredSuciStudents.length,
      totalActiveHaid: activeHaidStudentIds.size,
      under15Days,
      eligibleNewHaid,
    };
  }, [monitoredSuciStudents, activeHaidStudentIds]);

  // Student Haid History
  const studentHistoryRecords = useMemo(() => {
    if (!selectedStudentForHistory) return [];
    return haidRecords
      .filter((r) => r.studentId === selectedStudentForHistory.id)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [selectedStudentForHistory, haidRecords]);

  return (
    <div className="max-w-6xl mx-auto space-y-3.5 sm:space-y-4 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-sm border border-emerald-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/25 shrink-0 shadow-inner">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Daftar Santriwati Suci & Siap Ibadah
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/40 text-emerald-100 border border-emerald-400/40">
                {monitoredSuciStudents.length} Santriwati Terpantau
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-200 leading-tight mt-0.5">
              Pemantauan masa suci syar'i pasca haid (Hari ke-1 s.d. 15+) untuk memastikan kejujuran & keabsahan ibadah.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto print:hidden">
          <button
            type="button"
            onClick={() => onNavigateToCatatHaid()}
            className="px-3 py-1.5 rounded-lg text-xs font-black bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Catat Haid</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToDaftarHaid}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/40 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-300" />
            <span>Daftar Haid ({activeHaidStudentIds.size})</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-teal-700 hover:bg-teal-600 text-white border border-teal-500/40 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            title="Cetak Daftar Suci"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="bg-white border border-emerald-200 rounded-xl p-2.5 sm:p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Terpantau Dalam Masa Suci
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-950">
              {stats.totalMonitored}
            </span>
            <span className="text-[10px] text-slate-500">santriwati</span>
          </div>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-2.5 sm:p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Masa Suci 1 - 14 Hari
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-amber-950">
              {stats.under15Days}
            </span>
            <span className="text-[10px] text-amber-700 font-semibold">(Belum Sah Haid Baru)</span>
          </div>
        </div>

        <div className="bg-white border border-teal-200 rounded-xl p-2.5 sm:p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
            Masa Suci &ge;15 Hari
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-teal-950">
              {stats.eligibleNewHaid}
            </span>
            <span className="text-[10px] text-teal-700 font-semibold">(Sah Haid Baru)</span>
          </div>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-2.5 sm:p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
            Sedang Udzur Haid
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-rose-950">
              {stats.totalActiveHaid}
            </span>
            <span className="text-[10px] text-slate-500">santriwati</span>
          </div>
        </div>
      </div>

      {/* Fiqh Rule Explanatory Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-950 flex items-start gap-2.5 shadow-2xs">
        <BookOpen className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="font-bold text-emerald-900">
            Kaidah Fiqih Syafi'i (Aqallu ath-Thuhr & Pencegahan Alasan Palsu):
          </strong>
          <p className="text-[11px] text-emerald-800 leading-snug">
            Masa minimal suci antara dua haid adalah <strong>15 hari 15 malam</strong>. Jika santriwati baru berada di masa suci 1–14 hari lalu melapor haid lagi, darah tersebut dihukumi <strong>Darah Istihadhah (Penyakit) atau Terindikasi Alasan Palsu</strong>. Siswi wajib tetap sholat & berpuasa.
          </p>
        </div>
      </div>

      {/* Filter & View Mode Bar */}
      {monitoredSuciStudents.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none shrink-0"
            >
              <option value="SEMUA">Semua Kelas ({monitoredSuciStudents.length})</option>
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
                placeholder="Cari santriwati suci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
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
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
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
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {monitoredSuciStudents.length === 0 ? (
        /* DEDICATED EMPTY STATE ACCORDING TO USER SPECIFICATION */
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-2xs max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Halaman Daftar Suci Saat Ini Kosong
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Belum ada santriwati yang menyelesaikan masa haid atau dikonfirmasi bersuci oleh petugas/ustadzah.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 space-y-2 max-w-lg mx-auto">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Sistem Proteksi Anti-Kebohongan Fiqih:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
              <li>
                Santriwati akan otomatis masuk ke daftar pemantauan ini <strong>hanya setelah menyelesaikan haid</strong> (dikonfirmasi mandi wajib oleh petugas atau setelah melewati batas maksimal haid 15 hari).
              </li>
              <li>
                Sistem akan menghitung waktu suci mulai dari <strong>Hari ke-1, Hari ke-2, hingga Hari ke-15+</strong>.
              </li>
              <li>
                Jika santriwati yang baru berstatus suci <strong>1–14 hari</strong> mencoba diinput haid lagi, sistem akan langsung menandai peringatan <strong>Terindikasi Alasan Palsu / Istihadhah</strong>.
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => onNavigateToCatatHaid()}
              className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 active:scale-98 text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Haid Santriwati</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToDaftarHaid}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span>Lihat Daftar Haid Aktif ({activeHaidStudentIds.size})</span>
            </button>
          </div>
        </div>
      ) : filteredMonitoredStudents.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-black text-slate-800">
            Santriwati Tidak Ditemukan
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada santriwati yang cocok dengan filter atau kata kunci pencarian.
          </p>
        </div>
      ) : viewMode === 'card' ? (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {filteredMonitoredStudents.map(({ student, latestRecord, suciInfo }) => {
            const isUnder15 = suciInfo.isUnder15Days;

            return (
              <div
                key={student.id}
                className={`bg-white border rounded-xl p-3.5 shadow-2xs flex flex-col justify-between gap-3 transition-all ${
                  isUnder15
                    ? 'border-amber-200 hover:border-amber-400'
                    : 'border-emerald-200 hover:border-emerald-400'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Header Student Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {student.foto ? (
                        <img
                          src={student.foto}
                          alt={student.nama}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {student.nama.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate leading-tight">
                          {student.nama}
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          {student.kelas} • NIK: {student.nik || '-'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 border uppercase tracking-wider flex items-center gap-1 ${
                        isUnder15
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Suci</span>
                    </span>
                  </div>

                  {/* Realtime Purity Day Counter Box */}
                  <div
                    className={`p-2.5 rounded-xl border space-y-2 ${
                      isUnder15
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-emerald-50/70 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        Penghitung Masa Suci:
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-black shadow-2xs ${
                          isUnder15
                            ? 'bg-amber-500 text-amber-950 ring-1 ring-amber-400'
                            : 'bg-emerald-600 text-white ring-1 ring-emerald-400'
                        }`}
                      >
                        Hari ke-{suciInfo.days} Suci
                      </span>
                    </div>

                    {/* Progress Bar towards 15 days */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>Progres Masa Minimal Suci:</span>
                        <strong className="font-bold text-slate-900">
                          {Math.min(15, suciInfo.days)} / 15 Hari
                        </strong>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isUnder15 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (suciInfo.days / 15) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Completion Details */}
                    <div className="text-[10px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-200/70">
                      <div className="flex justify-between">
                        <span>Tanggal Selesai Mandi:</span>
                        <span className="font-semibold text-slate-800">{latestRecord.endDate || '-'} {latestRecord.endTime || ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Petugas Verifikasi:</span>
                        <span className="font-semibold text-slate-800">{latestRecord.recordedBy || 'Ustadzah'}</span>
                      </div>
                    </div>

                    {/* Fiqh Ruling & Anti-Lie Protection Status */}
                    <div className="pt-1 text-[10px] leading-snug">
                      {isUnder15 ? (
                        <div className="p-1.5 rounded-lg bg-amber-100/70 border border-amber-300/80 text-amber-900 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold">Masa Suci Berjalan ({suciInfo.days} Hari):</strong> Kurang <strong>{suciInfo.remainingSuciDays} hari lagi</strong> untuk sah haid baru. Jika melapor haid sekarang, terindikasi alasan palsu / istihadhah.
                          </div>
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-emerald-100/70 border border-emerald-300/80 text-emerald-900 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold">Masa Suci Sempurna ({suciInfo.days} Hari):</strong> Telah melampaui batas minimal 15 hari suci syar'i. Sah dinyatakan haid baru jika nanti keluar darah.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForHistory(student)}
                    className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Riwayat Siklus</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToCatatHaid(student)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 shadow-2xs cursor-pointer ${
                      isUnder15
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    <Droplets className="w-3.5 h-3.5" />
                    <span>Catat Haid Baru</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Santriwati</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3">Penghitung Suci</th>
                  <th className="py-2.5 px-3">Tanggal Selesai Mandi</th>
                  <th className="py-2.5 px-3">Status Fiqih Syar'i</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMonitoredStudents.map(({ student, latestRecord, suciInfo }) => {
                  const isUnder15 = suciInfo.isUnder15Days;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {student.foto ? (
                            <img
                              src={student.foto}
                              alt={student.nama}
                              className="w-7 h-7 rounded-full object-cover border shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {student.nama.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 block">{student.nama}</span>
                            <span className="text-[10px] text-slate-500">NIK: {student.nik || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-600">{student.kelas}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-black inline-block ${
                            isUnder15
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          Hari ke-{suciInfo.days} Suci
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-700">
                        <div className="font-semibold">{latestRecord.endDate || '-'}</div>
                        <div className="text-[10px] text-slate-500">Oleh: {latestRecord.recordedBy || 'Ustadzah'}</div>
                      </td>
                      <td className="py-2 px-3 text-[11px]">
                        {isUnder15 ? (
                          <div className="text-amber-800 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Masa Suci Berjalan (&lt;15 Hari) • Kurang {suciInfo.remainingSuciDays} hr</span>
                          </div>
                        ) : (
                          <div className="text-emerald-800 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Masa Suci Sempurna (&ge;15 Hari) • Sah haid baru</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForHistory(student)}
                            className="px-2 py-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-[11px] font-bold"
                          >
                            Riwayat
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigateToCatatHaid(student)}
                            className="px-2 py-1 rounded text-xs font-black bg-rose-600 hover:bg-rose-700 text-white"
                          >
                            Catat Haid
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

      {/* Modal: Riwayat Siklus Haid & Suci Santriwati */}
      {selectedStudentForHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Riwayat Siklus Haid & Suci
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedStudentForHistory.nama} ({selectedStudentForHistory.kelas})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForHistory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {studentHistoryRecords.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 italic">
                Belum ada rekam catatan haid terdahulu untuk santriwati ini.
              </div>
            ) : (
              <div className="space-y-2">
                {studentHistoryRecords.map((r) => {
                  const fiqh = analyzeFiqhHaid(r.startDate, r.endDate, r.status);
                  return (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-rose-600" />
                          {r.startDate} s.d. {r.endDate || 'Sekarang'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            r.status === 'selesai_mandi'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.status === 'selesai_mandi' ? 'Selesai & Mandi' : 'Sedang Haid'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                        <div>
                          <span>Durasi: </span>
                          <strong className="text-slate-900">{fiqh.dayCount} Hari</strong>
                        </div>
                        <div>
                          <span>Warna: </span>
                          <strong className="capitalize text-slate-900">{r.bloodColor || '-'}</strong>
                        </div>
                      </div>

                      {r.notes && (
                        <p className="text-[11px] text-slate-600 italic bg-white p-1.5 rounded border border-slate-200">
                          Catatan: {r.notes}
                        </p>
                      )}

                      <div className="text-[10px] text-slate-500 pt-1 flex justify-between border-t border-slate-200">
                        <span>Pencatat: {r.recordedBy}</span>
                        <span>Update: {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('id-ID') : '-'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentForHistory(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
