import React, { useState } from 'react';
import { Student } from '../types';
import { parseCSVData } from '../data/students';
import {
  FileSpreadsheet,
  Upload,
  RotateCcw,
  Users,
  Check,
  AlertCircle,
  X,
  FileText,
  Sparkles,
  Camera
} from 'lucide-react';

interface StudentDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onUpdateStudents: (newStudents: Student[]) => void;
  onResetStudents: () => void;
  onOpenPhotoModal?: () => void;
}

export const StudentDataModal: React.FC<StudentDataModalProps> = ({
  isOpen,
  onClose,
  students,
  onUpdateStudents,
  onResetStudents,
  onOpenPhotoModal,
}) => {
  const [csvText, setCsvText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'info' | 'upload'>('info');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processCSV(text);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteProcess = () => {
    if (!csvText.trim()) {
      setMessage({ type: 'error', text: 'Teks CSV belum diisi!' });
      return;
    }
    processCSV(csvText);
  };

  const processCSV = (rawCsv: string) => {
    try {
      const parsed = parseCSVData(rawCsv);
      if (parsed.length === 0) {
        setMessage({
          type: 'error',
          text: 'Gagal membaca CSV. Pastikan terdapat kolom No, Nama, dan Kelas.',
        });
        return;
      }

      onUpdateStudents(parsed);
      setMessage({
        type: 'success',
        text: `Berhasil mengimpor ${parsed.length} data siswa baru!`,
      });
      setCsvText('');
    } catch (e) {
      console.error(e);
      setMessage({
        type: 'error',
        text: 'Terjadi kesalahan saat mengolah format CSV.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-emerald-100 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3 border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Kelola Data Siswa Checklist Puasa
              </h3>
              <p className="text-xs text-gray-500">
                Data basis siswa Sekolah Rakyat Kediri ({students.length} Siswa Terdaftar)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-gray-100 shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'info'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Info Master Siswa Saat Ini
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Upload / Tempel Data CSV Baru
          </button>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between shrink-0 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600 text-xs font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {activeTab === 'info' ? (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-emerald-950">
                    Sistem Menggunakan Data Resmi Sekolah Rakyat Kediri
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Mencakup tingkatan SD (1-6), SMP (VII), dan SMA (X, XI).
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {onOpenPhotoModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPhotoModal();
                      }}
                      className="px-3 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Kelola Foto Santri</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onResetStudents();
                      setMessage({
                        type: 'success',
                        text: 'Data master siswa berhasil di-reset ke bawaan Sekolah Rakyat Kediri!',
                      });
                    }}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Data Bawaan</span>
                  </button>
                </div>
              </div>

              {/* Sample Preview List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Pratinjau Data Siswa ({students.length} Siswa Total)
                </h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto divide-y divide-gray-100 text-xs">
                  {students.slice(0, 30).map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 font-mono text-gray-400">{s.no}.</span>
                        <span className="font-bold text-gray-900">{s.nama}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700">
                          {s.kelas}
                        </span>
                      </div>
                      <span className="text-gray-400 text-[11px] font-mono">
                        {s.jenisKelamin}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 italic">
                  * Menampilkan 30 dari {students.length} total siswa terdaftar.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Upload Box */}
              <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center bg-emerald-50/40 space-y-3">
                <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">
                    Pilih File CSV Data Siswa dari Komputer / HP
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Format kolom diharapkan: No, Nama, Kelas, Jenis Kelamin, NIK, Tempat Lahir, Tanggal Lahir, Nama Ibu, Alamat
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm">
                  <FileText className="w-4 h-4" />
                  <span>Pilih File CSV</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Raw CSV Textarea Option */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Atau Tempel (Paste) Teks CSV Langsung:
                </label>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`Contoh:\nNo,Nama,Kelas,Jenis Kelamin\n1,Ahmad Yani,SD 1-2,Laki-laki\n2,Siti Nur,SD 1-2,Perempuan`}
                  className="w-full p-3 text-xs font-mono bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 h-28"
                />
                <button
                  type="button"
                  onClick={handlePasteProcess}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Proses Teks CSV</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
