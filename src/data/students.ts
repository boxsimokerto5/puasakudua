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

// In-Memory Fast Cache Layers (Zero Latency)
let memoryStudentsCache: Student[] | null = null;
let memorySessionsCache: Record<string, FastingSession> | null = null;
let memoryAdminSettingsCache: AdminSettings | null = null;

let saveStudentsTimeout: any = null;
let saveSessionsTimeout: any = null;

export function getStoredStudents(): Student[] {
  if (memoryStudentsCache) {
    return memoryStudentsCache;
  }
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!raw) {
      memoryStudentsCache = DEFAULT_STUDENTS;
      return DEFAULT_STUDENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryStudentsCache = parsed;
      return parsed;
    }
  } catch (e) {
    console.error('Error reading stored students:', e);
  }
  memoryStudentsCache = DEFAULT_STUDENTS;
  return DEFAULT_STUDENTS;
}

export function saveStoredStudents(students: Student[]): void {
  memoryStudentsCache = students;
  // Non-blocking debounced sync to localStorage
  if (saveStudentsTimeout) clearTimeout(saveStudentsTimeout);
  saveStudentsTimeout = setTimeout(() => {
    try {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.error('Error saving students:', e);
    }
  }, 100);
}

export function resetStoredStudents(): Student[] {
  memoryStudentsCache = DEFAULT_STUDENTS;
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
export const EXACT_101_STUDENT_NAMES: string[] = [
  'Ahmad Syaiful Arsyad',
  'Alfaredo Samuel Mukti',
  'Iraqia Thursina',
  'Krysna Galang Saputra',
  'Misbahul Munir',
  'Muhamad Kiske Adi Robani',
  'Syahdan Nur Arifin',
  'Wachid Zusron Fahmi',
  'Ahmad Danu Prasetiya',
  'Kukuh Hadi Wijaya',
  'Muhammad Satria Panoto Jiwo',
  'Putri Ayu Sukma Pertiwi',
  'Randi Maulana',
  'Yuda Tri Bhakti',
  'Yuliantika Sukma Dewi',
  'Zufar Al-Baihaqi',
  'Ahmad Kasiful Birri',
  'Cahyono',
  'Efan Zamzami',
  'Hanesa Putra Aprilianto',
  'Khoirul Arfan Asnawi',
  'Meyra Tri Salsabila Keyla Putri',
  'Mikaela Primaisha',
  'Mochamad Fairuz Akmal Pasya',
  'Muhammad Bashith Annafi',
  'Muhammad Romadhon',
  'Qalbi Nata Nabila',
  'Yumna Jihan Ahnaf',
  'Ahmad Sobahus Surur',
  'Khalisa Hasna Sajidah',
  'Muhammad Sapto Prastiyo',
  'Muhammad Zafri',
  'Raihan Al Sabri',
  'Salsabella Assifa Salamah',
  'Wahyu Nur Salam',
  'Zahrotulsifa',
  'Cristin Dea Musa',
  'Dewi Sartika Nengrum',
  'Elisa Syara Junita',
  'Faiza Alvi Qirani',
  'Hani Sasmitia Putri',
  'Litsa Nailil Amani',
  'Moch. Dama Abyyu Tsani',
  'Mohammad Azril Fahreza',
  'Mohammad Zilbran Sudarsono Pranoto',
  'Muhammad Angga Saputra',
  'Muhammad Saepudin',
  'Nafa Raidatul Kusna',
  "Nur 'Aini",
  'Sela Fitriani',
  'Wahyu Hidayat Agung',
  'Duwi Cahyono',
  'Johan Pratama Dani',
  'Khoirul Mustaqim',
  'M. Mahesa Ilyas Wibisono',
  'Moh. Rizqi Qodari',
  'Moh. Zakaria Yahya Azzuba',
  'Mohamad Zidan Nur Riski',
  'Rizqi Melinda Aura Putri',
  'Sukma Arsy Wira Dharma',
  'Zakira Ar Raihan',
  'Zhilvian Avrillio Pramudya Pratama',
  'Cici Lia Kurnia Wati',
  'Elsa Rusmaida Putri',
  'Frida Mustikawati',
  'Laelia Aris Susanti',
  'M. Nasikhul Amin',
  'Moh. Adila Ihsan',
  'Muhammad Alvino Akbar',
  'Risky Kurniawan',
  'Shafaina Windyarta',
  'Yahya Ahlil Qolbi',
  'Zainun Nur Afifah',
  'Abimanyu Satria Pamungkas',
  'Ananda Putri Aulya',
  'Bintang Widya Safara',
  'Eko Budi Santoso',
  'Elok Ragil Meiza',
  'Firdo Fernando',
  'Jihan Emilia',
  'Muhammad Nur Zaky',
  'Riko',
  'Yuwand Fernanda',
  'ANGGRAINI ALIFIANA WAHONO',
  'Anggun Putri Noviati',
  'MICKO SANDIKA PRATAMA',
  'RIZKINA SALWA AZIZAH',
  'SATRIA RIZKI RAMADHAN',
  'BANGKIT ADITIA DANI',
  'Claura Bintang Maretzka Santoso',
  'FAJAR JUNIANANTA',
  'LAILA FEBRI NUR FATIN',
  'MOH. FARDAN ALBRIAN SYAHPUTRA',
  'OSKA DEWI AGUSTINA',
  'YASMIN OKTAVIA',
  'ACHMAD DEVA ADIANSA',
  'Alfalandhika Tauryson Evangelical',
  'M. PRADITIA TRI SUCAHYO',
  'Mutya Ningsih',
  'SODIKIN NUR ROKHIM',
  'VANESYA MELIANA SAFARA',
];

export function build101FastingRecords(studentList: Student[]) {
  const records: Record<number, { studentId: number; status: 'berpuasa'; updatedAt: string }> = {};

  const normalizedMap = new Map<string, Student>();
  studentList.forEach((s) => {
    normalizedMap.set(s.nama.toLowerCase().trim().replace(/['"`\s]/g, ''), s);
  });

  EXACT_101_STUDENT_NAMES.forEach((name) => {
    const key = name.toLowerCase().trim().replace(/['"`\s]/g, '');
    const found =
      normalizedMap.get(key) ||
      studentList.find(
        (s) =>
          s.nama.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(s.nama.toLowerCase())
      );
    if (found) {
      records[found.id] = {
        studentId: found.id,
        status: 'berpuasa',
        updatedAt: new Date().toISOString(),
      };
    }
  });

  return records;
}

export function getStoredSessions(): Record<string, FastingSession> {
  if (memorySessionsCache) {
    return memorySessionsCache;
  }

  const defaultSessionId = '2026-08-27_Puasa_Sunnah_Kamis';
  const records101 = build101FastingRecords(DEFAULT_STUDENTS);

  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        // Ensure the official 101-student session on 27 Agustus 2026 is preserved with its data
        if (!parsed[defaultSessionId] || Object.keys(parsed[defaultSessionId].records || {}).length === 0) {
          parsed[defaultSessionId] = {
            id: defaultSessionId,
            title: 'Puasa Sunnah Kamis',
            date: '2026-08-27',
            records: records101,
            isVerified: true,
            isLocked: false,
            updatedAt: new Date().toISOString(),
          };
          saveAllStoredSessions(parsed);
        }
        memorySessionsCache = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored sessions:', e);
  }

  // Pre-seed the official session for 27 Agustus 2026 with the complete 101 fasting students
  const sampleSession: FastingSession = {
    id: defaultSessionId,
    title: 'Puasa Sunnah Kamis',
    date: '2026-08-27',
    records: records101,
    isVerified: true,
    isLocked: false,
    updatedAt: new Date().toISOString(),
  };

  const initialSessions = { [defaultSessionId]: sampleSession };
  memorySessionsCache = initialSessions;
  saveAllStoredSessions(initialSessions);
  return initialSessions;
}

export function saveAllStoredSessions(sessions: Record<string, FastingSession>): void {
  memorySessionsCache = sessions;
  // Non-blocking debounced sync to localStorage
  if (saveSessionsTimeout) clearTimeout(saveSessionsTimeout);
  saveSessionsTimeout = setTimeout(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Error saving sessions:', e);
    }
  }, 100);
}

export function saveSession(session: FastingSession): void {
  const currentSessions = getStoredSessions();
  const nextSessions = {
    ...currentSessions,
    [session.id]: {
      ...session,
      updatedAt: new Date().toISOString(),
    },
  };
  saveAllStoredSessions(nextSessions);
}

export function deleteSession(sessionId: string): void {
  const currentSessions = getStoredSessions();
  const nextSessions = { ...currentSessions };
  delete nextSessions[sessionId];
  saveAllStoredSessions(nextSessions);
}

const ADMIN_SETTINGS_KEY = 'sr_kediri_admin_settings_v1';

export function getStoredAdminSettings(): AdminSettings {
  if (memoryAdminSettingsCache) {
    return memoryAdminSettingsCache;
  }
  try {
    const raw = localStorage.getItem(ADMIN_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const settings = {
        ...parsed,
        allowPenginputCreateSession: Boolean(parsed.allowPenginputCreateSession),
      };
      memoryAdminSettingsCache = settings;
      return settings;
    }
  } catch (e) {
    console.error('Error reading admin settings:', e);
  }
  const defaultSettings: AdminSettings = {
    allowPenginputCreateSession: false,
    defaultDeadlineTime: '15:00',
  };
  memoryAdminSettingsCache = defaultSettings;
  return defaultSettings;
}

export function saveStoredAdminSettings(settings: AdminSettings): void {
  memoryAdminSettingsCache = settings;
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
