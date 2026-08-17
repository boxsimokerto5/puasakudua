import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'puasaku_supabase_url';
const SUPABASE_ANON_KEY = 'puasaku_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function normalizeSupabaseUrl(rawUrl: string): string {
  let clean = rawUrl.trim();
  if (!clean) return '';
  // Strip /rest/v1 or trailing slashes if user pasted REST endpoint
  clean = clean.replace(/\/rest\/v1\/?$/i, '');
  clean = clean.replace(/\/+$/, '');
  return clean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const metaEnv = (import.meta as any).env || {};
  const envUrl = metaEnv.VITE_SUPABASE_URL || '';
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(SUPABASE_URL_KEY) || '';
  const storedKey = localStorage.getItem(SUPABASE_ANON_KEY) || '';

  return {
    url: normalizeSupabaseUrl(storedUrl || envUrl),
    anonKey: storedKey.trim() || envKey.trim(),
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  const cleanUrl = normalizeSupabaseUrl(url);
  localStorage.setItem(SUPABASE_URL_KEY, cleanUrl);
  localStorage.setItem(SUPABASE_ANON_KEY, anonKey.trim());
  cachedClient = null; // reset cached instance
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_ANON_KEY);
  cachedClient = null;
}

export function isJwtToken(key: string): boolean {
  if (!key) return false;
  const parts = key.trim().split('.');
  return parts.length === 3;
}

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return false;
  if (!config.url.startsWith('https://')) return false;
  // If key is publishable key or not a 3-part JWT, it is not yet a valid Supabase anon key
  if (config.anonKey.startsWith('sb_publishable_') || !isJwtToken(config.anonKey)) {
    return false;
  }
  return true;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  if (!isSupabaseConfigured()) {
    return null;
  }

  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    return cachedClient;
  } catch (error) {
    console.error('Gagal menginisialisasi Supabase client:', error);
    return null;
  }
}

export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<{ success: boolean; message: string }> {
  try {
    const rawUrl = url !== undefined ? url : getSupabaseConfig().url;
    const testUrl = normalizeSupabaseUrl(rawUrl);
    const testKey = anonKey !== undefined ? anonKey.trim() : getSupabaseConfig().anonKey;

    if (!testUrl || !testKey) {
      return { success: false, message: 'URL atau Anon Key Supabase belum diisi.' };
    }

    if (!testUrl.startsWith('https://')) {
      return { success: false, message: 'URL Supabase harus diawali dengan https://' };
    }

    if (testKey.startsWith('sb_publishable_')) {
      return {
        success: false,
        message: 'Kunci ini adalah "sb_publishable_...". Supabase Database membutuhkan "anon public key" (JWT token panjang yang diawali dengan "eyJhbGci..."). Silakan salin kunci anon dari Project Settings > API di Supabase.',
      };
    }

    const testClient = createClient(testUrl, testKey);
    // Try pinging table or selecting 1 row
    const { error } = await testClient.from('fasting_sessions').select('id').limit(1);

    if (error) {
      if (error.message.includes('Invalid API key') || error.message.includes('JWT') || error.message.includes('apiKey')) {
        return {
          success: false,
          message: 'API Key Ditolak (Invalid API key): Pastikan Anda menyalin "anon public key" (JWT token panjang yang diawali dengan "eyJhbGci...") dari Project Settings > API di Supabase.',
        };
      }

      // If table doesn't exist yet, it's still a valid connection
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Koneksi ke Supabase BERHASIL! (Catatan: Tabel database belum dibuat. Silakan jalankan script SQL schema di menu SQL Editor Supabase).',
        };
      }
      return { success: false, message: `Error Supabase: ${error.message}` };
    }

    return { success: true, message: 'Koneksi ke database Supabase BERHASIL dan tabel terverifikasi!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal menghubungi server Supabase.' };
  }
}
