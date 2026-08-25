import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, FastingSession, FastingStatus } from '../types';

export interface LevelGenderGroupStats {
  key: string;
  label: string;
  totalStudents: number;
  berpuasa: number;
  tidakPuasa: number;
  halangan: number;
  belumDiisi: number;
  percentage: number;
  isSubtotal?: boolean;
  isGrandTotal?: boolean;
}

export interface FullFastingBreakdown {
  sdPutri: LevelGenderGroupStats;
  sdPutra: LevelGenderGroupStats;
  jumlahSd: LevelGenderGroupStats;
  smpPutri: LevelGenderGroupStats;
  smpPutra: LevelGenderGroupStats;
  jumlahSmp: LevelGenderGroupStats;
  smaPutra: LevelGenderGroupStats;
  smaPutri: LevelGenderGroupStats;
  jumlahSma: LevelGenderGroupStats;
  totalSemua: LevelGenderGroupStats;
  allRows: LevelGenderGroupStats[];
}

/**
 * Categorizes a class name into 'SD', 'SMP', or 'SMA'
 */
export function getStudentLevel(kelas: string): 'SD' | 'SMP' | 'SMA' {
  const k = (kelas || '').toUpperCase().trim();
  if (k.startsWith('SD') || k.includes('SD')) return 'SD';
  if (
    k.startsWith('VII') ||
    k.startsWith('VIII') ||
    k.startsWith('IX') ||
    k.includes('SMP')
  )
    return 'SMP';
  if (
    k.startsWith('X') ||
    k.startsWith('XI') ||
    k.startsWith('XII') ||
    k.includes('SMA')
  )
    return 'SMA';
  return 'SD'; // Fallback
}

/**
 * Computes breakdown for:
 * 1. SD Putri
 * 2. SD Putra
 * 3. Jumlah SD
 * 4. SMP Putri
 * 5. SMP Putra
 * 6. Jumlah SMP
 * 7. SMA Putra
 * 8. SMA Putri
 * 9. Jumlah SMA
 * 10. Total Semua
 */
export function computeFullBreakdown(
  students: Student[],
  session: FastingSession
): FullFastingBreakdown {
  const initStats = (key: string, label: string, isSubtotal = false, isGrandTotal = false): LevelGenderGroupStats => ({
    key,
    label,
    totalStudents: 0,
    berpuasa: 0,
    tidakPuasa: 0,
    halangan: 0,
    belumDiisi: 0,
    percentage: 0,
    isSubtotal,
    isGrandTotal,
  });

  const sdPutri = initStats('sd_putri', 'SD Putri');
  const sdPutra = initStats('sd_putra', 'SD Putra');
  const smpPutri = initStats('smp_putri', 'SMP Putri');
  const smpPutra = initStats('smp_putra', 'SMP Putra');
  const smaPutri = initStats('sma_putri', 'SMA Putri');
  const smaPutra = initStats('sma_putra', 'SMA Putra');

  students.forEach((s) => {
    const level = getStudentLevel(s.kelas);
    const isFemale =
      s.jenisKelamin === 'Perempuan' ||
      s.jenisKelamin.toLowerCase().startsWith('p');

    const rec = session?.records ? session.records[s.id] : undefined;
    const status: FastingStatus = rec?.status || 'belum_diisi';

    let target: LevelGenderGroupStats | null = null;

    if (level === 'SD') {
      target = isFemale ? sdPutri : sdPutra;
    } else if (level === 'SMP') {
      target = isFemale ? smpPutri : smpPutra;
    } else if (level === 'SMA') {
      target = isFemale ? smaPutri : smaPutra;
    }

    if (target) {
      target.totalStudents += 1;
      if (status === 'berpuasa') target.berpuasa += 1;
      else if (status === 'tidak_puasa') target.tidakPuasa += 1;
      else if (status === 'halangan') target.halangan += 1;
      else target.belumDiisi += 1;
    }
  });

  const calculatePct = (grp: LevelGenderGroupStats) => {
    grp.percentage =
      grp.totalStudents > 0
        ? Math.round((grp.berpuasa / grp.totalStudents) * 100)
        : 0;
  };

  calculatePct(sdPutri);
  calculatePct(sdPutra);
  calculatePct(smpPutri);
  calculatePct(smpPutra);
  calculatePct(smaPutri);
  calculatePct(smaPutra);

  // Helper to sum two stats
  const sumStats = (
    key: string,
    label: string,
    a: LevelGenderGroupStats,
    b: LevelGenderGroupStats,
    isSubtotal = true,
    isGrandTotal = false
  ): LevelGenderGroupStats => {
    const total = a.totalStudents + b.totalStudents;
    const berpuasa = a.berpuasa + b.berpuasa;
    return {
      key,
      label,
      totalStudents: total,
      berpuasa,
      tidakPuasa: a.tidakPuasa + b.tidakPuasa,
      halangan: a.halangan + b.halangan,
      belumDiisi: a.belumDiisi + b.belumDiisi,
      percentage: total > 0 ? Math.round((berpuasa / total) * 100) : 0,
      isSubtotal,
      isGrandTotal,
    };
  };

  const jumlahSd = sumStats('jumlah_sd', 'JUMLAH SD', sdPutri, sdPutra, true, false);
  const jumlahSmp = sumStats('jumlah_smp', 'JUMLAH SMP', smpPutri, smpPutra, true, false);
  const jumlahSma = sumStats('jumlah_sma', 'JUMLAH SMA', smaPutri, smaPutra, true, false);

  // Total Semua
  const totalSemua: LevelGenderGroupStats = {
    key: 'total_semua',
    label: 'TOTAL KESELURUHAN',
    totalStudents: jumlahSd.totalStudents + jumlahSmp.totalStudents + jumlahSma.totalStudents,
    berpuasa: jumlahSd.berpuasa + jumlahSmp.berpuasa + jumlahSma.berpuasa,
    tidakPuasa: jumlahSd.tidakPuasa + jumlahSmp.tidakPuasa + jumlahSma.tidakPuasa,
    halangan: jumlahSd.halangan + jumlahSmp.halangan + jumlahSma.halangan,
    belumDiisi: jumlahSd.belumDiisi + jumlahSmp.belumDiisi + jumlahSma.belumDiisi,
    percentage:
      jumlahSd.totalStudents + jumlahSmp.totalStudents + jumlahSma.totalStudents > 0
        ? Math.round(
            ((jumlahSd.berpuasa + jumlahSmp.berpuasa + jumlahSma.berpuasa) /
              (jumlahSd.totalStudents + jumlahSmp.totalStudents + jumlahSma.totalStudents)) *
              100
          )
        : 0,
    isSubtotal: false,
    isGrandTotal: true,
  };

  const allRows: LevelGenderGroupStats[] = [
    sdPutri,
    sdPutra,
    jumlahSd,
    smpPutri,
    smpPutra,
    jumlahSmp,
    smaPutri,
    smaPutra,
    jumlahSma,
    totalSemua,
  ];

  return {
    sdPutri,
    sdPutra,
    jumlahSd,
    smpPutri,
    smpPutra,
    jumlahSmp,
    smaPutra,
    smaPutri,
    jumlahSma,
    totalSemua,
    allRows,
  };
}

/**
 * Formats ISO or YYYY-MM-DD date string to Indonesian long date format
 */
export function formatDateIndoLong(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generates PDF using jsPDF and jspdf-autotable
 * Clean, compact 1-page layout for ~50 students
 */
export function downloadFastingReportPDF(
  students: Student[],
  session: FastingSession,
  verifierName?: string
): void {
  const breakdown = computeFullBreakdown(students, session);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const greenDark: [number, number, number] = [6, 78, 59]; // emerald-900
  const emeraldMid: [number, number, number] = [16, 185, 129]; // emerald-500
  const bgLight: [number, number, number] = [240, 253, 244]; // emerald-50

  // 1. KOP HEADER (Tanpa Alamat/Jalan)
  doc.setFillColor(...greenDark);
  doc.rect(10, 8, 190, 15, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI', 105, 15, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(253, 230, 138); // amber-200
  doc.text('SISTEM INFORMASI PENCATATAN AMALAN PUASA SISWA (PUASAKU) - WALI ASUH', 105, 20, { align: 'center' });

  // 2. JUDUL DOKUMEN
  doc.setTextColor(6, 78, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('LAPORAN REKAPITULASI SISWA BERPUASA', 105, 28, { align: 'center' });

  // Garis aksen bawah judul
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line(70, 30, 140, 30);

  // 3. DESKRIPSI RESUME (Tanggal input, nama sesi kegiatan, total berpuasa)
  doc.setFillColor(...bgLight);
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.setLineWidth(0.3);
  doc.roundedRect(10, 32.5, 190, 12, 1.5, 1.5, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('Kegiatan / Sesi', 13, 37);
  doc.text('Tanggal Input', 80, 37);
  doc.text('Total Berpuasa', 145, 37);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(6, 78, 59);
  doc.setFontSize(8.5);
  doc.text(`: ${session.title}`, 35, 37);
  doc.text(`: ${formatDateIndoLong(session.date)}`, 100, 37);
  doc.setFont('helvetica', 'bold');
  doc.text(`: ${breakdown.totalSemua.berpuasa} dari ${students.length} Siswa (${breakdown.totalSemua.percentage}%)`, 166, 37);

  // Verifikasi info jika ada di baris kedua resume
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Status: ${session.isVerified ? 'Terverifikasi' : 'Terdata'} • Dibuat secara otomatis oleh Sistem PUASAKU`, 13, 42);

  // 4. TABEL HORIZONTAL REKAP JUMLAH BERPUASA PER JENJANG
  const totalDark: [number, number, number] = [4, 47, 36];
  const horizHeaders = [
    [
      { content: 'SD', colSpan: 3, styles: { halign: 'center' as const, fillColor: greenDark } },
      { content: 'SMP', colSpan: 3, styles: { halign: 'center' as const, fillColor: greenDark } },
      { content: 'SMA', colSpan: 3, styles: { halign: 'center' as const, fillColor: greenDark } },
      { content: 'TOTAL', rowSpan: 2, styles: { halign: 'center' as const, fillColor: totalDark, fontStyle: 'bold' as const, valign: 'middle' as const } }
    ],
    [
      'Putra', 'Putri', 'Total SD',
      'Putra', 'Putri', 'Total SMP',
      'Putra', 'Putri', 'Total SMA'
    ]
  ];

  const horizBody = [
    [
      breakdown.sdPutra.berpuasa.toString(),
      breakdown.sdPutri.berpuasa.toString(),
      breakdown.jumlahSd.berpuasa.toString(),
      breakdown.smpPutra.berpuasa.toString(),
      breakdown.smpPutri.berpuasa.toString(),
      breakdown.jumlahSmp.berpuasa.toString(),
      breakdown.smaPutra.berpuasa.toString(),
      breakdown.smaPutri.berpuasa.toString(),
      breakdown.jumlahSma.berpuasa.toString(),
      `${breakdown.totalSemua.berpuasa} Siswa`
    ]
  ];

  autoTable(doc, {
    startY: 46.5,
    head: horizHeaders,
    body: horizBody,
    theme: 'grid',
    margin: { left: 10, right: 10 },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.2,
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: greenDark,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 7,
    },
    bodyStyles: {
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 17 },
      1: { cellWidth: 17 },
      2: { cellWidth: 20, fillColor: [209, 250, 229], textColor: [6, 78, 59] },
      3: { cellWidth: 17 },
      4: { cellWidth: 17 },
      5: { cellWidth: 20, fillColor: [209, 250, 229], textColor: [6, 78, 59] },
      6: { cellWidth: 17 },
      7: { cellWidth: 17 },
      8: { cellWidth: 20, fillColor: [209, 250, 229], textColor: [6, 78, 59] },
      9: { cellWidth: 28, fillColor: [4, 47, 36], textColor: [254, 240, 138], fontStyle: 'bold' },
    }
  });

  const tableAfterY = (doc as any).lastAutoTable?.finalY || 62;

  // 5. DAFTAR NAMA SISWA YANG BERPUASA (2 KOLOM KOMPAK & RAPAT)
  const fastingStudents = students
    .filter((s) => session.records[s.id]?.status === 'berpuasa')
    .sort((a, b) => {
      if (a.kelas !== b.kelas) return a.kelas.localeCompare(b.kelas);
      return a.nama.localeCompare(b.nama);
    });

  // Label Section
  doc.setTextColor(6, 78, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`DAFTAR SISWA YANG BERPUASA (${fastingStudents.length} SISWA)`, 10, tableAfterY + 4);

  // Build 2-column paired rows so 50+ students fit on 1 page
  const halfCount = Math.ceil(fastingStudents.length / 2);
  const twoColBody: any[][] = [];

  if (fastingStudents.length === 0) {
    twoColBody.push([
      { content: 'Tidak ada siswa yang berpuasa pada sesi ini.', colSpan: 8, styles: { halign: 'center' as const, fontStyle: 'italic' as const } }
    ]);
  } else {
    for (let i = 0; i < halfCount; i++) {
      const left = fastingStudents[i];
      const right = fastingStudents[i + halfCount];

      const leftGender = left.jenisKelamin === 'Perempuan' || left.jenisKelamin?.toLowerCase().startsWith('p') ? 'P' : 'L';
      const rightGender = right ? (right.jenisKelamin === 'Perempuan' || right.jenisKelamin?.toLowerCase().startsWith('p') ? 'P' : 'L') : '';

      twoColBody.push([
        (i + 1).toString(),
        left.nama,
        left.kelas,
        leftGender,
        right ? (i + halfCount + 1).toString() : '',
        right ? right.nama : '',
        right ? right.kelas : '',
        right ? rightGender : ''
      ]);
    }
  }

  const twoColHeaders = [
    [
      'No', 'Nama Siswa', 'Kelas', 'L/P',
      'No', 'Nama Siswa', 'Kelas', 'L/P'
    ]
  ];

  autoTable(doc, {
    startY: tableAfterY + 5.5,
    head: twoColHeaders,
    body: twoColBody,
    theme: 'grid',
    margin: { left: 10, right: 10, bottom: 12 },
    styles: {
      fontSize: 7,
      cellPadding: 1,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: greenDark,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center',
      cellPadding: 1.2,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 7 },
      1: { cellWidth: 54, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 26, textColor: [6, 78, 59] },
      3: { halign: 'center', cellWidth: 8 },
      4: { halign: 'center', cellWidth: 7 },
      5: { cellWidth: 54, fontStyle: 'bold' },
      6: { halign: 'center', cellWidth: 26, textColor: [6, 78, 59] },
      7: { halign: 'center', cellWidth: 8 },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [248, 250, 252]; // subtle alternate row
        }
      }
    },
  });

  // 6. FOOTER (Hanya "Didata oleh Wali Asuh", tanpa penanda tangan)
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);

    // Garis tipis footer
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(10, 289, 200, 289);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Didata oleh Wali Asuh', 10, 293);

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `PUASAKU • Hal. ${p}/${pageCount} • Dicetak: ${new Date().toLocaleDateString('id-ID')}`,
      200,
      293,
      { align: 'right' }
    );
  }

  // Save the PDF file
  const cleanTitle = session.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Rekap_Puasa_${session.date}_${cleanTitle}.pdf`;
  doc.save(fileName);
}

/**
 * PDF Generator for Ceklist Berbuka Puasa per Level (SD, SMP, SMA, SEMUA)
 */
export function generateBerbukaChecklistPdf(
  students: Student[],
  session: FastingSession,
  level: 'SEMUA' | 'SD' | 'SMP' | 'SMA' = 'SEMUA',
  verifierName: string = 'Wali Asuh'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(14, 12, 182, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SEKOLAH RAKYAT KABUPATEN KEDIRI', 105, 21, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(253, 230, 138); // Amber 200
  const levelTitle = level === 'SEMUA' ? 'SEMUA JENJANG (SD, SMP, SMA)' : `JENJANG ${level}`;
  doc.text(`DAFTAR PRESENSI & CEKLIST BERBUKA PUASA - ${levelTitle}`, 105, 27, { align: 'center' });

  // Sorted list of ONLY fasting students (filtered by level if chosen)
  const fastingStudents = students
    .filter((s) => {
      const isFasting = session.records[s.id]?.status === 'berpuasa';
      if (!isFasting) return false;
      if (level === 'SEMUA') return true;
      return getStudentLevel(s.kelas) === level;
    })
    .sort((a, b) => {
      if (a.kelas !== b.kelas) return a.kelas.localeCompare(b.kelas);
      return a.nama.localeCompare(b.nama);
    });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Sesi: ${session.title}  |  Tanggal: ${formatDateIndoLong(session.date)}  |  Total Berpuasa: ${fastingStudents.length} Siswa (${levelTitle})`,
    14,
    38
  );

  const studentTableHeaders = [
    ['NO', 'NAMA SISWA', 'KELAS', 'L/P', 'NIK / NO', 'CEKLIST BERBUKA', 'PARAF / CATATAN']
  ];

  const studentTableBody = fastingStudents.map((s, idx) => {
    const rec = session.records[s.id];
    const gender =
      s.jenisKelamin === 'Perempuan' || s.jenisKelamin?.toLowerCase().startsWith('p') ? 'P' : 'L';

    return [
      idx + 1,
      s.nama,
      s.kelas,
      gender,
      s.nik || s.no.toString(),
      '[   ]  Sudah Berbuka',
      rec?.notes || ''
    ];
  });

  if (fastingStudents.length === 0) {
    studentTableBody.push([1, 'Tidak ada siswa yang berpuasa pada sesi ini', '-', '-', '-', '-', '-']);
  }

  autoTable(doc, {
    startY: 42,
    head: studentTableHeaders,
    body: studentTableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 78, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 12 },
      4: { halign: 'center', cellWidth: 26 },
      5: { halign: 'center', cellWidth: 34, fontStyle: 'bold' },
      6: { cellWidth: 30 },
    },
  });

  // Signature Section
  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  const sigY = Math.min(finalY + 15, 245);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text('Kediri, ' + formatDateIndoLong(new Date().toISOString().split('T')[0]), 135, sigY);
  doc.setFont('helvetica', 'bold');
  doc.text('Wali Asuh / Petugas,', 135, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(`( ${verifierName} )`, 135, sigY + 24);

  // Save PDF
  const fileName = `Ceklist_Berbuka_SR_Kediri_${session.date}.pdf`;
  doc.save(fileName);
}

/**
 * PDF Generator for Ceklist Makan Siang (Tidak Berpuasa) per Level (SD, SMP, SMA, SEMUA)
 */
export function generateMakanSiangChecklistPdf(
  students: Student[],
  session: FastingSession,
  level: 'SEMUA' | 'SD' | 'SMP' | 'SMA' = 'SEMUA',
  verifierName: string = 'Wali Asuh'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(159, 18, 57); // Rose 900
  doc.rect(14, 12, 182, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SEKOLAH RAKYAT KABUPATEN KEDIRI', 105, 21, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(254, 205, 211); // Rose 200
  const levelTitle = level === 'SEMUA' ? 'SEMUA JENJANG (SD, SMP, SMA)' : `JENJANG ${level}`;
  doc.text(`DAFTAR CEKLIST MAKAN SIANG (TIDAK BERPUASA) - ${levelTitle}`, 105, 27, { align: 'center' });

  // Filter non-fasting students (anyone whose status is NOT 'berpuasa')
  const nonFastingStudents = students
    .filter((s) => {
      const rec = session.records[s.id];
      const status = rec?.status;
      const isNonFasting = status !== 'berpuasa';
      if (!isNonFasting) return false;
      if (level === 'SEMUA') return true;
      return getStudentLevel(s.kelas) === level;
    })
    .sort((a, b) => {
      if (a.kelas !== b.kelas) return a.kelas.localeCompare(b.kelas);
      return a.nama.localeCompare(b.nama);
    });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Sesi: ${session.title}  |  Tanggal: ${formatDateIndoLong(session.date)}  |  Jenjang: ${level}  |  Total Makan Siang: ${nonFastingStudents.length} Siswa`,
    14,
    38
  );

  const studentTableHeaders = [
    ['NO', 'NAMA SISWA', 'KELAS', 'L/P', 'KETERANGAN', 'CEKLIST MAKAN SIANG', 'PARAF / CATATAN']
  ];

  const studentTableBody = nonFastingStudents.map((s, idx) => {
    const rec = session.records[s.id];
    const gender =
      s.jenisKelamin === 'Perempuan' || s.jenisKelamin?.toLowerCase().startsWith('p') ? 'P' : 'L';
    const reason =
      rec?.status === 'halangan'
        ? 'Halangan / Uzur'
        : rec?.status === 'tidak_puasa'
        ? 'Tidak Puasa'
        : 'Tidak Puasa';

    return [
      idx + 1,
      s.nama,
      s.kelas,
      gender,
      reason,
      '[   ]  Sudah Makan',
      rec?.notes || ''
    ];
  });

  if (nonFastingStudents.length === 0) {
    studentTableBody.push([1, `Tidak ada siswa ${level === 'SEMUA' ? '' : level} yang memerlukan makan siang`, '-', '-', '-', '-', '-']);
  }

  autoTable(doc, {
    startY: 42,
    head: studentTableHeaders,
    body: studentTableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [159, 18, 57], // Rose 900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 12 },
      4: { halign: 'center', cellWidth: 30 },
      5: { halign: 'center', cellWidth: 34, fontStyle: 'bold' },
      6: { cellWidth: 26 },
    },
  });

  // Signature Section
  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  const sigY = Math.min(finalY + 15, 245);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text('Kediri, ' + formatDateIndoLong(new Date().toISOString().split('T')[0]), 135, sigY);
  doc.setFont('helvetica', 'bold');
  doc.text('Wali Asuh / Petugas,', 135, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(`( ${verifierName} )`, 135, sigY + 24);

  // Save PDF
  const fileName = `Ceklist_Makan_Siang_${level}_SR_Kediri_${session.date}.pdf`;
  doc.save(fileName);
}

/**
 * PDF Generator for Ceklist Sahur (Data Siswa Berpuasa) per Level (SD, SMP, SMA, SEMUA)
 */
export function generateSahurChecklistPdf(
  students: Student[],
  session: FastingSession,
  level: 'SEMUA' | 'SD' | 'SMP' | 'SMA' = 'SEMUA',
  verifierName: string = 'Wali Asuh'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner - Navy / Indigo Theme
  doc.setFillColor(30, 27, 75); // Indigo 950
  doc.rect(14, 12, 182, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI', 105, 21, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(253, 230, 138); // Amber 200
  const levelTitle = level === 'SEMUA' ? 'SEMUA JENJANG (SD, SMP, SMA)' : `JENJANG ${level}`;
  doc.text(`DAFTAR PRESENSI & CEKLIST SANTAP SAHUR - ${levelTitle}`, 105, 27, { align: 'center' });

  // Sorted list of fasting students (filtered by level if chosen)
  const fastingStudents = students
    .filter((s) => {
      const isFasting = session.records[s.id]?.status === 'berpuasa';
      if (!isFasting) return false;
      if (level === 'SEMUA') return true;
      return getStudentLevel(s.kelas) === level;
    })
    .sort((a, b) => {
      if (a.kelas !== b.kelas) return a.kelas.localeCompare(b.kelas);
      return a.nama.localeCompare(b.nama);
    });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Sesi: ${session.title}  |  Tanggal: ${formatDateIndoLong(session.date)}  |  Total Santri Sahur: ${fastingStudents.length} Siswa (${levelTitle})`,
    14,
    38
  );

  const studentTableHeaders = [
    ['NO', 'NAMA SISWA', 'KELAS', 'L/P', 'NIK / NO', 'CEKLIST SAHUR', 'PARAF / CATATAN']
  ];

  const studentTableBody = fastingStudents.map((s, idx) => {
    const rec = session.records[s.id];
    const gender =
      s.jenisKelamin === 'Perempuan' || s.jenisKelamin?.toLowerCase().startsWith('p') ? 'P' : 'L';

    return [
      idx + 1,
      s.nama,
      s.kelas,
      gender,
      s.nik || s.no.toString(),
      '[   ]  Sudah Sahur',
      rec?.notes || ''
    ];
  });

  if (fastingStudents.length === 0) {
    studentTableBody.push([1, 'Tidak ada data siswa berpuasa/sahur pada sesi ini', '-', '-', '-', '-', '-']);
  }

  autoTable(doc, {
    startY: 42,
    head: studentTableHeaders,
    body: studentTableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 27, 75], // Indigo 950
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 12 },
      4: { halign: 'center', cellWidth: 26 },
      5: { halign: 'center', cellWidth: 34, fontStyle: 'bold' },
      6: { cellWidth: 30 },
    },
  });

  // Signature Section
  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  const sigY = Math.min(finalY + 15, 245);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text('Kediri, ' + formatDateIndoLong(new Date().toISOString().split('T')[0]), 135, sigY);
  doc.setFont('helvetica', 'bold');
  doc.text('Wali Asuh / Petugas Sahur,', 135, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(`( ${verifierName} )`, 135, sigY + 24);

  // Save PDF
  const fileName = `Ceklist_Sahur_SRT1_Kediri_${session.date}.pdf`;
  doc.save(fileName);
}

