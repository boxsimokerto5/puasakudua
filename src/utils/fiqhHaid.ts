import { HaidRecord, Student, HaidStatus } from '../types';

export const HAID_STORAGE_KEY = 'sr_kediri_haid_records_v1';

// Fiqh Constants (Madzhab Syafi'i)
export const FIQH_CONSTANTS = {
  MIN_HAID_DAYS: 1, // Minimal 1 hari 1 malam (24 jam)
  GHALIB_HAID_DAYS: 7, // Umumnya 6 - 7 hari
  MAX_HAID_DAYS: 15, // Maksimal 15 hari 15 malam
  MIN_SUCI_DAYS: 15, // Minimal masa suci antara dua haid (15 hari 15 malam)
};

/**
 * Format Date to YYYY-MM-DD string
 */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date in YYYY-MM-DD
 */
export function getTodayDateStr(): string {
  return formatDateISO(new Date());
}

/**
 * Calculate the difference in calendar days between two dates (inclusive of start date as day 1)
 */
export function calculateDaysBetween(startDateStr: string, endDateStr?: string): number {
  if (!startDateStr) return 1;
  const start = new Date(startDateStr + 'T00:00:00');
  const end = endDateStr ? new Date(endDateStr + 'T00:00:00') : new Date(getTodayDateStr() + 'T00:00:00');
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

/**
 * Calculate start date backwards when a student reports they are currently on Day N
 * e.g., if today is 2026-08-28 and student says "Hari ke-3", 
 * then startDate = 2026-08-28 minus (3 - 1) days = 2026-08-26.
 */
export function calculateStartDateFromReportedDay(reportedDay: number, referenceDateStr: string = getTodayDateStr()): string {
  const safeDay = Math.max(1, reportedDay);
  const refDate = new Date(referenceDateStr + 'T12:00:00');
  refDate.setDate(refDate.getDate() - (safeDay - 1));
  return formatDateISO(refDate);
}

/**
 * Determine Fiqh status analysis & Islamic ruling recommendations
 */
export interface FiqhStatusAnalysis {
  dayCount: number;
  stage: 'awal' | 'aktif_normal' | 'ghalib' | 'lanjutan' | 'maksimal' | 'istihadhah';
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  stageTitle: string;
  description: string;
  fiqhRuling: string;
  isExceedingMax: boolean;
  canFasting: boolean;
  canPrayer: boolean;
}

export function analyzeFiqhHaid(startDateStr: string, endDateStr?: string, status: HaidStatus = 'haid_aktif'): FiqhStatusAnalysis {
  const dayCount = calculateDaysBetween(startDateStr, endDateStr);
  
  if (status === 'selesai_mandi') {
    return {
      dayCount,
      stage: 'aktif_normal',
      badgeColor: 'text-emerald-800',
      badgeBg: 'bg-emerald-50',
      badgeBorder: 'border-emerald-200',
      stageTitle: `Selesai (${dayCount} Hari) - Telah Mandi`,
      description: `Santriwati telah bersuci/mandi wajib setelah haid berlangsung selama ${dayCount} hari.`,
      fiqhRuling: 'Wajib melaksanakan sholat 5 waktu dan sah menjalankan ibadah puasa (Wajib maupun Sunnah).',
      isExceedingMax: false,
      canFasting: true,
      canPrayer: true,
    };
  }

  if (dayCount === 1) {
    return {
      dayCount,
      stage: 'awal',
      badgeColor: 'text-rose-800',
      badgeBg: 'bg-rose-50',
      badgeBorder: 'border-rose-200',
      stageTitle: 'Hari ke-1 (Masa Awal Haid)',
      description: 'Darah baru keluar pada hari pertama. Menunggu tercapainya batas minimal haid 24 jam akumulatif.',
      fiqhRuling: 'Haram sholat dan puasa. Bila saat siang puasa keluar darah, puasa hari ini batal dan wajib diqadha di luar Ramadhan.',
      isExceedingMax: false,
      canFasting: false,
      canPrayer: false,
    };
  }

  if (dayCount >= 2 && dayCount <= 5) {
    return {
      dayCount,
      stage: 'aktif_normal',
      badgeColor: 'text-rose-800',
      badgeBg: 'bg-rose-50',
      badgeBorder: 'border-rose-200',
      stageTitle: `Hari ke-${dayCount} (Masa Haid Aktif)`,
      description: `Masa haid aktif santriwati berjalan normal dalam rentang waktu haid.`,
      fiqhRuling: 'Udzur Syar\'i aktif. Haram berpuasa, sholat, memegang mushaf Al-Qur\'an, dan thawaf. Dianjurkan memperbanyak dzikir dan doa.',
      isExceedingMax: false,
      canFasting: false,
      canPrayer: false,
    };
  }

  if (dayCount >= 6 && dayCount <= 7) {
    return {
      dayCount,
      stage: 'ghalib',
      badgeColor: 'text-amber-800',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-200',
      stageTitle: `Hari ke-${dayCount} (Masa Ghalib/Umum Haid)`,
      description: `Mendekati durasi kebiasaan umum wanita muslimah (6 - 7 hari). Pantau apakah darah sudah berhenti atau keluar cairan putih bening (qashshah al-baidha).`,
      fiqhRuling: 'Jika darah telah benar-benar bersih dan kering, segera mandi besar/thaharah dan mulai sholat serta berpuasa.',
      isExceedingMax: false,
      canFasting: false,
      canPrayer: false,
    };
  }

  if (dayCount >= 8 && dayCount <= 14) {
    return {
      dayCount,
      stage: 'lanjutan',
      badgeColor: 'text-orange-800',
      badgeBg: 'bg-orange-50',
      badgeBorder: 'border-orange-200',
      stageTitle: `Hari ke-${dayCount} (Masa Lanjutan Haid)`,
      description: `Masih dihukumi darah haid selama belum melebihi 15 hari 15 malam. Tetap pantau tanda-tanda kesucian.`,
      fiqhRuling: 'Masih dalam masa udzur syar\'i yang sah. Belum diperbolehkan puasa atau sholat.',
      isExceedingMax: false,
      canFasting: false,
      canPrayer: false,
    };
  }

  if (dayCount === 15) {
    return {
      dayCount,
      stage: 'maksimal',
      badgeColor: 'text-red-900',
      badgeBg: 'bg-red-100',
      badgeBorder: 'border-red-300',
      stageTitle: 'Hari ke-15 (Batas Maksimal Haid)',
      description: 'Hari terakhir batas maksimal masa haid menurut Madzhab Syafi\'i.',
      fiqhRuling: 'Jika lewat hari ini darah masih keluar, maka darah berikutnya dihukumi Darah Istihadhah (Penyakit). Santriwati WAJIB mandi besar pada akhir hari ke-15.',
      isExceedingMax: false,
      canFasting: false,
      canPrayer: false,
    };
  }

  // dayCount > 15
  return {
    dayCount,
    stage: 'istihadhah',
    badgeColor: 'text-red-950',
    badgeBg: 'bg-red-200',
    badgeBorder: 'border-red-400',
    stageTitle: `Hari ke-${dayCount} (Peringatan: Melebihi 15 Hari / Istihadhah)`,
    description: `Darah yang keluar setelah 15 hari 15 malam adalah Darah Istihadhah (bukan haid). Santriwati dihukumi sebagai Mustahadhah.`,
    fiqhRuling: 'Wajib mandi besar, lalu membersihkan kemaluan, membalut, berwudhu setiap kali masuk waktu sholat, dan WAJIB melaksanakan sholat serta SAH berpuasa.',
    isExceedingMax: true,
    canFasting: true,
    canPrayer: true,
  };
}

/**
 * Local Storage Persistence for Haid Records
 */
export function getStoredHaidRecords(): HaidRecord[] {
  try {
    const raw = localStorage.getItem(HAID_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.error('Error loading haid records from storage:', e);
  }
  return [];
}

export function saveStoredHaidRecords(records: HaidRecord[]): void {
  try {
    localStorage.setItem(HAID_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving haid records to storage:', e);
  }
}

/**
 * Helper to get active haid record for a student
 */
export function getActiveHaidRecordForStudent(studentId: number, records: HaidRecord[]): HaidRecord | undefined {
  return records.find((r) => r.studentId === studentId && r.status === 'haid_aktif');
}

/**
 * Helper to get latest completed haid record for a student
 */
export function getLatestCompletedHaidRecord(studentId: number, records: HaidRecord[]): HaidRecord | undefined {
  const completed = records.filter((r) => r.studentId === studentId && r.status === 'selesai_mandi');
  if (completed.length === 0) return undefined;
  return completed.sort((a, b) => new Date(b.endDate || b.startDate).getTime() - new Date(a.endDate || a.startDate).getTime())[0];
}

/**
 * Helper to calculate purity days since last haid
 */
export interface SuciInfo {
  days: number; // 1-indexed (Hari ke-1 pada tanggal mandi)
  lastEndDate?: string;
  lastEndTime?: string;
  hasPreviousRecord: boolean;
  isEligibleNewHaid: boolean; // >= 15 days
  isUnder15Days: boolean; // hasPreviousRecord && days < 15
  remainingSuciDays: number; // Max(0, 15 - days)
  lastRecord?: HaidRecord;
  warningMessage?: string;
}

export function calculateSuciDaysForStudent(studentId: number, records: HaidRecord[]): SuciInfo {
  const latestCompleted = getLatestCompletedHaidRecord(studentId, records);
  if (!latestCompleted || !latestCompleted.endDate) {
    return {
      days: 30, // Default pure
      hasPreviousRecord: false,
      isEligibleNewHaid: true,
      isUnder15Days: false,
      remainingSuciDays: 0,
    };
  }

  // Calculate day count starting from the completion/mandi date as Day 1
  const days = calculateDaysBetween(latestCompleted.endDate, getTodayDateStr());
  const safeDays = Math.max(1, days);
  const isEligibleNewHaid = safeDays >= FIQH_CONSTANTS.MIN_SUCI_DAYS;
  const isUnder15Days = !isEligibleNewHaid;
  const remainingSuciDays = Math.max(0, FIQH_CONSTANTS.MIN_SUCI_DAYS - safeDays);

  let warningMessage: string | undefined;
  if (isUnder15Days) {
    warningMessage = `Santriwati baru menjalani masa suci Hari ke-${safeDays} (Selesai mandi: ${latestCompleted.endDate}). Menurut Fiqih Madzhab Syafi'i, masa suci minimal (Aqallu ath-Thuhr) adalah 15 hari. Darah yang keluar sekarang BUKAN darah haid (dihukumi Istihadhah/Penyakit atau terindikasi alasan palsu). Kurang ${remainingSuciDays} hari lagi untuk sah haid baru.`;
  }

  return {
    days: safeDays,
    lastEndDate: latestCompleted.endDate,
    lastEndTime: latestCompleted.endTime,
    hasPreviousRecord: true,
    isEligibleNewHaid,
    isUnder15Days,
    remainingSuciDays,
    lastRecord: latestCompleted,
    warningMessage,
  };
}

