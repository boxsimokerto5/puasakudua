import { useState, useEffect, useCallback } from 'react';

interface VersionInfo {
  version: string;
  buildTime: number;
  builtAt?: string;
}

export function useAutoUpdate() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [serverVersion, setServerVersion] = useState<VersionInfo | null>(null);

  // Client's compiled build timestamp
  const clientBuildTime = typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : 0;

  const checkForUpdate = useCallback(async () => {
    // Only check if we are online
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    try {
      // Add timestamp query parameter and cache: 'no-store' to guarantee fresh response
      const response = await fetch(`/version.json?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (!response.ok) return;

      const data: VersionInfo = await response.json();
      if (data && data.buildTime) {
        // If server buildTime is greater than clientBuildTime (by at least 2 seconds)
        if (clientBuildTime > 0 && data.buildTime > clientBuildTime + 2000) {
          setHasUpdate(true);
          setServerVersion(data);
          console.log('[AutoUpdate] New version detected on Cloudflare Pages:', data);
        }
      }
    } catch {
      // Ignore network errors
    }
  }, [clientBuildTime]);

  const applyUpdate = useCallback(async () => {
    setIsUpdating(true);

    try {
      // 1. Tell Service Worker to purge cache & skip waiting if available
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }

      // 2. Clear caches storage directly if supported
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }
    } catch (e) {
      console.warn('[AutoUpdate] Cache purge warning:', e);
    }

    // 3. Force reload with cache bypass
    setTimeout(() => {
      window.location.reload();
    }, 200);
  }, []);

  useEffect(() => {
    // 1. Initial check after app finishes loading (3 seconds)
    const initialTimer = setTimeout(() => {
      checkForUpdate();
    }, 3000);

    // 2. Check periodically every 3 minutes
    const interval = setInterval(() => {
      checkForUpdate();
    }, 3 * 60 * 1000);

    // 3. Check whenever user focuses or switches back to this tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };

    // 4. Check when reconnecting online
    const handleOnline = () => {
      checkForUpdate();
    };

    // 5. Catch chunk load errors (happens when Cloudflare deployed new chunks and user clicks a new route/component)
    const handleWindowError = (event: ErrorEvent) => {
      const msg = event.message || '';
      if (
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Loading chunk') ||
        msg.includes('is not a valid JavaScript MIME type')
      ) {
        console.warn('[AutoUpdate] Dynamic import chunk error detected. Performing clean reload...');
        applyUpdate();
      }
    };

    // 6. Listen for service worker updates
    let refreshing = false;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('error', handleWindowError);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('error', handleWindowError);
    };
  }, [checkForUpdate, applyUpdate]);

  return {
    hasUpdate,
    isUpdating,
    serverVersion,
    checkForUpdate,
    applyUpdate,
  };
}
