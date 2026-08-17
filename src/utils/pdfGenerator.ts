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

  const greenDark = '#064e3b'; // emerald-900
  const gold = '#d97706'; // amber-600

  // Header Title & Logo Box
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(14, 12, 182, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SEKOLAH RAKYAT KABUPATEN KEDIRI', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('LAPORAN REKAPITULASI AMALAN PUASA SISWA', 105, 26, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Jl. Raya Kediri - Nganjuk, Kediri, Jawa Timur | Sistem Informasi Kedisiplinan & Amalan', 105, 31, { align: 'center' });

  // Session Metadata Box
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(14, 40, 182, 22, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Judul Kegiatan : ${session.title}`, 18, 47);
  doc.text(`Tanggal : ${formatDateIndoLong(session.date)} (${session.date})`, 18, 53);

  const statusText = session.isVerified
    ? `TERVERIFIKASI SAH (Oleh: ${session.verifiedBy || verifierName || 'Petugas Pengecek'})`
    : 'DRAF BELUM DIVERIFIKASI';
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(session.isVerified ? 6 : 180, session.isVerified ? 78 : 83, session.isVerified ? 59 : 9);
  doc.text(`Status Laporan : ${statusText}`, 18, 59);

  // Table Title
  doc.setTextColor(6, 78, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('REKAPITULASI JUMLAH SISWA BERPUASA BERDASARKAN JENJANG & GENDER', 14, 69);

  // Table Data - Simplified to focus on fasting count
  const tableHeaders = [
    [
      'NO',
      'REKAP JENJANG & GENDER',
      'TOTAL SISWA',
      'JUMLAH BERPUASA',
      '% BERPUASA',
    ],
  ];

  const tableBody = breakdown.allRows.map((row, idx) => {
    return [
      idx + 1,
      row.label,
      row.totalStudents,
      row.berpuasa,
      `${row.percentage}%`,
    ];
  });

  autoTable(doc, {
    startY: 72,
    head: tableHeaders,
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 78, 59], // Emerald 900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 70, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 32 },
      3: { halign: 'center', cellWidth: 38, fontStyle: 'bold' },
      4: { halign: 'center', cellWidth: 30, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      // Highlight subtotals and grand total
      const rowIdx = data.row.index;
      const rowObj = breakdown.allRows[rowIdx];
      if (rowObj) {
        if (rowObj.isGrandTotal) {
          data.cell.styles.fillColor = [6, 78, 59];
          data.cell.styles.textColor = [255, 251, 235]; // amber light
          data.cell.styles.fontStyle = 'bold';
        } else if (rowObj.isSubtotal) {
          data.cell.styles.fillColor = [209, 250, 229]; // emerald-100
          data.cell.styles.textColor = [6, 78, 59];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Summary Insights Box
  const finalY = (doc as any).lastAutoTable?.finalY || 160;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, finalY + 6, 182, 22, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CATATAN KHUSUS & CATATAN VERIFIKASI:', 18, finalY + 12);
  doc.setFont('helvetica', 'normal');

  const vNotes = session.verifierNotes
    ? session.verifierNotes
    : 'Data rekapitulasi amalan puasa siswa telah dihitung secara otomatis berdasarkan sistem presensi Sekolah Rakyat Kabupaten Kediri.';
  
  const splitNotes = doc.splitTextToSize(vNotes, 174);
  doc.text(splitNotes, 18, finalY + 17);

  // Signatures Section - Single Signature for Wali Asuh
  const sigY = finalY + 35;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  // Wali Asuh Signature Box
  doc.text('Kediri, ' + formatDateIndoLong(new Date().toISOString().split('T')[0]), 135, sigY);
  doc.setFont('helvetica', 'bold');
  doc.text('Wali Asuh,', 135, sigY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text('(________________________)', 135, sigY + 28);

  // Footer text Page 1
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Halaman 1 | Dicetak otomatis via Sistem Informasi Sekolah Rakyat Kediri pada ${new Date().toLocaleString('id-ID')}`,
    105,
    285,
    { align: 'center' }
  );

  // ==========================================
  // PAGE 2: LAMPIRAN DAFTAR NAMA-NAMA SISWA BERPUASA
  // ==========================================
  doc.addPage();

  // Lampiran Header Banner
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(14, 12, 182, 16, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('LAMPIRAN: DAFTAR NAMA SISWA YANG BERPUASA', 105, 22, { align: 'center' });

  // Sorted list of ONLY fasting students
  const fastingStudents = students
    .filter((s) => session.records[s.id]?.status === 'berpuasa')
    .sort((a, b) => {
      if (a.kelas !== b.kelas) return a.kelas.localeCompare(b.kelas);
      return a.nama.localeCompare(b.nama);
    });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Kegiatan: ${session.title}  |  Tanggal: ${formatDateIndoLong(session.date)}  |  Jumlah Berpuasa: ${fastingStudents.length} Siswa`,
    14,
    34
  );

  const studentTableHeaders = [
    ['NO', 'NAMA SISWA', 'KELAS', 'L/P', 'NIK / NO', 'STATUS AMALAN', 'CATATAN']
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
      'Berpuasa (✓)',
      rec?.notes || '-'
    ];
  });

  if (fastingStudents.length === 0) {
    studentTableBody.push([1, 'Tidak ada siswa yang berpuasa pada sesi ini', '-', '-', '-', '-', '-']);
  }

  autoTable(doc, {
    startY: 38,
    head: studentTableHeaders,
    body: studentTableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 78, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 48, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'center', cellWidth: 12 },
      4: { halign: 'center', cellWidth: 26 },
      5: { halign: 'center', cellWidth: 28, fontStyle: 'bold' },
      6: { cellWidth: 40 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        data.cell.styles.textColor = [6, 120, 80];
      }
    },
  });

  // Footer text Page 2
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Halaman 2 (Lampiran) | Dicetak via Sistem Informasi Sekolah Rakyat Kediri`,
    105,
    285,
    { align: 'center' }
  );

  // Save the PDF file
  const fileName = `Rekap_Puasa_SR_Kediri_${session.date}_${session.title.replace(/\s+/g, '_')}.pdf`;
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

