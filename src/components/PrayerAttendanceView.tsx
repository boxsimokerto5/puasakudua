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

  // Camera scanner lifecycle
  useEffect(() => {
    if (!isCameraActive) {
      if (scannerInstanceRef.current && scannerInstanceRef.current.isScanning) {
        scannerInstanceRef.current.stop().then(() => scannerInstanceRef.current?.clear()).catch(() => {});
      }
      return;
    }

    const html5QrCode = new Html5Qrcode(qrRegionId);
    scannerInstanceRef.current = html5QrCode;
    setCameraError(null);

    html5QrCode
      .start(
        { facingMode: 'environment' },
        { fps: 15, qrbox: { width: 260, height: 180 } },
        (decodedText) => {
          processScannedCode(decodedText);
        },
        () => {}
      )
      .catch((err) => {
        console.error('Camera sholat error:', err);
        setCameraError('Gagal mengakses kamera. Izinkan akses kamera pada browser Anda.');
        setIsCameraActive(false);
      });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
      }
    };
  }, [isCameraActive, selectedPrayer, selectedDate, inputStatusMode]);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100 pb-16">
      {/* Top Emerald/Gold Banner & Live Clock Info (Compact & Clean) */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-b border-emerald-800/40 px-3 py-2.5 sm:px-5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Presensi Sholat Berjamaah
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {currentSlotInfo.arabicLabel}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80">
                Scanner Cepat & Pemantauan Disiplin Ibadah Santri SRT 1 Kediri
              </p>
            </div>
          </div>

          {/* Real-time Digital Clock & Status Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-inner text-xs">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 leading-tight">Waktu Server</div>
                <div className="text-sm font-mono font-bold text-emerald-300 leading-none mt-0.5">
                  {currentTime.toLocaleTimeString('id-ID')} WIB
                </div>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 leading-tight">Aturan Jam</div>
                <div className="text-xs font-semibold leading-none mt-0.5">
                  {calculatedStatusAtMoment.status === 'tepat_waktu' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      🟢 Tepat Waktu ({currentSlotInfo.onTimeStart} - {currentSlotInfo.onTimeEnd})
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      🟡 Terlambat / Masbuq (&gt; {currentSlotInfo.onTimeEnd})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 space-y-2.5">
        {/* 5 Waktu Sholat Selector Bar (Compact) */}
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
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-400 shadow-md shadow-emerald-900/40 ring-1 ring-emerald-400/50'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {isAutoActive && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-[10px] opacity-75 font-serif">{slot.arabicLabel}</div>
                </div>
                <div className="font-bold text-xs sm:text-sm capitalize leading-tight">{slot.label}</div>
                <div className="text-[10px] opacity-80 mt-0.5 font-mono">
                  {slot.onTimeStart} - {slot.onTimeEnd}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Rule Description Banner (Compact & Clean) */}
        <div className="bg-slate-900/90 border border-emerald-500/20 rounded-xl px-3 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-300 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div className="text-[11.5px] leading-tight">
              <span className="font-bold text-white">Ketentuan {currentSlotInfo.label}:</span>{' '}
              {currentSlotInfo.description}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {copiedState ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedState ? 'Tersalin!' : 'Salin Laporan WA'}
            </button>
          </div>
        </div>

        {/* Quick Stats Grid (Compact 6-Columns) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-xs">
            <div className="text-[10.5px] text-slate-400">Total Santri</div>
            <div className="text-lg sm:text-xl font-black text-white mt-0.5">{stats.totalSantri}</div>
            <div className="text-[10px] text-slate-500">Semua santri</div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-2.5 shadow-xs">
            <div className="text-[10.5px] text-emerald-400 flex items-center gap-1 truncate">
              <CheckCircle2 className="w-3 h-3 shrink-0" /> Tepat Waktu
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-300 mt-0.5">{stats.tepatWaktu}</div>
            <div className="text-[10px] text-emerald-400/70">{stats.persentaseTepatWaktu}% dr hadir</div>
          </div>

          <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-2.5 shadow-xs">
            <div className="text-[10.5px] text-amber-400 flex items-center gap-1 truncate">
              <Clock className="w-3 h-3 shrink-0" /> Terlambat
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-300 mt-0.5">{stats.terlambat}</div>
            <div className="text-[10px] text-amber-400/70">Masbuq</div>
          </div>

          <div className="bg-pink-950/40 border border-pink-800/40 rounded-xl p-2.5 shadow-xs">
            <div className="text-[10.5px] text-pink-400 flex items-center gap-1 truncate">
              <Droplets className="w-3 h-3 shrink-0" /> Udzur Haid
            </div>
            <div className="text-lg sm:text-xl font-black text-pink-300 mt-0.5">{stats.haid}</div>
            <div className="text-[10px] text-pink-400/70">Sinkron haid</div>
          </div>

          <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-2.5 shadow-xs">
            <div className="text-[10.5px] text-blue-400 flex items-center gap-1 truncate">
              <HeartPulse className="w-3 h-3 shrink-0" /> Sakit / Izin
            </div>
            <div className="text-lg sm:text-xl font-black text-blue-300 mt-0.5">{stats.sakit + stats.izin}</div>
            <div className="text-[10px] text-blue-400/70">Asrama/Izin</div>
          </div>

          <div className="bg-rose-950/40 border border-rose-800/40 rounded-xl p-2.5 shadow-xs">
            <div className="text-[10.5px] text-rose-400 flex items-center gap-1 truncate">
              <UserX className="w-3 h-3 shrink-0" /> Belum Hadir
            </div>
            <div className="text-lg sm:text-xl font-black text-rose-300 mt-0.5">{stats.belumAbsen}</div>
            <div className="text-[10px] text-rose-400/70">Ghaib / Alpa</div>
          </div>
        </div>

        {/* Tab Navigation Navigation (Rapat & Rapi) */}
        <div className="flex border-b border-slate-800 gap-1 sm:gap-2 overflow-x-auto pb-0.5 pt-1">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'input'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900/90'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Input Presensi</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              {stats.totalHadir}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('terlambat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'terlambat'
                ? 'border-amber-400 text-amber-400 bg-slate-900/90'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Daftar Terlambat</span>
            {stats.terlambat > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold">
                {stats.terlambat}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tidak_hadir')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'tidak_hadir'
                ? 'border-rose-400 text-rose-400 bg-slate-900/90'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Belum Hadir & Udzur</span>
            {stats.belumAbsen > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-mono font-bold">
                {stats.belumAbsen}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rekap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'rekap'
                ? 'border-teal-400 text-teal-400 bg-slate-900/90'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Kamera Scanner Barcode / QR</h3>
                      <p className="text-[11px] text-slate-400">Arahkan kartu santri ke kamera</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCameraActive(!isCameraActive)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      isCameraActive
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isCameraActive ? 'Matikan' : 'Buka Kamera'}
                  </button>
                </div>

                {/* Inline Camera Reader Box */}
                {isCameraActive ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-emerald-500/30 flex items-center justify-center">
                    <div id={qrRegionId} className="w-full h-full" />
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-slate-800 p-5 text-center bg-slate-950/50 flex flex-col items-center justify-center">
                    <Camera className="w-8 h-8 text-slate-600 mb-1.5" />
                    <p className="text-xs font-semibold text-slate-300">Kamera Scanner Siaga</p>
                    <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                      Gunakan kamera HP/laptop, scanner barcode USB, atau ketik NIK di bawah.
                    </p>
                    <button
                      onClick={() => setIsCameraActive(true)}
                      className="mt-2.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      Buka Scanner Kamera
                    </button>
                  </div>
                )}

                {cameraError && (
                  <div className="mt-2.5 p-2 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
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
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Input Cepat Barcode / NIK:
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={manualInputCode}
                      onChange={(e) => setManualInputCode(e.target.value)}
                      placeholder="Scan USB atau ketik NIK..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
                    >
                      Enter
                    </button>
                  </div>
                </form>

                {/* Mode Override Status Selector */}
                <div className="mt-3 pt-2.5 border-t border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Override Mode Status:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      onClick={() => setInputStatusMode('auto')}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        inputStatusMode === 'auto'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      ⚡ Otomatis Jam
                    </button>
                    <button
                      onClick={() => setInputStatusMode('tepat_waktu')}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        inputStatusMode === 'tepat_waktu'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      🟢 Tepat
                    </button>
                    <button
                      onClick={() => setInputStatusMode('terlambat')}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        inputStatusMode === 'terlambat'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      🟡 Terlambat
                    </button>
                    <button
                      onClick={() => setInputStatusMode('sakit')}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        inputStatusMode === 'sakit'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      🏥 Sakit/Izin
                    </button>
                  </div>
                </div>
              </div>

              {/* Instant Scan Result Toast / Feedback Card */}
              {lastScannedResult && (
                <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 rounded-2xl p-3 shadow-md animate-fade-in">
                  <div className="flex items-center gap-3">
                    {lastScannedResult.student.foto ? (
                      <img
                        src={lastScannedResult.student.foto}
                        alt={lastScannedResult.student.nama}
                        className="w-11 h-11 rounded-xl object-cover border border-emerald-500 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                        {lastScannedResult.student.nama.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                          {lastScannedResult.student.nama}
                        </h4>
                        <span className="text-[10.5px] text-slate-400 font-mono">
                          {lastScannedResult.record.scanTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        Kelas: {lastScannedResult.student.kelas} | NIK: {lastScannedResult.student.nik}
                      </p>
                      <div className="mt-0.5 text-[11px] font-semibold text-emerald-300">
                        {lastScannedResult.message}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Quick Student Search & 1-Click Action Table (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-emerald-400" />
                    Pencarian & Absensi Manual
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Klik tombol untuk tandai hadir atau terlambat
                  </p>
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
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
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">Semua Santri</option>
                    <option value="Laki-laki">Santriwan (L)</option>
                    <option value="Perempuan">Santriwati (P)</option>
                  </select>
                </div>
              </div>

              {/* Search input field */}
              <div className="relative mb-2.5">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik nama santri atau NIK..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                              : rec.status === 'terlambat'
                              ? 'bg-amber-950/20 border-amber-800/40 text-slate-200'
                              : rec.status === 'haid'
                              ? 'bg-pink-950/20 border-pink-800/40 text-slate-200'
                              : 'bg-slate-950/60 border-slate-800 text-slate-200'
                            : isHaid
                            ? 'bg-pink-950/10 border-pink-900/30 text-slate-300'
                            : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {student.foto ? (
                            <img
                              src={student.foto}
                              alt={student.nama}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-700 cursor-pointer shrink-0"
                              onClick={() => onOpenPhotoModal?.(student)}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                              {student.nama.substring(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="font-semibold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                              {student.nama}
                              {isHaid && (
                                <span className="px-1 py-0.2 rounded text-[9.5px] bg-pink-500/20 text-pink-300 border border-pink-500/30 font-medium">
                                  Haid
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {student.kelas} | NIK: {student.nik}
                            </div>
                          </div>
                        </div>

                        {/* Status / Quick Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {rec ? (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${
                                  rec.status === 'tepat_waktu'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : rec.status === 'terlambat'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : rec.status === 'haid'
                                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
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
                                className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleRecordAttendance(student, 'tepat_waktu')}
                                title="Tandai Tepat Waktu"
                                className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              >
                                + Tepat
                              </button>
                              <button
                                onClick={() => handleRecordAttendance(student, 'terlambat')}
                                title="Tandai Terlambat / Masbuq"
                                className="px-2 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Daftar Santri Terlambat / Masbuq ({currentSlotInfo.label})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Santri yang hadir setelah batas waktu tepat ({currentSlotInfo.onTimeEnd} WIB)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold">
                  Total: {lateStudents.length} Santri
                </span>
                <button
                  onClick={handleCopyReport}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" /> Salin Data
                </button>
              </div>
            </div>

            {lateStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/80">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-white text-sm">Alhamdulillah, Tidak Ada Santri Terlambat</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Seluruh santri hadir tepat waktu sebelum pukul {currentSlotInfo.onTimeEnd} WIB.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[11px] uppercase font-semibold text-slate-400 border-b border-slate-800">
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
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {lateStudents.map((item, idx) => (
                      <tr key={item.record.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="px-3 py-2 text-slate-500 font-mono text-xs">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {item.student?.foto ? (
                              <img
                                src={item.student.foto}
                                alt={item.student.nama}
                                className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                                {item.student?.nama.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-white text-xs">{item.student?.nama}</div>
                              <div className="text-[10.5px] text-slate-500 font-mono">NIK: {item.student?.nik}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-300">{item.student?.kelas}</td>
                        <td className="px-3 py-2 font-mono text-amber-300 font-bold">
                          {item.record.scanTime} WIB
                        </td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[11px] font-semibold">
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
                            className="bg-slate-950 border border-slate-700/80 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 w-36 sm:w-44"
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
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] text-emerald-400 rounded-md border border-slate-700 font-semibold cursor-pointer"
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                  <UserX className="w-4 h-4 text-rose-400" />
                  Daftar Belum Hadir & Udzur ({currentSlotInfo.label})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Santri yang belum presensi atau berhalangan syar'i / sakit
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleBulkMarkAbsent}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UserX className="w-3.5 h-3.5" />
                  Tandai Sisa Belum Absen Sebagai Alpa
                </button>
              </div>
            </div>

            {/* Quick Filters (Compact) */}
            <div className="flex items-center gap-2 mb-3 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px]">
                <Filter className="w-3 h-3" /> Filter Kelas:
              </span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-slate-200"
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
              <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/80">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-white text-sm">Masya Allah, Seluruh Santri Hadir Lengkap</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tidak ada santri yang alpa atau belum terdata pada sesi {currentSlotInfo.label}.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[11px] uppercase font-semibold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2">No</th>
                      <th className="px-3 py-2">Santri</th>
                      <th className="px-3 py-2">Kelas</th>
                      <th className="px-3 py-2">Status Keterangan</th>
                      <th className="px-3 py-2 text-right">Tindakan Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {absentStudents.map((item, idx) => (
                      <tr key={item.student.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="px-3 py-2 text-slate-500 font-mono text-xs">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {item.student.foto ? (
                              <img
                                src={item.student.foto}
                                alt={item.student.nama}
                                className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                                {item.student.nama.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-white text-xs">{item.student.nama}</div>
                              <div className="text-[10.5px] text-slate-500 font-mono">NIK: {item.student.nik}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-300">{item.student.kelas}</td>
                        <td className="px-3 py-2">
                          {item.effectiveStatus === 'haid' ? (
                            <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[11px] font-semibold flex items-center gap-1 w-max">
                              <Droplets className="w-2.5 h-2.5" /> Udzur Haid
                            </span>
                          ) : item.effectiveStatus === 'sakit' ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold flex items-center gap-1 w-max">
                              <HeartPulse className="w-2.5 h-2.5" /> Sakit
                            </span>
                          ) : item.effectiveStatus === 'izin' ? (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1 w-max">
                              📝 Izin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 w-max">
                              ❓ Belum Absen
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleRecordAttendance(item.student, 'tepat_waktu')}
                              className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] rounded-md font-semibold cursor-pointer"
                            >
                              Hadir
                            </button>
                            <button
                              onClick={() => handleRecordAttendance(item.student, 'sakit')}
                              className="px-2 py-0.5 bg-blue-700 hover:bg-blue-600 text-white text-[11px] rounded-md font-semibold cursor-pointer"
                            >
                              Sakit
                            </button>
                            <button
                              onClick={() => handleRecordAttendance(item.student, 'izin')}
                              className="px-2 py-0.5 bg-indigo-700 hover:bg-indigo-600 text-white text-[11px] rounded-md font-semibold cursor-pointer"
                            >
                              Izin
                            </button>
                            {item.student.jenisKelamin === 'Perempuan' && (
                              <button
                                onClick={() => handleRecordAttendance(item.student, 'haid')}
                                className="px-2 py-0.5 bg-pink-700 hover:bg-pink-600 text-white text-[11px] rounded-md font-semibold cursor-pointer"
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-lg">
              <h3 className="font-bold text-white text-base mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" />
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
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-[10px] text-slate-400 font-serif">{slot.arabicLabel}</div>
                        <div className="font-bold text-white text-sm capitalize mt-0.5">
                          {slot.label}
                        </div>
                        <div className="text-[10.5px] text-slate-500 font-mono mt-0.5">
                          {slot.onTimeStart} - {slot.onTimeEnd}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span>🟢 Tepat:</span>
                          <span className="font-bold text-emerald-400">{tepat}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>🟡 Telat:</span>
                          <span className="font-bold text-amber-400">{telat}</span>
                        </div>
                        <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                          <span>Hadir:</span>
                          <span className="text-emerald-300">{total} Santri</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Share to WhatsApp CTA */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-white text-sm">Bagikan Laporan Sholat ke Grup Ustadz & Musyrif</h4>
                <p className="text-[11px] text-emerald-200/70 mt-0.5">
                  Salin teks laporan rapi untuk koordinasi pengasuhan santri.
                </p>
              </div>
              <button
                onClick={handleCopyReport}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedState ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedState ? 'Laporan Disalin!' : 'Salin Format Laporan WA'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
