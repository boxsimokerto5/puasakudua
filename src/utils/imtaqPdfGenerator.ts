import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, FastingSession, FastingStatus } from '../types';
import { formatDateIndoLong, getStudentLevel } from './pdfGenerator';

export interface StudentImtaqStats {
  student: Student;
  totalSessions: number;
  berpuasaCount: number;
  tidakPuasaCount: number;
  halanganCount: number;
  belumDiisiCount: number;
  percentage: number;
  predicate: 'Mumtaz (A)' | 'Jayyid Jiddan (B+)' | 'Jayyid (B)' | 'Maqbul (C)';
  predicateColor: string;
  predicateDescription: string;
  isEligibleForCertificate: boolean;
  streak: number;
  history: {
    sessionId: string;
    sessionTitle: string;
    date: string;
    status: FastingStatus;
    notes?: string;
  }[];
}

/**
 * Calculates comprehensive Imtaq statistics for all students across given sessions
 */
export function calculateAllStudentsImtaqStats(
  students: Student[],
  sessions: Record<string, FastingSession>
): StudentImtaqStats[] {
  const sessionList = Object.values(sessions).sort((a, b) => a.date.localeCompare(b.date));
  const totalSessionsCount = sessionList.length;

  return students.map((student) => {
    let berpuasaCount = 0;
    let tidakPuasaCount = 0;
    let halanganCount = 0;
    let belumDiisiCount = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    const history = sessionList.map((session) => {
      const rec = session.records[student.id];
      const status: FastingStatus = rec ? rec.status : 'belum_diisi';

      if (status === 'berpuasa') {
        berpuasaCount++;
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
        if (status === 'tidak_puasa') tidakPuasaCount++;
        else if (status === 'halangan') halanganCount++;
        else belumDiisiCount++;
      }

      return {
        sessionId: session.id,
        sessionTitle: session.title,
        date: session.date,
        status,
        notes: rec?.notes,
      };
    });

    const percentage =
      totalSessionsCount > 0
        ? Math.round((berpuasaCount / totalSessionsCount) * 100 * 10) / 10
        : 0;

    let predicate: 'Mumtaz (A)' | 'Jayyid Jiddan (B+)' | 'Jayyid (B)' | 'Maqbul (C)' = 'Maqbul (C)';
    let predicateColor = '#ef4444';
    let predicateDescription =
      'Perlu bimbingan dan motivasi berkelanjutan untuk membiasakan amalan puasa sunnah.';

    if (percentage >= 85) {
      predicate = 'Mumtaz (A)';
      predicateColor = '#059669';
      predicateDescription =
        'Sangat Istiqomah! Menunjukkan kesungguhan dan keteladanan yang luar biasa dalam menjalankan amalan puasa.';
    } else if (percentage >= 70) {
      predicate = 'Jayyid Jiddan (B+)';
      predicateColor = '#0284c7';
      predicateDescription =
        'Istiqomah dan disiplin menjalankan amalan puasa sunnah secara konsisten.';
    } else if (percentage >= 50) {
      predicate = 'Jayyid (B)';
      predicateColor = '#d97706';
      predicateDescription =
        'Cukup baik dalam berpuasa, terus tingkatkan motivasi dan kekompakan bersama santri lainnya.';
    }

    const isEligibleForCertificate = percentage >= 70 && berpuasaCount >= 1;

    return {
      student,
      totalSessions: totalSessionsCount,
      berpuasaCount,
      tidakPuasaCount,
      halanganCount,
      belumDiisiCount,
      percentage,
      predicate,
      predicateColor,
      predicateDescription,
      isEligibleForCertificate,
      streak: maxStreak,
      history,
    };
  });
}

/**
 * Generates an official, single-page Raport Keimanan dan Ketaqwaan PDF for an individual student
 */
export function generateStudentImtaqReportPdf(
  stats: StudentImtaqStats,
  pembinaName: string = 'Wali Asuh / Pembina Asrama',
  kepalaName: string = 'Kepala Asrama SRT 1 Kediri'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const s = stats.student;

  // Header Frame Box
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(14, 12, 182, 24, 'F');

  // Decorative Golden Border inside Header
  doc.setDrawColor(251, 191, 36); // Amber 400
  doc.setLineWidth(0.8);
  doc.rect(16, 14, 178, 20, 'D');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI', 105, 21, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(253, 230, 138); // Amber 200
  doc.text('RAPORT PENILAIAN KEIMANAN DAN KETAQWAAN (IMTAQ)', 105, 27, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(209, 250, 229);
  doc.text('Portofolio & Rekapitulasi Riwayat Pembiasaan Amalan Ibadah Puasa Santri Asrama', 105, 31.5, { align: 'center' });

  // Student Profile Info Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 40, 182, 28, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Left Column
  doc.setFont('helvetica', 'bold');
  doc.text('Nama Santri', 18, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(`:  ${s.nama.toUpperCase()}`, 45, 47);

  doc.setFont('helvetica', 'bold');
  doc.text('NIK / NISN', 18, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(`:  ${s.nik || '-'}`, 45, 54);

  doc.setFont('helvetica', 'bold');
  doc.text('Kelas / Jenjang', 18, 61);
  doc.setFont('helvetica', 'normal');
  doc.text(`:  ${s.kelas} (${getStudentLevel(s.kelas)})`, 45, 61);

  // Right Column
  doc.setFont('helvetica', 'bold');
  doc.text('Jenis Kelamin', 115, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(`:  ${s.jenisKelamin}`, 145, 47);

  doc.setFont('helvetica', 'bold');
  doc.text('Total Sesi Puasa', 115, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(`:  ${stats.totalSessions} Kegiatan Terjadwal`, 145, 54);

  doc.setFont('helvetica', 'bold');
  doc.text('Tahun Ajaran', 115, 61);
  doc.setFont('helvetica', 'normal');
  doc.text(`:  2026 / 2027`, 145, 61);

  // Imtaq Metric Summary Cards (4 Cards)
  const cardY = 72;
  const cardW = 42;
  const cardH = 22;

  // Card 1: Hari Puasa
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(14, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setTextColor(6, 95, 70);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('HARI BERPUASA', 14 + cardW / 2, cardY + 6, { align: 'center' });
  doc.setFontSize(14);
  doc.text(`${stats.berpuasaCount} Hari`, 14 + cardW / 2, cardY + 14, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`dari ${stats.totalSessions} sesi terlaksana`, 14 + cardW / 2, cardY + 19, { align: 'center' });

  // Card 2: Tingkat Istiqomah (%)
  doc.setFillColor(239, 246, 255); // Blue 50
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(60, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TINGKAT ISTIQOMAH', 60 + cardW / 2, cardY + 6, { align: 'center' });
  doc.setFontSize(14);
  doc.text(`${stats.percentage}%`, 60 + cardW / 2, cardY + 14, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Persentase Kehadiran', 60 + cardW / 2, cardY + 19, { align: 'center' });

  // Card 3: Predikat Imtaq
  doc.setFillColor(254, 243, 199); // Amber 50
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(106, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PREDIKAT CAPAIAN', 106 + cardW / 2, cardY + 6, { align: 'center' });
  doc.setFontSize(10.5);
  doc.text(stats.predicate, 106 + cardW / 2, cardY + 14, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(stats.isEligibleForCertificate ? '★ Berhak Piagam' : 'Dalam Bimbingan', 106 + cardW / 2, cardY + 19, { align: 'center' });

  // Card 4: Udzur / Halangan
  doc.setFillColor(254, 242, 242); // Rose 50
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(152, cardY, 44, cardH, 2, 2, 'FD');
  doc.setTextColor(159, 18, 57);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('UDZUR / HALANGAN', 152 + 22, cardY + 6, { align: 'center' });
  doc.setFontSize(14);
  doc.text(`${stats.halanganCount + stats.tidakPuasaCount} Hari`, 152 + 22, cardY + 14, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${stats.halanganCount} Halangan, ${stats.tidakPuasaCount} Sakit/Izin`, 152 + 22, cardY + 19, { align: 'center' });

  // Narrative Assessment Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 98, 182, 16, 1.5, 1.5, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Catatan & Evaluasi Pembiasaan Adab / Karakter Santri:', 18, 103);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`"${stats.predicateDescription}"`, 18, 109);

  // Table of Session History
  const tableHeaders = [
    ['NO', 'TANGGAL & NAMA SESI PUASA', 'STATUS AMALAN', 'KETERANGAN / CATATAN WALI ASUH']
  ];

  const tableBody = stats.history.map((h, idx) => {
    let statusText = 'Belum Diisi';
    if (h.status === 'berpuasa') statusText = 'BERPUASA (Alhamdulillah)';
    else if (h.status === 'tidak_puasa') statusText = 'TIDAK PUASA';
    else if (h.status === 'halangan') statusText = 'UDZUR / HALANGAN';

    return [
      idx + 1,
      `${h.sessionTitle} (${formatDateIndoLong(h.date)})`,
      statusText,
      h.notes || '-'
    ];
  });

  if (tableBody.length === 0) {
    tableBody.push([1, 'Belum ada data sesi kegiatan puasa yang tercatat.', '-', '-']);
  }

  autoTable(doc, {
    startY: 118,
    head: tableHeaders,
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 78, 59], // Emerald 900
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
      1: { cellWidth: 80, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 42 },
      3: { cellWidth: 50 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        const text = String(data.cell.raw);
        if (text.includes('BERPUASA')) {
          data.cell.styles.textColor = [5, 150, 105];
          data.cell.styles.fontStyle = 'bold';
        } else if (text.includes('TIDAK PUASA')) {
          data.cell.styles.textColor = [225, 29, 72];
        } else if (text.includes('UDZUR')) {
          data.cell.styles.textColor = [217, 119, 6];
        }
      }
    },
  });

  // Signature Block
  const finalY = (doc as any).lastAutoTable?.finalY || 220;
  const sigY = Math.min(finalY + 12, 245);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  // Left Signature: Pembina Asrama
  doc.text('Mengetahui,', 20, sigY);
  doc.setFont('helvetica', 'bold');
  doc.text('Wali Asuh / Pembina Ibadah,', 20, sigY + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(`( ${pembinaName} )`, 20, sigY + 22);

  // Right Signature: Kepala Asrama
  doc.text('Kediri, ' + formatDateIndoLong(new Date().toISOString().split('T')[0]), 130, sigY);
  doc.setFont('helvetica', 'bold');
  doc.text('Kepala Asrama / Sekolah,', 130, sigY + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(`( ${kepalaName} )`, 130, sigY + 22);

  // Bottom Footer Note
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Dokumen resmi Raport Keimanan & Ketaqwaan diterbitkan oleh Aplikasi Puasaku - Sekolah Rakyat Terintegrasi 1 Kediri`,
    105,
    288,
    { align: 'center' }
  );

  const cleanName = s.nama.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Raport_Imtaq_${cleanName}_SRT1_Kediri.pdf`);
}

/**
 * Draws a single landscape Certificate of Fasting Excellence page on a jsPDF document
 */
function drawCertificatePage(
  doc: jsPDF,
  stats: StudentImtaqStats,
  pembinaName: string = 'Wali Asuh / Pembina Ibadah',
  kepalaName: string = 'Kepala Asrama SRT 1 Kediri'
) {
  const s = stats.student;

  // Background subtle tint
  doc.setFillColor(254, 252, 247); // Warm parchment off-white
  doc.rect(0, 0, 297, 210, 'F');

  // Outer Thick Emerald Border
  doc.setDrawColor(6, 78, 59); // Emerald 900
  doc.setLineWidth(4);
  doc.rect(10, 10, 277, 190, 'D');

  // Inner Elegant Gold Double Border
  doc.setDrawColor(217, 119, 6); // Amber 600
  doc.setLineWidth(1.2);
  doc.rect(14, 14, 269, 182, 'D');

  doc.setDrawColor(251, 191, 36); // Amber 400
  doc.setLineWidth(0.5);
  doc.rect(16, 16, 265, 178, 'D');

  // Corner Ornaments (Gold Triangles)
  const drawCorner = (x: number, y: number, size: number) => {
    doc.setFillColor(217, 119, 6);
    doc.triangle(x, y, x + size, y, x, y + size, 'F');
  };
  drawCorner(17, 17, 12);
  drawCorner(280, 17, -12);
  drawCorner(17, 193, 12);
  drawCorner(280, 193, -12);

  // Institution Title Header
  doc.setTextColor(6, 78, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI', 148.5, 30, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('LEMBAGA PENDIDIKAN & PEMBINAAN KARAKTER SANTRI BERBASIS KETAQWAAN', 148.5, 36, { align: 'center' });

  // Decorative Ribbon Line
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.line(60, 40, 237, 40);

  // Main Certificate Title
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('PIAGAM PENGHARGAAN', 148.5, 52, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(6, 78, 59);
  doc.text('SANTRI ISTIQOMAH AMALAN PUASA SUNNAH', 148.5, 60, { align: 'center' });

  // Description intro
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('Dengan rasa syukur dan bangga, Piagam Penghargaan ini dianugerahkan kepada:', 148.5, 72, { align: 'center' });

  // Student Full Name in Large High-Contrast Display
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text(s.nama.toUpperCase(), 148.5, 86, { align: 'center' });

  // Gold underline under student name
  const nameWidth = doc.getTextWidth(s.nama.toUpperCase());
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.8);
  doc.line(148.5 - nameWidth / 2 - 5, 89, 148.5 + nameWidth / 2 + 5, 89);

  // Student Identity Subtext
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Kelas: ${s.kelas}   |   NIK/NISN: ${s.nik || '-'}   |   Jenjang: ${getStudentLevel(s.kelas)}`,
    148.5,
    97,
    { align: 'center' }
  );

  // Award Reason & Metrics
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const awardText1 = `Telah menunjukkan kedisiplinan, keteladanan akhlak, dan keistiqomahan luar biasa dalam`;
  const awardText2 = `menjalankan ibadah puasa sunnah terjadwal dengan capaian kehadiran ${stats.percentage}% (${stats.berpuasaCount} Hari Puasa) serta meraih predikat:`;
  doc.text(awardText1, 148.5, 108, { align: 'center' });
  doc.text(awardText2, 148.5, 114, { align: 'center' });

  // Predicate Ribbon Badge
  doc.setFillColor(6, 78, 59);
  doc.roundedRect(100, 121, 97, 12, 3, 3, 'F');
  doc.setDrawColor(251, 191, 36);
  doc.setLineWidth(0.7);
  doc.roundedRect(101, 122, 95, 10, 2, 2, 'D');

  doc.setTextColor(253, 230, 138); // Gold text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`★  ${stats.predicate.toUpperCase()}  ★`, 148.5, 129, { align: 'center' });

  // Motto / Hadith / Motivational Quote
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(
    '“Sesungguhnya amalan yang paling dicintai oleh Allah adalah amalan yang kontinu (istiqomah) walaupun sedikit.” (HR. Muslim)',
    148.5,
    142,
    { align: 'center' }
  );

  // Signatures Section
  const sigY = 154;

  // Left: Pembina Ibadah / Wali Asuh
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('Mengetahui,', 48, sigY, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Wali Asuh / Pembina Ibadah,', 48, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`( ${pembinaName} )`, 48, sigY + 28, { align: 'center' });

  // Center: Official Gold Seal / Stamp Circle
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1);
  doc.circle(148.5, sigY + 12, 13, 'FD');
  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('SRT 1 KEDIRI', 148.5, sigY + 9, { align: 'center' });
  doc.setFontSize(5.5);
  doc.text('★ IMTAQ ★', 148.5, sigY + 13, { align: 'center' });
  doc.text('TERVERIFIKASI', 148.5, sigY + 17, { align: 'center' });

  // Right: Kepala Asrama
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('Kediri, ' + formatDateIndoLong(new Date().toISOString().split('T')[0]), 249, sigY, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Kepala Asrama SRT 1 Kediri,', 249, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`( ${kepalaName} )`, 249, sigY + 28, { align: 'center' });
}

/**
 * Generates an Individual Certificate PDF (Landscape A4)
 */
export function generateImtaqCertificatePdf(
  stats: StudentImtaqStats,
  pembinaName: string = 'Wali Asuh / Pembina Ibadah',
  kepalaName: string = 'Kepala Asrama SRT 1 Kediri'
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  drawCertificatePage(doc, stats, pembinaName, kepalaName);

  const cleanName = stats.student.nama.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Sertifikat_Istiqomah_${cleanName}_SRT1_Kediri.pdf`);
}

/**
 * Generates Batch Certificates PDF for multiple eligible students in one single document
 */
export function generateBatchImtaqCertificatesPdf(
  statsList: StudentImtaqStats[],
  pembinaName: string = 'Wali Asuh / Pembina Ibadah',
  kepalaName: string = 'Kepala Asrama SRT 1 Kediri'
) {
  if (statsList.length === 0) return;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  statsList.forEach((stats, idx) => {
    if (idx > 0) doc.addPage();
    drawCertificatePage(doc, stats, pembinaName, kepalaName);
  });

  doc.save(`Kumpulan_Sertifikat_Santri_Istiqomah_SRT1_Kediri_${statsList.length}_Siswa.pdf`);
}

/**
 * Generates a Collective Imtaq Summary Sheet PDF (Rekapitulasi Raport Keimanan Seluruh Siswa)
 */
export function generateCollectiveImtaqReportPdf(
  statsList: StudentImtaqStats[],
  selectedLevel: string = 'SEMUA',
  pembinaName: string = 'Wali Asuh / Pembina Asrama'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Box
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(14, 12, 182, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI', 105, 21, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(253, 230, 138); // Amber 200
  const levelTitle = selectedLevel === 'SEMUA' ? 'SEMUA JENJANG' : `JENJANG ${selectedLevel}`;
  doc.text(`REKAPITULASI RAPORT KEIMANAN & KETAQWAAN - ${levelTitle}`, 105, 27, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Total Santri: ${statsList.length} Siswa  |  Tanggal Cetak: ${formatDateIndoLong(new Date().toISOString().split('T')[0])}`,
    14,
    37
  );

  const tableHeaders = [
    ['NO', 'NAMA SANTRI', 'KELAS', 'L/P', 'PUASA', 'UDZUR', 'KONSISTENSI', 'PREDIKAT IMTAQ']
  ];

  const tableBody = statsList.map((st, idx) => {
    const gender =
      st.student.jenisKelamin === 'Perempuan' || st.student.jenisKelamin?.toLowerCase().startsWith('p')
        ? 'P'
        : 'L';
    return [
      idx + 1,
      st.student.nama,
      st.student.kelas,
      gender,
      `${st.berpuasaCount} / ${st.totalSessions}`,
      `${st.halanganCount + st.tidakPuasaCount}`,
      `${st.percentage}%`,
      st.predicate
    ];
  });

  autoTable(doc, {
    startY: 41,
    head: tableHeaders,
    body: tableBody,
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
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'center', cellWidth: 12 },
      4: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
      5: { halign: 'center', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
      7: { halign: 'center', cellWidth: 25, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 7) {
        const text = String(data.cell.raw);
        if (text.includes('Mumtaz')) {
          data.cell.styles.textColor = [5, 150, 105];
        } else if (text.includes('Jayyid Jiddan')) {
          data.cell.styles.textColor = [2, 132, 199];
        } else if (text.includes('Jayyid')) {
          data.cell.styles.textColor = [217, 119, 6];
        } else {
          data.cell.styles.textColor = [225, 29, 72];
        }
      }
    },
  });

  // Signatures
  const finalY = (doc as any).lastAutoTable?.finalY || 200;
  const sigY = Math.min(finalY + 12, 250);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text('Kediri, ' + formatDateIndoLong(new Date().toISOString().split('T')[0]), 135, sigY);
  doc.setFont('helvetica', 'bold');
  doc.text('Wali Asuh / Pembina Asrama,', 135, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(`( ${pembinaName} )`, 135, sigY + 22);

  doc.save(`Rekap_Raport_Imtaq_SRT1_Kediri_${selectedLevel}.pdf`);
}
