import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserSession, FastingSession, FastingStatus, Student, AdminSettings, HaidRecord, AdminTabType } from './types';
import {
  getStoredStudents,
  saveStoredStudents,
  resetStoredStudents,
  getStoredSessions,
  saveSession,
  saveAllStoredSessions,
  deleteSession,
  getStoredAdminSettings,
  saveStoredAdminSettings,
  build101FastingRecords,
} from './data/students';
import { getStoredHaidRecords, saveStoredHaidRecords } from './utils/fiqhHaid';
import { isSupabaseConfigured } from './lib/supabase';
import {
  fetchSessionsFromSupabase,
  upsertSessionToSupabase,
  deleteSessionFromSupabase,
  fetchStudentsFromSupabase,
  syncAllStudentsToSupabase,
  fetchAdminSettingsFromSupabase,
  saveAdminSettingsToSupabase,
  setupSupabaseRealtime,
} from './services/supabaseService';
import { HeaderNavbar } from './components/HeaderNavbar';
import { LoginForm } from './components/LoginForm';
import { SessionSelector } from './components/SessionSelector';
import { FastingInputterView } from './components/FastingInputterView';
import { FastingCheckerView } from './components/FastingCheckerView';
import { SplashScreen } from './components/SplashScreen';
import { PrayerTimeBannerCard } from './components/PrayerTimeBannerCard';
import { SlimBannerCarousel } from './components/SlimBannerCarousel';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { AdminPanel } from './components/AdminPanel';
import { RaportImtaqView } from './components/RaportImtaqView';
import { ShortSurahsModal } from './components/ShortSurahsModal';
import { PrayerTimesModal } from './components/PrayerTimesModal';
import { FastingWisdomModal } from './components/FastingWisdomModal';
import { CalendarView } from './components/CalendarView';
import { CatatHaidView } from './components/CatatHaidView';
import { DaftarHaidView } from './components/DaftarHaidView';
import { DaftarSuciView } from './components/DaftarSuciView';
import { PrayerAttendanceView } from './components/PrayerAttendanceView';
import { HaidNotificationModal } from './components/HaidNotificationModal';
import { StudentDataModal } from './components/StudentDataModal';
import { StudentPhotoUploadModal } from './components/StudentPhotoUploadModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { usePwaInstall } from './hooks/usePwaInstall';
import { useAutoUpdate } from './hooks/useAutoUpdate';
import { INDONESIA_CITIES, CityLocation } from './utils/prayerTimes';
import { applyThemeToDocument, getTheme } from './utils/themeConfig';
import { Sparkles, Cloud, CloudCheck, RefreshCw, Download } from 'lucide-react';

const USER_SESSION_KEY = 'sr_kediri_user_session_v1';
const PRAYER_CITY_KEY = 'sr_kediri_prayer_city_v1';

export default function App() {
  // Cloudflare Auto Update Detector
  const autoUpdate = useAutoUpdate();

  // PWA Install State & Detection
  const pwaState = usePwaInstall();

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Ramadan Fasting Wisdom Modal State
  const [showWisdomModal, setShowWisdomModal] = useState(false);

  // Prayer Times Modal State
  const [showPrayerModal, setShowPrayerModal] = useState(false);

  // Short Surahs Modal State
  const [showSurahsModal, setShowSurahsModal] = useState(false);
  const [surahsModalTab, setSurahsModalTab] = useState<'juz_amma' | 'yasin' | 'tahlil' | 'sholawat' | 'mahalul_qiyam' | 'dzikir_sholat' | 'doa_harian' | 'tata_cara_sholat'>('juz_amma');

  const handleOpenSurahsModal = (tab: 'juz_amma' | 'yasin' | 'tahlil' | 'sholawat' | 'mahalul_qiyam' | 'dzikir_sholat' | 'doa_harian' | 'tata_cara_sholat' = 'juz_amma') => {
    setSurahsModalTab(tab);
    setShowSurahsModal(true);
  };

  // Selected Prayer City
  const [selectedCity, setSelectedCity] = useState<CityLocation>(() => {
    try {
      const saved = localStorage.getItem(PRAYER_CITY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = INDONESIA_CITIES.find((c) => c.name === parsed.name);
        return match || INDONESIA_CITIES[0];
      }
    } catch {
      // fallback
    }
    return INDONESIA_CITIES[0];
  });

  const handleCityChange = (city: CityLocation) => {
    setSelectedCity(city);
    try {
      localStorage.setItem(PRAYER_CITY_KEY, JSON.stringify(city));
    } catch {
      // ignore
    }
  };

  // Active Logged-in User Session State
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Master Students Data
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());

  // Fasting Sessions Data
  const [sessions, setSessions] = useState<Record<string, FastingSession>>(() =>
    getStoredSessions()
  );

  // Admin Settings (Fasting Target, Sync, Color Theme, School Identity)
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() =>
    getStoredAdminSettings()
  );

  // Active theme configuration
  const activeTheme = useMemo(() => getTheme(adminSettings.colorTheme), [adminSettings.colorTheme]);

  // Apply Theme CSS variables & attributes to Document Root
  useEffect(() => {
    applyThemeToDocument(adminSettings.colorTheme);
  }, [adminSettings.colorTheme]);

  // Supabase Cloud State & Modal
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(() => isSupabaseConfigured());
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  // Active sub-view tab for navigation
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTabType>(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'admin') return 'admin';
        if (u.role === 'penginput') return 'input';
        if (u.role === 'haid') return 'catat_haid';
        return 'checker';
      }
    } catch {}
    return 'admin';
  });

  // Haid Records (Fiqih Udzur Syar'i)
  const [haidRecords, setHaidRecords] = useState<HaidRecord[]>(() => getStoredHaidRecords());
  const [preselectedHaidStudent, setPreselectedHaidStudent] = useState<Student | undefined>(undefined);

  // Active Session ID
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const all = getStoredSessions();
    const keys = Object.keys(all);
    return keys.length > 0 ? keys[0] : '2026-08-27_Puasa_Senin';
  });

  // Modal & Toast States
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoTargetStudent, setPhotoTargetStudent] = useState<Student | null>(null);
  const [isHaidNotificationModalOpen, setIsHaidNotificationModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Haid Count
  const activeHaidCount = useMemo(() => {
    return haidRecords.filter((r) => r.status === 'haid_aktif').length;
  }, [haidRecords]);

  // Helper to open student photo modal
  const handleOpenPhotoModal = useCallback((student?: Student) => {
    setPhotoTargetStudent(student || null);
    setIsPhotoModalOpen(true);
  }, []);

  // Show auto-dismiss toast helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Fetch initial data from Supabase & Setup Realtime Sync
  const loadCloudData = useCallback(async () => {
    const configured = isSupabaseConfigured();
    setIsCloudConnected(configured);

    if (!configured) return;

    setIsCloudSyncing(true);
    try {
      // 1. Fetch Students
      const cloudStudents = await fetchStudentsFromSupabase();
      if (cloudStudents && cloudStudents.length > 0) {
        setStudents(cloudStudents);
        saveStoredStudents(cloudStudents);
      }

      // 2. Fetch Sessions
      const cloudSessions = await fetchSessionsFromSupabase();
      if (cloudSessions && Object.keys(cloudSessions).length > 0) {
        setSessions(cloudSessions);
        saveAllStoredSessions(cloudSessions);

        const keys = Object.keys(cloudSessions);
        if (!cloudSessions[activeSessionId] && keys.length > 0) {
          setActiveSessionId(keys[0]);
        }
      }

      // 3. Fetch Admin Settings
      const cloudSettings = await fetchAdminSettingsFromSupabase();
      if (cloudSettings) {
        setAdminSettings((prev) => {
          const merged: AdminSettings = {
            ...prev,
            ...cloudSettings,
            colorTheme: cloudSettings.colorTheme || prev.colorTheme || 'emerald',
            schoolName: cloudSettings.schoolName || prev.schoolName || "SMP-SMA TAHFIDZ AL-QUR'AN",
            schoolSubName: cloudSettings.schoolSubName || prev.schoolSubName || 'SR 1 KEDIRI',
          };
          saveStoredAdminSettings(merged);
          return merged;
        });
      }
    } catch (e) {
      console.error('Error saat loadCloudData:', e);
    } finally {
      setIsCloudSyncing(false);
    }
  }, [activeSessionId]);

  useEffect(() => {
    loadCloudData();

    // Subscribe to Realtime Postgres Changes with smart diffing
    const unsubscribe = setupSupabaseRealtime(
      (updatedSession) => {
        setSessions((prev) => {
          const existing = prev[updatedSession.id];
          // Skip redundant re-renders if updatedAt is identical or older
          if (existing && existing.updatedAt && updatedSession.updatedAt && existing.updatedAt >= updatedSession.updatedAt) {
            return prev;
          }
          const next = { ...prev, [updatedSession.id]: updatedSession };
          saveAllStoredSessions(next);
          return next;
        });
      },
      (deletedId) => {
        setSessions((prev) => {
          if (!prev[deletedId]) return prev;
          const next = { ...prev };
          delete next[deletedId];
          saveAllStoredSessions(next);
          return next;
        });
      },
      async () => {
        const cloudStudents = await fetchStudentsFromSupabase();
        if (cloudStudents && cloudStudents.length > 0) {
          setStudents(cloudStudents);
          saveStoredStudents(cloudStudents);
        }
      },
      (newSettings) => {
        setAdminSettings((prev) => {
          const merged: AdminSettings = {
            ...prev,
            ...newSettings,
            colorTheme: newSettings.colorTheme || prev.colorTheme || 'emerald',
            schoolName: newSettings.schoolName || prev.schoolName || "SMP-SMA TAHFIDZ AL-QUR'AN",
            schoolSubName: newSettings.schoolSubName || prev.schoolSubName || 'SR 1 KEDIRI',
          };
          saveStoredAdminSettings(merged);
          return merged;
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [loadCloudData, showToast]);

  // Login handler
  const handleLogin = (session: UserSession) => {
    setUser(session);
    if (session.role === 'admin') {
      setActiveAdminTab('admin');
    } else if (session.role === 'penginput') {
      setActiveAdminTab('input');
    } else if (session.role === 'haid') {
      setActiveAdminTab('catat_haid');
    } else if (session.role === 'sholat') {
      setActiveAdminTab('sholat');
    } else {
      setActiveAdminTab('checker');
    }
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error(e);
    }
    showToast(`Selamat datang, ${session.name}!`);
    setShowWisdomModal(true);
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
  };

  // Update Students master data
  const handleUpdateStudents = async (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStoredStudents(newStudents);

    if (isSupabaseConfigured()) {
      await syncAllStudentsToSupabase(newStudents);
    }
  };

  const handleResetStudents = async () => {
    const reset = resetStoredStudents();
    setStudents(reset);
    if (isSupabaseConfigured()) {
      await syncAllStudentsToSupabase(reset);
    }
  };

  // Create new Fasting Session (Restricted to Admin Only)
  const handleCreateSession = async (title: string, date: string) => {
    if (user?.role !== 'admin') {
      showToast('⚠️ Hak Akses Dibatasi: Hanya Administrator yang berhak menambahkan sesi baru.');
      return;
    }

    const id = `${date}_${title.trim().replace(/\s+/g, '_')}`;
    const newSession: FastingSession = {
      id,
      title,
      date,
      records: {},
      isVerified: false,
      isLocked: false,
      createdById: user?.username,
      updatedAt: new Date().toISOString(),
    };

    saveSession(newSession);
    const updatedSessions = getStoredSessions();
    setSessions(updatedSessions);
    setActiveSessionId(id);
    showToast(`✅ Sesi baru "${title}" berhasil dibuat oleh Admin!`);

    if (isSupabaseConfigured()) {
      await upsertSessionToSupabase(newSession);
    }
  };

  // Toggle lock state for a session
  const handleToggleLockSession = async (sessionId: string, isLocked: boolean) => {
    const current = sessions[sessionId];
    if (!current) return;

    const updatedSession: FastingSession = {
      ...current,
      isLocked,
      lockedAt: isLocked ? new Date().toISOString() : undefined,
      lockedBy: isLocked ? (user?.name || 'Admin') : undefined,
      updatedAt: new Date().toISOString(),
    };

    saveSession(updatedSession);
    setSessions((prev) => ({
      ...prev,
      [sessionId]: updatedSession,
    }));

    showToast(
      isLocked
        ? `Sesi "${current.title}" berhasil DIKUNCI (Hanya Lihat)!`
        : `Sesi "${current.title}" berhasil DIBUKA untuk penginputan!`
    );

    if (isSupabaseConfigured()) {
      await upsertSessionToSupabase(updatedSession);
    }
  };

  // Update Admin Settings
  const handleUpdateAdminSettings = async (newSettings: AdminSettings) => {
    setAdminSettings(newSettings);
    saveStoredAdminSettings(newSettings);
    showToast('Pengaturan Administrator berhasil disimpan!');

    if (isSupabaseConfigured()) {
      await saveAdminSettingsToSupabase(newSettings);
    }
  };

  // Update single student record in active session
  const handleUpdateRecord = async (
    studentId: number,
    status: FastingStatus,
    notes?: string
  ) => {
    const currentActive = sessions[activeSessionId];
    if (!currentActive) return;

    // Check lock
    if (currentActive.isLocked && user?.role !== 'admin') {
      showToast('⚠️ Sesi ini dikunci oleh Admin. Data tidak dapat diubah.');
      return;
    }

    const updatedRecords = {
      ...currentActive.records,
      [studentId]: {
        studentId,
        status,
        notes: notes !== undefined ? notes : currentActive.records[studentId]?.notes,
        updatedAt: new Date().toISOString(),
      },
    };

    const updatedSession: FastingSession = {
      ...currentActive,
      records: updatedRecords,
      updatedAt: new Date().toISOString(),
    };

    saveSession(updatedSession);
    setSessions((prev) => ({
      ...prev,
      [activeSessionId]: updatedSession,
    }));

    if (isSupabaseConfigured()) {
      upsertSessionToSupabase(updatedSession);
    }
  };

  // Bulk update student records (e.g., mark all as fasting)
  const handleBulkUpdateRecords = async (
    updates: { studentId: number; status: FastingStatus }[]
  ) => {
    const currentActive = sessions[activeSessionId];
    if (!currentActive) return;

    if (currentActive.isLocked && user?.role !== 'admin') {
      showToast('⚠️ Sesi ini dikunci oleh Admin. Data tidak dapat diubah.');
      return;
    }

    const updatedRecords = { ...currentActive.records };

    updates.forEach(({ studentId, status }) => {
      updatedRecords[studentId] = {
        studentId,
        status,
        notes: updatedRecords[studentId]?.notes,
        updatedAt: new Date().toISOString(),
      };
    });

    const updatedSession: FastingSession = {
      ...currentActive,
      records: updatedRecords,
      updatedAt: new Date().toISOString(),
    };

    saveSession(updatedSession);
    setSessions((prev) => ({
      ...prev,
      [activeSessionId]: updatedSession,
    }));

    showToast(`Berhasil memperbarui ${updates.length} data siswa!`);

    if (isSupabaseConfigured()) {
      upsertSessionToSupabase(updatedSession);
    }
  };

  // Verify Fasting Session by Verifier (pengecek)
  const handleVerifySession = async (verifiedBy: string, verifierNotes?: string) => {
    const currentActive = sessions[activeSessionId];
    if (!currentActive) return;

    const updatedSession: FastingSession = {
      ...currentActive,
      isVerified: true,
      verifiedBy,
      verifierNotes,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveSession(updatedSession);
    setSessions((prev) => ({
      ...prev,
      [activeSessionId]: updatedSession,
    }));

    showToast(`Sesi "${currentActive.title}" resmi disahkan oleh ${verifiedBy}!`);

    if (isSupabaseConfigured()) {
      await upsertSessionToSupabase(updatedSession);
    }
  };

  // Delete Fasting Session (Only allowed by Admin)
  const handleDeleteSession = async (sessionId: string) => {
    if (user?.role !== 'admin') {
      showToast('⚠️ Hanya Administrator yang memiliki hak menghapus sesi.');
      return;
    }

    const sessionToDelete = sessions[sessionId];
    deleteSession(sessionId);
    const updatedSessions = getStoredSessions();
    setSessions(updatedSessions);

    const keys = Object.keys(updatedSessions);
    if (activeSessionId === sessionId) {
      if (keys.length > 0) {
        setActiveSessionId(keys[0]);
      } else {
        const defaultId = `${new Date().toISOString().split('T')[0]}_Puasa_Senin`;
        const defaultSession: FastingSession = {
          id: defaultId,
          title: 'Puasa Sunnah Senin',
          date: new Date().toISOString().split('T')[0],
          records: {},
          isVerified: false,
          isLocked: false,
          updatedAt: new Date().toISOString(),
        };
        saveSession(defaultSession);
        const reloaded = getStoredSessions();
        setSessions(reloaded);
        setActiveSessionId(defaultId);
      }
    }
    showToast(`Sesi "${sessionToDelete?.title || 'Riwayat'}" berhasil dihapus!`);

    if (isSupabaseConfigured()) {
      await deleteSessionFromSupabase(sessionId);
    }
  };

  // --- HAID & SUCI (FIQIH UDZUR SYAR'I) HANDLERS ---
  const handleSaveHaidRecord = (record: HaidRecord, autoUpdateFasting: boolean) => {
    // 1. Save or replace in HaidRecords
    const existingIndex = haidRecords.findIndex((r) => r.id === record.id);
    let updated: HaidRecord[];
    if (existingIndex >= 0) {
      updated = [...haidRecords];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...haidRecords];
    }
    setHaidRecords(updated);
    saveStoredHaidRecords(updated);

    // 2. If autoUpdateFasting is true, update the active session's record for this student to 'halangan'
    if (autoUpdateFasting && activeSession) {
      const currentActive = sessions[activeSessionId];
      if (currentActive) {
        const updatedRecords = {
          ...currentActive.records,
          [record.studentId]: {
            studentId: record.studentId,
            status: 'halangan' as FastingStatus,
            notes: `Udzur Syar'i (Haid) - Dicatat oleh ${record.recordedBy}`,
            updatedAt: new Date().toISOString(),
          },
        };
        const updatedSession: FastingSession = {
          ...currentActive,
          records: updatedRecords,
          updatedAt: new Date().toISOString(),
        };
        saveSession(updatedSession);
        setSessions((prev) => ({
          ...prev,
          [activeSessionId]: updatedSession,
        }));
        if (isSupabaseConfigured()) {
          upsertSessionToSupabase(updatedSession);
        }
      }
    }

    showToast(`✅ Catatan haid ${record.studentName} berhasil disimpan!`);
  };

  const handleFinishHaid = (
    recordId: string,
    endDate: string,
    endTime: string,
    mandiNotes?: string
  ) => {
    const updated = haidRecords.map((r) => {
      if (r.id === recordId) {
        return {
          ...r,
          status: 'selesai_mandi' as const,
          endDate,
          endTime,
          mandiWajibAt: `${endDate} ${endTime}`,
          notes: mandiNotes ? `${r.notes ? r.notes + ' | ' : ''}${mandiNotes}` : r.notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    setHaidRecords(updated);
    saveStoredHaidRecords(updated);
    showToast(`🌸 Status santriwati berhasil diperbarui ke DAFTAR SUCI (Siap Ibadah)!`);
  };

  const handleUpdateHaidRecord = (record: HaidRecord) => {
    const updated = haidRecords.map((r) => (r.id === record.id ? record : r));
    setHaidRecords(updated);
    saveStoredHaidRecords(updated);
    showToast(`✅ Perubahan catatan haid ${record.studentName} disimpan.`);
  };

  const handleDeleteHaidRecord = (recordId: string) => {
    const target = haidRecords.find((r) => r.id === recordId);
    const updated = haidRecords.filter((r) => r.id !== recordId);
    setHaidRecords(updated);
    saveStoredHaidRecords(updated);
    showToast(`Catatan haid ${target?.studentName || ''} berhasil dihapus.`);
  };

  const handleNavigateToCatatHaid = (student?: Student) => {
    setPreselectedHaidStudent(student);
    setActiveAdminTab('catat_haid');
  };

  // Get active session object safely
  const activeSession = sessions[activeSessionId] || {
    id: activeSessionId,
    title: 'Puasa Sunnah Kamis',
    date: '2026-08-27',
    records: {},
    isVerified: false,
    isLocked: false,
  };

  const isAdmin = user?.role === 'admin';
  const isPenginput = user?.role === 'penginput';

  return (
    <>
      {showSplash && (
        <SplashScreen
          onFinish={() => {
            setShowSplash(false);
            setShowWisdomModal(true);
          }}
        />
      )}

      {/* PWA Auto-Detection & Installation Prompt Component */}
      <PwaInstallPrompt pwaState={pwaState} />

      {!user ? (
        <LoginForm
          onLogin={handleLogin}
          isSupabaseConnected={isCloudConnected}
          onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
          onInstallPwa={pwaState.triggerInstall}
          isPwaInstalled={pwaState.isInstalled}
          onOpenWisdomModal={() => setShowWisdomModal(true)}
          onOpenPrayerModal={() => setShowPrayerModal(true)}
          onOpenSurahsModal={() => setShowSurahsModal(true)}
        />
      ) : (
        <div className="min-h-screen bg-emerald-950/5 flex flex-col font-sans text-gray-900">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold">{toastMessage}</span>
            </div>
          )}

          {/* Main Navbar with Supabase Cloud Status Indicator */}
          <HeaderNavbar
            user={user}
            onLogout={handleLogout}
            adminSettings={adminSettings}
            activeSessionTitle={activeSession.title}
            activeSessionDate={activeSession.date}
            activeAdminTab={activeAdminTab}
            onSelectAdminTab={setActiveAdminTab}
            isSupabaseConnected={isCloudConnected}
            onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
            onInstallPwa={pwaState.triggerInstall}
            isPwaInstalled={pwaState.isInstalled}
            onOpenWisdomModal={() => setShowWisdomModal(true)}
            onOpenPrayerModal={() => setShowPrayerModal(true)}
            onOpenSurahsModal={(tab) => handleOpenSurahsModal(tab || 'juz_amma')}
            haidActiveCount={activeHaidCount}
            onOpenHaidNotification={() => setIsHaidNotificationModalOpen(true)}
            selectedCity={selectedCity}
            hasUpdate={autoUpdate.hasUpdate}
            isUpdating={autoUpdate.isUpdating}
            onApplyUpdate={autoUpdate.applyUpdate}
          />

          {/* Main Container */}
          <main className="max-w-7xl w-full mx-auto px-3 sm:px-5 lg:px-6 py-2.5 sm:py-3.5 flex-1 space-y-3 sm:space-y-4">
            {/* Slim Sliding Banner Carousel (Ramadan, Hadith, Activity Highlights) */}
            {adminSettings.showTopBanner !== false &&
              activeAdminTab !== 'catat_haid' &&
              activeAdminTab !== 'daftar_haid' &&
              activeAdminTab !== 'daftar_suci' &&
              activeAdminTab !== 'sholat' && (
                <SlimBannerCarousel
                  onOpenCalendar={() => setActiveAdminTab('calendar')}
                  onOpenWisdom={() => setShowWisdomModal(true)}
                  onOpenPrayer={() => setShowPrayerModal(true)}
                  onOpenSurah={() => handleOpenSurahsModal('juz_amma')}
                  schoolName={adminSettings.schoolName}
                />
              )}

            {/* Live Ramadan Prayer Times & Imsakiyah Banner Card (Hidden on Admin, Ceklist, Form Input, Raport, Calendar, Catat Haid, Daftar Haid, Daftar Suci, and Sholat for a clean focused view) */}
            {activeAdminTab !== 'admin' &&
              activeAdminTab !== 'calendar' &&
              activeAdminTab !== 'input' &&
              activeAdminTab !== 'raport' &&
              activeAdminTab !== 'checker' &&
              activeAdminTab !== 'catat_haid' &&
              activeAdminTab !== 'daftar_haid' &&
              activeAdminTab !== 'daftar_suci' &&
              activeAdminTab !== 'sholat' && (
                <PrayerTimeBannerCard
                  onOpenModal={() => setShowPrayerModal(true)}
                  onOpenSurahsModal={() => handleOpenSurahsModal('juz_amma')}
                  onOpenCalendar={() => setActiveAdminTab('calendar')}
                  city={selectedCity}
                />
              )}

            {/* Session Selector / Creator Block (Shown on regular fasting session workflows; hidden on admin, raport, calendar, catat haid, daftar haid, daftar suci, and sholat) */}
            {activeAdminTab !== 'admin' &&
              activeAdminTab !== 'raport' &&
              activeAdminTab !== 'calendar' &&
              activeAdminTab !== 'catat_haid' &&
              activeAdminTab !== 'daftar_haid' &&
              activeAdminTab !== 'daftar_suci' &&
              activeAdminTab !== 'sholat' && (
                <SessionSelector
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onSelectSession={(id) => setActiveSessionId(id)}
                  onCreateSession={handleCreateSession}
                  onDeleteSession={isAdmin ? handleDeleteSession : undefined}
                  isAdmin={isAdmin}
                  canCreateSession={isAdmin}
                />
              )}

            {/* View Switcher based on User Role & Selected Navigation Tab */}
            {activeAdminTab === 'sholat' ? (
              <div key="sholat" className="w-full relative transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
                <PrayerAttendanceView
                  students={students}
                  haidRecords={haidRecords}
                  currentUser={user}
                  onOpenPhotoModal={(st) => handleOpenPhotoModal(st)}
                />
              </div>
            ) : activeAdminTab === 'catat_haid' || activeAdminTab === 'daftar_haid' || activeAdminTab === 'daftar_suci' ? (
              <div key={activeAdminTab} className="w-full relative transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
                {activeAdminTab === 'catat_haid' ? (
                  <CatatHaidView
                    students={students}
                    haidRecords={haidRecords}
                    activeSession={activeSession}
                    currentUserName={user.name}
                    preselectedStudent={preselectedHaidStudent}
                    onSaveHaidRecord={handleSaveHaidRecord}
                    onNavigateToDaftarHaid={() => setActiveAdminTab('daftar_haid')}
                    onNavigateToDaftarSuci={() => setActiveAdminTab('daftar_suci')}
                  />
                ) : activeAdminTab === 'daftar_haid' ? (
                  <DaftarHaidView
                    students={students}
                    haidRecords={haidRecords}
                    currentUserName={user.name}
                    onFinishHaid={handleFinishHaid}
                    onUpdateHaidRecord={handleUpdateHaidRecord}
                    onDeleteHaidRecord={handleDeleteHaidRecord}
                    onNavigateToCatatHaid={() => {
                      setPreselectedHaidStudent(undefined);
                      setActiveAdminTab('catat_haid');
                    }}
                    onNavigateToDaftarSuci={() => setActiveAdminTab('daftar_suci')}
                  />
                ) : (
                  <DaftarSuciView
                    students={students}
                    haidRecords={haidRecords}
                    onNavigateToCatatHaid={handleNavigateToCatatHaid}
                    onNavigateToDaftarHaid={() => setActiveAdminTab('daftar_haid')}
                  />
                )}
              </div>
            ) : activeAdminTab === 'calendar' ? (
              <CalendarView
                sessions={Object.values(sessions)}
                students={students}
                user={user}
                activeSessionId={activeSessionId}
                onSelectSession={(id) => {
                  setActiveSessionId(id);
                }}
                onCreateSessionForDate={(dateStr, title) => {
                  if (isAdmin) {
                    handleCreateSession(title, dateStr);
                    setActiveAdminTab('input');
                  } else {
                    showToast('⚠️ Hanya Administrator yang berhak membuat sesi baru.');
                  }
                }}
                onNavigateToTab={(tab) => setActiveAdminTab(tab)}
              />
            ) : activeAdminTab === 'raport' ? (
              <RaportImtaqView
                students={students}
                sessions={sessions}
                user={user}
              />
            ) : isAdmin ? (
              activeAdminTab === 'admin' ? (
                <AdminPanel
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  activeSession={activeSession}
                  students={students}
                  adminSettings={adminSettings}
                  onToggleLockSession={handleToggleLockSession}
                  onUpdateAdminSettings={handleUpdateAdminSettings}
                  onDeleteSession={handleDeleteSession}
                  onSelectSession={(id) => setActiveSessionId(id)}
                  onCreateSession={handleCreateSession}
                  onSwitchView={(tab) => setActiveAdminTab(tab)}
                  onOpenStudentModal={() => setIsStudentModalOpen(true)}
                  onOpenPhotoModal={handleOpenPhotoModal}
                  onUpdateStudents={handleUpdateStudents}
                  isSupabaseConnected={isCloudConnected}
                  onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
                />
              ) : activeAdminTab === 'input' ? (
                <FastingInputterView
                  students={students}
                  activeSession={activeSession}
                  haidRecords={haidRecords}
                  onUpdateRecord={handleUpdateRecord}
                  onBulkUpdateRecords={handleBulkUpdateRecords}
                  onOpenStudentModal={() => setIsStudentModalOpen(true)}
                  onOpenPhotoModal={() => handleOpenPhotoModal()}
                  isAdmin={true}
                  onToggleLockSession={handleToggleLockSession}
                  onLogout={handleLogout}
                  onUpdateStudents={handleUpdateStudents}
                />
              ) : (
                <FastingCheckerView
                  students={students}
                  activeSession={activeSession}
                  user={user}
                  onVerifySession={handleVerifySession}
                  onLogout={handleLogout}
                />
              )
            ) : isPenginput ? (
              activeAdminTab === 'input' ? (
                <FastingInputterView
                  students={students}
                  activeSession={activeSession}
                  haidRecords={haidRecords}
                  onUpdateRecord={handleUpdateRecord}
                  onBulkUpdateRecords={handleBulkUpdateRecords}
                  onOpenPhotoModal={() => handleOpenPhotoModal()}
                  isAdmin={false}
                  onLogout={handleLogout}
                  onUpdateStudents={handleUpdateStudents}
                />
              ) : (
                <RaportImtaqView
                  students={students}
                  sessions={sessions}
                  user={user}
                  onLogout={handleLogout}
                />
              )
            ) : (
              activeAdminTab === 'checker' ? (
                <FastingCheckerView
                  students={students}
                  activeSession={activeSession}
                  user={user}
                  onVerifySession={handleVerifySession}
                  onLogout={handleLogout}
                />
              ) : (
                <RaportImtaqView
                  students={students}
                  sessions={sessions}
                  user={user}
                  onLogout={handleLogout}
                />
              )
            )}
          </main>

          {/* Student Data Management Modal */}
          {isStudentModalOpen && (
            <StudentDataModal
              isOpen={isStudentModalOpen}
              onClose={() => setIsStudentModalOpen(false)}
              students={students}
              onUpdateStudents={handleUpdateStudents}
              onResetStudents={handleResetStudents}
              onOpenPhotoModal={() => handleOpenPhotoModal()}
            />
          )}

          {/* Student Photo Upload & Management Modal */}
          {isPhotoModalOpen && (
            <StudentPhotoUploadModal
              isOpen={isPhotoModalOpen}
              onClose={() => {
                setIsPhotoModalOpen(false);
                setPhotoTargetStudent(null);
              }}
              students={students}
              onUpdateStudents={handleUpdateStudents}
              targetStudent={photoTargetStudent}
            />
          )}

          {/* Clean Footer */}
          <footer className={`${activeTheme.colors.footerBgClass} text-white/80 text-xs py-5 border-t border-white/10 mt-12 transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <img src="/assets/logo.svg" alt="Logo" className="w-5 h-5 object-contain" />
                <span className="font-bold text-white">
                  PUASAKU - {adminSettings.schoolSubName || 'SR 1 KEDIRI'}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
                {!pwaState.isInstalled && (
                  <>
                    <button
                      type="button"
                      onClick={pwaState.triggerInstall}
                      className="text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Pasang PWA di HP</span>
                    </button>
                    <span className="text-white/30">•</span>
                  </>
                )}
                <span className="text-[11px] text-amber-300 font-medium">
                  {isCloudConnected ? 'Cloud Supabase Terhubung' : 'Penyimpanan Aman'}
                </span>
                <span className="text-white/30">•</span>
                <p className="text-[11px] text-white/70">
                  Aplikasi Pencatatan & Verifikasi Amalan Puasa Siswa © {new Date().getFullYear()}
                </p>
                <span className="text-white/30">•</span>
                <p className="text-[11px] text-white/80 font-medium flex items-center gap-1">
                  <span>Dibuat oleh</span>
                  <span className="font-bold text-amber-300">eccko developer</span>
                </p>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Ramadan Fasting Wisdom Modal (Hourly Rotated) */}
      {showWisdomModal && (
        <FastingWisdomModal
          isOpen={showWisdomModal}
          onClose={() => setShowWisdomModal(false)}
          userName={user?.name}
          roleName={
            user?.role === 'admin'
              ? 'Administrator Utama'
              : user?.role === 'penginput'
              ? 'Penginput Data'
              : user?.role === 'pengecek'
              ? 'Petugas Pengecek'
              : undefined
          }
        />
      )}

      {/* Ramadan Prayer Times & Imsakiyah Modal */}
      {showPrayerModal && (
        <PrayerTimesModal
          isOpen={showPrayerModal}
          onClose={() => setShowPrayerModal(false)}
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
        />
      )}

      {/* Short Surahs (Juz 'Amma, Yasin, Tahlil, Mahalul Qiyam, Dzikir & Doa) Modal */}
      {showSurahsModal && (
        <ShortSurahsModal
          isOpen={showSurahsModal}
          onClose={() => setShowSurahsModal(false)}
          initialTab={surahsModalTab}
        />
      )}

      {/* Supabase Cloud Connection & Sync Modal */}
      {isSupabaseModalOpen && (
        <SupabaseConfigModal
          isOpen={isSupabaseModalOpen}
          onClose={() => {
            setIsSupabaseModalOpen(false);
            setIsCloudConnected(isSupabaseConfigured());
          }}
          students={students}
          sessions={sessions}
          adminSettings={adminSettings}
          onSyncCompleted={() => {
            loadCloudData();
            showToast('Data berhasil disinkronkan ke Supabase Cloud!');
          }}
        />
      )}

      {/* Notifikasi Haid Siswi Modal */}
      {isHaidNotificationModalOpen && (
        <HaidNotificationModal
          isOpen={isHaidNotificationModalOpen}
          onClose={() => setIsHaidNotificationModalOpen(false)}
          haidRecords={haidRecords}
          students={students}
        />
      )}
    </>
  );
}

