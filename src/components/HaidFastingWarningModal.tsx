import React from 'react';
import { Student, HaidRecord } from '../types';
import { Droplets, AlertTriangle, X, ShieldAlert, Check, ArrowRight } from 'lucide-react';

interface HaidFastingWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  haidRecord?: HaidRecord;
  dayCount?: number;
  sessionDate?: string;
  onMarkAsHalangan?: (studentId: number) => void;
}

export const HaidFastingWarningModal: React.FC<HaidFastingWarningModalProps> = ({
  isOpen,
  onClose,
  student,
  haidRecord,
  dayCount = 1,
  sessionDate,
  onMarkAsHalangan,
}) => {
  if (!isOpen || !student) return null;

  const handleConfirmHalangan = () => {
    if (onMarkAsHalangan) {
      onMarkAsHalangan(student.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-pink-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header Card - Soft Rose Islamic Banner */}
        <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-rose-50 via-pink-50/70 to-rose-100/50 border-b border-rose-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
                <Droplets className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-200/80 text-rose-900 border border-rose-300">
                  <ShieldAlert className="w-3 h-3" /> Peringatan Udzur Syar'i
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1 leading-snug">
                  Siswi Terindikasi Haid
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors cursor-pointer"
              title="Tutup Peringatan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Student Profile Snapshot Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            {student.foto ? (
              <img
                src={student.foto}
                alt={student.nama}
                className="w-12 h-12 rounded-xl object-cover border-2 border-rose-300 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                {student.nama.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-sm text-slate-900 truncate">
                {student.nama}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Kelas: <strong className="text-rose-900 font-bold">{student.kelas}</strong>
                {student.nik && <span className="text-slate-400 font-mono"> • NIK: {student.nik}</span>}
              </p>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  🩸 Sedang Haid (Hari ke-{dayCount})
                </span>
                {haidRecord?.startDate && (
                  <span className="text-[10.5px] text-slate-500 font-medium">
                    Mulai: {haidRecord.startDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Fiqh Explanation Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/90 to-rose-50/50 border border-amber-200/80 text-amber-950 text-xs leading-relaxed space-y-1.5">
            <div className="flex items-center gap-1.5 font-extrabold text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Hukum Fiqih & Larangan Input Puasa:</span>
            </div>
            <p className="text-[11.5px] text-amber-900/90">
              Berdasarkan Fiqih Madzhab Syafi'i, santriwati yang sedang dalam masa haid <strong>diharamkan berpuasa</strong> dan puasanya tidak sah. Sistem otomatis memblokir input puasa agar data ibadah tetap sah dan akurat.
            </p>
            {sessionDate && (
              <p className="text-[11px] text-slate-600 pt-0.5 border-t border-amber-200/60 font-medium">
                Sesi Tanggal: <strong>{sessionDate}</strong>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {onMarkAsHalangan && (
              <button
                type="button"
                onClick={handleConfirmHalangan}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-700 hover:to-rose-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Tandai Otomatis Sebagai "Udzur / Halangan"</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Tutup Peringatan
            </button>
          </div>
        </div>

        {/* Bottom subtle note */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10.5px] text-slate-500">
            Terintegrasi otomatis dengan sistem Portal Catat Haid & Suci santriwati.
          </p>
        </div>
      </div>
    </div>
  );
};
