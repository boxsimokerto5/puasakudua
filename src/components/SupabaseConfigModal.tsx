import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Cloud,
  CloudOff,
  UploadCloud,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  isSupabaseConfigured,
} from '../lib/supabase';
import { syncAllStudentsToSupabase, upsertSessionToSupabase, saveAdminSettingsToSupabase } from '../services/supabaseService';
import { Student, FastingSession, AdminSettings } from '../types';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  sessions: Record<string, FastingSession>;
  adminSettings: AdminSettings;
  onSyncCompleted: () => void;
}

export function SupabaseConfigModal({
  isOpen,
  onClose,
  students,
  sessions,
  adminSettings,
  onSyncCompleted,
}: SupabaseConfigModalProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setTestResult(null);
      setSyncStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url, anonKey);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e?.message || 'Gagal mengetes koneksi.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    saveSupabaseConfig(url, anonKey);
    handleTest();
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult({ success: false, message: 'Koneksi Supabase diputuskan. Menggunakan mode penyimpanan lokal.' });
  };

  const handleUploadAllDataToSupabase = async () => {
    if (!url || !anonKey) {
      alert('Harap masukkan dan simpan kredensial Supabase terlebih dahulu.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Mengunggah data siswa...');

    try {
      // 1. Simpan semua siswa
      const studentsOk = await syncAllStudentsToSupabase(students);
      if (!studentsOk) {
        throw new Error('Gagal mengunggah data siswa. Pastikan script SQL sudah dijalankan di Supabase.');
      }

      setSyncStatus('Mengunggah seluruh sesi puasa & riwayat...');
      // 2. Simpan semua sesi
      const sessionList = Object.values(sessions);
      for (const sess of sessionList) {
        await upsertSessionToSupabase(sess);
      }

      // 3. Simpan admin settings
      await saveAdminSettingsToSupabase(adminSettings);

      setSyncStatus('✓ Berhasil menyinkronkan seluruh data siswa & sesi ke Cloud Supabase!');
      onSyncCompleted();
    } catch (err: any) {
      setSyncStatus(`Error saat sinkronisasi: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const SQL_SCRIPT = `-- SCRIPT PEMBUATAN DATABASE SUPABASE UNTUK PUASAKU SRT 1 KEDIRI
CREATE TABLE IF NOT EXISTS public.students (
    id BIGINT PRIMARY KEY,
    no INT,
    nama TEXT NOT NULL,
    kelas TEXT NOT NULL,
    jenis_kelamin TEXT NOT NULL,
    nik TEXT DEFAULT '',
    tempat_lahir TEXT DEFAULT '',
    tanggal_lahir TEXT DEFAULT '',
    nama_ibu TEXT DEFAULT '',
    alamat TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.fasting_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    records JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    verified_by TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    verifier_notes TEXT,
    is_locked BOOLEAN DEFAULT false NOT NULL,
    locked_at TIMESTAMP WITH TIME ZONE,
    locked_by TEXT,
    input_deadline TEXT DEFAULT '15:00',
    created_by_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admin_settings (
    id TEXT PRIMARY KEY DEFAULT 'global_settings',
    allow_penginput_create_session BOOLEAN DEFAULT true NOT NULL,
    default_deadline_time TEXT DEFAULT '15:00' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.admin_settings (id, allow_penginput_create_session, default_deadline_time)
VALUES ('global_settings', true, '15:00')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access for students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for fasting_sessions" ON public.fasting_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for admin_settings" ON public.admin_settings FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.fasting_sessions, public.students, public.admin_settings;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-emerald-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-700/60 text-emerald-200 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>Pengaturan Database Cloud (Supabase)</span>
                {isConnected ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                    <Cloud className="w-3 h-3" /> Terhubung
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                    <CloudOff className="w-3 h-3" /> Mode Lokal
                  </span>
                )}
              </h3>
              <p className="text-xs text-emerald-200/80">
                Penyimpanan PostgreSQL & Sinkronisasi Real-Time Tanpa Batas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 px-6 pt-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'config'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Koneksi & Sinkronisasi
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'sql'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Script SQL Supabase (1-Klik Salin)
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'config' ? (
            <>
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <p className="font-bold">Koneksi Database Bebas Batas & Realtime</p>
                  <p className="text-emerald-800/90 mt-0.5">
                    Hubungkan akun <strong>Supabase</strong> Anda agar data siswa, input amalan puasa, dan status verifikasi tersinkronisasi otomatis antar perangkat secara seketika.
                  </p>
                </div>
              </div>

              {/* Form Input URL & Anon Key */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xxxxxxxx.supabase.co"
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Didapat dari dashboard Supabase: <span className="font-semibold">Project Settings &gt; API &gt; Project URL</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Supabase Anon / Public Key (JWT)
                  </label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className={`w-full px-3.5 py-2.5 text-xs font-mono bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 ${
                      anonKey.startsWith('sb_publishable_')
                        ? 'border-amber-400 focus:ring-amber-500 bg-amber-50/50'
                        : 'border-gray-300 focus:ring-emerald-600'
                    }`}
                  />
                  {anonKey.startsWith('sb_publishable_') ? (
                    <div className="mt-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug">
                      ⚠️ <strong>Perhatian:</strong> Kunci yang dimasukkan adalah <em>Publishable Key</em> (<code className="font-mono">sb_publishable_...</code>). Supabase REST database memerlukan <strong>JWT Anon Key</strong> (yang diawali <code className="font-mono">eyJhbGci...</code>).
                      <br />Silakan salin kunci <strong>anon public</strong> dari menu <strong>Project Settings &gt; API</strong> di Supabase.
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500 mt-1">
                      Didapat dari Supabase: <span className="font-semibold">Project Settings &gt; API &gt; Project API keys &gt; anon public</span> (diawali <code className="font-mono">eyJhbGci...</code>)
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Simpan & Hubungkan
                </button>

                <button
                  type="button"
                  onClick={handleTest}
                  disabled={isTesting || !url || !anonKey}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Menguji Koneksi...' : 'Uji Koneksi'}
                </button>

                {isConnected && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs transition-all cursor-pointer ml-auto"
                  >
                    Putuskan Koneksi
                  </button>
                )}
              </div>

              {/* Test Result Banner */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Sync Section */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-emerald-700" />
                      Unggah / Migrasikan Data Lokal ke Supabase
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Sinkronkan {students.length} data siswa dan {Object.keys(sessions).length} sesi puasa saat ini langsung ke database cloud.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUploadAllDataToSupabase}
                  disabled={isSyncing || !isConnected}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs shadow hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sedang Mengunggah Data ke Supabase...' : 'Unggah & Sinkronkan Semua Data Sekarang'}
                </button>

                {syncStatus && (
                  <p className="text-xs font-medium text-center text-emerald-800 bg-emerald-50 py-2 px-3 rounded-lg border border-emerald-200">
                    {syncStatus}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Script SQL Schema Supabase</h4>
                  <p className="text-[11px] text-gray-500">
                    Jalankan script ini 1 kali di <strong>Supabase SQL Editor</strong> untuk membuat tabel dan realtime channel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Tersalin!' : 'Salin Script SQL'}
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-gray-900 text-emerald-400 font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto select-all border border-gray-800">
                {SQL_SCRIPT}
              </pre>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Setelah menekan <strong>Run</strong> di SQL Editor Supabase, kembali ke tab <strong>Koneksi & Sinkronisasi</strong> dan klik <strong>Unggah & Sinkronkan Semua Data Sekarang</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 underline"
          >
            <span>Buka Dashboard Supabase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
