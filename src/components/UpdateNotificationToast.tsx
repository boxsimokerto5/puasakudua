import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X, CloudCheck } from 'lucide-react';

interface UpdateNotificationToastProps {
  hasUpdate: boolean;
  isUpdating: boolean;
  onUpdate: () => void;
}

export const UpdateNotificationToast: React.FC<UpdateNotificationToastProps> = ({
  hasUpdate,
  isUpdating,
  onUpdate,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (hasUpdate) {
      setDismissed(false);
    }
  }, [hasUpdate]);

  if (!hasUpdate || dismissed) return null;

  return (
    <div className="fixed bottom-5 right-5 left-5 sm:left-auto sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-amber-500/40 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Pembaruan Tersedia
              </h4>
              <p className="text-xs text-slate-300 leading-tight mt-0.5">
                Versi baru aplikasi Puasaku telah rilis di Cloudflare.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
          <button
            onClick={() => setDismissed(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Nanti Saja
          </button>
          <button
            onClick={onUpdate}
            disabled={isUpdating}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-900/30 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Memperbarui...' : 'Perbarui Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
};
