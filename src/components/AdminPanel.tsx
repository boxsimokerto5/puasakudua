import React, { useState, useEffect } from 'react';
import { FastingSession, Student, AdminSettings } from '../types';
import { DormCardModal } from './DormCardModal';
import {
  ShieldAlert,
  Lock,
  Unlock,
  Clock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  Settings,
  Eye,
  Plus,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  Trophy,
  Camera,
} from 'lucide-react';

interface AdminPanelProps {
  sessions: Record<string, FastingSession>;
  activeSessionId: string;
  activeSession?: FastingSession;
  students: Student[];
  adminSettings: AdminSettings;
  onSelectSession: (id: string) => void;
  onToggleLockSession: (sessionId: string, locked: boolean) => void;
  onUpdateDeadline: (sessionId: string, deadline: string) => void;
  onUpdateAdminSettings: (settings: AdminSettings) => void;
  onDeleteSession: (sessionId: string) => void;
  onCreateSession: (title: string, date: string) => void;
  onOpenStudentModal: () => void;
  onOpenPhotoModal?: (student?: Student) => void;
  onUpdateStudents?: (newStudents: Student[]) => void;
  onSwitchView: (view: 'input' | 'checker' | 'raport') => void;
  isSupabaseConnected?: boolean;
  onOpenSupabaseConfig?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  sessions,
  activeSessionId,
  activeSession: propActiveSession,
  students,
  adminSettings,
  onSelectSession,
  onToggleLockSession,
  onUpdateDeadline,
  onUpdateAdminSettings,
  onDeleteSession,
  onCreateSession,
  onOpenStudentModal,
  onOpenPhotoModal,
  onUpdateStudents,
  onSwitchView,
}) => {
  const activeSession: FastingSession =
    propActiveSession ||
    sessions[activeSessionId] || {
      id: activeSessionId,
      title: 'Puasa Sunnah',
      date: new Date().toISOString().split('T')[0],
      records: {},
      isVerified: false,
      isLocked: false,
      inputDeadline: '15:00',
    };

  const [sessionToDelete, setSessionToDelete] = useState<FastingSession | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDormCardModalOpen, setIsDormCardModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('Puasa Sunnah Senin');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [deadlineInput, setDeadlineInput] = useState(activeSession.inputDeadline || '15:00');

  useEffect(() => {
    if (activeSession?.inputDeadline) {
      setDeadlineInput(activeSession.inputDeadline);
    }
  }, [activeSession?.inputDeadline, activeSessionId]);

  const sessionList: FastingSession[] = (Object.values(sessions) as FastingSession[]).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalSessions = sessionList.length;
  const lockedSessionsCount = sessionList.filter((s) => s.isLocked).length;
  const verifiedSessionsCount = sessionList.filter((s) => s.isVerified).length;

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

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = newTitle === 'Lainnya' ? customTitle.trim() : newTitle;
    if (!finalTitle) return;
    onCreateSession(finalTitle, newDate);
    setIsCreateModalOpen(false);
    setCustomTitle('');
  };

  const handleSaveDeadline = () => {
    onUpdateDeadline(activeSessionId, deadlineInput);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete.id);
      setSessionToDelete(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* Top Banner - Compact & Streamlined */}
      <div className="bg-gradient-to-r from-purple-950 via-emerald-950 to-emerald-900 text-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-md border border-purple-800/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[11px] font-bold">
              <ShieldAlert className="w-3 h-3" />
              <span>Pusat Kendali Administrator</span>
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
              Manajemen Akses & Izin Penginputan
            </h1>
            <p className="text-[11px] sm:text-xs text-purple-200/90 max-w-xl leading-snug">
              Kendalikan pembukaan sesi, batas waktu input, dan pengelolaan data puasa santri.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            <button
              onClick={() => setIsDormCardModalOpen(true)}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Buat dan Cetak Kartu Puasa Wali Asuh"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-950" />
              <span>Kartu Puasa</span>
            </button>
            <button
              onClick={() => onSwitchView('input')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Mode Penginput</span>
            </button>
            <button
              onClick={() => onSwitchView('checker')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mode Pengecek</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards - Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-purple-100 shadow-xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">Total Sesi</p>
            <p className="text-base sm:text-lg font-bold text-gray-900 leading-tight">{totalSessions}</p>
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-rose-100 shadow-xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider truncate">Terkunci</p>
            <p className="text-base sm:text-lg font-bold text-rose-950 leading-tight">{lockedSessionsCount}</p>
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-emerald-100 shadow-xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
            <Unlock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider truncate">Terbuka</p>
            <p className="text-base sm:text-lg font-bold text-emerald-950 leading-tight">{totalSessions - lockedSessionsCount}</p>
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-amber-100 shadow-xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider truncate">Terverifikasi</p>
            <p className="text-base sm:text-lg font-bold text-amber-950 leading-tight">{verifiedSessionsCount}</p>
          </div>
        </div>
      </div>

      {/* Main Active Session Lock Controller - Tightened */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-gray-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Sesi Aktif
              </span>
              {activeSession.isLocked ? (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Terkunci (Read-Only)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> Terbuka (Bisa Diinput)
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mt-1">
              {activeSession.title}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Tanggal: <strong className="text-gray-800">{formatDateIndo(activeSession.date)}</strong>
              {activeSession.lockedAt && (
                <span className="ml-2 text-rose-600">
                  (Terkunci: {new Date(activeSession.lockedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                </span>
              )}
            </p>
          </div>

          {/* Quick Lock/Unlock Toggle Button */}
          <div className="flex items-center gap-2 shrink-0">
            {activeSession.isLocked ? (
              <button
                type="button"
                onClick={() => onToggleLockSession(activeSessionId, false)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Buka Izin Input</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleLockSession(activeSessionId, true)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Kunci Sesi Ini</span>
              </button>
            )}
          </div>
        </div>

        {/* Global & Session Rules Configuration - Compact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
          {/* Deadline Setting */}
          <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-200/70 space-y-1.5">
            <div className="flex items-center gap-1.5 text-gray-900 font-bold text-xs">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Batas Waktu Penginputan (Deadline)</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-snug">
              Batas jam harian agar petugas mencatat tepat waktu.
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="time"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:ring-1 focus:ring-purple-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveDeadline}
                className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer"
              >
                Simpan Jam
              </button>
              {activeSession.inputDeadline && (
                <span className="text-[11px] text-purple-800 font-medium ml-1">
                  (Aktif: {activeSession.inputDeadline} WIB)
                </span>
              )}
            </div>
          </div>

          {/* Penginput New Session Creation Permission */}
          <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-200/70 space-y-1.5">
            <div className="flex items-center gap-1.5 text-gray-900 font-bold text-xs">
              <Settings className="w-3.5 h-3.5 text-emerald-600" />
              <span>Izin Buat Sesi oleh Penginput</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-snug">
              Atur wewenang pembuatan sesi baru untuk petugas penginput.
            </p>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-xs font-semibold text-gray-700">
                {adminSettings.allowPenginputCreateSession ? 'Diizinkan' : 'Dibatasi (Hanya Admin)'}
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateAdminSettings({
                    ...adminSettings,
                    allowPenginputCreateSession: !adminSettings.allowPenginputCreateSession,
                  })
                }
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  adminSettings.allowPenginputCreateSession
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}
              >
                {adminSettings.allowPenginputCreateSession ? 'Aktif (Izinkan)' : 'Nonaktif (Kunci)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table of All Sessions (Full Control for Admin) - Tightened */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-3 sm:p-3.5 bg-gray-50/90 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-700" />
              <span>Daftar Seluruh Sesi Puasa</span>
            </h3>
            <p className="text-[11px] text-gray-500">
              Wewenang penuh untuk mengunci, membuka, dan mengelola riwayat sesi.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onSwitchView('raport')}
              className="px-2.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 rounded-lg text-xs font-black flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              title="Buka Raport Keimanan dan Ketaqwaan Santri"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Raport</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Sesi</span>
            </button>

            {onOpenPhotoModal && (
              <button
                type="button"
                onClick={() => onOpenPhotoModal()}
                className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-lg text-xs font-black flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                title="Kelola & Upload Foto Santri"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Foto Santri</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenStudentModal}
              className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-700" />
              <span>Data Siswa</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-100/80 text-gray-700 uppercase text-[10px] tracking-wider font-bold border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3">Nama Sesi & Tanggal</th>
                <th className="py-2.5 px-3 text-center">Status Akses</th>
                <th className="py-2.5 px-3 text-center">Verifikasi</th>
                <th className="py-2.5 px-3 text-center">Jumlah Puasa</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessionList.map((s) => {
                const isActive = s.id === activeSessionId;
                const recordsCount = Object.values(s.records || {}).filter(
                  (r) => r.status === 'berpuasa'
                ).length;

                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-purple-50/20 transition-colors ${
                      isActive ? 'bg-purple-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectSession(s.id)}
                          className={`text-left group cursor-pointer ${
                            isActive ? 'text-purple-950 font-bold' : 'text-gray-900 hover:text-purple-700'
                          }`}
                        >
                          <p className="text-xs font-bold leading-tight">{s.title}</p>
                          <p className="text-[11px] text-gray-500 font-normal">
                            {formatDateIndo(s.date)} ({s.date})
                          </p>
                        </button>
                        {isActive && (
                          <span className="px-1.5 py-0.5 bg-purple-200 text-purple-900 text-[9px] font-extrabold rounded">
                            AKTIF
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {s.isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Lock className="w-2.5 h-2.5" /> Dikunci
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Unlock className="w-2.5 h-2.5" /> Terbuka
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {s.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <CheckCircle2 className="w-2.5 h-2.5 text-amber-600" /> Sah
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600">
                          Draf
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-bold text-gray-900">
                      {recordsCount} Siswa
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Lock / Unlock Toggle button */}
                        <button
                          type="button"
                          onClick={() => onToggleLockSession(s.id, !s.isLocked)}
                          className={`p-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            s.isLocked
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                          title={s.isLocked ? 'Buka Kunci Sesi' : 'Kunci Sesi'}
                        >
                          {s.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>

                        {/* Select as Active Session */}
                        <button
                          type="button"
                          onClick={() => onSelectSession(s.id)}
                          className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[10px] transition-all cursor-pointer"
                        >
                          Pilih
                        </button>

                        {/* Delete Session Button (Protected) */}
                        <button
                          type="button"
                          onClick={() => setSessionToDelete(s)}
                          className="p-1 bg-gray-50 hover:bg-rose-600 text-gray-400 hover:text-white rounded-md transition-all cursor-pointer"
                          title="Hapus Sesi Puasa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-gray-800 rounded-2xl max-w-sm w-full p-4 sm:p-5 shadow-2xl border border-rose-200 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  Hapus Sesi Secara Permanen?
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Apakah Anda yakin ingin menghapus sesi{' '}
                  <strong className="text-gray-900">
                    &quot;{sessionToDelete.title}&quot; ({sessionToDelete.date})
                  </strong>
                  ? Seluruh data presensi pada tanggal tersebut akan dihapus permanen.
                </p>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create New Session for Admin */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-gray-800 rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-emerald-100 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2.5 border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-emerald-950 text-sm sm:text-base">
                  Buat Judul & Tanggal Sesi Puasa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Pilih Judul Kegiatan Puasa
                </label>
                <select
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="Puasa Sunnah Senin">Puasa Sunnah Senin</option>
                  <option value="Puasa Sunnah Kamis">Puasa Sunnah Kamis</option>
                  <option value="Puasa Ayyamul Bidh">Puasa Ayyamul Bidh</option>
                  <option value="Puasa Sunnah Dzulhijjah">Puasa Sunnah Dzulhijjah</option>
                  <option value="Puasa Ramadhan">Puasa Ramadhan</option>
                  <option value="Lainnya">+ Tulis Judul Kustom</option>
                </select>
              </div>

              {newTitle === 'Lainnya' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Judul Kustom
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Contoh: Puasa Sunnah Nisfu Sya'ban"
                    className="w-full p-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Tanggal Kegiatan Puasa
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Format: {formatDateIndo(newDate)}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Sesi Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dorm Student ID Cards Modal */}
      {isDormCardModalOpen && (
        <DormCardModal
          students={students}
          onClose={() => setIsDormCardModalOpen(false)}
          onUpdateStudents={onUpdateStudents}
          onOpenPhotoModal={onOpenPhotoModal}
        />
      )}
    </div>
  );
};
