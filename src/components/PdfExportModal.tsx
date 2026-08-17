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
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5 print:border-none print:shadow-none print:p-0"
          >
            {/* Kop Surat / Letterhead */}
            <div className="border-b-2 border-emerald-900 pb-4 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-emerald-950 font-black text-lg sm:text-xl uppercase tracking-wide">
                <Building2 className="w-6 h-6 text-emerald-800 shrink-0" />
                <span>SEKOLAH RAKYAT KABUPATEN KEDIRI</span>
              </div>
              <h4 className="font-bold text-gray-800 text-sm sm:text-base">
                LAPORAN REKAPITULASI AMALAN PUASA SISWA
              </h4>
              <p className="text-xs text-gray-500">
                Jl. Raya Kediri - Nganjuk, Kediri, Jawa Timur | Sistem Informasi Kedisiplinan & Amalan
              </p>
            </div>

            {/* Session Details Info Grid */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-gray-500 font-semibold uppercase text-[10px]">
                  Judul Kegiatan
                </p>
                <p className="font-bold text-gray-900 text-sm">{session.title}</p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold uppercase text-[10px]">
                  Tanggal Pelaksanaan
                </p>
                <p className="font-bold text-gray-900 text-sm">
                  {formatDateIndoLong(session.date)} ({session.date})
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold uppercase text-[10px]">
                  Status Verifikasi
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {session.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-lg text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Terverifikasi ({session.verifiedBy || verifierName})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-lg text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      Belum Diverifikasi
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Breakdown Table (Exact Order Requested) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>Rekapitulasi Jumlah Siswa Berpuasa (SD, SMP, SMA)</span>
                </h5>
                <span className="text-xs text-gray-500 italic">
                  Total {students.length} Siswa Terdaftar
                </span>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-2xs">
                <table className="w-full text-xs text-left divide-y divide-gray-200">
                  <thead className="bg-emerald-900 text-white font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">No</th>
                      <th className="py-2.5 px-3">Kategori Jenjang & Gender</th>
                      <th className="py-2.5 px-3 text-center">Total Siswa</th>
                      <th className="py-2.5 px-3 text-center text-emerald-300 font-extrabold">
                        Jumlah Berpuasa (✓)
                      </th>
                      <th className="py-2.5 px-3 text-center">% Berpuasa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {breakdown.allRows.map((row, idx) => {
                      return (
                        <tr
                          key={row.key}
                          className={`transition-colors ${
                            row.isGrandTotal
                              ? 'bg-emerald-950 text-white font-bold text-xs'
                              : row.isSubtotal
                              ? 'bg-emerald-100/80 text-emerald-950 font-bold text-xs'
                              : 'hover:bg-gray-50 text-gray-800 font-medium'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center">{idx + 1}</td>
                          <td className="py-2.5 px-3 flex items-center gap-1.5 font-bold">
                            {row.label}
                          </td>
                          <td className="py-2.5 px-3 text-center">{row.totalStudents}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-700 text-sm print:text-emerald-900">
                            {row.berpuasa}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-md ${
                                row.isGrandTotal
                                  ? 'bg-amber-400 text-emerald-950 font-black'
                                  : row.isSubtotal
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {row.percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verifier & Operational Notes */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1">
              <p className="font-bold text-gray-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Catatan Pengesahan Laporan:
              </p>
              <p className="text-gray-600 leading-relaxed">
                {session.verifierNotes ||
                  'Laporan ini diterbitkan secara resmi melalui Sistem Informasi Presensi Amalan Puasa Sekolah Rakyat Kabupaten Kediri dan digunakan sebagai bukti pengawasan kedisiplinan ibadah siswa.'}
              </p>
            </div>

            {/* Single Signature Line for Wali Asuh */}
            <div className="pt-6 flex justify-end text-xs text-gray-800 pr-4">
              <div className="text-center min-w-[220px]">
                <p>Kediri, {formatDateIndoLong(new Date().toISOString().split('T')[0])}</p>
                <p className="font-bold text-gray-900 mt-1">Wali Asuh,</p>
                <div className="h-16"></div>
                <p className="font-bold text-gray-900">(________________________)</p>
              </div>
            </div>

            {/* Lampiran Section: Daftar Detail Siswa YANG BERPUASA */}
            <div className="pt-8 border-t-2 border-emerald-900/30 space-y-3 print:break-before-page">
              <div className="bg-emerald-900 text-white p-3 rounded-xl flex items-center justify-between">
                <h5 className="font-bold text-sm uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-300" />
                  <span>Lampiran: Daftar Nama Siswa Yang Berpuasa</span>
                </h5>
                <span className="text-xs text-emerald-200 font-semibold">
                  Total {students.filter((s) => session.records[s.id]?.status === 'berpuasa').length} Siswa Berpuasa
                </span>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-xs text-left divide-y divide-gray-200">
                  <thead className="bg-gray-100 text-gray-800 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-2.5 text-center w-8">No</th>
                      <th className="py-2 px-2.5">Nama Siswa</th>
                      <th className="py-2 px-2.5 text-center">Kelas</th>
                      <th className="py-2 px-2.5 text-center">L/P</th>
                      <th className="py-2 px-2.5 text-center">NIK / No</th>
                      <th className="py-2 px-2.5 text-center">Status Amalan</th>
                      <th className="py-2 px-2.5">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {(() => {
                      const fastingList = students
                        .filter((s) => session.records[s.id]?.status === 'berpuasa')
                        .sort((a, b) => {
                          if (a.kelas !== b.kelas) return a.kelas.localeCompare(b.kelas);
                          return a.nama.localeCompare(b.nama);
                        });

                      if (fastingList.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="py-6 text-center text-gray-500 italic">
                              Tidak ada siswa yang berpuasa pada sesi ini.
                            </td>
                          </tr>
                        );
                      }

                      return fastingList.map((s, index) => {
                        const rec = session.records[s.id];
                        const isFemale =
                          s.jenisKelamin === 'Perempuan' ||
                          s.jenisKelamin?.toLowerCase().startsWith('p');

                        return (
                          <tr key={s.id} className="hover:bg-gray-50 text-gray-800">
                            <td className="py-1.5 px-2.5 text-center font-medium">{index + 1}</td>
                            <td className="py-1.5 px-2.5 font-bold text-gray-900">{s.nama}</td>
                            <td className="py-1.5 px-2.5 text-center font-semibold text-emerald-800">
                              {s.kelas}
                            </td>
                            <td className="py-1.5 px-2.5 text-center">{isFemale ? 'P' : 'L'}</td>
                            <td className="py-1.5 px-2.5 text-center text-gray-500 font-mono text-[10px]">
                              {s.nik || s.no}
                            </td>
                            <td className="py-1.5 px-2.5 text-center font-bold">
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                ✓ Berpuasa
                              </span>
                            </td>
                            <td className="py-1.5 px-2.5 text-gray-600 text-[11px] italic">
                              {rec?.notes || '-'}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
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
