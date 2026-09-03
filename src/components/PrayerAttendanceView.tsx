import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Student,
  HaidRecord,
  PrayerName,
  PrayerStatus,
  PrayerAttendanceRecord,
  UserSession,
} from '../types';
import {
  PRAYER_SLOTS,
  detectCurrentPrayerSlot,
  calculatePrayerStatus,
  isStudentInActiveHaid,
  getStoredPrayerRecords,
  savePrayerRecords,
  formatIndoDate,
} from '../utils/prayerAttendance';
import { playScanSuccessSound, triggerHaptic } from '../utils/audioNotification';
import {
  Clock,
  Camera,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Volume2,
  Calendar,
  UserCheck,
  UserX,
  Filter,
  RefreshCw,
  Copy,
  Check,
  Flame,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Droplets,
  HeartPulse,
  Share2,
  Info,
  Maximize2,
  BookOpen,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface PrayerAttendanceViewProps {
  students: Student[];
  haidRecords: HaidRecord[];
  currentUser: UserSession | null;
  onOpenPhotoModal?: (student: Student) => void;
}

export const PrayerAttendanceView: React.FC<PrayerAttendanceViewProps> = ({
  students,
  haidRecords,
  currentUser,
  onOpenPhotoModal,
}) => {
  // Current real-time clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Active selected prayer (defaults to auto-detected slot)
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerName>(() => {
    return detectCurrentPrayerSlot().prayer;
  });

  // Active date for recording (defaults to today YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Active sub-tab: 'input' | 'terlambat' | 'tidak_hadir' | 'rekap'
  const [activeTab, setActiveTab] = useState<'input' | 'terlambat' | 'tidak_hadir' | 'rekap'>('input');

  // Stored prayer records
  const [records, setRecords] = useState<PrayerAttendanceRecord[]>(() => getStoredPrayerRecords());

  // Input & search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState<'ALL' | 'Laki-laki' | 'Perempuan'>('ALL');
  const [manualInputCode, setManualInputCode] = useState('');

  // Manual status override during quick input (default: 'auto' will calculate based on clock)
  const [inputStatusMode, setInputStatusMode] = useState<'auto' | 'tepat_waktu' | 'terlambat' | 'sakit' | 'izin'>('auto');

  // Camera Scanner active state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = 'prayer-inline-qr-reader';

  // Last scanned student notification toast
  const [lastScannedResult, setLastScannedResult] = useState<{
    student: Student;
    record: PrayerAttendanceRecord;
    message: string;
  } | null>(null);

  // Copy success indicator
  const [copiedState, setCopiedState] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Synchronize records with LocalStorage
  const updateRecords = (newRecords: PrayerAttendanceRecord[]) => {
    setRecords(newRecords);
    savePrayerRecords(newRecords);
  };

  // Detected slot based on real time
  const autoDetectedInfo = useMemo(() => {
    return detectCurrentPrayerSlot(currentTime);
  }, [currentTime]);

  // Current slot info for selected prayer
  const currentSlotInfo = PRAYER_SLOTS[selectedPrayer];

  // Calculated on-time / late status for the selected prayer at this moment
  const calculatedStatusAtMoment = useMemo(() => {
    return calculatePrayerStatus(selectedPrayer, currentTime);
  }, [selectedPrayer, currentTime]);

  // All unique classes for filter
  const classList = useMemo(() => {
    const set = new Set(students.map((s) => s.kelas).filter(Boolean));
    return Array.from(set).sort();
  }, [students]);

  // Filtered records for selected date & selected prayer
  const currentSessionRecords = useMemo(() => {
    return records.filter(
      (r) => r.date === selectedDate && r.prayer === selectedPrayer
    );
  }, [records, selectedDate, selectedPrayer]);

  // Map of studentId -> record for quick lookup
  const recordMap = useMemo(() => {
    const map = new Map<number, PrayerAttendanceRecord>();
    for (const rec of currentSessionRecords) {
      map.set(rec.studentId, rec);
    }
    return map;
  }, [currentSessionRecords]);

  // Total student counts & statistics
  const stats = useMemo(() => {
    let tepatWaktu = 0;
    let terlambat = 0;
    let sakit = 0;
    let izin = 0;
    let haid = 0;
    let belumAbsen = 0;

    students.forEach((student) => {
      const rec = recordMap.get(student.id);
      const isHaid = isStudentInActiveHaid(student.id, haidRecords);

      if (rec) {
        if (rec.status === 'tepat_waktu') tepatWaktu++;
        else if (rec.status === 'terlambat') terlambat++;
        else if (rec.status === 'sakit') sakit++;
        else if (rec.status === 'izin') izin++;
        else if (rec.status === 'haid') haid++;
      } else {
        if (isHaid) {
          haid++;
        } else {
          belumAbsen++;
        }
      }
    });

    const totalHadir = tepatWaktu + terlambat;
    const totalSantri = students.length;
    const persentaseHadir = totalSantri > 0 ? Math.round((totalHadir / totalSantri) * 100) : 0;
    const persentaseTepatWaktu = totalHadir > 0 ? Math.round((tepatWaktu / totalHadir) * 100) : 0;

    return {
      totalSantri,
      tepatWaktu,
      terlambat,
      sakit,
      izin,
      haid,
      belumAbsen,
      totalHadir,
      persentaseHadir,
      persentaseTepatWaktu,
    };
  }, [students, recordMap, haidRecords]);

  // Students who are LATE (Terlambat)
  const lateStudents = useMemo(() => {
    return currentSessionRecords
      .filter((r) => r.status === 'terlambat')
      .map((r) => {
        const student = students.find((s) => s.id === r.studentId);
        return {
          record: r,
          student,
        };
      })
      .filter((item) => item.student !== undefined);
  }, [currentSessionRecords, students]);

  // Students who have NOT scanned / Absent
  const absentStudents = useMemo(() => {
    return students
      .filter((student) => {
        if (selectedClass !== 'ALL' && student.kelas !== selectedClass) return false;
        if (selectedGender !== 'ALL' && student.jenisKelamin !== selectedGender) return false;
        const rec = recordMap.get(student.id);
        // If not recorded, or recorded as tidak_hadir / haid / sakit / izin
        return !rec || rec.status === 'tidak_hadir' || rec.status === 'haid' || rec.status === 'sakit' || rec.status === 'izin';
      })
      .map((student) => {
        const rec = recordMap.get(student.id);
        const isHaid = isStudentInActiveHaid(student.id, haidRecords);
        let effectiveStatus: PrayerStatus = rec ? rec.status : isHaid ? 'haid' : 'tidak_hadir';
        return {
          student,
          record: rec,
          isHaid,
          effectiveStatus,
        };
      });
  }, [students, recordMap, haidRecords, selectedClass, selectedGender]);

  // Filtered student list for quick search in input tab
  const filteredStudentsForInput = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return students.filter((s) => {
      if (selectedClass !== 'ALL' && s.kelas !== selectedClass) return false;
      if (selectedGender !== 'ALL' && s.jenisKelamin !== selectedGender) return false;
      if (!q) return true;
      return (
        s.nama.toLowerCase().includes(q) ||
        s.nik.includes(q) ||
        s.kelas.toLowerCase().includes(q) ||
        String(s.no).includes(q)
      );
    });
  }, [students, searchQuery, selectedClass, selectedGender]);

  // Handle Recording Attendance for a student
  const handleRecordAttendance = (
    student: Student,
    forcedStatus?: PrayerStatus,
    customNotes?: string
  ) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const scanTimeString = `${hours}:${minutes}:${seconds}`;

    // Check if student has active haid
    const isHaid = isStudentInActiveHaid(student.id, haidRecords);

    // Determine final status
    let finalStatus: PrayerStatus = 'tepat_waktu';
    let lateMins = 0;

    if (forcedStatus) {
      finalStatus = forcedStatus;
    } else if (inputStatusMode !== 'auto') {
      finalStatus = inputStatusMode;
    } else if (isHaid) {
      finalStatus = 'haid';
    } else {
      // Auto-calculate from current prayer time rules
      const calc = calculatePrayerStatus(selectedPrayer, now);
      finalStatus = calc.status;
      lateMins = calc.lateMinutes;
    }

    const recordId = `sholat-${selectedDate}-${selectedPrayer}-${student.id}`;
    const newRecord: PrayerAttendanceRecord = {
      id: recordId,
      studentId: student.id,
      studentName: student.nama,
      studentClass: student.kelas,
      studentNik: student.nik,
      date: selectedDate,
      prayer: selectedPrayer,
      status: finalStatus,
      scanTime: scanTimeString,
      recordedBy: currentUser?.name || 'Petugas Sholat',
      notes: customNotes || '',
      lateMinutes: lateMins,
      updatedAt: new Date().toISOString(),
    };

    // Play crisp audio feedback
    playScanSuccessSound();
    triggerHaptic(60);

    // Upsert record
    const updated = records.filter((r) => r.id !== recordId);
    updated.push(newRecord);
    updateRecords(updated);

    // Show instant toast
    let msg = '';
    if (finalStatus === 'tepat_waktu') {
      msg = `✅ Berhasil Hadir Tepat Waktu (${scanTimeString})`;
    } else if (finalStatus === 'terlambat') {
      msg = `⚠️ Hadir Terlambat (+${lateMins} mnt dari batas waktu)`;
    } else if (finalStatus === 'haid') {
      msg = `🩸 Tercatat Udzur Syar'i (Haid)`;
    } else if (finalStatus === 'sakit') {
      msg = `🏥 Tercatat Sakit di Asrama`;
    } else if (finalStatus === 'izin') {
      msg = `📝 Tercatat Izin Petugas / Dinas`;
    }

    setLastScannedResult({
      student,
      record: newRecord,
      message: msg,
    });
  };

  // Process Scanned Barcode / QR / NIS text
  const processScannedCode = (code: string) => {
    const clean = code.trim().toLowerCase();
    if (!clean) return;

    // Find student by NIK, No, or exact Name
    const found = students.find(
      (s) =>
        s.nik.toLowerCase() === clean ||
        String(s.no) === clean ||
        s.nama.toLowerCase() === clean
    );

    if (found) {
      handleRecordAttendance(found);
      setManualInputCode('');
    } else {
      triggerHaptic([100, 50, 100]);
      alert(`⚠️ Santri dengan Barcode / NIK "${code}" tidak ditemukan dalam database.`);
    }
  };

  // Camera scanner lifecycle & safety refs
  const processScannedCodeRef = useRef(processScannedCode);
  useEffect(() => {
    processScannedCodeRef.current = processScannedCode;
  });
  const lastScannedTimeRef = useRef<number>(0);

  useEffect(() => {
    const safeStopScanner = async (scanner: Html5Qrcode | null) => {
      if (!scanner) return;
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch {
        // Safe ignore
      }
      try {
        scanner.clear();
      } catch {
        // Safe ignore
      }
    };

    if (!isCameraActive) {
      if (scannerInstanceRef.current) {
        const inst = scannerInstanceRef.current;
        scannerInstanceRef.current = null;
        safeStopScanner(inst);
      }
      return;
    }

    let isMounted = true;
    let localScanner: Html5Qrcode | null = null;

    const startCamera = async () => {
      // Allow DOM element to mount
      await new Promise((r) => setTimeout(r, 120));
      if (!isMounted) return;

      const element = document.getElementById(qrRegionId);
      if (!element) return;

      try {
        localScanner = new Html5Qrcode(qrRegionId);
        scannerInstanceRef.current = localScanner;
        setCameraError(null);

        await localScanner.start(
          { facingMode: 'environment' },
          { fps: 15, qrbox: { width: 260, height: 180 } },
          (decodedText) => {
            if (!isMounted) return;
            const now = Date.now();
            if (now - lastScannedTimeRef.current < 1200) return;
            lastScannedTimeRef.current = now;
            processScannedCodeRef.current(decodedText);
          },
          () => {}
        );

        if (!isMounted && localScanner) {
          await safeStopScanner(localScanner);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        console.error('Camera sholat error:', err);
        const errMsg = String(err || '');
        if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission denied')) {
          setCameraError('Akses kamera diblokir. Izinkan izin kamera pada browser Anda.');
        } else if (errMsg.includes('Cannot transition')) {
          // Ignore transient transition error
        } else {
          setCameraError('Gagal mengakses kamera. Pastikan kamera terhubung.');
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (localScanner) {
        const inst = localScanner;
        localScanner = null;
        scannerInstanceRef.current = null;
        safeStopScanner(inst);
      }
    };
  }, [isCameraActive]);

  // Bulk mark all remaining absent as 'tidak_hadir'
  const handleBulkMarkAbsent = () => {
    const confirm = window.confirm(
      `Apakah Anda yakin ingin menandai seluruh ${stats.belumAbsen} santri yang belum scan sebagai "Tidak Hadir / Alpa" untuk Sholat ${currentSlotInfo.label}?`
    );
    if (!confirm) return;

    const newRecords = [...records];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    students.forEach((student) => {
      const rec = recordMap.get(student.id);
      if (!rec) {
        const isHaid = isStudentInActiveHaid(student.id, haidRecords);
        const recordId = `sholat-${selectedDate}-${selectedPrayer}-${student.id}`;
        newRecords.push({
          id: recordId,
          studentId: student.id,
          studentName: student.nama,
          studentClass: student.kelas,
          studentNik: student.nik,
          date: selectedDate,
          prayer: selectedPrayer,
          status: isHaid ? 'haid' : 'tidak_hadir',
          scanTime: timeStr,
          recordedBy: currentUser?.name || 'Petugas Sholat',
          notes: isHaid ? 'Otomatis sinkron dari Buku Haid' : 'Tidak Hadir Berjamaah',
          lateMinutes: 0,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    updateRecords(newRecords);
    alert('✅ Seluruh santri yang belum scan berhasil diperbarui!');
  };

  // Copy WhatsApp report text
  const handleCopyReport = () => {
    const text = `*📋 LAPORAN ABSENSI ${currentSlotInfo.label.toUpperCase()}*
📅 Hari/Tgl: ${formatIndoDate(selectedDate)}
🕌 Sesi: ${currentSlotInfo.label} (${currentSlotInfo.onTimeStart} - ${currentSlotInfo.onTimeEnd} WIB)
👤 Petugas: ${currentUser?.name || 'Petugas Sholat'}

*📊 RINGKASAN KEHADIRAN:*
👥 Total Santri: ${stats.totalSantri}
✅ Hadir Tepat Waktu: ${stats.tepatWaktu} santri
⚠️ Terlambat / Masbuq: ${stats.terlambat} santri
🩸 Udzur Syar'i (Haid): ${stats.haid} santriwati
🏥 Sakit: ${stats.sakit} santri
📝 Izin Pondok: ${stats.izin} santri
❌ Belum Hadir / Alpa: ${stats.belumAbsen} santri

*📈 Tingkat Kehadiran: ${stats.persentaseHadir}%*
*🎯 Ketepatan Waktu: ${stats.persentaseTepatWaktu}%*

${
  lateStudents.length > 0
    ? `*⚠️ DAFTAR SANTRI TERLAMBAT (${lateStudents.length}):*\n` +
      lateStudents
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.student?.nama} (${item.student?.kelas}) - Pukul ${item.record.scanTime} (+${item.record.lateMinutes || 0} mnt)${item.record.notes ? ` [${item.record.notes}]` : ''}`
        )
        .join('\n')
    : '✨ Alhamdulillah tidak ada santri yang terlambat.'
}

_Sistem Presensi Sholat Berjamaah - SMP-SMA Tahfidz Al-Qur\'an_`;

    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4fbf7] via-[#edf7f2] to-[#e4f3eb] text-slate-800 pb-16">
      {/* Top Emerald/Gold Banner & Live Clock Info (Compact, Lembut Terang Islami) */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 border-b border-emerald-700/50 px-3 py-2.5 sm:px-5 shadow-sm text-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 via-teal-300 to-amber-300 p-0.5 shadow-md shadow-emerald-950/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-emerald-900 rounded-[10px] flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-emerald-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Presensi Sholat Berjamaah
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40 font-serif">
                  {currentSlotInfo.arabicLabel}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/90 font-medium">
                Scanner Cepat & Pemantauan Disiplin Ibadah Santri SRT 1 Kediri
              </p>
            </div>
          </div>

          {/* Real-time Digital Clock & Status Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-emerald-950/60 border border-emerald-600/40 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-inner text-xs text-white">
              <div className="text-right">
                <div className="text-[10px] text-emerald-200/80 leading-tight">Waktu Server</div>
                <div className="text-sm font-mono font-bold text-amber-300 leading-none mt-0.5">
                  {currentTime.toLocaleTimeString('id-ID')} WIB
                </div>
              </div>
              <div className="h-6 w-px bg-emerald-700/60" />
              <div className="text-left">
                <div className="text-[10px] text-emerald-200/80 leading-tight">Aturan Jam</div>
                <div className="text-xs font-semibold leading-none mt-0.5">
                  {calculatedStatusAtMoment.status === 'tepat_waktu' ? (
                    <span className="text-emerald-200 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      🟢 Tepat Waktu ({currentSlotInfo.onTimeStart} - {currentSlotInfo.onTimeEnd})
                    </span>
                  ) : (
                    <span className="text-amber-200 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      🟡 Terlambat / Masbuq (&gt; {currentSlotInfo.onTimeEnd})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-600/40 rounded-xl px-2.5 py-1.5 text-xs text-emerald-100">
              <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 space-y-2.5">
        {/* 5 Waktu Sholat Selector Bar (Compact & Soft Islamic Nuance) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {(['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] as PrayerName[]).map((prayerKey) => {
            const slot = PRAYER_SLOTS[prayerKey];
            const isSelected = selectedPrayer === prayerKey;
            const isAutoActive = autoDetectedInfo.prayer === prayerKey;

            return (
              <button
                key={prayerKey}
                onClick={() => setSelectedPrayer(prayerKey)}
                className={`relative px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border text-left transition-all duration-150 overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                    : 'bg-white/95 text-slate-700 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50 shadow-xs'
                }`}
              >
                {isAutoActive && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className={`text-[10.5px] font-serif ${isSelected ? 'text-amber-200' : 'text-emerald-700 font-bold'}`}>
                    {slot.arabicLabel}
                  </div>
                </div>
                <div className={`font-bold text-xs sm:text-sm capitalize leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {slot.label}
                </div>
                <div className={`text-[10px] mt-0.5 font-mono ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                  {slot.onTimeStart} - {slot.onTimeEnd}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Rule Description Banner (Compact & Soft Islamic Nuance) */}
        <div className="bg-white/95 border border-emerald-200/80 rounded-xl px-3 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-700 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div className="text-[11.5px] leading-tight">
              <span className="font-bold text-emerald-900">Ketentuan {currentSlotInfo.label}:</span>{' '}
              <span className="text-slate-600">{currentSlotInfo.description}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold transition-colors cursor-pointer"
            >
              {copiedState ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-emerald-700" />}
              {copiedState ? 'Tersalin!' : 'Salin Laporan WA'}
            </button>
          </div>
        </div>

        {/* Quick Stats Grid (Compact 6-Columns - Soft Islamic Palette) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
          <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-xs">
            <div className="text-[10.5px] text-slate-500 font-medium">Total Santri</div>
            <div className="text-lg sm:text-xl font-black text-slate-800 mt-0.5">{stats.totalSantri}</div>
            <div className="text-[10px] text-slate-400">Semua santri</div>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 shadow-xs">
            <div className="text-[10.5px] text-emerald-800 font-bold flex items-center gap-1 truncate">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> Tepat Waktu
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-700 mt-0.5">{stats.tepatWaktu}</div>
            <div className="text-[10px] text-emerald-600/80 font-medium">{stats.persentaseTepatWaktu}% dr hadir</div>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 shadow-xs">
            <div className="text-[10.5px] text-amber-800 font-bold flex items-center gap-1 truncate">
              <Clock className="w-3 h-3 text-amber-600 shrink-0" /> Terlambat
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-700 mt-0.5">{stats.terlambat}</div>
            <div className="text-[10px] text-amber-600/80 font-medium">Masbuq</div>
          </div>

          <div className="bg-pink-50/80 border border-pink-200 rounded-xl p-2.5 shadow-xs">
            <div className="text-[10.5px] text-pink-800 font-bold flex items-center gap-1 truncate">
              <Droplets className="w-3 h-3 text-pink-600 shrink-0" /> Udzur Haid
            </div>
            <div className="text-lg sm:text-xl font-black text-pink-700 mt-0.5">{stats.haid}</div>
            <div className="text-[10px] text-pink-600/80 font-medium">Sinkron haid</div>
          </div>

          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2.5 shadow-xs">
            <div className="text-[10.5px] text-blue-800 font-bold flex items-center gap-1 truncate">
              <HeartPulse className="w-3 h-3 text-blue-600 shrink-0" /> Sakit / Izin
            </div>
            <div className="text-lg sm:text-xl font-black text-blue-700 mt-0.5">{stats.sakit + stats.izin}</div>
            <div className="text-[10px] text-blue-600/80 font-medium">Asrama/Izin</div>
          </div>

          <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-2.5 shadow-xs">
            <div className="text-[10.5px] text-rose-800 font-bold flex items-center gap-1 truncate">
              <UserX className="w-3 h-3 text-rose-600 shrink-0" /> Belum Hadir
            </div>
            <div className="text-lg sm:text-xl font-black text-rose-700 mt-0.5">{stats.belumAbsen}</div>
            <div className="text-[10px] text-rose-600/80 font-medium">Ghaib / Alpa</div>
          </div>
        </div>

        {/* Tab Navigation (Rapat & Rapi - Nuansa Lembut Terang) */}
        <div className="flex border-b border-emerald-200/80 gap-1 sm:gap-2 overflow-x-auto pb-0.5 pt-1">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'input'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-emerald-800 hover:bg-emerald-50/50'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Input Presensi</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold">
              {stats.totalHadir}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('terlambat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'terlambat'
                ? 'border-amber-600 text-amber-800 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-amber-800 hover:bg-amber-50/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Daftar Terlambat</span>
            {stats.terlambat > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono font-bold">
                {stats.terlambat}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tidak_hadir')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'tidak_hadir'
                ? 'border-rose-600 text-rose-800 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-rose-800 hover:bg-rose-50/50'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Belum Hadir & Udzur</span>
            {stats.belumAbsen > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800 font-mono font-bold">
                {stats.belumAbsen}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rekap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'rekap'
                ? 'border-teal-600 text-teal-800 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-teal-800 hover:bg-teal-50/50'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Rekap Matriks</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: INPUT PRESENSI (SCANNER & PENCARIAN BERSIH) */}
        {/* ========================================================================= */}
        {activeTab === 'input' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
            {/* Left Column: Scanner & Quick Action Bar (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              {/* Camera Scanner Box */}
              <div className="bg-white border border-emerald-100/90 rounded-2xl p-3.5 sm:p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-sm">Kamera Scanner Barcode / QR</h3>
                      <p className="text-[11px] text-slate-500">Arahkan kartu santri ke kamera</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCameraActive(!isCameraActive)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      isCameraActive
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isCameraActive ? 'Matikan' : 'Buka Kamera'}
                  </button>
                </div>

                {/* Inline Camera Reader Box */}
                {isCameraActive ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-emerald-500/50 flex items-center justify-center shadow-inner">
                    <div id={qrRegionId} className="w-full h-full" />
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-emerald-200/80 p-5 text-center bg-emerald-50/40 flex flex-col items-center justify-center">
                    <Camera className="w-8 h-8 text-emerald-600/70 mb-1.5" />
                    <p className="text-xs font-bold text-emerald-900">Kamera Scanner Siaga</p>
                    <p className="text-[11px] text-slate-600 max-w-xs mt-0.5">
                      Gunakan kamera HP/laptop, scanner barcode USB, atau ketik NIK di bawah.
                    </p>
                    <button
                      onClick={() => setIsCameraActive(true)}
                      className="mt-2.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      Buka Scanner Kamera
                    </button>
                  </div>
                )}

                {cameraError && (
                  <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Direct Manual Barcode / NIK Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    processScannedCode(manualInputCode);
                  }}
                  className="mt-3"
                >
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Input Cepat Barcode / NIK:
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={manualInputCode}
                      onChange={(e) => setManualInputCode(e.target.value)}
                      placeholder="Scan USB atau ketik NIK..."
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
                    >
                      Enter
                    </button>
                  </div>
                </form>

                {/* Mode Override Status Selector */}
                <div className="mt-3 pt-2.5 border-t border-slate-150">
                  <div className="text-[11px] font-bold text-slate-700 mb-1.5">Override Mode Status:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      onClick={() => setInputStatusMode('auto')}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        inputStatusMode === 'auto'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50/60 hover:border-emerald-300'
                      }`}
                    >
                      ⚡ Otomatis
                    </button>
                    <button
                      onClick={() => setInputStatusMode('tepat_waktu')}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        inputStatusMode === 'tepat_waktu'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50/60 hover:border-emerald-300'
                      }`}
                    >
                      🟢 Tepat
                    </button>
                    <button
                      onClick={() => setInputStatusMode('terlambat')}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        inputStatusMode === 'terlambat'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50/60 hover:border-amber-300'
                      }`}
                    >
                      🟡 Terlambat
                    </button>
                    <button
                      onClick={() => setInputStatusMode('sakit')}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        inputStatusMode === 'sakit'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50/60 hover:border-blue-300'
                      }`}
                    >
                      🏥 Sakit/Izin
                    </button>
                  </div>
                </div>
              </div>

              {/* Instant Scan Result Toast / Feedback Card */}
              {lastScannedResult && (
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl p-3 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-3">
                    {lastScannedResult.student.foto ? (
                      <img
                        src={lastScannedResult.student.foto}
                        alt={lastScannedResult.student.nama}
                        className="w-11 h-11 rounded-xl object-cover border border-emerald-400 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                        {lastScannedResult.student.nama.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-emerald-950 text-xs sm:text-sm truncate">
                          {lastScannedResult.student.nama}
                        </h4>
                        <span className="text-[10.5px] text-slate-500 font-mono">
                          {lastScannedResult.record.scanTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">
                        Kelas: {lastScannedResult.student.kelas} | NIK: {lastScannedResult.student.nik}
                      </p>
                      <div className="mt-0.5 text-[11px] font-bold text-emerald-800">
                        {lastScannedResult.message}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Quick Student Search & 1-Click Action Table (7 Cols) */}
            <div className="lg:col-span-7 bg-white border border-emerald-100/90 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
                <div>
                  <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-emerald-600" />
                    Pencarian & Absensi Manual
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Klik tombol untuk tandai hadir atau terlambat
                  </p>
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">Semua Kelas</option>
                    {classList.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">Semua Santri</option>
                    <option value="Laki-laki">Santriwan (L)</option>
                    <option value="Perempuan">Santriwati (P)</option>
                  </select>
                </div>
              </div>

              {/* Search input field */}
              <div className="relative mb-2.5">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik nama santri atau NIK..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Student List for Instant Click */}
              <div className="flex-1 overflow-y-auto max-h-[440px] space-y-1.5 pr-0.5">
                {filteredStudentsForInput.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    Tidak ada santri yang sesuai dengan pencarian "{searchQuery}".
                  </div>
                ) : (
                  filteredStudentsForInput.map((student) => {
                    const rec = recordMap.get(student.id);
                    const isHaid = isStudentInActiveHaid(student.id, haidRecords);

                    return (
                      <div
                        key={student.id}
                        className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all ${
                          rec
                            ? rec.status === 'tepat_waktu'
                              ? 'bg-emerald-50/80 border-emerald-200 text-slate-800'
                              : rec.status === 'terlambat'
                              ? 'bg-amber-50/80 border-amber-200 text-slate-800'
                              : rec.status === 'haid'
                              ? 'bg-pink-50/80 border-pink-200 text-slate-800'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                            : isHaid
                            ? 'bg-pink-50/50 border-pink-200/80 text-slate-700'
                            : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {student.foto ? (
                            <img
                              src={student.foto}
                              alt={student.nama}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 cursor-pointer shrink-0"
                              onClick={() => onOpenPhotoModal?.(student)}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                              {student.nama.substring(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="font-bold text-xs sm:text-sm text-slate-900 truncate flex items-center gap-1.5">
                              {student.nama}
                              {isHaid && (
                                <span className="px-1.5 py-0.2 rounded text-[9.5px] bg-pink-100 text-pink-800 border border-pink-200 font-medium">
                                  Haid
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {student.kelas} | NIK: {student.nik}
                            </div>
                          </div>
                        </div>

                        {/* Status / Quick Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {rec ? (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                                  rec.status === 'tepat_waktu'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : rec.status === 'terlambat'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : rec.status === 'haid'
                                    ? 'bg-pink-100 text-pink-800 border-pink-300'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {rec.status === 'tepat_waktu' && '🟢 Tepat'}
                                {rec.status === 'terlambat' && `🟡 Telat (${rec.scanTime})`}
                                {rec.status === 'haid' && '🩸 Haid'}
                                {rec.status === 'sakit' && '🏥 Sakit'}
                                {rec.status === 'izin' && '📝 Izin'}
                              </span>

                              <button
                                onClick={() => {
                                  const filtered = records.filter((r) => r.id !== rec.id);
                                  updateRecords(filtered);
                                }}
                                title="Hapus / Reset Absen"
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleRecordAttendance(student, 'tepat_waktu')}
                                title="Tandai Tepat Waktu"
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                              >
                                + Tepat
                              </button>
                              <button
                                onClick={() => handleRecordAttendance(student, 'terlambat')}
                                title="Tandai Terlambat / Masbuq"
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                              >
                                + Telat
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DAFTAR TERLAMBAT (MASBUQ / KETERLAMBATAN) */}
        {/* ========================================================================= */}
        {activeTab === 'terlambat' && (
          <div className="bg-white border border-emerald-100/90 rounded-2xl p-3.5 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3">
              <div>
                <h3 className="font-bold text-emerald-950 text-base flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Daftar Santri Terlambat / Masbuq ({currentSlotInfo.label})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Santri yang hadir setelah batas waktu tepat ({currentSlotInfo.onTimeEnd} WIB)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
                  Total: {lateStudents.length} Santri
                </span>
                <button
                  onClick={handleCopyReport}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-slate-600" /> Salin Data
                </button>
              </div>
            </div>

            {lateStudents.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/40 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-950 text-sm">Alhamdulillah, Tidak Ada Santri Terlambat</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Seluruh santri hadir tepat waktu sebelum pukul {currentSlotInfo.onTimeEnd} WIB.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-emerald-50 text-[11px] uppercase font-bold text-emerald-900 border-b border-emerald-100">
                    <tr>
                      <th className="px-3 py-2">No</th>
                      <th className="px-3 py-2">Santri</th>
                      <th className="px-3 py-2">Kelas</th>
                      <th className="px-3 py-2">Jam Scan</th>
                      <th className="px-3 py-2">Selisih</th>
                      <th className="px-3 py-2">Catatan / Alasan</th>
                      <th className="px-3 py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {lateStudents.map((item, idx) => (
                      <tr key={item.record.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-3 py-2 text-slate-400 font-mono text-xs">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {item.student?.foto ? (
                              <img
                                src={item.student.foto}
                                alt={item.student.nama}
                                className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                                {item.student?.nama.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{item.student?.nama}</div>
                              <div className="text-[10.5px] text-slate-500 font-mono">NIK: {item.student?.nik}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-700">{item.student?.kelas}</td>
                        <td className="px-3 py-2 font-mono text-amber-700 font-bold">
                          {item.record.scanTime} WIB
                        </td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">
                            +{item.record.lateMinutes || 0} Menit
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            defaultValue={item.record.notes || ''}
                            onBlur={(e) => {
                              const updated = records.map((r) =>
                                r.id === item.record.id ? { ...r, notes: e.target.value } : r
                              );
                              updateRecords(updated);
                            }}
                            placeholder="Alasan (cth: wudhu)..."
                            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 w-36 sm:w-44"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => {
                              const updated = records.map((r) =>
                                r.id === item.record.id ? { ...r, status: 'tepat_waktu' as PrayerStatus } : r
                              );
                              updateRecords(updated);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[11px] text-emerald-800 rounded-md border border-emerald-200 font-bold cursor-pointer transition-colors"
                          >
                            Ubah ke Tepat
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DAFTAR BELUM HADIR / ALPA & UDZUR */}
        {/* ========================================================================= */}
        {activeTab === 'tidak_hadir' && (
          <div className="bg-white border border-emerald-100/90 rounded-2xl p-3.5 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3">
              <div>
                <h3 className="font-bold text-emerald-950 text-base flex items-center gap-1.5">
                  <UserX className="w-4 h-4 text-rose-600" />
                  Daftar Belum Hadir & Udzur ({currentSlotInfo.label})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Santri yang belum presensi atau berhalangan syar'i / sakit
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleBulkMarkAbsent}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UserX className="w-3.5 h-3.5" />
                  Tandai Sisa Belum Absen Sebagai Alpa
                </button>
              </div>
            </div>

            {/* Quick Filters (Compact) */}
            <div className="flex items-center gap-2 mb-3 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-600 font-bold flex items-center gap-1 text-[11px]">
                <Filter className="w-3 h-3 text-emerald-700" /> Filter Kelas:
              </span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Semua Kelas</option>
                {classList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {absentStudents.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/40 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-950 text-sm">Masya Allah, Seluruh Santri Hadir Lengkap</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Tidak ada santri yang alpa atau belum terdata pada sesi {currentSlotInfo.label}.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-emerald-50 text-[11px] uppercase font-bold text-emerald-900 border-b border-emerald-100">
                    <tr>
                      <th className="px-3 py-2">No</th>
                      <th className="px-3 py-2">Santri</th>
                      <th className="px-3 py-2">Kelas</th>
                      <th className="px-3 py-2">Status Keterangan</th>
                      <th className="px-3 py-2 text-right">Tindakan Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {absentStudents.map((item, idx) => (
                      <tr key={item.student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 text-slate-400 font-mono text-xs">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {item.student.foto ? (
                              <img
                                src={item.student.foto}
                                alt={item.student.nama}
                                className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                                {item.student.nama.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{item.student.nama}</div>
                              <div className="text-[10.5px] text-slate-500 font-mono">NIK: {item.student.nik}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-700">{item.student.kelas}</td>
                        <td className="px-3 py-2">
                          {item.effectiveStatus === 'haid' ? (
                            <span className="px-2 py-0.5 rounded-md bg-pink-100 text-pink-800 border border-pink-200 text-[11px] font-bold flex items-center gap-1 w-max">
                              <Droplets className="w-2.5 h-2.5" /> Udzur Haid
                            </span>
                          ) : item.effectiveStatus === 'sakit' ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold flex items-center gap-1 w-max">
                              <HeartPulse className="w-2.5 h-2.5" /> Sakit
                            </span>
                          ) : item.effectiveStatus === 'izin' ? (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-bold flex items-center gap-1 w-max">
                              📝 Izin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold flex items-center gap-1 w-max">
                              ❓ Belum Absen
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleRecordAttendance(item.student, 'tepat_waktu')}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] rounded-md font-bold cursor-pointer transition-colors shadow-2xs"
                            >
                              Hadir
                            </button>
                            <button
                              onClick={() => handleRecordAttendance(item.student, 'sakit')}
                              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] rounded-md font-bold cursor-pointer transition-colors shadow-2xs"
                            >
                              Sakit
                            </button>
                            <button
                              onClick={() => handleRecordAttendance(item.student, 'izin')}
                              className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] rounded-md font-bold cursor-pointer transition-colors shadow-2xs"
                            >
                              Izin
                            </button>
                            {item.student.jenisKelamin === 'Perempuan' && (
                              <button
                                onClick={() => handleRecordAttendance(item.student, 'haid')}
                                className="px-2 py-0.5 bg-pink-600 hover:bg-pink-700 text-white text-[11px] rounded-md font-bold cursor-pointer transition-colors shadow-2xs"
                              >
                                Haid
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: REKAPITULASI & PAPAN PANTAU */}
        {/* ========================================================================= */}
        {activeTab === 'rekap' && (
          <div className="space-y-3">
            {/* Rekap 5 Waktu Sholat Hari Ini */}
            <div className="bg-white border border-emerald-100/90 rounded-2xl p-3.5 sm:p-4 shadow-sm">
              <h3 className="font-bold text-emerald-950 text-base mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                Matriks Kehadiran 5 Waktu Sholat ({formatIndoDate(selectedDate)})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {(['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] as PrayerName[]).map((pKey) => {
                  const slot = PRAYER_SLOTS[pKey];
                  const sessionRecs = records.filter(
                    (r) => r.date === selectedDate && r.prayer === pKey
                  );
                  const tepat = sessionRecs.filter((r) => r.status === 'tepat_waktu').length;
                  const telat = sessionRecs.filter((r) => r.status === 'terlambat').length;
                  const total = tepat + telat;

                  return (
                    <div
                      key={pKey}
                      className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-[11px] text-emerald-800 font-serif font-bold">{slot.arabicLabel}</div>
                        <div className="font-bold text-slate-900 text-sm capitalize mt-0.5">
                          {slot.label}
                        </div>
                        <div className="text-[10.5px] text-slate-500 font-mono mt-0.5">
                          {slot.onTimeStart} - {slot.onTimeEnd}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-emerald-200/60 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>🟢 Tepat:</span>
                          <span className="font-bold text-emerald-700">{tepat}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>🟡 Telat:</span>
                          <span className="font-bold text-amber-700">{telat}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-emerald-200/60">
                          <span>Hadir:</span>
                          <span className="text-emerald-800">{total} Santri</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Share to WhatsApp CTA */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 border border-emerald-700 rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
              <div>
                <h4 className="font-bold text-white text-sm">Bagikan Laporan Sholat ke Grup Ustadz & Musyrif</h4>
                <p className="text-[11px] text-emerald-100/90 mt-0.5">
                  Salin teks laporan rapi untuk koordinasi pengasuhan santri.
                </p>
              </div>
              <button
                onClick={handleCopyReport}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedState ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedState ? 'Laporan Disalin!' : 'Salin Format Laporan WA'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
