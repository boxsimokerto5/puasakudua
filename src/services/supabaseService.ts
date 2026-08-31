import { getSupabase } from '../lib/supabase';
import { Student, FastingSession, AdminSettings } from '../types';

export interface SupabaseSessionRow {
  id: string;
  title: string;
  date: string;
  records: Record<string, any>;
  is_verified: boolean;
  verified_by?: string | null;
  verified_at?: string | null;
  verifier_notes?: string | null;
  is_locked: boolean;
  locked_at?: string | null;
  locked_by?: string | null;
  input_deadline?: string | null;
  created_by_id?: string | null;
  updated_at?: string | null;
}

export interface SupabaseStudentRow {
  id: number;
  no: number;
  nama: string;
  kelas: string;
  jenis_kelamin: string;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  nama_ibu: string;
  alamat: string;
  updated_at?: string;
}

function mapRowToSession(row: SupabaseSessionRow): FastingSession {
  // ensure studentId keys in records are numeric strings or numbers
  const recordsMap: Record<number, any> = {};
  if (row.records && typeof row.records === 'object') {
    Object.entries(row.records).forEach(([k, v]) => {
      const numKey = Number(k);
      if (!isNaN(numKey)) {
        recordsMap[numKey] = v;
      }
    });
  }

  return {
    id: row.id,
    title: row.title,
    date: row.date,
    records: recordsMap,
    isVerified: Boolean(row.is_verified),
    verifiedBy: row.verified_by || undefined,
    verifiedAt: row.verified_at || undefined,
    verifierNotes: row.verifier_notes || undefined,
    isLocked: Boolean(row.is_locked),
    lockedAt: row.locked_at || undefined,
    lockedBy: row.locked_by || undefined,
    inputDeadline: row.input_deadline || undefined,
    createdById: row.created_by_id || undefined,
    updatedAt: row.updated_at || undefined,
  };
}

function mapSessionToRow(session: FastingSession): SupabaseSessionRow {
  return {
    id: session.id,
    title: session.title,
    date: session.date,
    records: session.records || {},
    is_verified: Boolean(session.isVerified),
    verified_by: session.verifiedBy || null,
    verified_at: session.verifiedAt || null,
    verifier_notes: session.verifierNotes || null,
    is_locked: Boolean(session.isLocked),
    locked_at: session.lockedAt || null,
    locked_by: session.lockedBy || null,
    input_deadline: session.inputDeadline || null,
    created_by_id: session.createdById || null,
    updated_at: new Date().toISOString(),
  };
}

function mapRowToStudent(row: SupabaseStudentRow): Student {
  return {
    id: Number(row.id),
    no: Number(row.no || row.id),
    nama: row.nama || '',
    kelas: row.kelas || '',
    jenisKelamin: row.jenis_kelamin === 'Perempuan' ? 'Perempuan' : 'Laki-laki',
    nik: row.nik || '',
    tempatLahir: row.tempat_lahir || '',
    tanggalLahir: row.tanggal_lahir || '',
    namaIbu: row.nama_ibu || '',
    alamat: row.alamat || '',
  };
}

function mapStudentToRow(student: Student): SupabaseStudentRow {
  return {
    id: student.id,
    no: student.no,
    nama: student.nama,
    kelas: student.kelas,
    jenis_kelamin: student.jenisKelamin,
    nik: student.nik || '',
    tempat_lahir: student.tempatLahir || '',
    tanggal_lahir: student.tanggalLahir || '',
    nama_ibu: student.namaIbu || '',
    alamat: student.alamat || '',
    updated_at: new Date().toISOString(),
  };
}

// 1. Sessions CRUD
export async function fetchSessionsFromSupabase(): Promise<Record<string, FastingSession> | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('fasting_sessions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.warn('Gagal mengambil sesi dari Supabase:', error.message);
      return null;
    }

    if (!data) return {};

    const result: Record<string, FastingSession> = {};
    data.forEach((row: any) => {
      const session = mapRowToSession(row);
      result[session.id] = session;
    });

    return result;
  } catch (err) {
    console.error('Exception saat fetchSessionsFromSupabase:', err);
    return null;
  }
}

export async function upsertSessionToSupabase(session: FastingSession): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const row = mapSessionToRow(session);
    const { error } = await supabase
      .from('fasting_sessions')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('Gagal menyimpan sesi ke Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception saat upsertSessionToSupabase:', err);
    return false;
  }
}

export async function deleteSessionFromSupabase(sessionId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('fasting_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Gagal menghapus sesi di Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception saat deleteSessionFromSupabase:', err);
    return false;
  }
}

// 2. Students CRUD
export async function fetchStudentsFromSupabase(): Promise<Student[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Gagal mengambil daftar siswa dari Supabase:', error.message);
      return null;
    }

    if (!data || data.length === 0) return [];

    return data.map((r: any) => mapRowToStudent(r));
  } catch (err) {
    console.error('Exception saat fetchStudentsFromSupabase:', err);
    return null;
  }
}

export async function syncAllStudentsToSupabase(students: Student[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const rows = students.map(mapStudentToRow);
    const { error } = await supabase
      .from('students')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('Gagal menyinkronkan siswa ke Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception saat syncAllStudentsToSupabase:', err);
    return false;
  }
}

// 3. Admin Settings
export async function fetchAdminSettingsFromSupabase(): Promise<AdminSettings | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('id', 'global_settings')
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.warn('Gagal mengambil pengaturan admin dari Supabase:', error.message);
      }
      return null;
    }

    if (!data) return null;

    return {
      allowPenginputCreateSession: Boolean(data.allow_penginput_create_session),
      defaultDeadlineTime: data.default_deadline_time || '15:00',
      colorTheme: data.color_theme || undefined,
      schoolName: data.school_name || undefined,
      schoolSubName: data.school_sub_name || undefined,
    };
  } catch (err) {
    console.error('Exception saat fetchAdminSettingsFromSupabase:', err);
    return null;
  }
}

export async function saveAdminSettingsToSupabase(settings: AdminSettings): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  // 1. Try full upsert including color_theme and school branding
  try {
    const { error } = await supabase
      .from('admin_settings')
      .upsert(
        {
          id: 'global_settings',
          allow_penginput_create_session: settings.allowPenginputCreateSession,
          default_deadline_time: settings.defaultDeadlineTime,
          color_theme: settings.colorTheme || 'emerald',
          school_name: settings.schoolName || null,
          school_sub_name: settings.schoolSubName || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (!error) {
      return true;
    }

    // 2. If table doesn't have the new columns yet, fallback to saving base settings
    const isColumnMissingError =
      error.message?.includes('column') ||
      error.message?.includes('schema cache') ||
      error.code === 'PGRST204';

    if (isColumnMissingError) {
      console.warn(
        'Kolom kustomisasi tema belum ada di tabel Supabase admin_settings. Menyimpan kolom dasar dan mengandalkan local storage.'
      );

      const { error: fallbackError } = await supabase
        .from('admin_settings')
        .upsert(
          {
            id: 'global_settings',
            allow_penginput_create_session: settings.allowPenginputCreateSession,
            default_deadline_time: settings.defaultDeadlineTime,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (fallbackError) {
        console.error('Gagal menyimpan settings dasar ke Supabase:', fallbackError.message);
        return false;
      }
      return true;
    }

    console.error('Gagal menyimpan settings ke Supabase:', error.message);
    return false;
  } catch (err) {
    console.error('Exception saat saveAdminSettingsToSupabase:', err);
    return false;
  }
}

// 4. Realtime Subscription
export function setupSupabaseRealtime(
  onSessionUpdate: (session: FastingSession) => void,
  onSessionDelete: (sessionId: string) => void,
  onStudentsUpdate: () => void,
  onSettingsUpdate: (settings: AdminSettings) => void
) {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase
    .channel('puasaku_realtime_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'fasting_sessions' },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updatedSession = mapRowToSession(payload.new as SupabaseSessionRow);
          onSessionUpdate(updatedSession);
        } else if (payload.eventType === 'DELETE') {
          if (payload.old && payload.old.id) {
            onSessionDelete(payload.old.id);
          }
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'students' },
      () => {
        onStudentsUpdate();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'admin_settings' },
      (payload) => {
        if (payload.new) {
          const data: any = payload.new;
          onSettingsUpdate({
            allowPenginputCreateSession: Boolean(data.allow_penginput_create_session),
            defaultDeadlineTime: data.default_deadline_time || '15:00',
            colorTheme: data.color_theme || undefined,
            schoolName: data.school_name || undefined,
            schoolSubName: data.school_sub_name || undefined,
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
