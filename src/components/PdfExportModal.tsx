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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-800 text-emerald-200 rounded-xl border border-emerald-700/60">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Cetak & Unduh Laporan Rekapitulasi PDF</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-800 text-emerald-200 border border-emerald-700 font-semibold">
                  A4 Landscape / Portrait
                </span>
              </h3>
              <p className="text-xs text-emerald-200">
                Rekapitulasi amalan puasa per jenjang & gender (SD, SMP, SMA)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/80 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content / Printable Area */}
        <div className="p-6 overflow-y-auto space-y-6 print:p-0 print:overflow-visible">
          {/* Printable Report Sheet Layout */}
          <div
            id="printable-report-sheet"
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4 print:border-none print:shadow-none print:p-2 text-gray-900"
          >
            {/* Kop Header (Tanpa Jalan/Alamat) */}
            <div className="bg-emerald-900 text-white p-3 rounded-lg text-center space-y-0.5">
              <div className="flex items-center justify-center gap-2 font-black text-sm sm:text-base tracking-wide uppercase">
                <Building2 className="w-5 h-5 text-amber-300 shrink-0" />
                <span>SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI</span>
              </div>
              <p className="text-[11px] text-amber-200 font-medium tracking-wider">
                SISTEM INFORMASI PENCATATAN AMALAN PUASA SISWA (PUASAKU) - WALI ASUH
              </p>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center pt-1 pb-0.5 border-b-2 border-emerald-800">
              <h4 className="font-extrabold text-emerald-950 text-sm sm:text-base tracking-wide uppercase">
                LAPORAN REKAPITULASI SISWA BERPUASA
              </h4>
            </div>

            {/* Session Resume Info Grid */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <p className="text-gray-500 font-semibold uppercase text-[10px]">
                  Kegiatan / Sesi
                </p>
                <p className="font-bold text-gray-900 text-xs sm:text-sm">{session.title}</p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold uppercase text-[10px]">
                  Tanggal Input
                </p>
                <p className="font-bold text-gray-900 text-xs sm:text-sm">
                  {formatDateIndoLong(session.date)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold uppercase text-[10px]">
                  Total Berpuasa
                </p>
                <p className="font-bold text-emerald-900 text-xs sm:text-sm">
                  {breakdown.totalSemua.berpuasa} dari {students.length} Siswa ({breakdown.totalSemua.percentage}%)
                </p>
              </div>
            </div>

            {/* Tabel Horizontal Rekap Jumlah Berpuasa Saja */}
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                Rekapitulasi Jumlah Berpuasa Per Jenjang
              </p>
              <div className="overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-thin border border-gray-200 rounded-lg shadow-2xs">
                <table className="w-full min-w-[580px] text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-emerald-900 text-white font-bold text-[11px]">
                      <th colSpan={3} className="py-1.5 px-2 border-r border-emerald-800">SD</th>
                      <th colSpan={3} className="py-1.5 px-2 border-r border-emerald-800">SMP</th>
                      <th colSpan={3} className="py-1.5 px-2 border-r border-emerald-800">SMA</th>
                      <th rowSpan={2} className="py-1.5 px-3 bg-emerald-950 text-amber-300 font-extrabold border-l border-emerald-800 align-middle">
                        TOTAL SEMUA
                      </th>
                    </tr>
                    <tr className="bg-emerald-800 text-emerald-100 font-semibold text-[10px]">
                      <th className="py-1 px-1.5 border-r border-emerald-700">Putra</th>
                      <th className="py-1 px-1.5 border-r border-emerald-700">Putri</th>
                      <th className="py-1 px-1.5 bg-emerald-700 text-white font-bold border-r border-emerald-800">Jml SD</th>
                      <th className="py-1 px-1.5 border-r border-emerald-700">Putra</th>
                      <th className="py-1 px-1.5 border-r border-emerald-700">Putri</th>
                      <th className="py-1 px-1.5 bg-emerald-700 text-white font-bold border-r border-emerald-800">Jml SMP</th>
                      <th className="py-1 px-1.5 border-r border-emerald-700">Putra</th>
                      <th className="py-1 px-1.5 border-r border-emerald-700">Putri</th>
                      <th className="py-1 px-1.5 bg-emerald-700 text-white font-bold border-r border-emerald-800">Jml SMA</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white font-bold text-gray-900 text-xs">
                    <tr className="divide-x divide-gray-200">
                      <td className="py-2 px-1.5">{breakdown.sdPutra.berpuasa}</td>
                      <td className="py-2 px-1.5">{breakdown.sdPutri.berpuasa}</td>
                      <td className="py-2 px-1.5 bg-emerald-100 text-emerald-900">{breakdown.jumlahSd.berpuasa}</td>
                      <td className="py-2 px-1.5">{breakdown.smpPutra.berpuasa}</td>
                      <td className="py-2 px-1.5">{breakdown.smpPutri.berpuasa}</td>
                      <td className="py-2 px-1.5 bg-emerald-100 text-emerald-900">{breakdown.jumlahSmp.berpuasa}</td>
                      <td className="py-2 px-1.5">{breakdown.smaPutra.berpuasa}</td>
                      <td className="py-2 px-1.5">{breakdown.smaPutri.berpuasa}</td>
                      <td className="py-2 px-1.5 bg-emerald-100 text-emerald-900">{breakdown.jumlahSma.berpuasa}</td>
                      <td className="py-2 px-2 bg-emerald-950 text-amber-300 text-sm font-black">
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
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                      Daftar Nama Siswa Yang Berpuasa ({fastingList.length} Siswa)
                    </p>
                    <span className="text-[10px] text-gray-500 italic">
                      Susunan 2 Kolom Kompak
                    </span>
                  </div>

                  <div className="overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-thin border border-gray-200 rounded-lg shadow-2xs">
                    <table className="w-full min-w-[620px] text-xs text-left border-collapse">
                      <thead className="bg-emerald-900 text-white font-bold text-[10.5px]">
                        <tr className="divide-x divide-emerald-800">
                          <th className="py-1 px-2 text-center w-7">No</th>
                          <th className="py-1 px-2">Nama Siswa</th>
                          <th className="py-1 px-2 text-center w-16">Kelas</th>
                          <th className="py-1 px-2 text-center w-8">L/P</th>
                          <th className="py-1 px-2 text-center w-7">No</th>
                          <th className="py-1 px-2">Nama Siswa</th>
                          <th className="py-1 px-2 text-center w-16">Kelas</th>
                          <th className="py-1 px-2 text-center w-8">L/P</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white text-[11px]">
                        {fastingList.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-6 text-center text-gray-500 italic">
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
                                className={`divide-x divide-gray-100 ${
                                  i % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'
                                }`}
                              >
                                <td className="py-1 px-1.5 text-center font-medium text-gray-500">
                                  {i + 1}
                                </td>
                                <td className="py-1 px-2 font-bold text-gray-900 truncate max-w-[140px]">
                                  {left.nama}
                                </td>
                                <td className="py-1 px-1.5 text-center font-semibold text-emerald-800">
                                  {left.kelas}
                                </td>
                                <td className="py-1 px-1 text-center text-gray-600">
                                  {leftGender}
                                </td>

                                <td className="py-1 px-1.5 text-center font-medium text-gray-500">
                                  {right ? i + half + 1 : ''}
                                </td>
                                <td className="py-1 px-2 font-bold text-gray-900 truncate max-w-[140px]">
                                  {right ? right.nama : ''}
                                </td>
                                <td className="py-1 px-1.5 text-center font-semibold text-emerald-800">
                                  {right ? right.kelas : ''}
                                </td>
                                <td className="py-1 px-1 text-center text-gray-600">
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

            {/* Footer Sederhana: Didata oleh Wali Asuh (Tanpa Penanda Tangan) */}
            <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span className="font-semibold text-gray-700">
                Didata oleh Wali Asuh
              </span>
              <span className="text-[11px] text-gray-400">
                Sistem Informasi PUASAKU • SRT 1 Kediri
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Bar (Bottom Footer) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-500 font-medium text-center sm:text-left">
            Pilih metode ekspor: Unduh berkas <strong>.PDF</strong> atau Cetak langsung via browser.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Batal
            </button>

            <button
              onClick={handleBrowserPrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Browser / Simpan PDF</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File PDF (.pdf)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
