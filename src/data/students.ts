import { Student, FastingSession, AdminSettings } from '../types';
import { INITIAL_STUDENTS } from './initialStudents';
import { STUDENTS_PART2 } from './studentsDataPart2';
import { STUDENTS_PART3 } from './studentsDataPart3';
import { STUDENTS_PART4 } from './studentsDataPart4';
import { STUDENTS_PART5 } from './studentsDataPart5';

export const DEFAULT_STUDENTS: Student[] = [
  ...INITIAL_STUDENTS,
  ...STUDENTS_PART2,
  ...STUDENTS_PART3,
  ...STUDENTS_PART4,
  ...STUDENTS_PART5,
];

const STUDENTS_STORAGE_KEY = 'sr_kediri_students_v1';
const SESSIONS_STORAGE_KEY = 'sr_kediri_fasting_sessions_v1';

export function getStoredStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!raw) return DEFAULT_STUDENTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Error reading stored students:', e);
  }
  return DEFAULT_STUDENTS;
}

export function saveStoredStudents(students: Student[]): void {
  try {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
  } catch (e) {
    console.error('Error saving students:', e);
  }
}

export function resetStoredStudents(): Student[] {
  saveStoredStudents(DEFAULT_STUDENTS);
  return DEFAULT_STUDENTS;
}

export function getUniqueClasses(students: Student[]): string[] {
  const set = new Set<string>();
  students.forEach((s) => {
    if (s.kelas) set.add(s.kelas.trim());
  });
  const classes = Array.from(set);
  
  // Custom sort to keep SD, VII, X, XI in logical school order
  const orderRank = (cls: string) => {
    if (cls.startsWith('SD 1-2')) return 1;
    if (cls.startsWith('SD 3-4')) return 2;
    if (cls.startsWith('SD 5-6')) return 3;
    if (cls.startsWith('VII-1')) return 4;
    if (cls.startsWith('VII-2')) return 5;
    if (cls.startsWith('VII-3')) return 6;
    if (cls.startsWith('VII-4')) return 7;
    if (cls.startsWith('X-1')) return 8;
    if (cls.startsWith('X-2')) return 9;
    if (cls.startsWith('X-3')) return 10;
    if (cls.startsWith('X-4')) return 11;
    if (cls.startsWith('XI 1')) return 12;
    if (cls.startsWith('XI 2')) return 13;
    if (cls.startsWith('XI 3')) return 14;
    return 99;
  };

  return classes.sort((a, b) => orderRank(a) - orderRank(b));
}

// Storage helpers for Fasting Sessions
export function getStoredSessions(): Record<string, FastingSession> {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading stored sessions:', e);
  }

  // Pre-seed an initial session for 27 Agustus 2026 (or sample date) if empty
  const defaultSessionId = '2026-08-27_Puasa Senin';
  const sampleSession: FastingSession = {
    id: defaultSessionId,
    title: 'Puasa Sunnah Senin',
    date: '2026-08-27',
    records: {},
    isVerified: false,
    updatedAt: new Date().toISOString(),
  };

  const initialSessions = { [defaultSessionId]: sampleSession };
  saveAllStoredSessions(initialSessions);
  return initialSessions;
}

export function saveAllStoredSessions(sessions: Record<string, FastingSession>): void {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving sessions:', e);
  }
}

export function saveSession(session: FastingSession): void {
  const sessions = getStoredSessions();
  sessions[session.id] = {
    ...session,
    updatedAt: new Date().toISOString(),
  };
  saveAllStoredSessions(sessions);
}

export function deleteSession(sessionId: string): void {
  const sessions = getStoredSessions();
  delete sessions[sessionId];
  saveAllStoredSessions(sessions);
}

const ADMIN_SETTINGS_KEY = 'sr_kediri_admin_settings_v1';

export function getStoredAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(ADMIN_SETTINGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading admin settings:', e);
  }
  return {
    allowPenginputCreateSession: true,
    defaultDeadlineTime: '15:00',
  };
}

export function saveStoredAdminSettings(settings: AdminSettings): void {
  try {
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving admin settings:', e);
  }
}

// CSV Parser helper function
export function parseCSVData(csvText: string): Student[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // find header line or data line
  let startIndex = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const l = lines[i].toLowerCase();
    if (l.includes('nama') && l.includes('kelas')) {
      startIndex = i + 1;
      break;
    }
  }

  const parsedStudents: Student[] = [];
  let nextId = 1;

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Split CSV respecting quotes
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let charIdx = 0; charIdx < rawLine.length; charIdx++) {
      const char = rawLine[charIdx];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());

    if (fields.length < 2) continue;

    // Map fields
    // Standard format: No.,Nama,Kelas,Jenis Kelamin,NIK,Tempat Lahir,Tanggal Lahir,Nama Ibu,Alamat
    const noVal = parseInt(fields[0], 10) || nextId;
    const nama = fields[1]?.replace(/^["']|["']$/g, '').trim();
    if (!nama || nama.toLowerCase().startsWith('data siswa') || nama.toLowerCase() === 'nama') continue;

    const kelas = fields[2]?.replace(/^["']|["']$/g, '').trim() || 'Umum';
    const jenisKelamin = (fields[3] || '').toLowerCase().includes('perempuan') ? 'Perempuan' : 'Laki-laki';
    const nik = fields[4]?.replace(/[^\d]/g, '').trim() || '';
    const tempatLahir = fields[5]?.replace(/^["']|["']$/g, '').trim() || '';
    const tanggalLahir = fields[6]?.replace(/^["']|["']$/g, '').trim() || '';
    const namaIbu = fields[7]?.replace(/^["']|["']$/g, '').trim() || '';
    const alamat = fields[8]?.replace(/^["']|["']$/g, '').trim() || '';
    const foto = fields[9]?.replace(/^["']|["']$/g, '').trim() || undefined;

    parsedStudents.push({
      id: nextId,
      no: noVal,
      nama,
      kelas,
      jenisKelamin,
      nik,
      tempatLahir,
      tanggalLahir,
      namaIbu,
      alamat,
      foto: foto && (foto.startsWith('http') || foto.startsWith('data:image')) ? foto : undefined,
    });

    nextId++;
  }

  return parsedStudents;
}
