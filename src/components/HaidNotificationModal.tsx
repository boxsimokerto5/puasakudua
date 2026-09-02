import React, { useState, useMemo } from 'react';
import { Student, HaidRecord } from '../types';
import { analyzeFiqhHaid } from '../utils/fiqhHaid';
import { HeartPulse, Search, X, CheckCircle2, Calendar, Droplets } from 'lucide-react';

interface HaidNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  haidRecords: HaidRecord[];
  students: Student[];
}

export const HaidNotificationModal: React.FC<HaidNotificationModalProps> = ({
  isOpen,
  onClose,
  haidRecords,
  students,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeHaidRecords = useMemo(() => {
    return haidRecords.filter((r) => r.status === 'haid_aktif');
  }, [haidRecords]);

  const filteredActiveHaid = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return activeHaidRecords;
    return activeHaidRecords.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.studentClass.toLowerCase().includes(q) ||
        r.studentNik?.includes(q)
    );
  }, [activeHaidRecords, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50/50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 text-white flex items-center justify-center shadow-xs">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 leading-tight">
                <span>Notifikasi Siswi Sedang Haid</span>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                  {activeHaidRecords.length} Siswi
                </span>
              </h3>
              <p className="text-[10.5px] text-slate-500">
                Daftar santriwati yang berstatus haid aktif (tidak berpuasa)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              setSearchQuery('');
            }}
            className="w-8 h-8 rounded-lg hover:bg-rose-200/50 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search filter in modal */}
        {activeHaidRecords.length > 0 && (
          <div className="px-4 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau kelas siswi haid..."
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Body / List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {activeHaidRecords.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Alhamdulillah, Tidak Ada Siswi yang Sedang Haid
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Semua siswi dalam catatan sistem saat ini berstatus suci dan siap mengikuti puasa.
                </p>
              </div>
            </div>
          ) : filteredActiveHaid.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Tidak ditemukan siswi haid dengan pencarian &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredActiveHaid.map((rec, idx) => {
              const fiqhAnalysis = analyzeFiqhHaid(rec.startDate, rec.endDate);
              const matchedStudent = students.find((s) => s.id === rec.studentId);

              return (
                <div
                  key={rec.id || idx}
                  className="p-3 bg-white rounded-xl border border-rose-100 hover:border-rose-200 shadow-xs transition-all flex items-start justify-between gap-3"
                >
                  {/* Left: Avatar & Detail */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    {matchedStudent?.foto ? (
                      <img
                        src={matchedStudent.foto}
                        alt={rec.studentName}
                        className="w-10 h-10 rounded-xl object-cover border border-rose-200 shrink-0 bg-rose-50"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {rec.studentName.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {rec.studentName}
                        </h4>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {rec.studentClass}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>Mulai: {rec.startDate}</span>
                        </span>
                        {rec.bloodColor && (
                          <span className="flex items-center gap-1 text-[10.5px]">
                            <Droplets className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                            <span className="capitalize">Warna {rec.bloodColor}</span>
                          </span>
                        )}
                      </div>

                      {rec.notes && (
                        <p className="text-[10.5px] text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 italic">
                          &ldquo;{rec.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Badge Hari Ke-X & Fiqh */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10.5px] font-black tracking-tight border ${
                        fiqhAnalysis.isExceedingMax
                          ? 'bg-red-100 text-red-900 border-red-300'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      Hari ke-{fiqhAnalysis.dayCount}
                    </span>

                    {fiqhAnalysis.isExceedingMax && (
                      <span className="text-[9.5px] font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded">
                        ⚠️ &gt;15 Hari
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500">
            Informasi otomatis dari pencatatan Fiqih Haid santri
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              setSearchQuery('');
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
