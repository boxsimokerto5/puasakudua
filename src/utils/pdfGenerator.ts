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
 * Helper to get clean level title
 */
function getLevelLabel(level: 'SEMUA' | 'SD' | 'SMP' | 'SMA'): string {
  if (level === 'SEMUA') return 'Semua Jenjang (SD, SMP, SMA)';
  return `Jenjang ${level}`;
}

/**
 * PDF Generator for Ceklist Berbuka Puasa per Level (SD, SMP, SMA, SEMUA)
 * Slim, dense, proportional, fitting 35-40 students per A4 page cleanly.
 * Signature removed, includes checked marks for claimed status.
 */
export function generateBerbukaChecklistPdf(
  students: Student[],
  session: FastingSession,
  level: 'SEMUA' | 'SD' | 'SMP' | 'SMA' = 'SEMUA',
  verifierName: string = 'Wali Asuh',
  checkedIds?: Set<number> | Set<string>
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const greenDark: [number, number, number] = [6, 78, 59]; // Emerald 900
  const amberGold: [number, number, number] = [245, 158, 11]; // Amber 500

  // 1. KOP HEADER SLIM (16 mm height)
  doc.setFillColor(...greenDark);
  doc.rect(10, 8, 190, 16, 'F');

  // Accent Line
  doc.setFillColor(...amberGold);
  doc.rect(10, 24, 190, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI', 105, 14.5, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setTextColor(253, 230, 138); // Amber 200
  const levelTitle = getLevelLabel(level);
  doc.text(
    `LAPORAN & CEKLIST BERBUKA PUASA SANTRI • ${levelTitle.toUpperCase()}`,
    105,
    20.5,
    { align: 'center' }
  );

  // 2. FILTER & SORT STUDENTS (Hanya yang berpuasa)
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

  let putraCount = 0;
  let putriCount = 0;
  let sudahBerbukaCount = 0;

  fastingStudents.forEach((s) => {
    const isFemale =
      s.jenisKelamin === 'Perempuan' || s.jenisKelamin?.toLowerCase().startsWith('p');
    if (isFemale) putriCount++;
    else putraCount++;

    if (checkedIds && ((checkedIds as any).has(s.id) || (checkedIds as any).has(String(s.id)))) {
      sudahBerbukaCount++;
    }
  });

  // 3. SLIM METADATA RESUME BAR (Height ~9 mm)
  doc.setFillColor(240, 253, 244); // Emerald 50
  doc.setDrawColor(187, 247, 208); // Emerald 200
  doc.setLineWidth(0.3);
  doc.roundedRect(10, 27, 190, 9, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  doc.text(`Sesi:`, 13, 32.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text(`${session.title}`, 20, 32.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Tanggal:`, 75, 32.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatDateIndoLong(session.date)}`, 88, 32.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Berpuasa:`, 132, 32.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text(
    `${fastingStudents.length} Santri (L: ${putraCount}, P: ${putriCount})${
      checkedIds ? ` | Tercentang: ${sudahBerbukaCount}` : ''
    }`,
    152,
    32.5
  );

  // 4. TABEL CEKLIST SLIM & PROPORIONAL
  const studentTableHeaders = [
    ['NO', 'NAMA SANTRI', 'KELAS', 'L/P', 'STATUS PUASA', 'CEKLIST BERBUKA', 'PARAF / CATATAN']
  ];

  const studentTableBody = fastingStudents.map((s, idx) => {
    const rec = session.records[s.id];
    const gender =
      s.jenisKelamin === 'Perempuan' || s.jenisKelamin?.toLowerCase().startsWith('p')
        ? 'P'
        : 'L';
    const isChecked = checkedIds ? ((checkedIds as any).has(s.id) || (checkedIds as any).has(String(s.id))) : true;
    const checklistText = isChecked ? '[ ✓ ] Sudah Berbuka' : '[    ] Belum Berbuka';

    return [
      idx + 1,
      s.nama,
      s.kelas,
      gender,
      '[ ✓ ] Berpuasa',
      checklistText,
      rec?.notes || ''
    ];
  });

  if (fastingStudents.length === 0) {
    studentTableBody.push([
      {
        content: `Tidak ada data santri yang berpuasa untuk ${levelTitle} pada sesi ini.`,
        colSpan: 7,
        styles: { halign: 'center' as const, fontStyle: 'italic' as const }
      } as any
    ]);
  }

  autoTable(doc, {
    startY: 38,
    head: studentTableHeaders,
    body: studentTableBody,
    theme: 'grid',
    margin: { left: 10, right: 10, bottom: 12 },
    styles: {
      fontSize: 7.5,
      cellPadding: { top: 1.1, bottom: 1.1, left: 1.5, right: 1.5 },
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: greenDark,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
      cellPadding: { top: 1.5, bottom: 1.5, left: 1.5, right: 1.5 },
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 64, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'center', cellWidth: 10 },
      4: { halign: 'center', cellWidth: 26, textColor: [6, 78, 59], fontStyle: 'bold' },
      5: { halign: 'center', cellWidth: 34, fontStyle: 'bold', textColor: [15, 23, 42] },
      6: { cellWidth: 30, textColor: [100, 116, 139] },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [248, 250, 252];
        }
        // Highlight checked status in cell
        if (data.column.index === 5) {
          const val = String(data.cell.raw || '');
          if (val.includes('[ ✓ ]')) {
            data.cell.styles.textColor = [6, 78, 59];
          }
        }
      }
    },
  });

  // 5. FOOTER HALAMAN (Tanpa Tanda Tangan Sesuai Instruksi)
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(10, 289, 200, 289);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('PUASAKU • SRT 1 KEDIRI • Laporan Ceklist Berbuka Puasa', 10, 293);

    doc.setTextColor(148, 163, 184);
    doc.text(
      `Hal. ${p}/${pageCount} • Dicetak: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
      200,
      293,
      { align: 'right' }
    );
  }

  // Save PDF
  const cleanTitle = session.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Ceklist_Berbuka_${level}_${session.date}_${cleanTitle}.pdf`;
  doc.save(fileName);
}

/**
 * PDF Generator for Ceklist Makan Siang (Tidak Berpuasa) per Level (SD, SMP, SMA, SEMUA)
 * Slim, dense, proportional, fitting 35-40 students per A4 page cleanly.
 * Signature removed, includes checked marks for claimed status.
 */
export function generateMakanSiangChecklistPdf(
  students: Student[],
  session: FastingSession,
  level: 'SEMUA' | 'SD' | 'SMP' | 'SMA' = 'SEMUA',
  verifierName: string = 'Wali Asuh',
  checkedIds?: Set<number> | Set<string>
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const maroonDark: [number, number, number] = [136, 19, 55]; // Rose 900
  const roseAccent: [number, number, number] = [244, 63, 94]; // Rose 500

  // 1. KOP HEADER SLIM (16 mm height)
  doc.setFillColor(...maroonDark);
  doc.rect(10, 8, 190, 16, 'F');

  // Accent Line
  doc.setFillColor(...roseAccent);
  doc.rect(10, 24, 190, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI', 105, 14.5, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setTextColor(254, 205, 211); // Rose 200
  const levelTitle = getLevelLabel(level);
  doc.text(
    `LAPORAN & CEKLIST PENYEDIAAN MAKAN SIANG (NON-PUASA) • ${levelTitle.toUpperCase()}`,
    105,
    20.5,
    { align: 'center' }
  );

  // 2. FILTER & SORT NON-FASTING STUDENTS
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

  let halanganCount = 0;
  let tidakPuasaCount = 0;
  let sudahMakanCount = 0;

  nonFastingStudents.forEach((s) => {
    const rec = session.records[s.id];
    if (rec?.status === 'halangan') halanganCount++;
    else tidakPuasaCount++;

    if (checkedIds && ((checkedIds as any).has(s.id) || (checkedIds as any).has(String(s.id)))) {
      sudahMakanCount++;
    }
  });

  // 3. SLIM METADATA RESUME BAR (Height ~9 mm)
  doc.setFillColor(255, 241, 242); // Rose 50
  doc.setDrawColor(254, 205, 211); // Rose 200
  doc.setLineWidth(0.3);
  doc.roundedRect(10, 27, 190, 9, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  doc.text(`Sesi:`, 13, 32.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(136, 19, 55);
  doc.text(`${session.title}`, 20, 32.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Tanggal:`, 75, 32.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatDateIndoLong(session.date)}`, 88, 32.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Makan Siang:`, 130, 32.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(136, 19, 55);
  doc.text(
    `${nonFastingStudents.length} Santri (Halangan: ${halanganCount}, Tidak Puasa: ${tidakPuasaCount})${
      checkedIds ? ` | Tercentang: ${sudahMakanCount}` : ''
    }`,
    154,
    32.5
  );

  // 4. TABEL CEKLIST SLIM & PROPORIONAL
  const studentTableHeaders = [
    ['NO', 'NAMA SANTRI', 'KELAS', 'L/P', 'KATEGORI / ALASAN', 'CEKLIST MAKAN SIANG', 'PARAF / CATATAN']
  ];

  const studentTableBody = nonFastingStudents.map((s, idx) => {
    const rec = session.records[s.id];
    const gender =
      s.jenisKelamin === 'Perempuan' || s.jenisKelamin?.toLowerCase().startsWith('p')
        ? 'P'
        : 'L';
    const reason =
      rec?.status === 'halangan'
        ? '[ ✓ ] Halangan / Uzur'
        : rec?.status === 'tidak_puasa'
        ? '[ ✓ ] Tidak Puasa'
        : '[ — ] Belum Diisi';
    const isChecked = checkedIds ? ((checkedIds as any).has(s.id) || (checkedIds as any).has(String(s.id))) : true;
    const checklistText = isChecked ? '[ ✓ ] Terlayani Makan' : '[    ] Belum Makan';

    return [
      idx + 1,
      s.nama,
      s.kelas,
      gender,
      reason,
      checklistText,
      rec?.notes || ''
    ];
  });

  if (nonFastingStudents.length === 0) {
    studentTableBody.push([
      {
        content: `Tidak ada data santri yang memerlukan makan siang untuk ${levelTitle} pada sesi ini.`,
        colSpan: 7,
        styles: { halign: 'center' as const, fontStyle: 'italic' as const }
      } as any
    ]);
  }

  autoTable(doc, {
    startY: 38,
    head: studentTableHeaders,
    body: studentTableBody,
    theme: 'grid',
    margin: { left: 10, right: 10, bottom: 12 },
    styles: {
      fontSize: 7.5,
      cellPadding: { top: 1.1, bottom: 1.1, left: 1.5, right: 1.5 },
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: maroonDark,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
      cellPadding: { top: 1.5, bottom: 1.5, left: 1.5, right: 1.5 },
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 62, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'center', cellWidth: 10 },
      4: { halign: 'center', cellWidth: 32, textColor: [136, 19, 55], fontStyle: 'bold' },
      5: { halign: 'center', cellWidth: 30, fontStyle: 'bold', textColor: [15, 23, 42] },
      6: { cellWidth: 30, textColor: [100, 116, 139] },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [255, 241, 242];
        }
        if (data.column.index === 5) {
          const val = String(data.cell.raw || '');
          if (val.includes('[ ✓ ]')) {
            data.cell.styles.textColor = [136, 19, 55];
          }
        }
      }
    },
  });

  // 5. FOOTER HALAMAN (Tanpa Tanda Tangan Sesuai Instruksi)
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(10, 289, 200, 289);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('PUASAKU • SRT 1 KEDIRI • Laporan Ceklist Makan Siang (Non-Puasa)', 10, 293);

    doc.setTextColor(148, 163, 184);
    doc.text(
      `Hal. ${p}/${pageCount} • Dicetak: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
      200,
      293,
      { align: 'right' }
    );
  }

  // Save PDF
  const cleanTitle = session.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Ceklist_Makan_Siang_${level}_${session.date}_${cleanTitle}.pdf`;
  doc.save(fileName);
}

/**
 * PDF Generator for Ceklist Sahur (Data Siswa Berpuasa) per Level (SD, SMP, SMA, SEMUA)
 * Slim, dense, proportional, fitting 35-40 students per A4 page cleanly.
 * Signature removed, includes checked marks for claimed status.
 */
export function generateSahurChecklistPdf(
  students: Student[],
  session: FastingSession,
  level: 'SEMUA' | 'SD' | 'SMP' | 'SMA' = 'SEMUA',
  verifierName: string = 'Wali Asuh',
  checkedIds?: Set<number> | Set<string>
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const navyDark: [number, number, number] = [30, 27, 75]; // Indigo 950
  const amberGold: [number, number, number] = [245, 158, 11]; // Amber 500

  // 1. KOP HEADER SLIM (16 mm height)
  doc.setFillColor(...navyDark);
  doc.rect(10, 8, 190, 16, 'F');

  // Accent Line
  doc.setFillColor(...amberGold);
  doc.rect(10, 24, 190, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI', 105, 14.5, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setTextColor(253, 230, 138); // Amber 200
  const levelTitle = getLevelLabel(level);
  doc.text(
    `LAPORAN & CEKLIST SANTAP SAHUR SANTRI • ${levelTitle.toUpperCase()}`,
    105,
    20.5,
    { align: 'center' }
  );

  // 2. FILTER & SORT FASTING STUDENTS
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

  let putraCount = 0;
  let putriCount = 0;
  let sudahSahurCount = 0;

  fastingStudents.forEach((s) => {
    const isFemale =
      s.jenisKelamin === 'Perempuan' || s.jenisKelamin?.toLowerCase().startsWith('p');
    if (isFemale) putriCount++;
    else putraCount++;

    if (checkedIds && ((checkedIds as any).has(s.id) || (checkedIds as any).has(String(s.id)))) {
      sudahSahurCount++;
    }
  });

  // 3. SLIM METADATA RESUME BAR (Height ~9 mm)
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.setDrawColor(199, 210, 254); // Indigo 200
  doc.setLineWidth(0.3);
  doc.roundedRect(10, 27, 190, 9, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  doc.text(`Sesi:`, 13, 32.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 27, 75);
  doc.text(`${session.title}`, 20, 32.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Tanggal:`, 75, 32.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatDateIndoLong(session.date)}`, 88, 32.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Sahur:`, 132, 32.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 27, 75);
  doc.text(
    `${fastingStudents.length} Santri (L: ${putraCount}, P: ${putriCount})${
      checkedIds ? ` | Tercentang: ${sudahSahurCount}` : ''
    }`,
    152,
    32.5
  );

  // 4. TABEL CEKLIST SLIM & PROPORIONAL
  const studentTableHeaders = [
    ['NO', 'NAMA SANTRI', 'KELAS', 'L/P', 'STATUS PUASA', 'CEKLIST SANTAP SAHUR', 'PARAF / CATATAN']
  ];

  const studentTableBody = fastingStudents.map((s, idx) => {
    const rec = session.records[s.id];
    const gender =
      s.jenisKelamin === 'Perempuan' || s.jenisKelamin?.toLowerCase().startsWith('p')
        ? 'P'
        : 'L';
    const isChecked = checkedIds ? ((checkedIds as any).has(s.id) || (checkedIds as any).has(String(s.id))) : true;
    const checklistText = isChecked ? '[ ✓ ] Sudah Sahur' : '[    ] Belum Sahur';

    return [
      idx + 1,
      s.nama,
      s.kelas,
      gender,
      '[ ✓ ] Berpuasa',
      checklistText,
      rec?.notes || ''
    ];
  });

  if (fastingStudents.length === 0) {
    studentTableBody.push([
      {
        content: `Tidak ada data santri yang berpuasa untuk ${levelTitle} pada sesi ini.`,
        colSpan: 7,
        styles: { halign: 'center' as const, fontStyle: 'italic' as const }
      } as any
    ]);
  }

  autoTable(doc, {
    startY: 38,
    head: studentTableHeaders,
    body: studentTableBody,
    theme: 'grid',
    margin: { left: 10, right: 10, bottom: 12 },
    styles: {
      fontSize: 7.5,
      cellPadding: { top: 1.1, bottom: 1.1, left: 1.5, right: 1.5 },
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: navyDark,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
      cellPadding: { top: 1.5, bottom: 1.5, left: 1.5, right: 1.5 },
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 64, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'center', cellWidth: 10 },
      4: { halign: 'center', cellWidth: 26, textColor: [30, 27, 75], fontStyle: 'bold' },
      5: { halign: 'center', cellWidth: 34, fontStyle: 'bold', textColor: [15, 23, 42] },
      6: { cellWidth: 30, textColor: [100, 116, 139] },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [248, 250, 252];
        }
        if (data.column.index === 5) {
          const val = String(data.cell.raw || '');
          if (val.includes('[ ✓ ]')) {
            data.cell.styles.textColor = [30, 27, 75];
          }
        }
      }
    },
  });

  // 5. FOOTER HALAMAN (Tanpa Tanda Tangan Sesuai Instruksi)
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(10, 289, 200, 289);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('PUASAKU • SRT 1 KEDIRI • Laporan Ceklist Santap Sahur', 10, 293);

    doc.setTextColor(148, 163, 184);
    doc.text(
      `Hal. ${p}/${pageCount} • Dicetak: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
      200,
      293,
      { align: 'right' }
    );
  }

  // Save PDF
  const cleanTitle = session.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Ceklist_Sahur_${level}_${session.date}_${cleanTitle}.pdf`;
  doc.save(fileName);
}

