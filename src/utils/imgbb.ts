/**
 * ImgBB Cloud Image Hosting Integration
 * Allows uploading student photos directly to ImgBB cloud storage
 * so the database (Supabase / LocalStorage) only stores lightweight URL strings.
 */

const STORAGE_KEY = 'srt_imgbb_api_key';

export function getImgBbApiKey(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // Ignore localStorage errors
  }
  return import.meta.env.VITE_IMGBB_API_KEY || '';
}

export function saveImgBbApiKey(key: string): void {
  try {
    if (!key.trim()) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
  } catch (err) {
    console.error('Failed to save ImgBB API key to localStorage', err);
  }
}

export interface ImgBbUploadResponse {
  success: boolean;
  url?: string;
  displayUrl?: string;
  deleteUrl?: string;
  error?: string;
}

/**
 * Uploads a File, Blob, or base64 dataURL to ImgBB
 */
export async function uploadToImgBb(
  fileOrBase64: File | Blob | string,
  customApiKey?: string
): Promise<ImgBbUploadResponse> {
  const apiKey = customApiKey?.trim() || getImgBbApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'API Key ImgBB belum dikonfigurasi. Masukkan API Key ImgBB di pengaturan foto.',
    };
  }

  try {
    const formData = new FormData();

    if (typeof fileOrBase64 === 'string') {
      // It's a base64 DataURL or raw base64
      let base64Data = fileOrBase64;
      if (base64Data.startsWith('data:')) {
        const commaIndex = base64Data.indexOf(',');
        if (commaIndex !== -1) {
          base64Data = base64Data.substring(commaIndex + 1);
        }
      }
      formData.append('image', base64Data);
    } else {
      formData.append('image', fileOrBase64);
    }

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.ok && result.success && result.data) {
      // Return direct image link (or display_url / url)
      const directUrl = result.data.url || result.data.display_url || result.data.image?.url;
      return {
        success: true,
        url: directUrl,
        displayUrl: result.data.display_url,
        deleteUrl: result.data.delete_url,
      };
    } else {
      const errorMsg =
        result.error?.message ||
        (result.error && typeof result.error === 'string' ? result.error : 'Gagal mengunggah gambar ke ImgBB.');
      return {
        success: false,
        error: errorMsg,
      };
    }
  } catch (err: unknown) {
    console.error('ImgBB Upload Error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kendala jaringan saat menghubungi ImgBB API.',
    };
  }
}

/**
 * Test if the provided ImgBB API key is valid using a 1x1 transparent PNG
 */
export async function testImgBbApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  if (!apiKey.trim()) {
    return { valid: false, message: 'API Key tidak boleh kosong.' };
  }

  // 1x1 transparent PNG base64
  const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAAPI=' +
    'AA//9vQAPA';

  try {
    const res = await uploadToImgBb(tinyPngBase64, apiKey);
    if (res.success) {
      return { valid: true, message: 'API Key ImgBB valid dan siap digunakan!' };
    } else {
      return { valid: false, message: res.error || 'API Key ImgBB ditolak atau tidak valid.' };
    }
  } catch (err: unknown) {
    return {
      valid: false,
      message: err instanceof Error ? err.message : 'Gagal memvalidasi API Key ImgBB.',
    };
  }
}
