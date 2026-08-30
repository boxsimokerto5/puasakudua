import React, { useEffect, useState, memo } from 'react';
import QRCode from 'qrcode';
import { Student } from '../types';
import { Camera, User, ShieldAlert, AlertTriangle } from 'lucide-react';
import { getOptimizedPhotoUrl } from '../utils/imageUtils';
import { buildCardQrValue, getEffectiveCardVersion } from '../utils/cardSecurity';

// Global In-Memory Cache for QR Code Data URLs (Avoids costly re-computations)
const qrCodeDataUrlCache = new Map<string, string>();

interface StudentCardItemProps {
  student: Student;
  level: 'SD' | 'SMP' | 'SMA';
  onUploadClick?: (student: Student, e: React.MouseEvent) => void;
}

export const StudentCardItem: React.FC<StudentCardItemProps> = memo(({ student, level, onUploadClick }) => {
  const cardVersion = getEffectiveCardVersion(student);
  const isDuplicate = cardVersion > 1;

  // Generate QR Code with version payload: e.g. "3506010203040002#V2"
  const qrValue = buildCardQrValue(student);
  const [qrDataUrl, setQrDataUrl] = useState<string>(() => qrCodeDataUrlCache.get(qrValue) || '');
  const [imgError, setImgError] = useState<boolean>(false);
  const [isUsingDirectFallback, setIsUsingDirectFallback] = useState<boolean>(false);

  // Reset imgError & fallback if student foto changes
  useEffect(() => {
    setImgError(false);
    setIsUsingDirectFallback(false);
  }, [student.foto]);

  const baseCodeDisplay = student.nik && student.nik.trim() ? student.nik.trim() : `SRT-${student.no.toString().padStart(4, '0')}`;

  useEffect(() => {
    if (qrCodeDataUrlCache.has(qrValue)) {
      setQrDataUrl(qrCodeDataUrlCache.get(qrValue)!);
      return;
    }

    let isMounted = true;
    QRCode.toDataURL(qrValue, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 140,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        qrCodeDataUrlCache.set(qrValue, url);
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('QR code render error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [qrValue]);

  // Color schemes for SD (Merah), SMP (Biru), SMA (Abu-abu)
  const themeConfig = {
    SD: {
      headerBg: 'from-red-700 via-rose-700 to-red-800',
      accentBorder: 'border-red-600',
      tagBg: 'bg-red-600 text-white',
      badgeBg: 'bg-red-50 text-red-800 border-red-200',
      watermarkColor: 'text-red-700',
      levelTitle: 'TINGKAT SD',
      subPattern: 'bg-red-500/10',
    },
    SMP: {
      headerBg: 'from-blue-700 via-sky-700 to-blue-800',
      accentBorder: 'border-blue-600',
      tagBg: 'bg-blue-600 text-white',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
      watermarkColor: 'text-blue-700',
      levelTitle: 'TINGKAT SMP',
      subPattern: 'bg-blue-500/10',
    },
    SMA: {
      headerBg: 'from-slate-700 via-gray-700 to-slate-800',
      accentBorder: 'border-slate-600',
      tagBg: 'bg-slate-700 text-white',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
      watermarkColor: 'text-slate-700',
      levelTitle: 'TINGKAT SMA',
      subPattern: 'bg-slate-500/10',
    },
  }[level];

  return (
    <div
      id={`student-card-${student.id}`}
      className={`w-full max-w-[305px] h-[190px] bg-white rounded-xl shadow-xs border overflow-hidden flex flex-col justify-between select-none relative font-sans text-gray-800 transition-all duration-150 ${
        isDuplicate ? 'border-rose-400 ring-2 ring-rose-300/40 shadow-rose-100' : 'border-slate-200'
      }`}
    >
      {/* Top Header Card */}
      <div
        className={`bg-gradient-to-r ${themeConfig.headerBg} text-white px-2.5 py-1.5 flex items-center justify-between relative overflow-hidden shrink-0`}
      >
        {/* Background Islamic / decorative pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px]" />

        <div className="flex items-center gap-1.5 z-10">
          <div className="w-6 h-6 rounded-md bg-white/15 backdrop-blur-xs p-0.5 border border-white/20 flex items-center justify-center shrink-0">
            <img src="/assets/logo.svg" alt="Logo" className="w-full h-full object-contain filter drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-[10px] font-black tracking-wider leading-none text-amber-300">
                KARTU PUASA WALI ASUH
              </h3>
              {isDuplicate && (
                <span className="px-1 py-0.2 rounded bg-rose-600 border border-white text-white text-[6.5px] font-black uppercase tracking-wider animate-pulse shadow-xs">
                  DUPLIKAT
                </span>
              )}
            </div>
            <p className="text-[7.5px] text-white/95 font-medium tracking-wide mt-0.5 whitespace-nowrap">
              SRT 1 KEDIRI
            </p>
          </div>
        </div>

        <div className="z-10 text-right">
          <div className="flex items-center gap-1 justify-end">
            <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-400 text-slate-950 uppercase shadow-2xs leading-none">
              {themeConfig.levelTitle}
            </span>
          </div>
          <div className="flex items-center gap-1 justify-end mt-0.5">
            <span className={`text-[7px] font-bold font-mono px-1 py-0.2 rounded leading-none ${
              isDuplicate ? 'bg-rose-950 text-rose-200 border border-rose-400/50' : 'text-white/90'
            }`}>
              {isDuplicate ? `V${cardVersion}` : 'V1'}
            </span>
            <p className="text-[7.5px] text-white/80 font-mono">#{student.no}</p>
          </div>
        </div>
      </div>

      {/* Prominent Duplicate Ribbon / Watermark Badge */}
      {isDuplicate && (
        <>
          <div className="absolute top-8 right-1 z-20 pointer-events-none">
            <div className="px-1.5 py-0.5 rounded-md bg-rose-600 border border-rose-300 text-white text-[7px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-2xs">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-300" />
              <span>DUPLIKAT (V{cardVersion})</span>
            </div>
          </div>
          {/* Subtle diagonal DUPLIKAT text watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
            <span className="text-[28px] font-black text-rose-500/10 uppercase tracking-widest -rotate-15 select-none whitespace-nowrap">
              DUPLIKAT V{cardVersion}
            </span>
          </div>
        </>
      )}

      {/* Main Body with Student Avatar, Details & Prominent QR Code */}
      <div className="px-2.5 py-1 flex items-center gap-2 relative flex-1 min-h-0">
        {/* Student Avatar / Photo Box */}
        <div
          onClick={(e) => {
            if (onUploadClick) {
              e.stopPropagation();
              onUploadClick(student, e);
            }
          }}
          className={`w-13 h-17 rounded-lg bg-slate-100 border border-dashed border-gray-300 flex flex-col items-center justify-center shrink-0 relative overflow-hidden text-center group ${
            onUploadClick ? 'cursor-pointer hover:border-emerald-500' : ''
          }`}
          title={onUploadClick ? 'Klik untuk mengganti / mengunggah foto santri' : undefined}
        >
          {student.foto && !imgError ? (
            <img
              src={
                isUsingDirectFallback
                  ? student.foto
                  : getOptimizedPhotoUrl(student.foto, { width: 200, height: 260, quality: 85, format: 'webp' })
              }
              alt={student.nama}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              loading="lazy"
              onError={() => {
                if (!isUsingDirectFallback && student.foto && student.foto.startsWith('http')) {
                  setIsUsingDirectFallback(true);
                } else {
                  setImgError(true);
                }
              }}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-0.5">
              <span className="text-base">
                {student.jenisKelamin === 'Perempuan' ? '🧕' : '👳'}
              </span>
              <span className="text-[6.5px] font-bold text-gray-400 mt-0.5 uppercase leading-tight">
                Foto
              </span>
            </div>
          )}

          {/* Quick upload trigger button overlay */}
          {onUploadClick && (
            <div className="absolute inset-0 bg-emerald-950/70 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <Camera className="w-3.5 h-3.5 text-amber-300 mb-0.5" />
              <span className="text-[7px] font-bold text-white leading-none">Ubah</span>
            </div>
          )}

          <span
            className={`absolute bottom-0 inset-x-0 text-[6px] font-extrabold text-white py-0.2 text-center shadow-2xs ${
              student.jenisKelamin === 'Perempuan' ? 'bg-pink-600' : 'bg-blue-600'
            }`}
          >
            {student.jenisKelamin === 'Perempuan' ? 'PUTRI' : 'PUTRA'}
          </span>
        </div>

        {/* Student Bio Details */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div>
            <p className="text-[7px] font-semibold text-gray-400 uppercase tracking-wider leading-none">
              Nama Lengkap
            </p>
            <h4 className="text-[10.5px] font-black text-gray-900 truncate leading-tight mt-0.5">
              {student.nama}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[8px] pt-0.5">
            <div>
              <p className="text-[6.5px] text-gray-400 font-semibold uppercase leading-none">Kelas</p>
              <p className="font-extrabold text-emerald-800 leading-tight truncate">{student.kelas}</p>
            </div>
            <div>
              <p className="text-[6.5px] text-gray-400 font-semibold uppercase leading-none">No. Urut</p>
              <p className="font-extrabold text-gray-800 leading-tight">#{student.no}</p>
            </div>
          </div>

          <div className="pt-0.5">
            <p className="text-[6.5px] text-gray-400 font-semibold uppercase leading-none">NIK / ID Siswa</p>
            <p className="text-[8.5px] font-mono font-bold text-gray-900 tracking-wide truncate leading-tight mt-0.5">
              {student.nik || '-'}
            </p>
          </div>
        </div>

        {/* Prominent Large QR Code on the Right */}
        <div className={`shrink-0 flex flex-col items-center bg-white p-0.5 rounded-lg border shadow-2xs ${
          isDuplicate ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-200'
        }`}>
          <div className={`text-[5.5px] font-black px-1 py-0.2 rounded uppercase tracking-wider mb-0.5 leading-none flex items-center gap-0.5 ${
            isDuplicate ? 'bg-rose-700 text-amber-200' : 'bg-slate-900 text-amber-300'
          }`}>
            <span>QR NIK</span>
            <span className="bg-white/20 px-0.5 rounded text-[5px]">V{cardVersion}</span>
          </div>
          <div className="w-13 h-13 bg-white flex items-center justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code NIK" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-gray-100 animate-pulse rounded" />
            )}
          </div>
          <span className="text-[6.5px] font-mono font-bold text-gray-900 tracking-tight leading-none mt-0.5 max-w-[58px] truncate">
            {baseCodeDisplay} <span className={isDuplicate ? 'text-rose-600 font-black' : 'text-slate-500'}>#V{cardVersion}</span>
          </span>
        </div>
      </div>

      {/* Footer Branding Bar */}
      <div className={`border-t px-2.5 py-0.5 flex items-center justify-between shrink-0 ${
        isDuplicate ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 rounded bg-emerald-600 p-0.5 flex items-center justify-center shrink-0">
            <img src="/assets/logo.svg" alt="Puasaku Logo" className="w-full h-full object-contain filter brightness-0 invert" />
          </div>
          <span className="text-[7.5px] font-black text-emerald-800 tracking-tight">
            puasaku.app <span className="font-normal text-gray-400 text-[6.5px]">• SRT 1 KEDIRI</span>
          </span>
        </div>

        <span className={`text-[6.5px] font-extrabold uppercase tracking-wider ${
          isDuplicate ? 'text-rose-700' : 'text-slate-400'
        }`}>
          {isDuplicate ? `DUPLIKAT (EDISI KE-${cardVersion})` : 'Kartu Puasa'}
        </span>
      </div>
    </div>
  );
});
