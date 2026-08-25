import React, { useState, useRef, useEffect } from 'react';
import { FastingSession } from '../types';
import { Calendar, Plus, Check, ChevronDown, Sparkles, Trash2, AlertTriangle, X, Lock, Unlock, Moon } from 'lucide-react';

interface SessionSelectorProps {
  sessions: Record<string, FastingSession>;
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateSession: (title: string, date: string) => void;
  onDeleteSession?: (id: string) => void;
  isAdmin?: boolean;
  canCreateSession?: boolean;
}

const PRESET_TITLES = [
  'Puasa Ramadhan 1447 H',
  'Puasa Sunnah Senin',
  'Puasa Sunnah Kamis',
  'Puasa Ayyamul Bidh',
  'Puasa Sunnah Dzulhijjah',
  'Puasa Sunnah Nisfu Sya\'ban',
];

export const SessionSelector: React.FC<SessionSelectorProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  isAdmin = false,
  canCreateSession = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<FastingSession | null>(null);

  const [newTitle, setNewTitle] = useState('Puasa Ramadhan 1447 H');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [customTitle, setCustomTitle] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sessionList: FastingSession[] = (Object.values(sessions) as FastingSession[]).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const activeSession = sessions[activeSessionId] || sessionList[0];

  const formatDateIndo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = newTitle === 'Lainnya' ? customTitle.trim() : newTitle;
    if (!finalTitle) return;

    onCreateSession(finalTitle, newDate);
    setIsModalOpen(false);
    setCustomTitle('');
  };

  const confirmDelete = () => {
    if (sessionToDelete && onDeleteSession && isAdmin) {
      onDeleteSession(sessionToDelete.id);
      setSessionToDelete(null);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-emerald-950 via-teal-950 to-emerald-900 text-emerald-50 rounded-xl p-2.5 sm:p-3 shadow-md border border-amber-500/35 ring-1 ring-amber-400/20 mb-2.5 z-30">
      {/* Decorative ambient background accents for Ramadan */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-30 flex flex-col lg:flex-row lg:items-center justify-between gap-2 sm:gap-3">
        {/* Active Session Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-emerald-950 rounded-xl shadow-md shadow-amber-500/25 ring-1 ring-amber-300/40 shrink-0 flex items-center justify-center">
            <Moon className="w-4 h-4 fill-emerald-950" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                {activeSession?.title || 'Puasa Ramadhan 1447 H'}
              </h2>
              {activeSession?.isLocked ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-950/90 text-rose-200 border border-rose-600/60 flex items-center gap-0.5 shadow-xs">
                  <Lock className="w-2.5 h-2.5" /> Terkunci
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-900/90 text-emerald-200 border border-emerald-500/50 flex items-center gap-0.5 shadow-xs">
                  <Unlock className="w-2.5 h-2.5 text-emerald-400" /> Terbuka
                </span>
              )}
              {activeSession?.isVerified && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 border border-amber-300 shadow-xs">
                  ✓ Sah
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-200/90 font-medium flex items-center gap-1.5 flex-wrap truncate">
              <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Tanggal:</span>
              <span className="font-bold text-amber-300">
                {activeSession ? formatDateIndo(activeSession.date) : '27 Agustus 2026'}
              </span>
              {activeSession?.inputDeadline && (
                <span className="text-amber-200/90 bg-emerald-900/60 px-1.5 py-0.2 rounded border border-emerald-700/50 text-[10px]">
                  Batas: <strong className="text-amber-300">{activeSession.inputDeadline} WIB</strong>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Actions & Selector Dropdown */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Custom History Selector Dropdown with Trash icons (Admin only) */}
          <div className="relative flex-1 sm:flex-initial w-full sm:w-auto min-w-[200px] z-40" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-emerald-900/90 hover:bg-emerald-950 text-emerald-100 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-amber-500/35 focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-inner transition-all flex items-center justify-between gap-2 cursor-pointer"
            >
              <div className="truncate text-left">
                <span className="font-bold text-amber-100">
                  {activeSession ? activeSession.title : 'Pilih Sesi'}
                </span>
                <span className="text-amber-300/80 text-[10px] ml-1 font-normal">
                  ({activeSession?.date})
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Popup */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 sm:left-auto sm:right-0 mt-1.5 sm:w-80 bg-white text-gray-900 rounded-xl shadow-2xl border border-amber-300 ring-1 ring-black/10 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 bg-gradient-to-r from-emerald-950 to-teal-900 text-white font-bold text-xs flex items-center justify-between border-b border-amber-500/30">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Moon className="w-3.5 h-3.5 fill-amber-300" /> Riwayat Sesi Puasa ({sessionList.length})
                  </span>
                  <span className="text-[10px] font-normal text-emerald-200">
                    Klik untuk memilih
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                  {sessionList.map((s) => {
                    const isActive = s.id === activeSessionId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          onSelectSession(s.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`p-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-amber-50/90 text-emerald-950 font-bold border-l-4 border-amber-500'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                            {isActive && <Check className="w-3.5 h-3.5 text-emerald-700 font-extrabold" />}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-gray-900 truncate">{s.title}</p>
                              {s.isLocked && (
                                <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-semibold">
                                  Terkunci
                                </span>
                              )}
                            </div>
                            <p className="text-[10.5px] text-gray-500 font-medium">
                              {formatDateIndo(s.date)} {s.isVerified && '• ✓ Disahkan'}
                            </p>
                          </div>
                        </div>

                        {/* Trash Button - ONLY FOR ADMIN */}
                        {isAdmin && onDeleteSession && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSessionToDelete(s);
                            }}
                            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Hapus Sesi Ini (Khusus Admin)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Delete Active Session Button (Quick Access Trash Bin) - ONLY FOR ADMIN */}
          {isAdmin && onDeleteSession && activeSession && (
            <button
              type="button"
              onClick={() => setSessionToDelete(activeSession)}
              className="p-1.5 bg-emerald-900/80 hover:bg-rose-900/80 text-amber-300 hover:text-rose-200 rounded-lg border border-amber-500/30 hover:border-rose-500 transition-all cursor-pointer shadow-xs"
              title="Hapus Sesi Aktif Ini (Khusus Admin)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Create New Session Button (Based on canCreateSession or Admin) */}
          {(isAdmin || canCreateSession) && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-emerald-950 font-bold text-xs rounded-lg shadow-md shadow-amber-400/20 transition-all duration-150 flex items-center gap-1 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Sesi Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal (Admin Only) */}
      {isAdmin && sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Hapus Sesi Puasa?
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Apakah Anda yakin ingin menghapus sesi{' '}
                  <strong className="text-gray-900">
                    &quot;{sessionToDelete.title}&quot; ({sessionToDelete.date})
                  </strong>
                  ? Seluruh data presensi pada sesi ini akan dihapus permanen.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Sesi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating New Fasting Session Block */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <Moon className="w-5 h-5 fill-amber-500 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-950 text-base">
                    Buat Sesi Inputan Puasa Baru
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">Tema Ramadhan & Puasa Sunnah</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Pilih Judul Kegiatan Puasa
                </label>
                <select
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {PRESET_TITLES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="Lainnya">+ Tulis Judul Kustom</option>
                </select>
              </div>

              {newTitle === 'Lainnya' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Judul Kustom
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Contoh: Puasa Ramadhan Hari Ke-1"
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tanggal Kegiatan Puasa
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Format tampilan: <strong className="text-emerald-800">{formatDateIndo(newDate)}</strong>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Simpan Sesi Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


