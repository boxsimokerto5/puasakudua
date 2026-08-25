import React, { useState, useMemo } from 'react';
import { Student, FastingSession, UserSession } from '../types';
import {
  calculateAllStudentsImtaqStats,
  StudentImtaqStats,
  generateStudentImtaqReportPdf,
  generateImtaqCertificatePdf,
  generateBatchImtaqCertificatesPdf,
  generateCollectiveImtaqReportPdf,
} from '../utils/imtaqPdfGenerator';
import { getStudentLevel, formatDateIndoLong } from '../utils/pdfGenerator';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  Filter,
  Flame,
  GraduationCap,
  Layers,
  Medal,
  Printer,
  Search,
  Sparkles,
  Star,
  Trophy,
  User,
  Users,
  X,
  LogOut,
} from 'lucide-react';

interface RaportImtaqViewProps {
  students: Student[];
  sessions: Record<string, FastingSession>;
  user: UserSession;
  onLogout?: () => void;
}

export const RaportImtaqView: React.FC<RaportImtaqViewProps> = ({
  students,
  sessions,
  user,
  onLogout,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<'SEMUA' | 'SD' | 'SMP' | 'SMA'>('SEMUA');
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [selectedPredicate, setSelectedPredicate] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedStudentStats, setSelectedStudentStats] = useState<StudentImtaqStats | null>(null);

  // Custom Signature Names for PDF
  const [pembinaName, setPembinaName] = useState<string>(user.name || 'Wali Asuh / Pembina Ibadah');
  const [kepalaName, setKepalaName] = useState<string>('Kepala Asrama SRT 1 Kediri');

  // Calculate all Imtaq statistics
  const allImtaqStats = useMemo(() => {
    return calculateAllStudentsImtaqStats(students, sessions);
  }, [students, sessions]);

  // Unique Classes
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.kelas) set.add(s.kelas);
    });
    return Array.from(set).sort();
  }, [students]);

  // Filtered list based on controls
  const filteredStats = useMemo(() => {
    return allImtaqStats
      .filter((item) => {
        const lvl = getStudentLevel(item.student.kelas);
        if (selectedLevel !== 'SEMUA' && lvl !== selectedLevel) return false;
        if (selectedClass !== 'SEMUA' && item.student.kelas !== selectedClass) return false;
        if (selectedPredicate !== 'SEMUA' && !item.predicate.includes(selectedPredicate)) return false;

        const q = searchQuery.toLowerCase().trim();
        if (q) {
          const matchName = item.student.nama.toLowerCase().includes(q);
          const matchClass = item.student.kelas.toLowerCase().includes(q);
          const matchNik = item.student.nik?.toLowerCase().includes(q);
          if (!matchName && !matchClass && !matchNik) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort primarily by percentage descending, then by berpuasaCount descending, then by name
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        if (b.berpuasaCount !== a.berpuasaCount) return b.berpuasaCount - a.berpuasaCount;
        return a.student.nama.localeCompare(b.student.nama);
      });
  }, [allImtaqStats, selectedLevel, selectedClass, selectedPredicate, searchQuery]);

  // Global Aggregate Summary Stats
  const globalSummary = useMemo(() => {
    const totalSessions = Object.keys(sessions).length;
    const totalStudents = students.length;
    let mumtazCount = 0;
    let jayyidJiddanCount = 0;
    let jayyidCount = 0;
    let maqbulCount = 0;
    let totalPercentageSum = 0;
    let eligibleCertCount = 0;

    allImtaqStats.forEach((st) => {
      totalPercentageSum += st.percentage;
      if (st.predicate.startsWith('Mumtaz')) mumtazCount++;
      else if (st.predicate.startsWith('Jayyid Jiddan')) jayyidJiddanCount++;
      else if (st.predicate.startsWith('Jayyid')) jayyidCount++;
      else maqbulCount++;

      if (st.isEligibleForCertificate) eligibleCertCount++;
    });

    const avgPercentage =
      totalStudents > 0 ? Math.round((totalPercentageSum / totalStudents) * 10) / 10 : 0;

    return {
      totalSessions,
      totalStudents,
      avgPercentage,
      mumtazCount,
      jayyidJiddanCount,
      jayyidCount,
      maqbulCount,
      eligibleCertCount,
    };
  }, [sessions, students, allImtaqStats]);

  // Students eligible for batch certificates
  const eligibleStudents = useMemo(() => {
    return filteredStats.filter((st) => st.isEligibleForCertificate);
  }, [filteredStats]);

  const handlePrintBatchCertificates = () => {
    if (eligibleStudents.length === 0) {
      alert('Tidak ada santri yang berhak menerima piagam pada filter yang dipilih.');
      return;
    }
    generateBatchImtaqCertificatesPdf(eligibleStudents, pembinaName, kepalaName);
  };

  const handlePrintCollectiveReport = () => {
    generateCollectiveImtaqReportPdf(filteredStats, selectedLevel, pembinaName);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-700/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 p-2.5 flex items-center justify-center shadow-lg shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Raport Keimanan & Ketaqwaan
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-emerald-950 shadow-xs">
                Portofolio Imtaq
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-2xl">
              Akumulasi otomatis riwayat pembiasaan amalan puasa sunnah santri Sekolah Rakyat Terintegrasi 1 Kediri, lengkap dengan predikat ketaqwaan dan pencetakan piagam penghargaan resmi.
            </p>
          </div>
        </div>

        {/* Global Batch Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          <button
            type="button"
            onClick={handlePrintCollectiveReport}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/70 shadow-sm transition-all cursor-pointer flex items-center gap-2"
            title="Cetak Ringkasan Tabel Rekapitulasi Raport Seluruh Santri"
          >
            <Printer className="w-4 h-4 text-emerald-300" />
            <span>Cetak Rekap Raport</span>
          </button>

          <button
            type="button"
            onClick={handlePrintBatchCertificates}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 shadow-md transition-all cursor-pointer flex items-center gap-2"
            title="Cetak Piagam Santri Istiqomah sekaligus"
          >
            <Medal className="w-4 h-4" />
            <span>Cetak Semua Piagam ({eligibleStudents.length})</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 active:scale-95 text-white border border-red-400 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              title="Keluar dari Akun"
            >
              <LogOut className="w-4 h-4 text-white" />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Total Sesi */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sesi</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-gray-900">{globalSummary.totalSessions}</div>
            <div className="text-[11px] text-gray-500 font-medium">Kegiatan Terjadwal</div>
          </div>
        </div>

        {/* Card 2: Rata-rata Istiqomah */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rata-rata</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-700">{globalSummary.avgPercentage}%</div>
            <div className="text-[11px] text-gray-500 font-medium">Tingkat Keistiqomahan</div>
          </div>
        </div>

        {/* Card 3: Mumtaz (A) */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Mumtaz (A)</span>
            <Trophy className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-900">{globalSummary.mumtazCount}</div>
            <div className="text-[11px] text-emerald-700 font-medium">Sangat Istiqomah (&ge;85%)</div>
          </div>
        </div>

        {/* Card 4: Jayyid Jiddan (B+) */}
        <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-sky-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Jayyid Jiddan</span>
            <Medal className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-sky-900">{globalSummary.jayyidJiddanCount}</div>
            <div className="text-[11px] text-sky-700 font-medium">Istiqomah (70% - 84%)</div>
          </div>
        </div>

        {/* Card 5: Jayyid (B) */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Jayyid (B)</span>
            <Star className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-900">{globalSummary.jayyidCount}</div>
            <div className="text-[11px] text-amber-700 font-medium">Baik (50% - 69%)</div>
          </div>
        </div>

        {/* Card 6: Berhak Piagam */}
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-950/80">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Berhak Piagam</span>
            <Award className="w-4 h-4 text-emerald-950" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-950">{globalSummary.eligibleCertCount}</div>
            <div className="text-[11px] text-emerald-950/80 font-bold">Santri Layak Piagam</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Filter Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Level Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-xl border border-gray-200 text-xs">
            <GraduationCap className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-semibold text-gray-600">Jenjang:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="bg-transparent font-bold text-gray-900 focus:outline-none cursor-pointer"
            >
              <option value="SEMUA">Semua Jenjang</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-xl border border-gray-200 text-xs">
            <Layers className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-semibold text-gray-600">Kelas:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent font-bold text-gray-900 focus:outline-none cursor-pointer"
            >
              <option value="SEMUA">Semua Kelas</option>
              {uniqueClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Predicate Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-xl border border-gray-200 text-xs">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-gray-600">Predikat:</span>
            <select
              value={selectedPredicate}
              onChange={(e) => setSelectedPredicate(e.target.value)}
              className="bg-transparent font-bold text-gray-900 focus:outline-none cursor-pointer"
            >
              <option value="SEMUA">Semua Predikat</option>
              <option value="Mumtaz">Mumtaz (A / &ge;85%)</option>
              <option value="Jayyid Jiddan">Jayyid Jiddan (B+ / 70-84%)</option>
              <option value="Jayyid">Jayyid (B / 50-69%)</option>
              <option value="Maqbul">Maqbul (C / &lt;50%)</option>
            </select>
          </div>
        </div>

        {/* Right: Search & View Mode Switch */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari santri / NIK..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-emerald-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Tabel
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-emerald-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Kartu
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid of Students */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-950 text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-3 text-center w-12">Peringkat</th>
                  <th className="py-3.5 px-4">Nama Santri</th>
                  <th className="py-3.5 px-4">Kelas & Jenjang</th>
                  <th className="py-3.5 px-3 text-center">L/P</th>
                  <th className="py-3.5 px-4 text-center">Hari Puasa</th>
                  <th className="py-3.5 px-4 text-center">Udzur</th>
                  <th className="py-3.5 px-4">Tingkat Istiqomah</th>
                  <th className="py-3.5 px-4 text-center">Predikat Capaian</th>
                  <th className="py-3.5 px-4 text-center">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredStats.map((item, index) => {
                  const s = item.student;
                  const isTop3 = index < 3 && item.percentage > 0;

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-emerald-50/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudentStats(item)}
                    >
                      {/* Rank Index */}
                      <td className="py-3.5 px-3 text-center font-bold">
                        {isTop3 ? (
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black text-white shadow-xs ${
                              index === 0
                                ? 'bg-amber-500 ring-2 ring-amber-300'
                                : index === 1
                                ? 'bg-slate-400 ring-2 ring-slate-300'
                                : 'bg-amber-700 ring-2 ring-amber-600'
                            }`}
                          >
                            {index + 1}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-mono">#{index + 1}</span>
                        )}
                      </td>

                      {/* Name & NIK */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                          {s.nama}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          NIK: {s.nik || s.no}
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-700">{s.kelas}</span>
                        <span className="text-[10px] ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                          {getStudentLevel(s.kelas)}
                        </span>
                      </td>

                      {/* Gender */}
                      <td className="py-3.5 px-3 text-center font-bold text-gray-500">
                        {s.jenisKelamin === 'Perempuan' || s.jenisKelamin?.toLowerCase().startsWith('p')
                          ? 'P'
                          : 'L'}
                      </td>

                      {/* Hari Puasa */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-extrabold text-emerald-800 text-sm">
                          {item.berpuasaCount}
                        </span>{' '}
                        <span className="text-gray-400 text-[11px]">/ {item.totalSessions} hari</span>
                      </td>

                      {/* Udzur */}
                      <td className="py-3.5 px-4 text-center text-gray-500">
                        {item.halanganCount + item.tidakPuasaCount > 0 ? (
                          <span className="text-rose-600 font-bold">
                            {item.halanganCount + item.tidakPuasaCount} hari
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* Percentage & Progress Bar */}
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-gray-800">{item.percentage}%</span>
                          {item.streak > 1 && (
                            <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                              <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                              {item.streak}x berturut
                            </span>
                          )}
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.percentage >= 85
                                ? 'bg-emerald-500'
                                : item.percentage >= 70
                                ? 'bg-sky-500'
                                : item.percentage >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-400'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </td>

                      {/* Predicate Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                            item.predicate.startsWith('Mumtaz')
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : item.predicate.startsWith('Jayyid Jiddan')
                              ? 'bg-sky-100 text-sky-900 border-sky-300'
                              : item.predicate.startsWith('Jayyid')
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}
                        >
                          {item.predicate}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentStats(item)}
                            className="p-1.5 text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                            title="Buka Raport Lengkap"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => generateStudentImtaqReportPdf(item, pembinaName, kepalaName)}
                            className="px-2 py-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                            title="Download Raport PDF"
                          >
                            <Download className="w-3 h-3 text-emerald-700" />
                            <span>Raport</span>
                          </button>

                          {item.isEligibleForCertificate && (
                            <button
                              type="button"
                              onClick={() => generateImtaqCertificatePdf(item, pembinaName, kepalaName)}
                              className="px-2 py-1 text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                              title="Download Piagam Penghargaan PDF"
                            >
                              <Medal className="w-3 h-3 text-amber-700" />
                              <span>Piagam</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredStats.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      Tidak ada santri yang sesuai dengan kriteria filter atau pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStats.map((item, index) => {
            const s = item.student;
            const isTop3 = index < 3 && item.percentage > 0;

            return (
              <div
                key={s.id}
                onClick={() => setSelectedStudentStats(item)}
                className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {isTop3 ? (
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-black text-white flex items-center justify-center ${
                            index === 0
                              ? 'bg-amber-500'
                              : index === 1
                              ? 'bg-slate-400'
                              : 'bg-amber-700'
                          }`}
                        >
                          {index + 1}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-400 font-mono">
                          #{index + 1}
                        </span>
                      )}
                      <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                        {s.kelas}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        item.predicate.startsWith('Mumtaz')
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : item.predicate.startsWith('Jayyid Jiddan')
                          ? 'bg-sky-100 text-sky-900 border-sky-300'
                          : item.predicate.startsWith('Jayyid')
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                      }`}
                    >
                      {item.predicate}
                    </span>
                  </div>

                  {/* Student Name */}
                  <h4 className="text-base font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                    {s.nama}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">NIK: {s.nik || s.no}</p>

                  {/* Stats Mini Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Puasa</span>
                      <span className="text-sm font-black text-emerald-700">
                        {item.berpuasaCount}
                      </span>
                      <span className="text-[10px] text-gray-400">/{item.totalSessions}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Udzur</span>
                      <span className="text-sm font-black text-rose-600">
                        {item.halanganCount + item.tidakPuasaCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Konsistensi</span>
                      <span className="text-sm font-black text-indigo-700">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div
                  className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => generateStudentImtaqReportPdf(item, pembinaName, kepalaName)}
                    className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Raport PDF</span>
                  </button>

                  {item.isEligibleForCertificate && (
                    <button
                      type="button"
                      onClick={() => generateImtaqCertificatePdf(item, pembinaName, kepalaName)}
                      className="flex-1 py-1.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Medal className="w-3.5 h-3.5 text-amber-700" />
                      <span>Piagam PDF</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DETAIL RAPORT & RIWAYAT SESI INDIVIDUAL SANTRI    */}
      {/* ======================================================== */}
      {selectedStudentStats && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Portofolio & Raport Imtaq Santri
                  </h3>
                  <p className="text-xs text-emerald-200">
                    {selectedStudentStats.student.nama} ({selectedStudentStats.student.kelas})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentStats(null)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Profile Card & Predicate */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-black text-gray-900">
                    {selectedStudentStats.student.nama}
                  </h4>
                  <div className="flex items-center gap-3 text-gray-500 mt-1 font-medium">
                    <span>Kelas: <strong>{selectedStudentStats.student.kelas}</strong></span>
                    <span>•</span>
                    <span>NIK: <strong>{selectedStudentStats.student.nik || '-'}</strong></span>
                    <span>•</span>
                    <span>Jenjang: <strong>{getStudentLevel(selectedStudentStats.student.kelas)}</strong></span>
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <span
                    className={`inline-block px-3.5 py-1.5 rounded-xl text-xs font-black border ${
                      selectedStudentStats.predicate.startsWith('Mumtaz')
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : selectedStudentStats.predicate.startsWith('Jayyid Jiddan')
                        ? 'bg-sky-100 text-sky-900 border-sky-300'
                        : selectedStudentStats.predicate.startsWith('Jayyid')
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}
                  >
                    ★ {selectedStudentStats.predicate}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {selectedStudentStats.isEligibleForCertificate
                      ? '✓ Berhak Piagam Penghargaan'
                      : 'Dalam Proses Bimbingan'}
                  </p>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">Hari Puasa</span>
                  <span className="text-xl font-black text-emerald-900">
                    {selectedStudentStats.berpuasaCount} Hari
                  </span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">
                    dari {selectedStudentStats.totalSessions} sesi
                  </span>
                </div>

                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                  <span className="text-[10px] font-bold uppercase text-sky-800 block">Konsistensi</span>
                  <span className="text-xl font-black text-sky-900">
                    {selectedStudentStats.percentage}%
                  </span>
                  <span className="text-[10px] text-sky-700 block mt-0.5">
                    Tingkat Kehadiran
                  </span>
                </div>

                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-[10px] font-bold uppercase text-rose-800 block">Udzur/Halangan</span>
                  <span className="text-xl font-black text-rose-900">
                    {selectedStudentStats.halanganCount + selectedStudentStats.tidakPuasaCount} Hari
                  </span>
                  <span className="text-[10px] text-rose-700 block mt-0.5">
                    {selectedStudentStats.halanganCount} Halangan, {selectedStudentStats.tidakPuasaCount} Izin
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold uppercase text-amber-800 block">Rekor Istiqomah</span>
                  <span className="text-xl font-black text-amber-900">
                    {selectedStudentStats.streak} Sesi
                  </span>
                  <span className="text-[10px] text-amber-700 block mt-0.5">
                    Berturut-turut
                  </span>
                </div>
              </div>

              {/* Evaluation Note */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">
                  Catatan Pembiasaan Karakter & Adab:
                </span>
                <p className="text-slate-600 italic">
                  "{selectedStudentStats.predicateDescription}"
                </p>
              </div>

              {/* Session History Table */}
              <div>
                <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>Riwayat Presensi Per Sesi Kegiatan Puasa</span>
                </h5>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 text-[10px] uppercase font-bold">
                        <th className="py-2.5 px-3 text-center w-10">No</th>
                        <th className="py-2.5 px-3">Tanggal & Sesi</th>
                        <th className="py-2.5 px-3 text-center">Status Amalan</th>
                        <th className="py-2.5 px-3">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[11px]">
                      {selectedStudentStats.history.map((h, i) => (
                        <tr key={h.sessionId} className="hover:bg-gray-50">
                          <td className="py-2 px-3 text-center font-mono text-gray-400">{i + 1}</td>
                          <td className="py-2 px-3">
                            <span className="font-bold text-gray-800">{h.sessionTitle}</span>
                            <span className="text-gray-400 ml-1">({h.date})</span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {h.status === 'berpuasa' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                Berpuasa ✓
                              </span>
                            ) : h.status === 'halangan' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                Halangan / Udzur
                              </span>
                            ) : h.status === 'tidak_puasa' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                Tidak Puasa
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-gray-500 italic">{h.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Custom Signature Config */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
                <span className="font-bold text-gray-700 block">
                  Penandatangan Dokumen Cetak (Bisa disesuaikan):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">
                      Nama Pembina / Wali Asuh:
                    </label>
                    <input
                      type="text"
                      value={pembinaName}
                      onChange={(e) => setPembinaName(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">
                      Nama Kepala Asrama / Sekolah:
                    </label>
                    <input
                      type="text"
                      value={kepalaName}
                      onChange={(e) => setKepalaName(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Download Actions */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedStudentStats(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    generateStudentImtaqReportPdf(
                      selectedStudentStats,
                      pembinaName,
                      kepalaName
                    )
                  }
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-300" />
                  <span>Cetak Raport Imtaq (A4)</span>
                </button>

                {selectedStudentStats.isEligibleForCertificate && (
                  <button
                    type="button"
                    onClick={() =>
                      generateImtaqCertificatePdf(
                        selectedStudentStats,
                        pembinaName,
                        kepalaName
                      )
                    }
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Medal className="w-4 h-4" />
                    <span>Cetak Piagam Penghargaan</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
