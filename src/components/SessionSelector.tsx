import React, { useState, useRef, useEffect } from 'react';
import { FastingSession } from '../types';
import { Calendar, Plus, Check, ChevronDown, Sparkles, Trash2, AlertTriangle, X, Lock, Unlock } from 'lucide-react';

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
  'Puasa Sunnah Senin',
  'Puasa Sunnah Kamis',
  'Puasa Ayyamul Bidh',
  'Puasa Sunnah Dzulhijjah',
  'Puasa Ramadhan',
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

  const [newTitle, setNewTitle] = useState('Puasa Sunnah Senin');
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
    <div className="bg-emerald-800 text-emerald-50 rounded-2xl p-4 shadow-lg border border-emerald-700/60 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Active Session Info */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-3 bg-emerald-700/80 rounded-xl border border-emerald-500/40 text-amber-300 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-300">
                Sesi Input Yang Aktif
              </span>
              {activeSession?.isLocked ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-900/90 text-rose-200 border border-rose-600 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Terkunci (Read-Only)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-900/80 text-emerald-200 border border-emerald-700 flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> Terbuka
                </span>
              )}
              {activeSession?.isVerified && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400 text-emerald-950 border border-amber-300">
                  ✓ Terverifikasi
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {activeSession?.title || 'Puasa Sunnah Senin'}
            </h2>
            <p className="text-xs text-emerald-200 font-medium">
              Tanggal:{' '}
              <span className="font-semibold text-amber-300">
                {activeSession ? formatDateIndo(activeSession.date) : '27 Agustus 2026'}
              </span>
              {activeSession?.inputDeadline && (
                <span className="ml-2 text-amber-200">
                  • Batas Jam: {activeSession.inputDeadline} WIB
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Actions & Selector Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Custom History Selector Dropdown with Trash icons (Admin only) */}
          <div className="relative flex-1 sm:flex-initial min-w-[220px]" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-emerald-900/90 hover:bg-emerald-950 text-emerald-100 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-emerald-600 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all flex items-center justify-between gap-2 cursor-pointer"
            >
              <div className="truncate text-left">
                <span className="font-bold text-white">
                  {activeSession ? activeSession.title : 'Pilih Sesi'}
                </span>
                <span className="text-emerald-300 text-[11px] ml-1.5 font-normal">
                  ({activeSession?.date})
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-emerald-300 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Popup */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2.5 bg-emerald-900 text-white font-bold text-xs flex items-center justify-between border-b border-emerald-800">
                  <span>Riwayat Sesi Puasa ({sessionList.length})</span>
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
                        className={`p-3 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-950 font-bold'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                            {isActive && <Check className="w-4 h-4 text-emerald-700 font-extrabold" />}
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
                            <p className="text-[11px] text-gray-500 font-medium">
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
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Hapus Sesi Ini (Khusus Admin)"
                          >
                            <Trash2 className="w-4 h-4" />
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
              className="p-2.5 bg-emerald-900/80 hover:bg-rose-900/80 text-emerald-300 hover:text-rose-200 rounded-xl border border-emerald-600 hover:border-rose-500 transition-all cursor-pointer"
              title="Hapus Sesi Aktif Ini (Khusus Admin)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Create New Session Button (Based on canCreateSession or Admin) */}
          {(isAdmin || canCreateSession) && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl shadow transition-all duration-150 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Judul / Tanggal Baru</span>
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
          <div className="bg-white text-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-emerald-950 text-base">
                  Buat Judul & Tanggal Inputan Puasa
                </h3>
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
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                    placeholder="Contoh: Puasa Sunnah Nisfu Sya'ban"
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Format tampilan: {formatDateIndo(newDate)}
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
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
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


