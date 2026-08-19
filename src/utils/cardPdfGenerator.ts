import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Student } from '../types';

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
 * Helper to load an image element asynchronously
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image: ' + src));
    img.src = src;
  });
}

/**
 * Generate ultra high-res 300 DPI Canvas image of the student card matching 100% of the in-app card design
 */
async function renderCardToCanvas(student: Student): Promise<string> {
  const level = getStudentLevel(student.kelas);
  const qrValue =
    student.nik && student.nik.trim()
      ? student.nik.trim()
      : `SRT-${student.no.toString().padStart(4, '0')}`;

  // High Resolution dimensions (3x standard 350x218 = 1050x654)
  const W = 1050;
  const H = 654;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  // Background white rounded card
  ctx.save();
  drawRoundedRect(ctx, 4, 4, W - 8, H - 8, 48);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();
  ctx.clip();

  // 1. TOP HEADER GRADIENT
  const headerHeight = 156;
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

  // Decorative dots pattern in header
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let px = 10; px < W; px += 24) {
    for (let py = 10; py < headerHeight; py += 24) {
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Header Logo Box
  const logoBoxX = 36;
  const logoBoxY = 28;
  const logoBoxSize = 96;
  drawRoundedRect(ctx, logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, 24);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.stroke();

  try {
    const logoImg = await loadImage('/assets/logo.svg');
    ctx.drawImage(logoImg, logoBoxX + 12, logoBoxY + 12, logoBoxSize - 24, logoBoxSize - 24);
  } catch {
    // Fallback logo icon
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('P', logoBoxX + 32, logoBoxY + 64);
  }

  // Header Titles
  ctx.fillStyle = '#fbbf24';
  ctx.font = '900 35px system-ui, -apple-system, sans-serif';
  ctx.fillText('KARTU SANTRI ASRAMA', logoBoxX + logoBoxSize + 28, 68);

  ctx.fillStyle = '#ffffff';
  ctx.font = '500 24px system-ui, -apple-system, sans-serif';
  ctx.fillText('SEKOLAH RAKYAT TERINTEGRASI 1 KEDIRI', logoBoxX + logoBoxSize + 28, 108);

  // Header Level Pill (Top Right)
  const pillW = 200;
  const pillH = 46;
  const pillX = W - pillW - 36;
  const pillY = 32;
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 12);
  ctx.fillStyle = '#fbbf24';
  ctx.fill();

  const levelLabel = level === 'SD' ? 'TINGKAT SD' : level === 'SMA' ? 'TINGKAT SMA' : 'TINGKAT SMP';
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(levelLabel, pillX + pillW / 2, pillY + 32);
  ctx.textAlign = 'left';

  // No Urut under Pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`No. #${student.no}`, W - 38, 116);
  ctx.textAlign = 'left';

  // 2. MAIN BODY (Photo & Bio)
  const isPutri = student.jenisKelamin === 'Perempuan';
  const photoX = 42;
  const photoY = headerHeight + 28;
  const photoW = 190;
  const photoH = 240;

  // Photo Container
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 32);
  ctx.fillStyle = '#f1f5f9';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  // Draw Photo or Fallback
  let hasPhoto = false;
  if (student.foto) {
    try {
      const studentImg = await loadImage(student.foto);
      ctx.save();
      drawRoundedRect(ctx, photoX, photoY, photoW, photoH - 42, 28);
      ctx.clip();
      ctx.drawImage(studentImg, photoX, photoY, photoW, photoH - 42);
      ctx.restore();
      hasPhoto = true;
    } catch {
      hasPhoto = false;
    }
  }

  if (!hasPhoto) {
    ctx.font = '56px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isPutri ? '🧕' : '👳', photoX + photoW / 2, photoY + 95);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('FOTO SANTRI', photoX + photoW / 2, photoY + 140);
    ctx.textAlign = 'left';
  }

  // Photo Gender Ribbon (PUTRI / PUTRA)
  const ribbonH = 44;
  const ribbonY = photoY + photoH - ribbonH;
  ctx.save();
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 32);
  ctx.clip();
  ctx.fillStyle = isPutri ? '#db2777' : '#2563eb';
  ctx.fillRect(photoX, ribbonY, photoW, ribbonH);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isPutri ? 'PUTRI' : 'PUTRA', photoX + photoW / 2, ribbonY + 30);
  ctx.textAlign = 'left';
  ctx.restore();

  // Bio Information Column
  const bioX = photoX + photoW + 40;
  let bioY = headerHeight + 36;

  // Nama Lengkap Label & Name
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('NAMA LENGKAP', bioX, bioY);

  bioY += 38;
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 33px system-ui, -apple-system, sans-serif';
  const displayName =
    student.nama.length > 26 ? student.nama.substring(0, 24) + '...' : student.nama;
  ctx.fillText(displayName, bioX, bioY);

  // Kelas & No. Urut (2 columns)
  bioY += 46;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 19px system-ui, -apple-system, sans-serif';
  ctx.fillText('KELAS', bioX, bioY);
  ctx.fillText('NO. URUT', bioX + 320, bioY);

  bioY += 34;
  ctx.fillStyle = '#065f46';
  ctx.font = '900 30px system-ui, -apple-system, sans-serif';
  ctx.fillText(student.kelas, bioX, bioY);

  ctx.fillStyle = '#1e293b';
  ctx.font = '900 30px system-ui, -apple-system, sans-serif';
  ctx.fillText(`#${student.no}`, bioX + 320, bioY);

  // NIK / ID Siswa
  bioY += 44;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 19px system-ui, -apple-system, sans-serif';
  ctx.fillText('NIK / ID SISWA', bioX, bioY);

  bioY += 32;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(student.nik || '-', bioX, bioY);

  // 3. FOOTER BAR (Slate-50 with QR Code & Puasaku Badge)
  const footerH = 150;
  const footerY = H - footerH;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, footerY, W, footerH);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(W, footerY);
  ctx.stroke();

  // QR Code Box (Left Footer)
  const qrBoxX = 36;
  const qrBoxY = footerY + 18;
  const qrBoxSize = 114;

  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Draw QR Image
  const qrDataUrl = await QRCode.toDataURL(qrValue, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 240,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });

  try {
    const qrImg = await loadImage(qrDataUrl);
    ctx.drawImage(qrImg, qrBoxX + 6, qrBoxY + 6, qrBoxSize - 12, qrBoxSize - 12);
  } catch (err) {
    console.error('Error drawing QR Code:', err);
  }

  // QR Code Text Beside QR
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('QR CODE NIK:', qrBoxX + qrBoxSize + 24, qrBoxY + 44);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 27px monospace';
  ctx.fillText(qrValue, qrBoxX + qrBoxSize + 24, qrBoxY + 82);

  // Puasaku Branding Badge (Right Footer)
  const badgeW = 270;
  const badgeH = 86;
  const badgeX = W - badgeW - 36;
  const badgeY = footerY + 32;

  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 28);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#a7f3d0';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Mini Green Logo Box
  const miniLogoSize = 54;
  const miniLogoX = badgeX + 16;
  const miniLogoY = badgeY + 16;
  drawRoundedRect(ctx, miniLogoX, miniLogoY, miniLogoSize, miniLogoSize, 16);
  ctx.fillStyle = '#059669';
  ctx.fill();

  try {
    const miniLogoImg = await loadImage('/assets/logo.svg');
    ctx.drawImage(miniLogoImg, miniLogoX + 8, miniLogoY + 8, miniLogoSize - 16, miniLogoSize - 16);
  } catch {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('P', miniLogoX + 18, miniLogoY + 38);
  }

  // Puasaku Text
  ctx.fillStyle = '#065f46';
  ctx.font = '900 28px system-ui, -apple-system, sans-serif';
  ctx.fillText('puasaku.app', miniLogoX + miniLogoSize + 16, badgeY + 40);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.fillText('SRT 1 KEDIRI', miniLogoX + miniLogoSize + 16, badgeY + 68);

  ctx.restore();

  return canvas.toDataURL('image/png', 0.96);
}

/**
 * Generate standard ID Card PDF sheets (A4 size, 8 cards per page - 2 columns x 4 rows)
 * Card Dimensions: ~86mm x 54mm (Standard CR-80 card ratio)
 * Visuals match the in-app design with 100% precision.
 */
export async function exportStudentCardsToPdf(
  students: Student[],
  onProgress?: (current: number, total: number) => void
) {
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

  for (let idx = 0; idx < students.length; idx++) {
    const pageIdx = Math.floor(idx / cardsPerPage);
    const cardPosInPage = idx % cardsPerPage;

    if (cardPosInPage === 0 && pageIdx > 0) {
      doc.addPage();
    }

    if (onProgress) {
      onProgress(idx + 1, students.length);
    }

    const student = students[idx];
    const col = cardPosInPage % 2;
    const row = Math.floor(cardPosInPage / 2);

    const x = marginX + col * (cardWidth + marginX);
    const y = marginY + row * (cardHeight + marginY);

    // Light subtle guide lines for clean cutting
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(x - 0.5, y - 0.5, cardWidth + 1, cardHeight + 1, 3.5, 3.5, 'S');

    // Render exact high-res card image matching the app UI
    try {
      const cardImgData = await renderCardToCanvas(student);
      doc.addImage(cardImgData, 'PNG', x, y, cardWidth, cardHeight);
    } catch (err) {
      console.error('Error rendering card for student:', student.nama, err);
    }

    // On last card of each page, add footer note
    if (cardPosInPage === cardsPerPage - 1 || idx === students.length - 1) {
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Halaman ${pageIdx + 1} dari ${totalPages} — Kartu Santri Asrama Puasaku SRT 1 Kediri (Format Siap Cetak A4 / ID Card)`,
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      );
    }
  }

  // Save / Download PDF
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`Kartu_Santri_Asrama_SRT1_Kediri_${timestamp}.pdf`);
}
