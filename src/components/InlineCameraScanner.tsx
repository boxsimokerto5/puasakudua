import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertCircle, Volume2, SwitchCamera } from 'lucide-react';
import { playScanSuccessSound } from '../utils/audioNotification';

interface InlineCameraScannerProps {
  isActive: boolean;
  onClose: () => void;
  onScanSuccess: (scannedCode: string) => void;
  title?: string;
  scannerId?: string;
}

export const InlineCameraScanner: React.FC<InlineCameraScannerProps> = ({
  isActive,
  onClose,
  onScanSuccess,
  title = 'Arahkan Kamera ke QR / Barcode Kartu',
  scannerId = 'haid-inline-qr-reader',
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const onScanSuccessRef = useRef(onScanSuccess);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  });

  useEffect(() => {
    const safeStop = async (scanner: Html5Qrcode | null) => {
      if (!scanner) return;
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch {
        // Safe ignore
      }
      try {
        scanner.clear();
      } catch {
        // Safe ignore
      }
    };

    if (!isActive) {
      if (scannerRef.current) {
        const inst = scannerRef.current;
        scannerRef.current = null;
        safeStop(inst);
      }
      return;
    }

    let isMounted = true;
    setIsStarting(true);
    setScannerError(null);
    let localScanner: Html5Qrcode | null = null;

    const startScanner = async () => {
      await new Promise((r) => setTimeout(r, 120));
      if (!isMounted) return;

      const el = document.getElementById(scannerId);
      if (!el) return;

      try {
        localScanner = new Html5Qrcode(scannerId);
        scannerRef.current = localScanner;

        const config = {
          fps: 12,
          qrbox: { width: 220, height: 160 },
          aspectRatio: 1.333333,
        };

        await localScanner.start(
          { facingMode: facingMode },
          config,
          (decodedText) => {
            const now = Date.now();
            if (now - lastScannedTimeRef.current < 1200) {
              return;
            }
            lastScannedTimeRef.current = now;

            if (isMounted) {
              playScanSuccessSound();
              if (navigator.vibrate) {
                try {
                  navigator.vibrate([80, 40, 80]);
                } catch {
                  // ignore
                }
              }
              onScanSuccessRef.current(decodedText);
            }
          },
          () => {}
        );

        if (isMounted) {
          setIsStarting(false);
        } else if (localScanner) {
          await safeStop(localScanner);
        }
      } catch (err: unknown) {
        console.error('Inline Camera error:', err);
        if (isMounted) {
          setIsStarting(false);
          const errMsg = String(err || '');
          if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission denied')) {
            setScannerError('Akses kamera diblokir. Izinkan izin kamera di browser Anda.');
          } else if (errMsg.includes('Cannot transition')) {
            // Safe ignore
          } else {
            setScannerError('Kamera tidak dapat diakses atau sedang digunakan aplikasi lain.');
          }
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (localScanner) {
        const inst = localScanner;
        localScanner = null;
        scannerRef.current = null;
        safeStop(inst);
      }
    };
  }, [isActive, facingMode, scannerId]);

  if (!isActive) return null;

  return (
    <div className="w-full bg-slate-900 rounded-2xl overflow-hidden border border-pink-200 shadow-md flex flex-col animate-in fade-in zoom-in-95 duration-150">
      {/* Mini Header Bar */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <Camera className="w-3.5 h-3.5 text-pink-100 shrink-0" />
          <span className="text-[11px] font-bold truncate leading-tight">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] flex items-center gap-0.5 cursor-pointer touch-manipulation"
            title="Ganti Kamera Depan/Belakang"
          >
            <SwitchCamera className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-white/15 hover:bg-white/30 text-white cursor-pointer touch-manipulation"
            title="Tutup Kamera"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Video Frame */}
      <div className="relative min-h-[220px] max-h-[260px] bg-black flex items-center justify-center overflow-hidden">
        <div id={scannerId} className="w-full h-full max-w-[320px] mx-auto overflow-hidden" />

        {isStarting && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-white space-y-2 p-3 z-10 text-center">
            <RefreshCw className="w-6 h-6 text-pink-400 animate-spin" />
            <p className="text-xs font-semibold">Mengaktifkan kamera perangkat...</p>
          </div>
        )}

        {scannerError && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-white space-y-2 p-4 z-10 text-center">
            <AlertCircle className="w-7 h-7 text-amber-400 shrink-0" />
            <p className="text-xs text-slate-200 leading-snug">{scannerError}</p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'environment' : 'user'))}
                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer touch-manipulation"
              >
                Coba Lagi
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer touch-manipulation"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-1.5 bg-slate-950 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1 text-pink-300">
          <Volume2 className="w-3 h-3" />
          <span>Suara beep & getar aktif</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-300 hover:text-white font-bold underline cursor-pointer"
        >
          Tutup Scanner
        </button>
      </div>
    </div>
  );
};
