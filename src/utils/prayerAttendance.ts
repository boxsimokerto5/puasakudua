import { PrayerName, PrayerStatus, PrayerAttendanceRecord, Student, HaidRecord } from '../types';

export interface PrayerSlotInfo {
  prayer: PrayerName;
  label: string;
  arabicLabel: string;
  onTimeStart: string; // "11:30"
  onTimeEnd: string;   // "12:30"
  sessionEnd: string;  // "14:29"
  description: string;
}

export const PRAYER_SLOTS: Record<PrayerName, PrayerSlotInfo> = {
  subuh: {
    prayer: 'subuh',
    label: 'Sholat Subuh',
    arabicLabel: 'صلاة الفجر',
    onTimeStart: '04:00',
    onTimeEnd: '04:45',
    sessionEnd: '06:00',
    description: 'Tepat Waktu: 04.00 - 04.45 WIB | Terlambat: > 04.45 WIB',
  },
  dzuhur: {
    prayer: 'dzuhur',
    label: 'Sholat Dzuhur',
    arabicLabel: 'صلاة الظهر',
    onTimeStart: '11:30',
    onTimeEnd: '12:30',
    sessionEnd: '14:29',
    description: 'Tepat Waktu: 11.30 - 12.30 WIB | Terlambat: > 12.30 WIB',
  },
  ashar: {
    prayer: 'ashar',
    label: 'Sholat Ashar',
    arabicLabel: 'صلاة العصر',
    onTimeStart: '14:30',
    onTimeEnd: '16:00',
    sessionEnd: '16:59',
    description: 'Tepat Waktu: 14.30 - 16.00 WIB | Terlambat: > 16.00 WIB',
  },
  maghrib: {
    prayer: 'maghrib',
    label: 'Sholat Maghrib',
    arabicLabel: 'صلاة المغرب',
    onTimeStart: '17:00',
    onTimeEnd: '17:40',
    sessionEnd: '18:44',
    description: 'Tepat Waktu: 17.00 - 17.40 WIB | Terlambat: > 17.40 WIB',
  },
  isya: {
    prayer: 'isya',
    label: 'Sholat Isya',
    arabicLabel: 'صلاة العشاء',
    onTimeStart: '18:45',
    onTimeEnd: '19:45',
    sessionEnd: '23:59',
    description: 'Tepat Waktu: 18.45 - 19.45 WIB | Terlambat: > 19.45 WIB',
  },
};

const STORAGE_KEY = 'puasaku_prayer_attendance_records';

/**
 * Konversi waktu "HH:mm" ke total menit dari jam 00:00
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Deteksi otomatis waktu sholat aktif dan status Tepat Waktu vs Terlambat
 * Berdasarkan aturan jam:
 * - 11.30 - 12.30 : Dzuhur (Tepat Waktu), di atas itu : Terlambat (sampai 14.29)
 * - 14.30 - 16.00 : Ashar (Tepat Waktu), di atas itu : Terlambat (sampai 16.59)
 * - 17.00 - 17.40 : Maghrib (Tepat Waktu), di atas itu : Terlambat (sampai 18.44)
 * - 04.00 - 04.45 : Subuh (Tepat Waktu), di atas itu : Terlambat (sampai 06.00)
 * - 18.45 - 19.45 : Isya (Tepat Waktu), di atas itu : Terlambat (sampai 23.59)
 */
export function detectCurrentPrayerSlot(date: Date = new Date()): {
  prayer: PrayerName;
  status: 'tepat_waktu' | 'terlambat';
  currentTimeString: string;
  slotInfo: PrayerSlotInfo;
  isInsideSlot: boolean;
  lateMinutes: number;
} {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const currentTimeString = `${hours}:${minutes}`;
  const currentTotalMins = date.getHours() * 60 + date.getMinutes();

  // 1. Subuh: 03:30 - 06:00
  if (currentTotalMins >= timeToMinutes('03:30') && currentTotalMins <= timeToMinutes('06:00')) {
    const isLate = currentTotalMins > timeToMinutes('04:45');
    const lateMinutes = isLate ? currentTotalMins - timeToMinutes('04:45') : 0;
    return {
      prayer: 'subuh',
      status: isLate ? 'terlambat' : 'tepat_waktu',
      currentTimeString,
      slotInfo: PRAYER_SLOTS.subuh,
      isInsideSlot: true,
      lateMinutes,
    };
  }

  // 2. Dzuhur: 11:00 - 14:29 (Tepat waktu: 11.30 - 12.30)
  if (currentTotalMins >= timeToMinutes('11:00') && currentTotalMins < timeToMinutes('14:30')) {
    const isLate = currentTotalMins > timeToMinutes('12:30');
    const lateMinutes = isLate ? currentTotalMins - timeToMinutes('12:30') : 0;
    return {
      prayer: 'dzuhur',
      status: isLate ? 'terlambat' : 'tepat_waktu',
      currentTimeString,
      slotInfo: PRAYER_SLOTS.dzuhur,
      isInsideSlot: true,
      lateMinutes,
    };
  }

  // 3. Ashar: 14:30 - 16:59 (Tepat waktu: 14.30 - 16.00)
  if (currentTotalMins >= timeToMinutes('14:30') && currentTotalMins < timeToMinutes('17:00')) {
    const isLate = currentTotalMins > timeToMinutes('16:00');
    const lateMinutes = isLate ? currentTotalMins - timeToMinutes('16:00') : 0;
    return {
      prayer: 'ashar',
      status: isLate ? 'terlambat' : 'tepat_waktu',
      currentTimeString,
      slotInfo: PRAYER_SLOTS.ashar,
      isInsideSlot: true,
      lateMinutes,
    };
  }

  // 4. Maghrib: 17:00 - 18:44 (Tepat waktu: 17.00 - 17.40)
  if (currentTotalMins >= timeToMinutes('17:00') && currentTotalMins < timeToMinutes('18:45')) {
    const isLate = currentTotalMins > timeToMinutes('17:40');
    const lateMinutes = isLate ? currentTotalMins - timeToMinutes('17:40') : 0;
    return {
      prayer: 'maghrib',
      status: isLate ? 'terlambat' : 'tepat_waktu',
      currentTimeString,
      slotInfo: PRAYER_SLOTS.maghrib,
      isInsideSlot: true,
      lateMinutes,
    };
  }

  // 5. Isya: 18:45 - 23:59 (Tepat waktu: 18.45 - 19.45)
  if (currentTotalMins >= timeToMinutes('18:45') || currentTotalMins < timeToMinutes('03:30')) {
    const isLate = currentTotalMins > timeToMinutes('19:45');
    const lateMinutes = isLate ? currentTotalMins - timeToMinutes('19:45') : 0;
    return {
      prayer: 'isya',
      status: isLate ? 'terlambat' : 'tepat_waktu',
      currentTimeString,
      slotInfo: PRAYER_SLOTS.isya,
      isInsideSlot: true,
      lateMinutes,
    };
  }

  // Fallback default ke Dzuhur
  return {
    prayer: 'dzuhur',
    status: 'tepat_waktu',
    currentTimeString,
    slotInfo: PRAYER_SLOTS.dzuhur,
    isInsideSlot: false,
    lateMinutes: 0,
  };
}

/**
 * Hitung status Tepat Waktu vs Terlambat untuk waktu sholat tertentu
 */
export function calculatePrayerStatus(
  prayer: PrayerName,
  date: Date = new Date()
): { status: 'tepat_waktu' | 'terlambat'; lateMinutes: number } {
  const currentTotalMins = date.getHours() * 60 + date.getMinutes();
  const slot = PRAYER_SLOTS[prayer];
  const onTimeEndMins = timeToMinutes(slot.onTimeEnd);

  if (currentTotalMins <= onTimeEndMins) {
    return { status: 'tepat_waktu', lateMinutes: 0 };
  } else {
    return { status: 'terlambat', lateMinutes: currentTotalMins - onTimeEndMins };
  }
}

/**
 * Cek apakah seorang santri sedang dalam masa Haid Aktif
 */
export function isStudentInActiveHaid(studentId: number, haidRecords: HaidRecord[]): boolean {
  return haidRecords.some((r) => r.studentId === studentId && r.status === 'haid_aktif');
}

/**
 * Ambil semua data absensi sholat dari localStorage
 */
export function getStoredPrayerRecords(): PrayerAttendanceRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load prayer records from storage', e);
    return [];
  }
}

/**
 * Simpan semua data absensi sholat ke localStorage
 */
export function savePrayerRecords(records: PrayerAttendanceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save prayer records to storage', e);
  }
}

/**
 * Format tanggal Indonesia YYYY-MM-DD ke teks formal
 */
export function formatIndoDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
