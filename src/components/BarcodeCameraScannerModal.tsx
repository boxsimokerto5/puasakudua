import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle2, AlertCircle, RefreshCw, Volume2 } from 'lucide-react';
import { playScanSuccessSound } from '../utils/audioNotification';

interface BarcodeCameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedCode: string) => void;
}

export const BarcodeCameraScannerModal: React.FC<BarcodeCameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState<boolean>(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = 'barcode-camera-reader-region';

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    let isStartingScanner = true;
    setIsStarting(true);
    setScannerError(null);

    const html5QrCode = new Html5Qrcode(qrRegionId);
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        const config = {
          fps: 15,
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1.333333,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (isMounted) {
              setLastScanned(decodedText);
              onScanSuccess(decodedText);
            }
          },
          () => {
            // ignore scan frame errors
          }
        );

        isStartingScanner = false;
        if (isMounted) {
          setIsStarting(false);
        } else {
          // If unmounted while starting was resolving, stop safely
          if (html5QrCode.isScanning) {
            html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
          }
        }
      } catch (err: unknown) {
        console.error('Camera Scanner error:', err);
        isStartingScanner = false;
        if (isMounted) {
          setIsStarting(false);
          const errMsg = String(err || '');
          if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission denied')) {
            setScannerError(
              'Akses kamera diblokir oleh browser. Silakan klik ikon gembok / kamera di bar alamat browser Anda, pilih "Izinkan (Allow)" kamera, lalu klik tombol Coba Lagi di bawah.'
            );
          } else {
            setScannerError(
              'Gagal mengakses kamera perangkat. Pastikan perangkat memiliki kamera yang terhubung atau gunakan Barcode Scanner USB / Input manual.'
            );
          }
        }
      }
    };

    // Give DOM time to mount qrRegionId
    const timer = setTimeout(() => {
      if (isMounted) {
        startScanner();
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);

      const scanner = scannerRef.current;
      if (scanner) {
        try {
          if (scanner.isScanning) {
            scanner
              .stop()
              .then(() => {
                try {
                  scanner.clear();
                } catch {
                  // ignore clear error
                }
              })
              .catch((e) => {
                console.log('Safe cleanup ignore:', e);
              });
          } else if (!isStartingScanner) {
            try {
              scanner.clear();
            } catch {
              // ignore
            }
          }
        } catch (e) {
          console.log('Scanner cleanup catch:', e);
        }
      }
    };
  }, [isOpen, onScanSuccess, retryCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4 text-emerald-100" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold leading-tight truncate">Scan QR Code / Barcode Santri</h3>
              <p className="text-[10px] text-emerald-300 truncate">Arahkan kamera ke QR Code NIK pada kartu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer shrink-0 touch-manipulation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Scanner Viewport */}
        <div className="p-2 sm:p-4 bg-slate-900 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px] relative overflow-hidden flex-1">
          <div
            id={qrRegionId}
            className="w-full max-w-[340px] rounded-2xl overflow-hidden shadow-inner bg-black"
          />

          {isStarting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white space-y-2 z-10 p-4 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs font-semibold">Mengaktifkan kamera...</p>
            </div>
          )}

          {scannerError && (
            <div className="absolute inset-2 sm:inset-4 flex flex-col items-center justify-center bg-slate-900 text-white p-4 sm:p-5 rounded-2xl text-center space-y-3 z-10 overflow-y-auto">
              <AlertCircle className="w-8 h-8 sm:w-9 sm:h-9 text-amber-400 shrink-0" />
              <p className="text-xs text-slate-200 leading-relaxed max-w-xs">{scannerError}</p>
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 w-full sm:w-auto">
                <button
                  onClick={() => setRetryCount((c) => c + 1)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md touch-manipulation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Coba Aktifkan Lagi</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer touch-manipulation"
                >
                  Gunakan Input Manual
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Last Scanned Feedback & Footer */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 space-y-2.5 sm:space-y-3 shrink-0">
          {lastScanned && (
            <div className="p-2 sm:p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-[11px]">Kode Terdeteksi:</p>
                <p className="font-mono text-emerald-700 text-xs truncate">{lastScanned}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1 text-emerald-700 font-medium text-[11px] truncate">
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Beep aktif saat scan</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 rounded-xl text-xs font-bold transition-all cursor-pointer touch-manipulation shrink-0"
            >
              Tutup Scanner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
