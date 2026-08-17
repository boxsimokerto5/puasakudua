import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Student } from '../types';
import { Camera, User } from 'lucide-react';

interface StudentCardItemProps {
  student: Student;
  level: 'SD' | 'SMP' | 'SMA';
  onUploadClick?: (student: Student, e: React.MouseEvent) => void;
}

export const StudentCardItem: React.FC<StudentCardItemProps> = ({ student, level, onUploadClick }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [imgError, setImgError] = useState<boolean>(false);

  // Reset imgError if student foto changes
  useEffect(() => {
    setImgError(false);
  }, [student.foto]);

  // Generate QR Code based on student NIK (or fallback to student ID / No)
  const qrValue = student.nik && student.nik.trim() ? student.nik.trim() : `SRT-${student.no.toString().padStart(4, '0')}`;

  useEffect(() => {
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
    <div className="w-[330px] sm:w-[350px] h-[218px] bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col justify-between select-none relative font-sans text-gray-800">
      {/* Top Header Card */}
      <div
        className={`bg-gradient-to-r ${themeConfig.headerBg} text-white px-3.5 py-2 flex items-center justify-between relative overflow-hidden`}
      >
        {/* Background Islamic / decorative pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />

        <div className="flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-xs p-1 border border-white/20 flex items-center justify-center shrink-0">
            <img src="/assets/logo.svg" alt="Logo" className="w-full h-full object-contain filter drop-shadow" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-wider leading-none text-amber-300">
              KARTU SANTRI ASRAMA
            </h3>
            <p className="text-[8.5px] text-white/95 font-medium tracking-wide mt-0.5 whitespace-nowrap">
              SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI
            </p>
          </div>
        </div>

        <div className="z-10 text-right">
          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black bg-amber-400 text-slate-950 uppercase shadow-xs">
            {themeConfig.levelTitle}
          </span>
          <p className="text-[8px] text-white/80 font-mono mt-0.5">No. #{student.no}</p>
        </div>
      </div>

      {/* Main Body with Student Avatar & Details */}
      <div className="px-3.5 py-2 flex items-center gap-3 relative flex-1">
        {/* Student Avatar / Photo Box */}
        <div
          onClick={(e) => {
            if (onUploadClick) {
              e.stopPropagation();
              onUploadClick(student, e);
            }
          }}
          className={`w-16 h-20 rounded-xl bg-slate-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center shrink-0 relative overflow-hidden text-center group ${
            onUploadClick ? 'cursor-pointer hover:border-emerald-500' : ''
          }`}
          title={onUploadClick ? 'Klik untuk mengganti / mengunggah foto santri' : undefined}
        >
          {student.foto && !imgError ? (
            <img
              src={student.foto}
              alt={student.nama}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-1">
              <span className="text-xl">
                {student.jenisKelamin === 'Perempuan' ? '🧕' : '👳'}
              </span>
              <span className="text-[7.5px] font-bold text-gray-400 mt-0.5 uppercase leading-tight">
                Foto Santri
              </span>
            </div>
          )}

          {/* Quick upload trigger button overlay */}
          {onUploadClick && (
            <div className="absolute inset-0 bg-emerald-950/70 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <Camera className="w-4 h-4 text-amber-300 mb-0.5" />
              <span className="text-[7.5px] font-bold text-white leading-none">Ubah</span>
            </div>
          )}

          <span
            className={`absolute bottom-0 inset-x-0 text-[7px] font-extrabold text-white py-0.5 text-center shadow-xs ${
              student.jenisKelamin === 'Perempuan' ? 'bg-pink-600' : 'bg-blue-600'
            }`}
          >
            {student.jenisKelamin === 'Perempuan' ? 'PUTRI' : 'PUTRA'}
          </span>
        </div>

        {/* Student Bio Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
              Nama Lengkap
            </p>
            <h4 className="text-xs font-black text-gray-900 truncate leading-tight">
              {student.nama}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <p className="text-[8px] text-gray-400 font-semibold uppercase">Kelas</p>
              <p className="font-extrabold text-emerald-800">{student.kelas}</p>
            </div>
            <div>
              <p className="text-[8px] text-gray-400 font-semibold uppercase">No. Urut</p>
              <p className="font-extrabold text-gray-800">#{student.no}</p>
            </div>
          </div>

          <div>
            <p className="text-[8px] text-gray-400 font-semibold uppercase">NIK / ID Siswa</p>
            <p className="text-[10px] font-mono font-bold text-gray-900 tracking-wider">
              {student.nik || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Footer Container */}
      <div className="bg-slate-50 border-t border-gray-200 px-3 py-1.5 flex items-center justify-between">
        {/* QR Code Graphic & NIK Display */}
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 bg-white p-0.5 rounded-lg border border-gray-300 shadow-xs flex items-center justify-center shrink-0">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code NIK" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-gray-100 animate-pulse rounded" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">
              QR Code NIK:
            </span>
            <span className="text-[9px] font-mono font-black text-gray-900 tracking-wider leading-tight">
              {qrValue}
            </span>
          </div>
        </div>

        {/* Logo and Puasaku.app Branding */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-emerald-200/80 shadow-xs">
          <div className="w-5 h-5 rounded-md bg-emerald-600 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
            <img src="/assets/logo.svg" alt="Puasaku Logo" className="w-full h-full object-contain filter brightness-0 invert" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black text-emerald-800 tracking-tight leading-none">
              puasaku.app
            </span>
            <span className="text-[7px] font-semibold text-gray-400 tracking-wider leading-tight mt-0.5">
              SRT 1 KEDIRI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
