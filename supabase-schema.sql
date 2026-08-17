-- ==============================================================================
-- DATABASE SCHEMA: PUASAKU - SRT 1 KEDIRI (SUPABASE POSTGRESQL)
-- ==============================================================================
-- Petunjuk:
-- 1. Buka dashboard Supabase Anda di https://supabase.com/dashboard
-- 2. Pilih project Anda -> Masuk ke menu "SQL Editor"
-- 3. Tempel (paste) seluruh script di bawah ini dan klik "Run"
-- ==============================================================================

-- 1. TABEL DATA SISWA (STUDENTS)
CREATE TABLE IF NOT EXISTS public.students (
    id BIGINT PRIMARY KEY,
    no INT,
    nama TEXT NOT NULL,
    kelas TEXT NOT NULL,
    jenis_kelamin TEXT NOT NULL,
    nik TEXT DEFAULT '',
    tempat_lahir TEXT DEFAULT '',
    tanggal_lahir TEXT DEFAULT '',
    nama_ibu TEXT DEFAULT '',
    alamat TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL SESI AMALAN PUASA (FASTING SESSIONS)
CREATE TABLE IF NOT EXISTS public.fasting_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    records JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    verified_by TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    verifier_notes TEXT,
    is_locked BOOLEAN DEFAULT false NOT NULL,
    locked_at TIMESTAMP WITH TIME ZONE,
    locked_by TEXT,
    input_deadline TEXT DEFAULT '15:00',
    created_by_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL PENGATURAN ADMIN (ADMIN SETTINGS)
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id TEXT PRIMARY KEY DEFAULT 'global_settings',
    allow_penginput_create_session BOOLEAN DEFAULT true NOT NULL,
    default_deadline_time TEXT DEFAULT '15:00' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Default Admin Settings jika belum ada
INSERT INTO public.admin_settings (id, allow_penginput_create_session, default_deadline_time)
VALUES ('global_settings', true, '15:00')
ON CONFLICT (id) DO NOTHING;

-- 4. AKTIFKAN ROW LEVEL SECURITY (RLS) DENGAN AKSES TERBUKA UNTUK ANON KEY
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Penuh untuk Public / Anon Key
DROP POLICY IF EXISTS "Public access for students" ON public.students;
CREATE POLICY "Public access for students" ON public.students
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for fasting_sessions" ON public.fasting_sessions;
CREATE POLICY "Public access for fasting_sessions" ON public.fasting_sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for admin_settings" ON public.admin_settings;
CREATE POLICY "Public access for admin_settings" ON public.admin_settings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. AKTIFKAN SUPABASE REALTIME REPLICATION
-- Mengaktifkan sinkronisasi langsung seketika antar perangkat
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'fasting_sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.fasting_sessions;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'students'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'admin_settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_settings;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Selesai! Database Supabase siap digunakan untuk Puasaku SRT 1 Kediri.
