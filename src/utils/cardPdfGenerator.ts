import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Student } from '../types';
import { loadSafeImageElement } from './imageUtils';

/**
 * Helper to determine student educational level from class string
 */
export const getStudentLevel = (kelas: string): 'SD' | 'SMP' | 'SMA' => {
  const k = (kelas || '').toUpperCase();
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

/**
 * Helper to draw rounded rectangle in Canvas 2D
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Module-level cached logo element
 */
let cachedLogoImg: HTMLImageElement | null = null;
let logoLoadAttempted = false;

async function getCachedLogo(): Promise<HTMLImageElement | null> {
  if (cachedLogoImg) return cachedLogoImg;
  if (logoLoadAttempted) return null;
  logoLoadAttempted = true;
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = '/assets/logo.svg';
    });
    cachedLogoImg = img;
    return img;
  } catch {
    return null;
  }
}

/**
 * Generate ultra crisp, fast-rendered Canvas image of the student card
 * Dimensions: 860 x 540 (Optimized 10x ratio for 86mm x 54mm ID Card at ~254 DPI)
 */
export async function renderCardToCanvas(
  student: Student,
  sharedLogo?: HTMLImageElement | null
): Promise<string> {
  const level = getStudentLevel(student.kelas);
  const qrValue =
    student.nik && student.nik.trim()
      ? student.nik.trim()
      : `SRT-${student.no.toString().padStart(4, '0')}`;

  const W = 860;
  const H = 540;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Cannot get canvas context');

  // Background white card
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  drawRoundedRect(ctx, 3, 3, W - 6, H - 6, 36);
  ctx.clip();

  // 1. TOP HEADER GRADIENT
  const headerHeight = 112;
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  if (level === 'SD') {
    grad.addColorStop(0, '#b91c1c');
    grad.addColorStop(0.5, '#be123c');
    grad.addColorStop(1, '#991b1b');
  } else if (level === 'SMA') {
    grad.addColorStop(0, '#334155');
    grad.addColorStop(0.5, '#374151');
    grad.addColorStop(1, '#1e293b');
  } else {
    // SMP
    grad.addColorStop(0, '#1d4ed8');
    grad.addColorStop(0.5, '#0284c7');
    grad.addColorStop(1, '#1e40af');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, headerHeight);

  // Decorative pattern in header
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let px = 8; px < W; px += 20) {
    for (let py = 8; py < headerHeight; py += 20) {
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Header Logo Box
  const logoBoxX = 26;
  const logoBoxY = 16;
  const logoBoxSize = 80;
  drawRoundedRect(ctx, logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, 18);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.stroke();

  const logoImg = sharedLogo || cachedLogoImg;
  if (logoImg) {
    ctx.drawImage(logoImg, logoBoxX + 8, logoBoxY + 8, logoBoxSize - 16, logoBoxSize - 16);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('P', logoBoxX + 26, logoBoxY + 52);
  }

  // Header Titles
  ctx.fillStyle = '#fde047';
  ctx.font = '900 26px system-ui, -apple-system, sans-serif';
  ctx.fillText('KARTU PUASA WALI ASUH', logoBoxX + logoBoxSize + 20, 50);

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 18px system-ui, -apple-system, sans-serif';
  ctx.fillText('SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI', logoBoxX + logoBoxSize + 20, 80);

  // Header Level Pill (Top Right)
  const pillW = 160;
  const pillH = 36;
  const pillX = W - pillW - 26;
  const pillY = 20;
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 10);
  ctx.fillStyle = '#fbbf24';
  ctx.fill();

  const levelLabel = level === 'SD' ? 'TINGKAT SD' : level === 'SMA' ? 'TINGKAT SMA' : 'TINGKAT SMP';
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 17px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(levelLabel, pillX + pillW / 2, pillY + 25);
  ctx.textAlign = 'left';

  // No Urut under Pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 17px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`No. #${student.no}`, W - 28, 86);
  ctx.textAlign = 'left';

  // 2. MAIN BODY
  const isPutri = student.jenisKelamin === 'Perempuan' || student.jenisKelamin?.toLowerCase().startsWith('p');

  // --- LEFT COLUMN: Student Photo & Puasaku Badge ---
  const photoX = 26;
  const photoY = 124;
  const photoW = 148;
  const photoH = 192;

  // Photo Container
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 20);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  // Draw Photo or Fallback
  let hasPhoto = false;
  if (student.foto) {
    try {
      const studentImg = await loadSafeImageElement(student.foto, 1800);
      ctx.save();
      drawRoundedRect(ctx, photoX, photoY, photoW, photoH - 34, 18);
      ctx.clip();
      ctx.drawImage(studentImg, photoX, photoY, photoW, photoH - 34);
      ctx.restore();
      hasPhoto = true;
    } catch {
      hasPhoto = false;
    }
  }

  if (!hasPhoto) {
    ctx.font = '44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isPutri ? '🧕' : '👳', photoX + photoW / 2, photoY + 76);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText('FOTO SANTRI', photoX + photoW / 2, photoY + 112);
    ctx.textAlign = 'left';
  }

  // Photo Gender Ribbon (PUTRI / PUTRA)
  const ribbonH = 34;
  const ribbonY = photoY + photoH - ribbonH;
  ctx.save();
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 20);
  ctx.clip();
  ctx.fillStyle = isPutri ? '#db2777' : '#2563eb';
  ctx.fillRect(photoX, ribbonY, photoW, ribbonH);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 17px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isPutri ? 'PUTRI' : 'PUTRA', photoX + photoW / 2, ribbonY + 24);
  ctx.textAlign = 'left';
  ctx.restore();

  // Left Bottom: Puasaku Logo Badge
  const pBadgeX = 26;
  const pBadgeY = 328;
  const pBadgeW = 148;
  const pBadgeH = 126;
  drawRoundedRect(ctx, pBadgeX, pBadgeY, pBadgeW, pBadgeH, 16);
  ctx.fillStyle = '#f0fdf4';
  ctx.fill();
  ctx.strokeStyle = '#bbf7d0';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Mini Green Logo Box
  const miniLogoSize = 42;
  const miniLogoX = pBadgeX + (pBadgeW - miniLogoSize) / 2;
  const miniLogoY = pBadgeY + 14;
  drawRoundedRect(ctx, miniLogoX, miniLogoY, miniLogoSize, miniLogoSize, 12);
  ctx.fillStyle = '#059669';
  ctx.fill();

  if (logoImg) {
    ctx.drawImage(logoImg, miniLogoX + 6, miniLogoY + 6, miniLogoSize - 12, miniLogoSize - 12);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('P', miniLogoX + 15, miniLogoY + 30);
  }

  ctx.fillStyle = '#065f46';
  ctx.font = '900 18px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('puasaku.app', pBadgeX + pBadgeW / 2, pBadgeY + 84);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('SRT 1 KEDIRI', pBadgeX + pBadgeW / 2, pBadgeY + 106);
  ctx.textAlign = 'left';

  // --- CENTER COLUMN: Student Bio Information ---
  const bioX = 194;
  let bioY = 138;

  // Nama Lengkap
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 14px system-ui, -apple-system, sans-serif';
  ctx.fillText('NAMA LENGKAP SANTRI', bioX, bioY);

  bioY += 28;
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 24px system-ui, -apple-system, sans-serif';
  const displayName =
    student.nama.length > 24 ? student.nama.substring(0, 22) + '...' : student.nama;
  ctx.fillText(displayName, bioX, bioY);

  // Kelas & No. Urut (2 columns)
  bioY += 36;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 14px system-ui, -apple-system, sans-serif';
  ctx.fillText('KELAS', bioX, bioY);
  ctx.fillText('NO. URUT', bioX + 220, bioY);

  bioY += 26;
  ctx.fillStyle = '#065f46';
  ctx.font = '900 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(student.kelas, bioX, bioY);

  ctx.fillStyle = '#1e293b';
  ctx.font = '900 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(`#${student.no}`, bioX + 220, bioY);

  // NIK / ID Siswa
  bioY += 34;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 14px system-ui, -apple-system, sans-serif';
  ctx.fillText('NIK / ID SISWA', bioX, bioY);

  bioY += 25;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(student.nik || '-', bioX, bioY);

  // Official Card note box (Center bottom)
  const noteBoxY = 328;
  const noteBoxW = 360;
  const noteBoxH = 126;
  drawRoundedRect(ctx, bioX, noteBoxY, noteBoxW, noteBoxH, 16);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#047857';
  ctx.font = '900 14px system-ui, -apple-system, sans-serif';
  ctx.fillText('✓ KARTU PUASA WALI ASUH RESMI', bioX + 16, noteBoxY + 32);

  ctx.fillStyle = '#475569';
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('Scan QR Code di samping untuk verifikasi', bioX + 16, noteBoxY + 62);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('data identitas santri & pencatatan puasa.', bioX + 16, noteBoxY + 88);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('Sekolah Rakyat Terintegrasi 1 Kediri', bioX + 16, noteBoxY + 110);

  // --- RIGHT COLUMN: GIANT QR CODE PANEL (Prominent & Fast Scan) ---
  const qrCardX = 574;
  const qrCardY = 124;
  const qrCardW = 260;
  const qrCardH = 330;

  // QR Container Box
  drawRoundedRect(ctx, qrCardX, qrCardY, qrCardW, qrCardH, 20);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.stroke();

  // QR Header Pill
  const qrPillW = 236;
  const qrPillH = 30;
  const qrPillX = qrCardX + (qrCardW - qrPillW) / 2;
  const qrPillY = qrCardY + 12;
  drawRoundedRect(ctx, qrPillX, qrPillY, qrPillW, qrPillH, 8);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  ctx.fillStyle = '#fde047';
  ctx.font = '900 13px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ SCAN QR CODE NIK', qrPillX + qrPillW / 2, qrPillY + 20);
  ctx.textAlign = 'left';

  // Draw Giant QR Code (220 x 220 px)
  const qrSize = 220;
  const qrX = qrCardX + (qrCardW - qrSize) / 2;
  const qrY = qrCardY + 48;

  try {
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, qrValue, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: qrSize,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
  } catch (err) {
    console.error('Error drawing Giant QR Code:', err);
  }

  // QR Code Value Footer inside QR box
  const qrFootW = 236;
  const qrFootH = 40;
  const qrFootX = qrCardX + (qrCardW - qrFootW) / 2;
  const qrFootY = qrCardY + qrCardH - qrFootH - 12;
  drawRoundedRect(ctx, qrFootX, qrFootY, qrFootW, qrFootH, 8);
  ctx.fillStyle = '#f1f5f9';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(qrValue, qrFootX + qrFootW / 2, qrFootY + 25);
  ctx.textAlign = 'left';

  // 3. BOTTOM FOOTER STRIP
  const footerH = 64;
  const footerY = H - footerH;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, footerY, W, footerH);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(W, footerY);
  ctx.stroke();

  // Footer text
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI — KARTU PUASA WALI ASUH', 28, footerY + 38);

  ctx.fillStyle = '#059669';
  ctx.font = '900 13px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('VERIFIED PUASAKU.APP ✓', W - 28, footerY + 38);
  ctx.textAlign = 'left';

  // Outer card border
  ctx.restore();
  drawRoundedRect(ctx, 3, 3, W - 6, H - 6, 36);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Hardware-accelerated fast JPEG encoding (~55KB per card)
  return canvas.toDataURL('image/jpeg', 0.90);
}

/**
 * Generate standard ID Card PDF sheets (A4 size, 8 cards per page - 2 columns x 4 rows)
 * Card Dimensions: ~86mm x 54mm (Standard CR-80 card ratio)
 * Visuals match the in-app design with 100% precision.
 * 
 * Performance & Stability Highlights:
 * - Parallel batch processing (4 cards at a time)
 * - Yields to main event loop for smooth UI rendering and memory cleanup
 * - Lightweight JPEG compression for fast generation & small file size
 */
export async function exportStudentCardsToPdf(
  students: Student[],
  onProgress?: (current: number, total: number, page: number, totalPages: number) => void
) {
  if (!students || students.length === 0) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Standard CR-80 Card dimensions on A4: 86mm x 54mm
  const cardWidth = 86;
  const cardHeight = 54;
  const marginX = (pageWidth - cardWidth * 2) / 3; // ~12.6mm margin
  const marginY = (pageHeight - cardHeight * 4) / 5; // ~13.4mm margin

  const cardsPerPage = 8;
  const totalPages = Math.ceil(students.length / cardsPerPage);

  // Preload logo once
  const logo = await getCachedLogo();

  // Concurrency batch size
  const CONCURRENCY = 4;

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) {
      doc.addPage();
    }

    const pageStart = pageIdx * cardsPerPage;
    const pageEnd = Math.min(pageStart + cardsPerPage, students.length);
    const pageStudents = students.slice(pageStart, pageEnd);

    // Process this page in parallel chunks
    for (let i = 0; i < pageStudents.length; i += CONCURRENCY) {
      const chunk = pageStudents.slice(i, i + CONCURRENCY);
      const renderPromises = chunk.map(async (student, chunkOffset) => {
        const studentIndex = pageStart + i + chunkOffset;
        const cardPosInPage = (i + chunkOffset) % cardsPerPage;
        const col = cardPosInPage % 2;
        const row = Math.floor(cardPosInPage / 2);

        const x = marginX + col * (cardWidth + marginX);
        const y = marginY + row * (cardHeight + marginY);

        try {
          const cardImgData = await renderCardToCanvas(student, logo);
          return { cardImgData, x, y, studentIndex };
        } catch (err) {
          console.error('Error rendering card for student:', student.nama, err);
          return null;
        }
      });

      const renderedCards = await Promise.all(renderPromises);

      // Add to jsPDF
      for (const item of renderedCards) {
        if (!item) continue;
        const { cardImgData, x, y, studentIndex } = item;

        // Light subtle guide lines for clean cutting
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.roundedRect(x - 0.4, y - 0.4, cardWidth + 0.8, cardHeight + 0.8, 3, 3, 'S');

        // Render card
        doc.addImage(cardImgData, 'JPEG', x, y, cardWidth, cardHeight, undefined, 'FAST');

        if (onProgress) {
          onProgress(studentIndex + 1, students.length, pageIdx + 1, totalPages);
        }
      }

      // Yield to main event loop to keep UI smooth and allow garbage collection
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    // Page footer note
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Halaman ${pageIdx + 1} dari ${totalPages} — Kartu Puasa Wali Asuh Puasaku SRT 1 Kediri (Format Siap Cetak A4 / ID Card)`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );

    // Small yield between pages
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  // Save / Download PDF
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`Kartu_Puasa_Wali_Asuh_SRT1_Kediri_${timestamp}.pdf`);
}
