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

export type AdminTabType = 'admin' | 'input' | 'checker' | 'raport' | 'calendar';

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

