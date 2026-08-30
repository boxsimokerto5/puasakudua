import React from 'react';
import { Student, FastingSession } from '../types';
import {
  computeFullBreakdown,
  downloadFastingReportPDF,
  formatDateIndoLong,
} from '../utils/pdfGenerator';
import {
  Printer,
  Download,
  X,
  FileText,
  CheckCircle2,
  Clock,
  Building2,
  Sparkles,
  Users,
} from 'lucide-react';

interface PdfExportModalProps {
  students: Student[];
  session: FastingSession;
  verifierName?: string;
  onClose: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  students,
  session,
  verifierName = 'Petugas Pengecek',
  onClose,
}) => {
  const breakdown = computeFullBreakdown(students, session);

  const handleDownloadPDF = () => {
    downloadFastingReportPDF(students, session, verifierName);
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-slate-50 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]">
        {/* Modal Header - Compact & Tight */}
        <div className="px-4 sm:px-5 py-3 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800/90 text-emerald-200 rounded-lg border border-emerald-700/60 shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2 leading-tight">
                <span>Cetak & Unduh Laporan Rekapitulasi PDF</span>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] bg-emerald-800 text-emerald-200 border border-emerald-700 font-semibold">
                  A4
                </span>
              </h3>
              <p className="text-[11px] text-emerald-200/90 leading-tight mt-0.5">
                Rekapitulasi amalan puasa per jenjang & gender (SD, SMP, SMA)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/80 rounded-lg transition-all cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content / Printable Area */}
        <div className="p-2.5 sm:p-4 overflow-y-auto space-y-3 bg-slate-100/70 smooth-scroll print:p-0 print:bg-white print:overflow-visible">
          {/* Printable Report Sheet Layout (Paper Preview) */}
          <div
            id="printable-report-sheet"
            className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 print:border-none print:shadow-none print:p-0 text-slate-900"
          >
            {/* Kop Header - Compact */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white px-3 py-2 rounded-lg text-center space-y-0.5 shadow-xs">
              <div className="flex items-center justify-center gap-1.5 font-black text-xs sm:text-sm tracking-wide uppercase">
                <Building2 className="w-4 h-4 text-amber-300 shrink-0" />
                <span>SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI</span>
              </div>
              <p className="text-[10px] sm:text-[10.5px] text-amber-200 font-medium tracking-wider">
                SISTEM INFORMASI PENCATATAN AMALAN PUASA SISWA (PUASAKU) - WALI ASUH
              </p>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center py-0.5 border-b-2 border-emerald-900">
              <h4 className="font-extrabold text-emerald-950 text-xs sm:text-sm tracking-wider uppercase">
                LAPORAN REKAPITULASI SISWA BERPUASA
              </h4>
            </div>

            {/* Session Resume Info Grid - Rapat & Rapi */}
            <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-lg p-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-white/80 rounded-md px-2.5 py-1.5 border border-emerald-100">
                <p className="text-slate-500 font-semibold uppercase text-[9.5px]">
                  Kegiatan / Sesi
                </p>
                <p className="font-bold text-slate-900 text-xs truncate" title={session.title}>
                  {session.title}
                </p>
              </div>
              <div className="bg-white/80 rounded-md px-2.5 py-1.5 border border-emerald-100">
                <p className="text-slate-500 font-semibold uppercase text-[9.5px]">
                  Tanggal Input
                </p>
                <p className="font-bold text-slate-900 text-xs">
                  {formatDateIndoLong(session.date)}
                </p>
              </div>
              <div className="bg-emerald-100/90 rounded-md px-2.5 py-1.5 border border-emerald-300/80">
                <p className="text-emerald-800 font-bold uppercase text-[9.5px]">
                  Total Berpuasa
                </p>
                <p className="font-black text-emerald-950 text-xs">
                  {breakdown.totalSemua.berpuasa} <span className="font-normal text-slate-600">dari</span> {students.length} Siswa{' '}
                  <span className="text-emerald-800">({breakdown.totalSemua.percentage}%)</span>
                </p>
              </div>
            </div>

            {/* Tabel Horizontal Rekap Jumlah Berpuasa Saja - Rapat & Rapi */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide">
                  Rekapitulasi Jumlah Berpuasa Per Jenjang
                </p>
              </div>
              <div className="overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-thin border border-slate-200 rounded-lg shadow-2xs">
                <table className="w-full min-w-[560px] text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-emerald-900 text-white font-bold text-[10.5px]">
                      <th colSpan={3} className="py-1 px-1.5 border-r border-emerald-800">SD</th>
                      <th colSpan={3} className="py-1 px-1.5 border-r border-emerald-800">SMP</th>
                      <th colSpan={3} className="py-1 px-1.5 border-r border-emerald-800">SMA</th>
                      <th rowSpan={2} className="py-1 px-2.5 bg-emerald-950 text-amber-300 font-black border-l border-emerald-800 align-middle text-[11px]">
                        TOTAL
                      </th>
                    </tr>
                    <tr className="bg-emerald-800 text-emerald-100 font-semibold text-[9.5px]">
                      <th className="py-0.5 px-1 border-r border-emerald-700">Putra</th>
                      <th className="py-0.5 px-1 border-r border-emerald-700">Putri</th>
                      <th className="py-0.5 px-1 bg-emerald-700 text-white font-bold border-r border-emerald-800">Jml SD</th>
                      <th className="py-0.5 px-1 border-r border-emerald-700">Putra</th>
                      <th className="py-0.5 px-1 border-r border-emerald-700">Putri</th>
                      <th className="py-0.5 px-1 bg-emerald-700 text-white font-bold border-r border-emerald-800">Jml SMP</th>
                      <th className="py-0.5 px-1 border-r border-emerald-700">Putra</th>
                      <th className="py-0.5 px-1 border-r border-emerald-700">Putri</th>
                      <th className="py-0.5 px-1 bg-emerald-700 text-white font-bold border-r border-emerald-800">Jml SMA</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white font-bold text-slate-800 text-xs">
                    <tr className="divide-x divide-slate-200">
                      <td className="py-1.5 px-1">{breakdown.sdPutra.berpuasa}</td>
                      <td className="py-1.5 px-1">{breakdown.sdPutri.berpuasa}</td>
                      <td className="py-1.5 px-1 bg-emerald-50 text-emerald-950 font-black">{breakdown.jumlahSd.berpuasa}</td>
                      <td className="py-1.5 px-1">{breakdown.smpPutra.berpuasa}</td>
                      <td className="py-1.5 px-1">{breakdown.smpPutri.berpuasa}</td>
                      <td className="py-1.5 px-1 bg-emerald-50 text-emerald-950 font-black">{breakdown.jumlahSmp.berpuasa}</td>
                      <td className="py-1.5 px-1">{breakdown.smaPutra.berpuasa}</td>
                      <td className="py-1.5 px-1">{breakdown.smaPutri.berpuasa}</td>
                      <td className="py-1.5 px-1 bg-emerald-50 text-emerald-950 font-black">{breakdown.jumlahSma.berpuasa}</td>
                      <td className="py-1.5 px-1.5 bg-emerald-950 text-amber-300 text-xs font-black">
                        {breakdown.totalSemua.berpuasa} Siswa
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daftar Nama Siswa yang Berpuasa (2 Kolom Rapat & Rapi) */}
            {(() => {
              const fastingList = students
                .filter((s) => session.records[s.id]?.status === 'berpuasa')
                .sort((a, b) => {
                  if (a.kelas !== b.kelas) return a.kelas.localeCompare(b.kelas);
                  return a.nama.localeCompare(b.nama);
                });

              const half = Math.ceil(fastingList.length / 2);

              return (
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide">
                      Daftar Nama Siswa Yang Berpuasa ({fastingList.length} Siswa)
                    </p>
                    <span className="text-[9.5px] text-slate-500 italic">
                      Susunan 2 Kolom Kompak
                    </span>
                  </div>

                  <div className="overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-thin border border-slate-200 rounded-lg shadow-2xs">
                    <table className="w-full min-w-[580px] text-xs text-left border-collapse">
                      <thead className="bg-emerald-900 text-white font-bold text-[10px]">
                        <tr className="divide-x divide-emerald-800">
                          <th className="py-1 px-1.5 text-center w-7">No</th>
                          <th className="py-1 px-2">Nama Siswa</th>
                          <th className="py-1 px-1.5 text-center w-14">Kelas</th>
                          <th className="py-1 px-1 text-center w-8">L/P</th>
                          <th className="py-1 px-1.5 text-center w-7 border-l-2 border-emerald-950">No</th>
                          <th className="py-1 px-2">Nama Siswa</th>
                          <th className="py-1 px-1.5 text-center w-14">Kelas</th>
                          <th className="py-1 px-1 text-center w-8">L/P</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-[10.5px]">
                        {fastingList.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-4 text-center text-slate-500 italic">
                              Tidak ada siswa yang berpuasa pada sesi ini.
                            </td>
                          </tr>
                        ) : (
                          Array.from({ length: half }).map((_, i) => {
                            const left = fastingList[i];
                            const right = fastingList[i + half];

                            const leftGender =
                              left.jenisKelamin === 'Perempuan' ||
                              left.jenisKelamin?.toLowerCase().startsWith('p')
                                ? 'P'
                                : 'L';
                            const rightGender = right
                              ? right.jenisKelamin === 'Perempuan' ||
                                right.jenisKelamin?.toLowerCase().startsWith('p')
                                ? 'P'
                                : 'L'
                              : '';

                            return (
                              <tr
                                key={`row-${i}`}
                                className={`divide-x divide-slate-100 ${
                                  i % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                                } hover:bg-emerald-50/40 transition-colors`}
                              >
                                <td className="py-1 px-1 text-center font-medium text-slate-500">
                                  {i + 1}
                                </td>
                                <td className="py-1 px-2 font-bold text-slate-900 truncate max-w-[130px] sm:max-w-[160px]">
                                  {left.nama}
                                </td>
                                <td className="py-1 px-1.5 text-center font-bold text-emerald-800">
                                  {left.kelas}
                                </td>
                                <td className="py-1 px-1 text-center text-slate-600 font-medium">
                                  {leftGender}
                                </td>

                                <td className="py-1 px-1 text-center font-medium text-slate-500 border-l-2 border-slate-200">
                                  {right ? i + half + 1 : ''}
                                </td>
                                <td className="py-1 px-2 font-bold text-slate-900 truncate max-w-[130px] sm:max-w-[160px]">
                                  {right ? right.nama : ''}
                                </td>
                                <td className="py-1 px-1.5 text-center font-bold text-emerald-800">
                                  {right ? right.kelas : ''}
                                </td>
                                <td className="py-1 px-1 text-center text-slate-600 font-medium">
                                  {right ? rightGender : ''}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Footer Sederhana: Didata oleh Wali Asuh - Rapat & Rapi */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">
                Didata oleh Wali Asuh
              </span>
              <span className="text-[10px] text-slate-400">
                Sistem Informasi PUASAKU • SRT 1 Kediri
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Bar (Bottom Footer) - Compact & Rapi */}
        <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="text-[11px] text-slate-500 font-medium text-center sm:text-left">
            Pilih opsi ekspor: Unduh berkas <strong>.PDF</strong> atau Cetak langsung via browser.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Tutup
            </button>

            <button
              onClick={handleBrowserPrint}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Browser</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
