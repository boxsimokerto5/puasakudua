import { Student, CardReissueRecord } from '../types';
import { saveStoredStudents } from '../data/students';

const CARD_REISSUE_STORAGE_KEY = 'sr_kediri_card_reissues_v1';

// Initial sample data if no history exists yet to demonstrate blacklist mechanism
const INITIAL_REISSUE_RECORDS: CardReissueRecord[] = [
  {
    id: 'reissue-sample-01',
    studentId: 2,
    studentName: 'Alfaredo Samuel Mukti',
    studentClass: 'SD 1-2',
    studentNik: '3506010203040002',
    oldVersion: 1,
    newVersion: 2,
    reissuedAt: '2026-08-26T14:30:00.000Z',
    reissuedBy: 'Ustadz Abdullah (Wali Asuh)',
    reason: 'Kartu Asli Hilang di Asrama Putra',
    notes: 'Dilaporkan tercecer setelah jam sholat Ashar di Masjid. Kartu V1 diblokir.',
    feePaid: true,
  },
  {
    id: 'reissue-sample-02',
    studentId: 7,
    studentName: 'Syahdan Nur Arifin',
    studentClass: 'VII-1',
    studentNik: '3506010708090007',
    oldVersion: 1,
    newVersion: 2,
    reissuedAt: '2026-08-27T09:15:00.000Z',
    reissuedBy: 'Ustadzah Fatimah (Musyrifah)',
    reason: 'Kartu Rusak / Patah Terlipat',
    notes: 'Kartu fisik lama sudah disita & digunting.',
    feePaid: true,
  },
];

/**
 * Get all card reissue / blacklist history records
 */
export function getCardReissueHistory(): CardReissueRecord[] {
  try {
    const raw = localStorage.getItem(CARD_REISSUE_STORAGE_KEY);
    if (!raw) {
      // Seed default samples on first load
      localStorage.setItem(CARD_REISSUE_STORAGE_KEY, JSON.stringify(INITIAL_REISSUE_RECORDS));
      return INITIAL_REISSUE_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.error('Error reading card reissue history:', e);
  }
  return INITIAL_REISSUE_RECORDS;
}

/**
 * Save card reissue history records to LocalStorage
 */
export function saveCardReissueHistory(records: CardReissueRecord[]): void {
  try {
    localStorage.setItem(CARD_REISSUE_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving card reissue history:', e);
  }
}

/**
 * Get effective active card version for a student.
 * Uses student.cardVersion if explicitly set > 1, otherwise checks reissue history in LocalStorage.
 */
export function getEffectiveCardVersion(student: Student): number {
  if (typeof student.cardVersion === 'number' && student.cardVersion > 1) {
    return student.cardVersion;
  }
  try {
    const history = getCardReissueHistory();
    const matches = history.filter(
      (r) => r.studentId === student.id || (student.nik && r.studentNik === student.nik)
    );
    if (matches.length > 0) {
      matches.sort((a, b) => b.newVersion - a.newVersion);
      return matches[0].newVersion;
    }
  } catch (err) {
    console.error('Error determining effective card version:', err);
  }
  return student.cardVersion || 1;
}

/**
 * Build QR Code payload for student card
 * Encodes NIK + Version tag: e.g. "3506010203040002#V2" or "SRT-0002#V2"
 */
export function buildCardQrValue(student: Student): string {
  const baseCode = student.nik && student.nik.trim() ? student.nik.trim() : `SRT-${student.no.toString().padStart(4, '0')}`;
  const version = getEffectiveCardVersion(student);
  return `${baseCode}#V${version}`;
}

export interface CardScanValidationResult {
  isValid: boolean;
  isBlacklisted: boolean;
  student?: Student;
  scannedCode: string;
  baseIdentifier: string;
  scannedVersion: number;
  activeVersion: number;
  message: string;
  reissueRecord?: CardReissueRecord;
}

/**
 * Validates a scanned QR/Barcode string against all registered students and card versions.
 * Identifies if the scanned card is an outdated/blacklisted version (e.g. V1 scanned when active is V2).
 */
export function validateScannedCard(rawCode: string, students: Student[]): CardScanValidationResult {
  const cleanCode = (rawCode || '').trim();
  if (!cleanCode) {
    return {
      isValid: false,
      isBlacklisted: false,
      scannedCode: '',
      baseIdentifier: '',
      scannedVersion: 1,
      activeVersion: 1,
      message: 'Kode barcode kosong.',
    };
  }

  // Check if code contains version delimiter: e.g., "350601230001#V2" or "350601230001#V1"
  let baseIdentifier = cleanCode;
  let parsedVersion: number | null = null;

  const versionMatch = cleanCode.match(/^(.*?)#(?:V|v)(\d+)$/);
  if (versionMatch) {
    baseIdentifier = versionMatch[1].trim();
    parsedVersion = parseInt(versionMatch[2], 10);
  }

  // Look up student by NIK, No Code (SRT-XXXX), or raw No
  const student = students.find((s) => {
    const matchNik = s.nik && s.nik.trim() === baseIdentifier;
    const matchNoCode = baseIdentifier === `SRT-${s.no.toString().padStart(4, '0')}`;
    const matchNoRaw = s.no.toString() === baseIdentifier;
    return matchNik || matchNoCode || matchNoRaw;
  });

  if (!student) {
    return {
      isValid: false,
      isBlacklisted: false,
      scannedCode: cleanCode,
      baseIdentifier,
      scannedVersion: parsedVersion || 1,
      activeVersion: 1,
      message: `Santri dengan kode "${cleanCode}" tidak ditemukan di database.`,
    };
  }

  const activeVersion = student.cardVersion || 1;
  const history = getCardReissueHistory();
  const lastReissue = history.find((h) => h.studentId === student.id);

  // If no explicit #V tag in code:
  // If student has activeVersion > 1, then a raw unversioned scan is the old original V1 card -> BLACKLISTED!
  const effectiveScannedVersion = parsedVersion !== null ? parsedVersion : 1;

  if (effectiveScannedVersion < activeVersion) {
    // BLACKLISTED / OUTDATED CARD
    const reissueDateStr = lastReissue
      ? new Date(lastReissue.reissuedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'sebelumnya';

    return {
      isValid: false,
      isBlacklisted: true,
      student,
      scannedCode: cleanCode,
      baseIdentifier,
      scannedVersion: effectiveScannedVersion,
      activeVersion,
      reissueRecord: lastReissue,
      message: `⛔ KARTU KADALUARSA / BLACKLIST! Kartu Versi ${effectiveScannedVersion} milik ${student.nama} (${student.kelas}) telah DINONAKTIFKAN karena dicetak ulang ke Versi ${activeVersion} pada ${reissueDateStr}. Tolong amankan kartu ini!`,
    };
  }

  // VALID ACTIVE CARD
  return {
    isValid: true,
    isBlacklisted: false,
    student,
    scannedCode: cleanCode,
    baseIdentifier,
    scannedVersion: effectiveScannedVersion,
    activeVersion,
    message: `Kartu Sah (Versi ${activeVersion}) - ${student.nama} (${student.kelas})`,
  };
}

/**
 * Reissue a new card version for a student (e.g. V1 -> V2, V2 -> V3)
 * Automatically marks previous version as blacklisted and adds entry to history log.
 */
export function reissueStudentCard({
  studentId,
  reason,
  reissuedBy,
  notes,
  feePaid = true,
  students,
}: {
  studentId: number;
  reason: string;
  reissuedBy: string;
  notes?: string;
  feePaid?: boolean;
  students: Student[];
}): {
  updatedStudents: Student[];
  reissuedStudent: Student;
  newRecord: CardReissueRecord;
} {
  const currentStudent = students.find((s) => s.id === studentId);
  if (!currentStudent) {
    throw new Error('Siswa tidak ditemukan');
  }

  const oldVersion = currentStudent.cardVersion || 1;
  const newVersion = oldVersion + 1;
  const reissuedAt = new Date().toISOString();

  const newRecord: CardReissueRecord = {
    id: `reissue-${Date.now()}-${studentId}`,
    studentId: currentStudent.id,
    studentName: currentStudent.nama,
    studentClass: currentStudent.kelas,
    studentNik: currentStudent.nik || `SRT-${currentStudent.no}`,
    oldVersion,
    newVersion,
    reissuedAt,
    reissuedBy: reissuedBy.trim() || 'Admin / Wali Asuh',
    reason: reason.trim() || 'Kartu Hilang / Rusak',
    notes: notes?.trim() || '',
    feePaid,
  };

  // Update student in array
  const updatedStudents = students.map((s) => {
    if (s.id === studentId) {
      return {
        ...s,
        cardVersion: newVersion,
        lastReissuedAt: reissuedAt,
        reissueCount: (s.reissueCount || 0) + 1,
      };
    }
    return s;
  });

  // Save updated students
  saveStoredStudents(updatedStudents);

  // Save to reissue history
  const currentHistory = getCardReissueHistory();
  const updatedHistory = [newRecord, ...currentHistory];
  saveCardReissueHistory(updatedHistory);

  const reissuedStudent = updatedStudents.find((s) => s.id === studentId)!;

  return {
    updatedStudents,
    reissuedStudent,
    newRecord,
  };
}

/**
 * Cancel / revoke a blacklist reissue record and restore student's card version.
 * If student was at V2, restores them back to V1 (or previous version).
 */
export function cancelBlacklistRecord({
  recordId,
  studentId,
  students,
}: {
  recordId: string;
  studentId: number;
  students: Student[];
}): {
  updatedStudents: Student[];
  restoredStudent?: Student;
  updatedHistory: CardReissueRecord[];
} {
  const currentHistory = getCardReissueHistory();
  const recordToCancel = currentHistory.find((r) => r.id === recordId);
  const updatedHistory = currentHistory.filter((r) => r.id !== recordId);
  saveCardReissueHistory(updatedHistory);

  // Find remaining reissue records for this student to determine correct active version
  const remainingForStudent = updatedHistory.filter((r) => r.studentId === studentId);
  let targetVersion = 1;
  let targetReissueCount = 0;
  let targetLastReissuedAt: string | undefined = undefined;

  if (remainingForStudent.length > 0) {
    // Sort descending by date/version to get highest remaining version
    remainingForStudent.sort((a, b) => b.newVersion - a.newVersion);
    targetVersion = remainingForStudent[0].newVersion;
    targetReissueCount = remainingForStudent.length;
    targetLastReissuedAt = remainingForStudent[0].reissuedAt;
  } else if (recordToCancel && recordToCancel.oldVersion) {
    targetVersion = recordToCancel.oldVersion;
    targetReissueCount = 0;
    targetLastReissuedAt = undefined;
  }

  const updatedStudents = students.map((s) => {
    if (s.id === studentId) {
      return {
        ...s,
        cardVersion: targetVersion,
        reissueCount: targetReissueCount,
        lastReissuedAt: targetLastReissuedAt,
      };
    }
    return s;
  });

  saveStoredStudents(updatedStudents);
  const restoredStudent = updatedStudents.find((s) => s.id === studentId);

  return {
    updatedStudents,
    restoredStudent,
    updatedHistory,
  };
}
