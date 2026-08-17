import React from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  X,
  Share,
  PlusSquare,
  Sparkles,
  Zap,
  ShieldCheck,
  Laptop
} from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface PwaInstallPromptProps {
  pwaState: ReturnType<typeof usePwaInstall>;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({ pwaState }) => {
  const {
    isInstalled,
    isIOS,
    showAutoBanner,
    showIosGuide,
    setShowIosGuide,
    triggerInstall,
    dismissBanner,
  } = pwaState;

  if (isInstalled && !showIosGuide) {
    return null;
  }

  return (
    <>
      {/* 1. AUTO-CHECK INSTALL BANNER / BOTTOM CARD */}
      {showAutoBanner && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-emerald-950/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/30 flex flex-col gap-3">
            {/* Header info */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-md flex-shrink-0 flex items-center justify-center">
                  <img
                    src="/assets/logo.svg"
                    alt="Logo Puasaku"
                    className="w-10 h-10 object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      PWA Siap Dipasang
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    Instal Aplikasi PUASAKU
                  </h4>
                  <p className="text-[11px] text-emerald-200/90 mt-0.5">
                    Buka lebih cepat, tanpa browser, dan hemat kuota di HP Anda.
                  </p>
                </div>
              </div>

              {/* Close / Dismiss */}
              <button
                onClick={() => dismissBanner(24)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800/50 transition-colors flex-shrink-0"
                title="Tutup banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-emerald-900/60 p-2 rounded-xl border border-emerald-800/40">
              <div className="flex items-center gap-1.5 text-emerald-100">
                <Zap className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                <span>Akses 1-Ketukan</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-100">
                <Smartphone className="w-3.5 h-3.5 text-teal-300 flex-shrink-0" />
                <span>Mode Layar Penuh</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={triggerInstall}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isIOS ? 'Lihat Cara Instal (iOS)' : '⚡ Pasang Sekarang'}</span>
              </button>

              <button
                onClick={() => dismissBanner(24)}
                className="px-3 py-2.5 text-xs text-emerald-300 hover:text-white hover:bg-emerald-900/80 rounded-xl transition-colors font-medium"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. iOS / MANUAL GUIDE MODAL */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-emerald-100 relative">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3 shadow-inner">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Pasang ke Layar Utama
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isIOS
                  ? 'Panduan instalasi untuk pengguna iPhone & iPad (Safari)'
                  : 'Panduan pemasangan aplikasi di perangkat Anda'}
              </p>
            </div>

            <div className="space-y-3.5 text-xs text-gray-700">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                  1
                </div>
                <div>
                  <p className="font-semibold text-emerald-950">
                    Ketuk Tombol Bagikan (Share)
                  </p>
                  <p className="text-emerald-800 text-[11px] mt-0.5 flex items-center gap-1">
                    Klik ikon <Share className="w-3.5 h-3.5 text-emerald-700 inline" /> di bilah bawah browser Safari Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                  2
                </div>
                <div>
                  <p className="font-semibold text-emerald-950">
                    Pilih "Tambah ke Layar Utama"
                  </p>
                  <p className="text-emerald-800 text-[11px] mt-0.5 flex items-center gap-1">
                    Gulir ke bawah dan ketuk opsi <PlusSquare className="w-3.5 h-3.5 text-emerald-700 inline" /> <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                  3
                </div>
                <div>
                  <p className="font-semibold text-emerald-950">
                    Ketuk "Tambah" (Add)
                  </p>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Aplikasi PUASAKU akan langsung terpasang dan muncul di layar utama HP Anda seperti aplikasi Play Store!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full mt-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
