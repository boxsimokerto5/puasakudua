import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global variable to capture beforeinstallprompt even before React renders
declare global {
  interface Window {
    __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__pwaDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

const PWA_DISMISSED_KEY = 'puasaku_pwa_dismissed_until';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    return (typeof window !== 'undefined' && window.__pwaDeferredPrompt) || null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showAutoBanner, setShowAutoBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) {
      setIsInstalled(true);
      return;
    }

    // 2. Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Sync if global prompt already exists
    if (window.__pwaDeferredPrompt && !deferredPrompt) {
      setDeferredPrompt(window.__pwaDeferredPrompt);
    }

    // 4. Check dismissed cooldown
    const dismissedUntil = localStorage.getItem(PWA_DISMISSED_KEY);
    const isDismissed = dismissedUntil && parseInt(dismissedUntil, 10) > Date.now();

    // 5. Handle beforeinstallprompt (Android / Chrome / Edge / Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);

      // Automatically show banner after 1.5 seconds if not dismissed
      if (!isDismissed && !isStandaloneMode) {
        setTimeout(() => {
          setShowAutoBanner(true);
        }, 1500);
      }
    };

    // 6. Handle appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      window.__pwaDeferredPrompt = null;
      setDeferredPrompt(null);
      setShowAutoBanner(false);
      localStorage.removeItem(PWA_DISMISSED_KEY);
      console.log('[PWA] Puasaku installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // If iOS and not standalone, show prompt after brief delay if not dismissed
    if (isIosDevice && !isStandaloneMode && !isDismissed) {
      const timer = setTimeout(() => {
        setShowAutoBanner(true);
      }, 2500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (isIOS) {
      setShowIosGuide(true);
      setShowAutoBanner(false);
      return;
    }

    const activePrompt = deferredPrompt || (typeof window !== 'undefined' ? window.__pwaDeferredPrompt : null);

    if (!activePrompt) {
      // Fallback guide if browser does not support or hasn't fired beforeinstallprompt
      setShowIosGuide(true);
      return;
    }

    try {
      await activePrompt.prompt();
      const choice = await activePrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setShowAutoBanner(false);
      }
      window.__pwaDeferredPrompt = null;
      setDeferredPrompt(null);
    } catch (err) {
      console.error('[PWA] Prompt error:', err);
    }
  }, [deferredPrompt, isIOS]);

  const dismissBanner = (hours = 24) => {
    setShowAutoBanner(false);
    const expireAt = Date.now() + hours * 60 * 60 * 1000;
    localStorage.setItem(PWA_DISMISSED_KEY, expireAt.toString());
  };

  return {
    isInstalled: isInstalled || isStandalone,
    isStandalone,
    isIOS,
    canInstall: Boolean(deferredPrompt) || (isIOS && !isStandalone),
    showAutoBanner,
    showIosGuide,
    setShowAutoBanner,
    setShowIosGuide,
    triggerInstall,
    dismissBanner,
  };
}
