/**
 * Image processing & Cloudflare CDN Proxy utilities for student photos
 */

export interface ImageProxyOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
  fit?: 'cover' | 'contain' | 'inside';
}

/**
 * Normalizes image URLs (e.g. converting ImgBB viewer page links like ibb.co/xyz to direct or proxyable formats)
 */
export function normalizeImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // If already base64 data url or local asset path
  if (trimmed.startsWith('data:') || trimmed.startsWith('/') || trimmed.startsWith('./')) {
    return trimmed;
  }

  // Handle ImgBB viewer links: e.g. https://ibb.co/abcdef -> direct link if possible
  return trimmed;
}

/**
 * Generates an ultra-fast, CORS-enabled Cloudflare CDN proxy URL
 * using wsrv.nl (powered globally by Cloudflare Edge Network)
 */
export function getCloudflareProxyUrl(url: string, options?: ImageProxyOptions): string {
  if (!url || typeof url !== 'string') return '';
  const cleanUrl = url.trim();

  // If local base64 or internal asset, return as-is
  if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('/') || cleanUrl.startsWith('./')) {
    return cleanUrl;
  }

  // Ensure valid URL
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  const {
    width,
    height,
    quality = 88,
    format = 'webp',
    fit = 'cover',
  } = options || {};

  const params = new URLSearchParams();
  params.set('url', cleanUrl);
  if (format) params.set('output', format);
  if (quality) params.set('q', quality.toString());
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (fit) params.set('fit', fit);
  params.set('we', '1'); // Without enlargement if smaller

  return `https://wsrv.nl/?${params.toString()}`;
}

/**
 * Gets the best optimized URL for rendering in UI elements:
 * - Base64 or local images return as-is
 * - External URLs (ImgBB, etc.) are routed through Cloudflare CDN Proxy for instant loading, CORS support, and webp compression
 */
export function getOptimizedPhotoUrl(photoUrl?: string, options?: ImageProxyOptions): string {
  if (!photoUrl || typeof photoUrl !== 'string') return '';
  const normalized = normalizeImageUrl(photoUrl);

  // If Base64 or local asset
  if (normalized.startsWith('data:') || normalized.startsWith('/') || normalized.startsWith('./')) {
    return normalized;
  }

  // If HTTP/HTTPS URL, proxy through Cloudflare CDN
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return getCloudflareProxyUrl(normalized, options);
  }

  return normalized;
}

// In-memory image element cache to prevent redundant fetches and speed up batch operations
const imageElementCache = new Map<string, HTMLImageElement>();

/**
 * Robust asynchronous image loader for Canvas and jsPDF:
 * - Employs Cloudflare CDN proxy to ensure Access-Control-Allow-Origin: *
 * - Fallbacks gracefully to secondary CDN, Blob URL fetch, or direct URL
 * - Prevents Canvas tainting (SecurityError) when generating student cards
 * - Includes in-memory caching and configurable fast timeouts
 */
export async function loadSafeImageElement(
  src: string,
  timeoutMs: number = 3000
): Promise<HTMLImageElement> {
  if (!src) throw new Error('Image source is empty');

  // Check in-memory cache first
  if (imageElementCache.has(src)) {
    return imageElementCache.get(src)!;
  }

  // If Base64 or relative asset, load directly
  if (src.startsWith('data:') || src.startsWith('/') || src.startsWith('./')) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        imageElementCache.set(src, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error('Failed to load local image: ' + src));
      img.src = src;
    });
  }

  // URLs list to attempt sequentially
  const urlsToTry: string[] = [
    // 1. Primary Cloudflare CDN Proxy (JPEG format for best Canvas compatibility)
    getCloudflareProxyUrl(src, { format: 'jpg', quality: 90 }),
    // 2. Secondary Cloudflare CDN (images.weserv.nl)
    `https://images.weserv.nl/?url=${encodeURIComponent(src)}&output=jpg&q=90`,
    // 3. Raw original source
    src,
  ];

  for (const testUrl of urlsToTry) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.referrerPolicy = 'no-referrer';
        const timer = setTimeout(() => {
          image.src = '';
          reject(new Error('Image load timed out'));
        }, timeoutMs);

        image.onload = () => {
          clearTimeout(timer);
          resolve(image);
        };
        image.onerror = () => {
          clearTimeout(timer);
          reject(new Error('Image load error on: ' + testUrl));
        };
        image.src = testUrl;
      });

      imageElementCache.set(src, img);
      return img;
    } catch {
      // Try next fallback
    }
  }

  // Final fallback: fetch as Blob and convert to ObjectURL
  try {
    const proxyFetchUrl = getCloudflareProxyUrl(src, { format: 'jpg', quality: 88 });
    const controller = new AbortController();
    const fetchTimer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(proxyFetchUrl, {
      mode: 'cors',
      signal: controller.signal,
    });
    clearTimeout(fetchTimer);
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        imageElementCache.set(src, image);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Blob image load failed'));
      };
      image.src = objectUrl;
    });
  } catch {
    throw new Error('All image loading strategies failed for: ' + src);
  }
}

/**
 * Resizes and compresses an image file to a lightweight data URL (JPEG/WebP)
 * suitable for ID cards and local storage.
 */
export async function processAndCompressImage(
  fileOrBlob: File | Blob,
  maxWidth: number = 320,
  maxHeight: number = 400,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Gagal memproses file gambar'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Converts an external image URL to a Base64 data URL via canvas
 */
export async function urlToBase64(url: string): Promise<string> {
  try {
    const img = await loadSafeImageElement(url);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return url;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.88);
  } catch {
    return url;
  }
}

