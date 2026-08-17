import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWA_DISMISSED_KEY = 'puasaku_pwa_dismissed_until';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
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

    // 3. Check dismissed cooldown
    const dismissedUntil = localStorage.getItem(PWA_DISMISSED_KEY);
    const isDismissed = dismissedUntil && parseInt(dismissedUntil, 10) > Date.now();

    // 4. Handle beforeinstallprompt (Android / Chrome / Edge / Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Automatically show banner after 1.5 seconds if not dismissed
      if (!isDismissed && !isStandaloneMode) {
        setTimeout(() => {
          setShowAutoBanner(true);
        }, 1500);
      }
    };

    // 5. Handle appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
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

  const triggerInstall = async () => {
    if (isIOS) {
      setShowIosGuide(true);
      setShowAutoBanner(false);
      return;
    }

    if (!deferredPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt
      setShowIosGuide(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setShowAutoBanner(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('[PWA] Prompt error:', err);
    }
  };

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
