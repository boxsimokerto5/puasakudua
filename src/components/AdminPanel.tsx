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
  Users,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  Settings,
  Eye,
  Plus,
  ShieldCheck,
  Check,
  X,
  FileText,
  Database,
  Cloud,
  CloudOff,
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
  isSupabaseConnected = false,
  onOpenSupabaseConfig,
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
    <div className="space-y-6">
      {/* Top Banner Alert / Welcome */}
      <div className="bg-gradient-to-r from-purple-950 via-emerald-950 to-emerald-900 text-white p-6 rounded-3xl shadow-xl border border-purple-800/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Pusat Kendali Administrator Asrama</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Manajemen Akses & Izin Penginputan
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
              Kendalikan kapan sesi boleh diinput, kunci data setelah batas waktu, dan cegah penghapusan tidak sengaja oleh petugas lain.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => setIsDormCardModalOpen(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
              title="Buat dan Cetak Kartu Puasa Wali Asuh (SD Merah, SMP Biru, SMA Abu-abu)"
            >
              <CreditCard className="w-4 h-4 text-emerald-950" />
              <span>Cetak Kartu Puasa Wali Asuh</span>
            </button>
            <button
              onClick={() => onSwitchView('input')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Buka Mode Penginput</span>
            </button>
            <button
              onClick={() => onSwitchView('checker')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Buka Mode Pengecek</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Sesi Puasa</p>
            <p className="text-xl font-bold text-gray-900">{totalSessions}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Sesi Terkunci</p>
            <p className="text-xl font-bold text-rose-950">{lockedSessionsCount} Sesi</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Unlock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Sesi Terbuka</p>
            <p className="text-xl font-bold text-emerald-950">{totalSessions - lockedSessionsCount} Sesi</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Terverifikasi</p>
            <p className="text-xl font-bold text-amber-950">{verifiedSessionsCount} Sesi</p>
          </div>
        </div>
      </div>

      {/* Main Active Session Lock Controller */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-md space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                Sesi Yang Sedang Dipilih
              </span>
              {activeSession.isLocked ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Terkunci (Read-Only)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> Terbuka (Bisa Diinput)
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
              {activeSession.title}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Tanggal Pelaksanaan: <strong className="text-gray-800">{formatDateIndo(activeSession.date)}</strong>
              {activeSession.lockedAt && (
                <span className="ml-2 text-rose-600">
                  (Dikunci pada: {new Date(activeSession.lockedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                </span>
              )}
            </p>
          </div>

          {/* Quick Lock/Unlock Toggle Button */}
          <div className="flex items-center gap-3">
            {activeSession.isLocked ? (
              <button
                type="button"
                onClick={() => onToggleLockSession(activeSessionId, false)}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <Unlock className="w-5 h-5" />
                <span>Buka Izin Penginputan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleLockSession(activeSessionId, true)}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <Lock className="w-5 h-5" />
                <span>Kunci Penginputan Sesi Ini</span>
              </button>
            )}
          </div>
        </div>

        {/* Global & Session Rules Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deadline Setting */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Batas Waktu Penginputan (Deadline)</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Tentukan batas jam penginputan harian agar petugas selesai mencatat tepat waktu (misal sebelum ashar/maghrib).
            </p>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveDeadline}
                className="px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Simpan Jam
              </button>
            </div>
            {activeSession.inputDeadline && (
              <p className="text-[11px] text-purple-800 font-medium">
                ✓ Batas waktu aktif: Pukul <strong>{activeSession.inputDeadline} WIB</strong>
              </p>
            )}
          </div>

          {/* Penginput New Session Creation Permission */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
              <Settings className="w-4 h-4 text-emerald-600" />
              <span>Izin Pembuatan Sesi Baru oleh Penginput</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Atur apakah Petugas Penginput boleh membuat tanggal/judul sesi baru secara mandiri atau hanya Administrator.
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-gray-700">
                {adminSettings.allowPenginputCreateSession ? 'Diizinkan (Penginput bisa buat sesi)' : 'Dibatasi (Hanya Admin yang bisa buat sesi)'}
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateAdminSettings({
                    ...adminSettings,
                    allowPenginputCreateSession: !adminSettings.allowPenginputCreateSession,
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

      {/* Table of All Sessions (Full Control for Admin) */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-md overflow-hidden">
        <div className="p-5 bg-gray-50/80 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-700" />
              <span>Daftar Seluruh Sesi Puasa & Kontrol Status</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Hanya Administrator yang memiliki wewenang mengunci, membuka, dan menghapus sesi.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onSwitchView('raport')}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Buka Raport Keimanan dan Ketaqwaan Santri"
            >
              <Trophy className="w-4 h-4" />
              <span>Raport & Piagam</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Sesi Baru</span>
            </button>

            {onOpenPhotoModal && (
              <button
                type="button"
                onClick={() => onOpenPhotoModal()}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Kelola & Upload Foto Santri Langsung / Batch"
              >
                <Camera className="w-4 h-4" />
                <span>Foto Santri</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenStudentModal}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-purple-700" />
              <span>Master Data Siswa</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-100/70 text-gray-700 uppercase text-[10px] tracking-wider font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Nama Sesi & Tanggal</th>
                <th className="py-3 px-4 text-center">Status Akses</th>
                <th className="py-3 px-4 text-center">Verifikasi</th>
                <th className="py-3 px-4 text-center">Jumlah Puasa</th>
                <th className="py-3 px-4 text-right">Aksi Administrator</th>
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
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => onSelectSession(s.id)}
                          className={`text-left group cursor-pointer ${
                            isActive ? 'text-purple-950 font-bold' : 'text-gray-900 hover:text-purple-700'
                          }`}
                        >
                          <p className="text-xs font-bold">{s.title}</p>
                          <p className="text-[11px] text-gray-500 font-normal">
                            {formatDateIndo(s.date)} ({s.date})
                          </p>
                        </button>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-purple-200 text-purple-900 text-[10px] font-extrabold rounded-md">
                            AKTIF
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {s.isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Lock className="w-3 h-3" /> Dikunci
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Unlock className="w-3 h-3" /> Terbuka
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {s.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <CheckCircle2 className="w-3 h-3 text-amber-600" /> Sah ({s.verifiedBy || 'Petugas'})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                          Draf
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-gray-900">
                      {recordsCount} Siswa
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Lock / Unlock Toggle button */}
                        <button
                          type="button"
                          onClick={() => onToggleLockSession(s.id, !s.isLocked)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            s.isLocked
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                          title={s.isLocked ? 'Buka Kunci Sesi' : 'Kunci Sesi'}
                        >
                          {s.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>

                        {/* Select as Active Session */}
                        <button
                          type="button"
                          onClick={() => onSelectSession(s.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] transition-all cursor-pointer"
                        >
                          Pilih
                        </button>

                        {/* Delete Session Button (Protected) */}
                        <button
                          type="button"
                          onClick={() => setSessionToDelete(s)}
                          className="p-1.5 bg-gray-50 hover:bg-rose-600 text-gray-400 hover:text-white rounded-lg transition-all cursor-pointer"
                          title="Hapus Sesi Puasa"
                        >
                          <Trash2 className="w-4 h-4" />
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
          <div className="bg-white text-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Hapus Sesi Secara Permanen?
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Apakah Anda yakin ingin menghapus sesi{' '}
                  <strong className="text-gray-900">
                    &quot;{sessionToDelete.title}&quot; ({sessionToDelete.date})
                  </strong>
                  ? Seluruh data presensi dan verifikasi pada tanggal tersebut akan dihapus permanen.
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

      {/* Modal Create New Session for Admin */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-emerald-950 text-base">
                  Buat Judul & Tanggal Kegiatan Puasa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Pilih Judul Kegiatan Puasa
                </label>
                <select
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                  Format: {formatDateIndo(newDate)}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
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
