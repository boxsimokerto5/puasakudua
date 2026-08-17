import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Student } from '../types';

/**
 * Generate standard ID Card PDF sheets (A4 size, 8 cards per page - 2 columns x 4 rows)
 * Card Dimensions: ~86mm x 54mm (Standard CR-80 card ratio)
 * QR Code based on Student NIK / ID
 */
export async function exportStudentCardsToPdf(students: Student[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Card dimensions on A4: 86mm x 54mm
  const cardWidth = 86;
  const cardHeight = 54;
  const marginX = (pageWidth - cardWidth * 2) / 3; // ~12.6mm margin
  const marginY = (pageHeight - cardHeight * 4) / 5; // ~13.4mm margin

  const getStudentLevel = (kelas: string): 'SD' | 'SMP' | 'SMA' => {
    const k = kelas.toUpperCase();
    if (
      k.includes('SD') ||
      /^[1-6]\b/.test(k) ||
      k.includes('KELAS 1') ||
      k.includes('KELAS 2') ||
      k.includes('KELAS 3') ||
      k.includes('KELAS 4') ||
      k.includes('KELAS 5') ||
      k.includes('KELAS 6')
    ) {
      return 'SD';
    }
    if (
      k.includes('SMP') ||
      /^[7-9]\b/.test(k) ||
      k.includes('VII') ||
      k.includes('VIII') ||
      k.includes('IX')
    ) {
      return 'SMP';
    }
    if (
      k.includes('SMA') ||
      k.includes('SMK') ||
      k.includes('MA') ||
      /^(10|11|12)\b/.test(k) ||
      k.includes('X') ||
      k.includes('XI') ||
      k.includes('XII')
    ) {
      return 'SMA';
    }
    const match = k.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num >= 1 && num <= 6) return 'SD';
      if (num >= 7 && num <= 9) return 'SMP';
      if (num >= 10 && num <= 12) return 'SMA';
    }
    return 'SMP';
  };

  // Helper to generate QR Code Base64 Data URL
  const generateQrDataUrl = async (value: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(value, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 160,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
    } catch (e) {
      console.error('Error generating QR code in PDF:', e);
      return '';
    }
  };

  const cardsPerPage = 8;
  const totalPages = Math.ceil(students.length / cardsPerPage);

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) {
      doc.addPage();
    }

    // Light crop marks / grid guidelines
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);

    const pageStudents = students.slice(pageIdx * cardsPerPage, (pageIdx + 1) * cardsPerPage);

    for (let i = 0; i < pageStudents.length; i++) {
      const student = pageStudents[i];
      const level = getStudentLevel(student.kelas);

      const col = i % 2;
      const row = Math.floor(i / 2);

      const x = marginX + col * (cardWidth + marginX);
      const y = marginY + row * (cardHeight + marginY);

      // Draw Card Outer Border & Background
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');

      // Theme Colors based on user specification:
      // SD = Red combination
      // SMP = Blue combination
      // SMA = Slate/Grey combination
      let headerR = 30,
        headerG = 58,
        headerB = 138; // Default Blue (SMP)
      let levelLabel = 'TINGKAT SMP';

      if (level === 'SD') {
        headerR = 185;
        headerG = 28;
        headerB = 28; // Red-700
        levelLabel = 'TINGKAT SD';
      } else if (level === 'SMA') {
        headerR = 71;
        headerG = 85;
        headerB = 105; // Slate-600 (Grey)
        levelLabel = 'TINGKAT SMA';
      }

      // Draw Card Header
      doc.setFillColor(headerR, headerG, headerB);
      doc.roundedRect(x, y, cardWidth, 12, 3, 3, 'F');
      // Fix bottom rounded corners of header
      doc.rect(x, y + 8, cardWidth, 4, 'F');

      // Header Text
      doc.setTextColor(255, 215, 0); // Gold
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('KARTU SANTRI ASRAMA', x + 4, y + 5);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'normal');
      doc.text('SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI', x + 4, y + 9);

      // Level Pill on Header Right
      doc.setFillColor(251, 191, 36); // Amber
      doc.roundedRect(x + cardWidth - 25, y + 3, 21, 5, 1, 1, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'bold');
      doc.text(levelLabel, x + cardWidth - 23, y + 6.5);

      // Photo Box (Draw image if student has photo, otherwise render elegant fallback avatar)
      const photoX = x + 4;
      const photoY = y + 14;
      const photoW = 15;
      const photoH = 18;

      doc.setFillColor(243, 244, 246);
      doc.setDrawColor(209, 213, 219);
      doc.rect(photoX, photoY, photoW, photoH, 'FD');

      let hasRenderedPhoto = false;
      if (student.foto) {
        try {
          doc.addImage(student.foto, 'JPEG', photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1);
          hasRenderedPhoto = true;
        } catch (e) {
          // If image format fails, fallback gracefully
          hasRenderedPhoto = false;
        }
      }

      if (!hasRenderedPhoto) {
        doc.setTextColor(156, 163, 175);
        doc.setFontSize(5);
        doc.text('FOTO', photoX + 3.5, photoY + 9);
      }

      const isPutri = student.jenisKelamin === 'Perempuan';
      doc.setFillColor(isPutri ? 219 : 37, isPutri ? 39 : 99, isPutri ? 119 : 235);
      doc.rect(photoX, photoY + 15, photoW, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(4);
      doc.setFont('helvetica', 'bold');
      doc.text(isPutri ? 'PUTRI' : 'PUTRA', photoX + 3, photoY + 17.2);

      // Student Details
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(5);
      doc.setFont('helvetica', 'normal');
      doc.text('NAMA LENGKAP:', x + 22, y + 16);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      const studentName =
        student.nama.length > 24 ? student.nama.substring(0, 22) + '...' : student.nama;
      doc.text(studentName, x + 22, y + 20);

      // Class & Number Info
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(5);
      doc.setFont('helvetica', 'normal');
      doc.text('KELAS:', x + 22, y + 25);
      doc.text('NO. URUT:', x + 50, y + 25);

      doc.setTextColor(6, 78, 59); // Emerald
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text(student.kelas, x + 22, y + 29);

      doc.setTextColor(15, 23, 42);
      doc.text(`#${student.no}`, x + 50, y + 29);

      // NIK Label
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(4.5);
      doc.setFont('helvetica', 'normal');
      doc.text('NIK / ID SISWA:', x + 22, y + 33);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text(student.nik || '-', x + 40, y + 33);

      // Footer divider
      doc.setDrawColor(229, 231, 235);
      doc.line(x + 2, y + 36, x + cardWidth - 2, y + 36);

      // Render QR Code (Crisp and easy to scan from camera/scanner)
      const qrValue =
        student.nik && student.nik.trim()
          ? student.nik.trim()
          : `SRT-${student.no.toString().padStart(4, '0')}`;
      const qrDataUrl = await generateQrDataUrl(qrValue);

      if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', x + 4, y + 37.5, 14, 14);
      }

      // QR Text Label & Details Beside QR
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(4.5);
      doc.setFont('helvetica', 'bold');
      doc.text('QR CODE NIK:', x + 20, y + 42);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(6);
      doc.setFont('courier', 'bold');
      doc.text(qrValue, x + 20, y + 46);

      // Logo and puasaku.app Branding Badge
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(x + cardWidth - 28, y + 39, 24, 11, 1.5, 1.5, 'FD');

      // Mini green logo box
      doc.setFillColor(5, 150, 105); // Emerald-600
      doc.roundedRect(x + cardWidth - 26.5, y + 41, 4.5, 4.5, 0.8, 0.8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(4);
      doc.text('P', x + cardWidth - 25.2, y + 44.2);

      // puasaku.app text
      doc.setTextColor(6, 95, 70); // Emerald-800
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.text('puasaku.app', x + cardWidth - 21, y + 44);

      doc.setTextColor(148, 163, 184); // Slate-400
      doc.setFontSize(3.5);
      doc.setFont('helvetica', 'bold');
      doc.text('SRT 1 KEDIRI', x + cardWidth - 21, y + 48);
    }

    // Add footer page indicator
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Halaman ${pageIdx + 1} dari ${totalPages} - Kartu Asrama Puasaku SRT 1 Kediri`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Save/Download PDF
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`Kartu_Asrama_Santri_QR_SRT1_Kediri_${timestamp}.pdf`);
}
