export type FastingStatus = 'berpuasa' | 'tidak_puasa' | 'halangan' | 'belum_diisi';

export interface CardReissueRecord {
  id: string;
  studentId: number;
  studentName: string;
  studentClass: string;
  studentNik: string;
  oldVersion: number;
  newVersion: number;
  reissuedAt: string; // ISO string
  reissuedBy: string;
  reason: string; // e.g. "Kartu Hilang di Asrama", "Kartu Rusak / Patah"
  notes?: string;
  feePaid?: boolean;
}

export interface Student {
  id: number;
  no: number;
  nama: string;
  kelas: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  namaIbu: string;
  alamat: string;
  foto?: string; // Base64 data URL or external image link
  cardVersion?: number; // 1 = Original/Perdana, 2 = Edisi 2 Duplikat, 3 = Edisi 3, etc.
  lastReissuedAt?: string;
  reissueCount?: number;
}

export interface FastingRecordItem {
  studentId: number;
  status: FastingStatus;
  notes?: string;
  updatedAt?: string;
}

export interface FastingSession {
  id: string; // unique identifier e.g. "puasa-senin-2026-08-27"
  title: string; // e.g. "Puasa Senin 27 Agustus 2026"
  date: string; // ISO YYYY-MM-DD format
  records: Record<number, FastingRecordItem>; // studentId -> status info
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verifierNotes?: string;
  isLocked?: boolean; // When true, only Admin can edit/input
  lockedAt?: string;
  lockedBy?: string;
  inputDeadline?: string; // e.g., "15:00"
  createdById?: string;
  updatedAt?: string;
}

export type UserRole = 'admin' | 'penginput' | 'pengecek';

export interface UserSession {
  username: string;
  role: UserRole;
  name: string;
}

export interface AdminSettings {
  allowPenginputCreateSession: boolean;
  defaultDeadlineTime: string;
}

export type AdminTabType = 'admin' | 'input' | 'checker' | 'raport' | 'calendar' | 'catat_haid' | 'daftar_haid' | 'daftar_suci';

export type HaidBloodColor = 'hitam' | 'merah' | 'coklat' | 'kuning' | 'keruh';
export type HaidStatus = 'haid_aktif' | 'selesai_mandi';

export interface HaidRecord {
  id: string; // unique ID e.g. "haid-1724839200-12"
  studentId: number;
  studentName: string;
  studentClass: string;
  studentNik: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  initialInputDay: number; // e.g. 1 (lapor hari 1), 3 (lapor saat hari ke-3)
  endDate?: string; // YYYY-MM-DD (when completed)
  endTime?: string;
  mandiWajibAt?: string; // ISO string / date
  status: HaidStatus;
  bloodColor?: HaidBloodColor;
  notes?: string; // Keluhan, nyeri haid, dsb.
  recordedBy: string; // Ustadzah / Admin
  recordedAt: string; // ISO timestamp
  updatedAt?: string;
}

export interface SchoolCalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'ramadhan' | 'tarbiyah' | 'kajian' | 'sosial' | 'ujian' | 'umum';
  description?: string;
  time?: string;
  location?: string;
  isImportant?: boolean;
}

