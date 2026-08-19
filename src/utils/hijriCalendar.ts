/**
 * Hijri & Islamic Calendar Calculation Utilities for PUASAKU SRT 1 KEDIRI
 * Supports Kuweit / Umm al-Qura standard algorithms, Intl DateTimeFormat with fallback,
 * fasting determination (Wajib, Sunnah, Haram), Niat & Dalil, and Islamic events.
 */

export interface HijriDateInfo {
  day: number;
  month: number; // 1-12
  monthName: string;
  monthNameArabic: string;
  year: number;
  formatted: string; // e.g. "1 Ramadhan 1447 H"
  formattedArabic: string;
}

export interface FastingTypeDetail {
  id: 'ramadhan' | 'senin_kamis' | 'ayyamul_bidh' | 'arafah' | 'tarwiyah' | 'asyura' | 'tasua' | 'syawal' | 'nisfu_syaban' | 'dzulhijjah_awal' | 'haram' | 'none';
  name: string;
  category: 'wajib' | 'sunnah_muakkad' | 'sunnah' | 'haram' | 'none';
  badgeColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  niatArabic?: string;
  niatLatin?: string;
  niatArti?: string;
  dalil?: string;
}

export interface CalendarDayData {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayOfMonth: number;
  dayOfWeek: number; // 0 = Ahad/Minggu, 1 = Senin, ..., 6 = Sabtu
  dayName: string;
  pasaran: { name: string; neptu: number };
  hijriDayArabic: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFriday: boolean;
  isSunday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  hijri: HijriDateInfo;
  fastingTypes: FastingTypeDetail[];
  primaryFasting: FastingTypeDetail;
  isFastingDay: boolean;
  isHaramFasting: boolean;
  islamicEvents: string[];
  isOddNightRamadan?: boolean; // Lailatul Qadar nights (21, 23, 25, 27, 29)
}

export const PASARAN_NAMES = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'] as const;
export const PASARAN_NEPTU: Record<string, number> = {
  Legi: 5,
  Pahing: 9,
  Pon: 7,
  Wage: 4,
  Kliwon: 8,
};

export const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicNumerals(num: number): string {
  return String(num)
    .split('')
    .map((ch) => ARABIC_DIGITS[parseInt(ch, 10)] || ch)
    .join('');
}

export function getPasaranJawa(date: Date): { name: string; neptu: number } {
  // Base: 1970-01-01 was Kamis Wage (Wage = index 3 in ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'])
  const baseUtc = Date.UTC(1970, 0, 1);
  const targetUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((targetUtc - baseUtc) / (24 * 60 * 60 * 1000));
  const pasaranIdx = ((diffDays + 3) % 5 + 5) % 5;
  const name = PASARAN_NAMES[pasaranIdx];
  return {
    name,
    neptu: PASARAN_NEPTU[name] || 5,
  };
}

export const HIJRI_MONTH_NAMES_ID = [
  '',
  'Muharram',
  'Safar',
  "Rabi'ul Awwal",
  "Rabi'ul Akhir",
  'Jumadil Ula',
  'Jumadil Akhir',
  'Rajab',
  "Sya'ban",
  'Ramadhan',
  'Syawal',
  "Dzulqa'dah",
  'Dzulhijjah',
];

export const HIJRI_MONTH_NAMES_AR = [
  '',
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

export const DAY_NAMES_ID = [
  'Ahad',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  "Jum'at",
  'Sabtu',
];

/**
 * Approximate Kuweit / Umm Al-Qura Astronomical Hijri Date Calculation
 * with Hilal adjustment offset in days (-2, -1, 0, +1, +2).
 */
export function getHijriDate(date: Date, offsetDays = 0): HijriDateInfo {
  // Apply offset in days
  const targetDate = new Date(date);
  if (offsetDays !== 0) {
    targetDate.setDate(targetDate.getDate() + offsetDays);
  }

  // First attempt native browser Islamic Umm al-Qura Intl
  try {
    const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(targetDate);
    let day = 1;
    let month = 1;
    let year = 1447;

    for (const p of parts) {
      if (p.type === 'day') day = parseInt(p.value, 10);
      if (p.type === 'month') month = parseInt(p.value, 10);
      if (p.type === 'year') {
        const parsedYear = parseInt(p.value.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsedYear)) year = parsedYear;
      }
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 30) {
      const monthName = HIJRI_MONTH_NAMES_ID[month] || `Bulan ke-${month}`;
      const monthNameArabic = HIJRI_MONTH_NAMES_AR[month] || '';
      return {
        day,
        month,
        monthName,
        monthNameArabic,
        year,
        formatted: `${day} ${monthName} ${year} H`,
        formattedArabic: `${day} ${monthNameArabic} ${year} هـ`,
      };
    }
  } catch {
    // Fallback algorithmic calculation
  }

  // Fallback mathematical Julian Day calculation
  return calculateHijriAlgorithmic(targetDate);
}

/**
 * Mathematical Julian day fallback for Hijri date
 */
function calculateHijriAlgorithmic(date: Date): HijriDateInfo {
  const day = date.getDate();
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();

  let m = month;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

  const z = jd - 1948439.5;
  const cyc = Math.floor(z / 10631);
  const rem = z - 10631 * cyc;
  const j = Math.floor((rem + 0.5) / 354.36667);
  const hijriYear = 30 * cyc + j + 1;
  const remDays = rem - Math.floor(j * 354.36667 + 0.5);
  const hijriMonth = Math.min(12, Math.floor((remDays + 28.5) / 29.5) + 1);
  const hijriDay = Math.max(1, Math.min(30, Math.floor(remDays - Math.floor((hijriMonth - 1) * 29.5) + 1)));

  const monthName = HIJRI_MONTH_NAMES_ID[hijriMonth] || `Bulan ke-${hijriMonth}`;
  const monthNameArabic = HIJRI_MONTH_NAMES_AR[hijriMonth] || '';

  return {
    day: hijriDay,
    month: hijriMonth,
    monthName,
    monthNameArabic,
    year: hijriYear,
    formatted: `${hijriDay} ${monthName} ${hijriYear} H`,
    formattedArabic: `${hijriDay} ${monthNameArabic} ${hijriYear} هـ`,
  };
}

/**
 * Fasting Database: Types, Niat, Dalil & Keutamaan
 */
export const FASTING_TYPES_DB: Record<string, FastingTypeDetail> = {
  ramadhan: {
    id: 'ramadhan',
    name: 'Puasa Wajib Ramadhan',
    category: 'wajib',
    badgeColor: 'bg-emerald-500 text-white',
    bgColor: 'bg-emerald-950/70',
    borderColor: 'border-emerald-500/50',
    textColor: 'text-emerald-300',
    description: 'Puasa fardhu wajib bagi setiap muslim yang berakal, baligh, dan mampu selama sebulan penuh Ramadhan.',
    niatArabic: 'نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلَّهِ تَعَالَى',
    niatLatin: "Nawaitu shauma ghadin 'an ada'i fardhi syahri Ramadhana hadzihis sanati lillahi ta'ala.",
    niatArti: 'Aku berniat puasa esok hari untuk menunaikan fardhu bulan Ramadhan tahun ini karena Allah Ta\'ala.',
    dalil: 'QS. Al-Baqarah: 183 — "Wahai orang-orang yang beriman, diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang sebelum kamu agar kamu bertakwa."',
  },
  senin_kamis: {
    id: 'senin_kamis',
    name: 'Puasa Sunnah Senin & Kamis',
    category: 'sunnah_muakkad',
    badgeColor: 'bg-teal-500 text-white',
    bgColor: 'bg-teal-950/60',
    borderColor: 'border-teal-500/40',
    textColor: 'text-teal-300',
    description: 'Amalan sunnah rutin Rasulullah SAW saat seluruh catatan amal hamba diperlihatkan kepada Allah Ta\'ala.',
    niatArabic: 'نَوَيْتُ صَوْمَ يَوْمِ الِاثْنَيْنِ / الْخَمِيسِ سُنَّةً لِلَّهِ تَعَالَى',
    niatLatin: "Nawaitu shauma yaumil itsnaini / yaumil khamiisi sunnatan lillahi ta'ala.",
    niatArti: 'Aku berniat puasa sunnah hari Senin / Kamis karena Allah Ta\'ala.',
    dalil: 'HR. Tirmidzi No. 747 — "Amalan-amalan manusia diperiksa pada hari Senin dan Kamis, maka aku menyukai saat amalku diperiksa aku dalam keadaan berpuasa."',
  },
  ayyamul_bidh: {
    id: 'ayyamul_bidh',
    name: 'Puasa Ayyamul Bidh (13, 14, 15)',
    category: 'sunnah_muakkad',
    badgeColor: 'bg-amber-500 text-slate-950',
    bgColor: 'bg-amber-950/60',
    borderColor: 'border-amber-500/50',
    textColor: 'text-amber-300',
    description: 'Puasa tiga hari di pertengahan bulan saat bulan purnama bersinar terang benderang. Pahalanya seperti berpuasa sepanjang tahun.',
    niatArabic: 'نَوَيْتُ صَوْمَ أَيَّامِ الْبِيضِ سُنَّةً لِلَّهِ تَعَالَى',
    niatLatin: "Nawaitu shauma ayyamil bidhi sunnatan lillahi ta'ala.",
    niatArti: 'Aku berniat puasa Ayyamul Bidh sunnah karena Allah Ta\'ala.',
    dalil: 'HR. Bukhari No. 1981 & Muslim No. 1159 — Puasa 3 hari setiap bulan (Ayyamul Bidh) senilai dengan puasa sepanjang masa.',
  },
  arafah: {
    id: 'arafah',
    name: 'Puasa Sunnah Arafah (9 Dzulhijjah)',
    category: 'sunnah_muakkad',
    badgeColor: 'bg-indigo-500 text-white',
    bgColor: 'bg-indigo-950/70',
    borderColor: 'border-indigo-500/50',
    textColor: 'text-indigo-300',
    description: 'Dilaksanakan saat jamaah haji wukuf di padang Arafah. Menghapus dosa setahun lalu dan setahun yang akan datang.',
    niatArabic: 'نَوَيْتُ صَوْمَ عَرَفَةَ سُنَّةً لِلَّهِ تَعَالَى',
    niatLatin: "Nawaitu shauma 'arafata sunnatan lillahi ta'ala.",
    niatArti: 'Aku berniat puasa sunnah Arafah karena Allah Ta\'ala.',
    dalil: 'HR. Muslim No. 1162 — "Puasa hari Arafah, aku berharap kepada Allah dapat menghapuskan dosa setahun sebelumnya dan setahun sesudahnya."',
  },
  tarwiyah: {
    id: 'tarwiyah',
    name: 'Puasa Sunnah Tarwiyah (8 Dzulhijjah)',
    category: 'sunnah',
    badgeColor: 'bg-sky-500 text-white',
    bgColor: 'bg-sky-950/60',
    borderColor: 'border-sky-500/40',
    textColor: 'text-sky-300',
    description: 'Puasa pada hari ke-8 Dzulhijjah saat jamaah haji menuju Mina mempersiapkan perbekalan air.',
    niatArabic: 'نَوَيْتُ صَوْمَ تَرْوِيَةَ سُنَّةً لِلَّهِ تَعَالَى',
    niatLatin: "Nawaitu shauma tarwiyata sunnatan lillahi ta'ala.",
    niatArti: 'Aku berniat puasa sunnah Tarwiyah karena Allah Ta\'ala.',
    dalil: 'Keutamaan amal shaleh pada 10 hari pertama bulan Dzulhijjah yang sangat dicintai Allah (HR. Bukhari No. 969).',
  },
  asyura: {
    id: 'asyura',
    name: 'Puasa Sunnah Asyura (10 Muharram)',
    category: 'sunnah_muakkad',
    badgeColor: 'bg-blue-600 text-white',
    bgColor: 'bg-blue-950/60',
    borderColor: 'border-blue-500/50',
    textColor: 'text-blue-300',
    description: 'Puasa pada hari ke-10 Muharram, hari diselamatkannya Nabi Musa AS dari kejaran Fir\'aun. Menghapus dosa setahun lalu.',
    niatArabic: 'نَوَيْتُ صَوْمَ عَاشُورَاءَ سُنَّةً لِلَّهِ تَعَالَى',
    niatLatin: "Nawaitu shauma 'asyura-a sunnatan lillahi ta'ala.",
    niatArti: 'Aku berniat puasa sunnah Asyura karena Allah Ta\'ala.',
    dalil: 'HR. Muslim No. 1162 — "Puasa hari Asyura menghapuskan dosa setahun yang telah lalu."',
  },
  tasua: {
    id: 'tasua',
    name: "Puasa Sunnah Tasu'a (9 Muharram)",
    category: 'sunnah',
    badgeColor: 'bg-cyan-600 text-white',
    bgColor: 'bg-cyan-950/60',
    borderColor: 'border-cyan-500/40',
    textColor: 'text-cyan-300',
    description: "Puasa pada hari ke-9 Muharram sebagai pembeda dari tradisi kaum Yahudi dan Nasrani.",
    niatArabic: 'نَوَيْتُ صَوْمَ تَاسُوعَاءَ سُنَّةً لِلَّهِ تَعَالَى',
    niatLatin: "Nawaitu shauma tasu'a-a sunnatan lillahi ta'ala.",
    niatArti: "Aku berniat puasa sunnah Tasu'a karena Allah Ta'ala.",
    dalil: 'HR. Muslim No. 1134 — Sabda Rasulullah SAW: "Jika aku masih hidup tahun depan, niscaya aku akan berpuasa pada hari kesembilan."',
  },
  syawal: {
    id: 'syawal',
    name: 'Puasa Sunnah 6 Hari Syawal',
    category: 'sunnah_muakkad',
    badgeColor: 'bg-pink-500 text-white',
    bgColor: 'bg-pink-950/60',
    borderColor: 'border-pink-500/40',
    textColor: 'text-pink-300',
    description: 'Berpuasa 6 hari di bulan Syawal (mulai 2 Syawal ke atas). Diganjar pahala puasa setahun penuh bersama puasa Ramadhan.',
    niatArabic: 'نَوَيْتُ صَوْمَ سِتَّةِ أَيَّامٍ مِنْ شَوَّالٍ سُنَّةً لِلَّهِ تَعَالَى',
    niatLatin: "Nawaitu shauma sittati ayyamin min Syawwalin sunnatan lillahi ta'ala.",
    niatArti: 'Aku berniat puasa sunnah enam hari di bulan Syawal karena Allah Ta\'ala.',
    dalil: 'HR. Muslim No. 1164 — "Barangsiapa berpuasa Ramadhan kemudian mengikutinya dengan enam hari di bulan Syawal, maka itu seperti puasa setahun penuh."',
  },
  nisfu_syaban: {
    id: 'nisfu_syaban',
    name: "Puasa Sunnah Nisfu Sya'ban",
    category: 'sunnah',
    badgeColor: 'bg-violet-500 text-white',
    bgColor: 'bg-violet-950/60',
    borderColor: 'border-violet-500/40',
    textColor: 'text-violet-300',
    description: "Puasa pertengahan bulan Sya'ban sebelum memasuki bulan suci Ramadhan.",
    niatArabic: 'نَوَيْتُ صَوْمَ شَهْرِ شَعْبَانَ سُنَّةً لِلَّهِ تَعَالَى',
    niatLatin: "Nawaitu shauma syahri sya'bana sunnatan lillahi ta'ala.",
    niatArti: "Aku berniat puasa sunnah bulan Sya'ban karena Allah Ta'ala.",
    dalil: "Aisyah RA menceritakan Rasulullah SAW paling banyak berpuasa sunnah pada bulan Sya'ban (HR. Bukhari & Muslim).",
  },
  dzulhijjah_awal: {
    id: 'dzulhijjah_awal',
    name: 'Puasa Sunnah 1-7 Dzulhijjah',
    category: 'sunnah',
    badgeColor: 'bg-amber-600 text-white',
    bgColor: 'bg-amber-950/60',
    borderColor: 'border-amber-600/40',
    textColor: 'text-amber-200',
    description: 'Amalan utama pada awal bulan Dzulhijjah sebelum hari Tarwiyah & Arafah.',
    niatArabic: 'نَوَيْتُ صَوْمَ شَهْرِ ذِي الْحِجَّةِ سُنَّةً لِلَّهِ تَعَالَى',
    niatLatin: "Nawaitu shauma syahri dzil hijjati sunnatan lillahi ta'ala.",
    niatArti: "Aku berniat puasa sunnah bulan Dzulhijjah karena Allah Ta'ala.",
    dalil: 'HR. Bukhari No. 969 — "Tidak ada hari di mana amal shalih lebih dicintai Allah daripada hari-hari ini (10 hari pertama Dzulhijjah)."',
  },
  haram: {
    id: 'haram',
    name: 'Diharamkan Berpuasa (Hari Raya & Tasyrik)',
    category: 'haram',
    badgeColor: 'bg-rose-600 text-white font-bold',
    bgColor: 'bg-rose-950/70',
    borderColor: 'border-rose-500/60',
    textColor: 'text-rose-300',
    description: 'Haram mutlak berpuasa pada Hari Raya Idul Fitri (1 Syawal), Hari Raya Idul Adha (10 Dzulhijjah), dan Hari Tasyrik (11, 12, 13 Dzulhijjah).',
    dalil: 'HR. Muslim No. 1141 — "Hari-hari Tasyrik adalah hari makan, minum, dan mengingat Allah Ta\'ala."',
  },
  none: {
    id: 'none',
    name: 'Bukan Hari Puasa Khusus',
    category: 'none',
    badgeColor: 'bg-slate-700 text-slate-300',
    bgColor: 'bg-slate-900/40',
    borderColor: 'border-slate-800',
    textColor: 'text-slate-400',
    description: 'Hari biasa (mubah).',
  },
};

/**
 * Determine fasting status, prohibitions and Islamic events for any given day
 */
export function analyzeDayFastingAndEvents(date: Date, offsetDays = 0): {
  hijri: HijriDateInfo;
  fastingTypes: FastingTypeDetail[];
  primaryFasting: FastingTypeDetail;
  isFastingDay: boolean;
  isHaramFasting: boolean;
  islamicEvents: string[];
  isOddNightRamadan: boolean;
} {
  const hijri = getHijriDate(date, offsetDays);
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ..., 4 = Thu, 5 = Fri, 6 = Sat
  const islamicEvents: string[] = [];
  const fastingTypes: FastingTypeDetail[] = [];
  let isOddNightRamadan = false;

  const { day: hDay, month: hMonth } = hijri;

  // -------------------------------------------------------------
  // 1. CHECK HARAM DAYS (Idul Fitri, Idul Adha, Hari Tasyrik)
  // -------------------------------------------------------------
  let isHaram = false;
  if (hMonth === 10 && hDay === 1) {
    isHaram = true;
    fastingTypes.push({
      ...FASTING_TYPES_DB.haram,
      name: 'Haram Puasa: Idul Fitri 1 Syawal',
      description: 'Hari Raya Idul Fitri — Diharamkan berpuasa, diwajibkan bergembira dan bersilaturahim.',
    });
    islamicEvents.push('🎉 Hari Raya Idul Fitri 1447 H');
  } else if (hMonth === 12 && hDay === 10) {
    isHaram = true;
    fastingTypes.push({
      ...FASTING_TYPES_DB.haram,
      name: 'Haram Puasa: Idul Adha 10 Dzulhijjah',
      description: 'Hari Raya Idul Adha (Hari Raya Qurban) — Diharamkan berpuasa.',
    });
    islamicEvents.push('🐑 Hari Raya Idul Adha (Qurban)');
  } else if (hMonth === 12 && (hDay === 11 || hDay === 12 || hDay === 13)) {
    isHaram = true;
    fastingTypes.push({
      ...FASTING_TYPES_DB.haram,
      name: `Haram Puasa: Hari Tasyrik (${hDay} Dzulhijjah)`,
      description: `Hari Tasyrik ke-${hDay - 10} — Hari makan, minum, qurban dan dzikir mengingat Allah. Dilarang berpuasa.`,
    });
    islamicEvents.push(`🥩 Hari Tasyrik ${hDay} Dzulhijjah`);
  }

  // -------------------------------------------------------------
  // 2. ISLAMIC EVENTS & BLESSED OCCASIONS
  // -------------------------------------------------------------
  if (hMonth === 1 && hDay === 1) islamicEvents.push('✨ Tahun Baru Hijriah (1 Muharram)');
  if (hMonth === 1 && hDay === 9) islamicEvents.push("⭐ Hari Tasu'a (9 Muharram)");
  if (hMonth === 1 && hDay === 10) islamicEvents.push('⭐ Hari Asyura (10 Muharram)');
  if (hMonth === 3 && hDay === 12) islamicEvents.push('🌸 Maulid Nabi Muhammad SAW');
  if (hMonth === 7 && hDay === 27) islamicEvents.push("🚀 Peringatan Isra' Mi'raj");
  if (hMonth === 8 && hDay === 15) islamicEvents.push("🌙 Malam Nisfu Sya'ban");
  if (hMonth === 9 && hDay === 1) islamicEvents.push('🌙 Awal Puasa Ramadhan');
  if (hMonth === 9 && hDay === 17) islamicEvents.push("📖 Peringatan Nuzulul Qur'an (17 Ramadhan)");

  // 10 Malam Terakhir & Malam Ganjil Lailatul Qadar
  if (hMonth === 9 && hDay >= 21) {
    if (hDay % 2 === 1) {
      isOddNightRamadan = true;
      islamicEvents.push(`🌟 Malam Ganjil Lailatul Qadar (${hDay} Ramadhan)`);
    } else {
      islamicEvents.push(`🌙 Sepuluh Malam Terakhir Ramadhan (${hDay} Ramadhan)`);
    }
  }

  if (hMonth === 12 && hDay === 8) islamicEvents.push('⛺ Hari Tarwiyah (Persiapan Haji)');
  if (hMonth === 12 && hDay === 9) islamicEvents.push('🕋 Hari Arafah (Wukuf di Arafah)');

  // -------------------------------------------------------------
  // 3. FASTING DETERMINATION (If not haram)
  // -------------------------------------------------------------
  if (!isHaram) {
    // A. RAMADHAN (Wajib)
    if (hMonth === 9) {
      fastingTypes.push({
        ...FASTING_TYPES_DB.ramadhan,
        name: `Puasa Ramadhan Hari ke-${hDay}`,
      });
    } else {
      // B. SUNNAH KHUSUS TANGGAL HIJRIAH
      // Asyura & Tasu'a
      if (hMonth === 1 && hDay === 10) fastingTypes.push(FASTING_TYPES_DB.asyura);
      if (hMonth === 1 && hDay === 9) fastingTypes.push(FASTING_TYPES_DB.tasua);

      // Nisfu Sya'ban
      if (hMonth === 8 && hDay === 15) fastingTypes.push(FASTING_TYPES_DB.nisfu_syaban);

      // Puasa 6 Hari Syawal (2 s/d 7 Syawal & sepanjang Syawal)
      if (hMonth === 10 && hDay >= 2 && hDay <= 7) {
        fastingTypes.push({
          ...FASTING_TYPES_DB.syawal,
          name: `Puasa 6 Hari Syawal (Hari ke-${hDay - 1})`,
        });
      } else if (hMonth === 10 && hDay > 7) {
        // Optional Syawal
        fastingTypes.push(FASTING_TYPES_DB.syawal);
      }

      // Awal Dzulhijjah, Tarwiyah & Arafah
      if (hMonth === 12 && hDay === 9) {
        fastingTypes.push(FASTING_TYPES_DB.arafah);
      } else if (hMonth === 12 && hDay === 8) {
        fastingTypes.push(FASTING_TYPES_DB.tarwiyah);
      } else if (hMonth === 12 && hDay >= 1 && hDay <= 7) {
        fastingTypes.push(FASTING_TYPES_DB.dzulhijjah_awal);
      }

      // Ayyamul Bidh (13, 14, 15 tiap bulan, KECUALI 13 Dzulhijjah karena Tasyrik)
      if ((hDay === 13 || hDay === 14 || hDay === 15) && hMonth !== 12) {
        fastingTypes.push({
          ...FASTING_TYPES_DB.ayyamul_bidh,
          name: `Puasa Ayyamul Bidh (Hari ${hDay} ${hijri.monthName})`,
        });
      } else if ((hDay === 14 || hDay === 15) && hMonth === 12) {
        fastingTypes.push({
          ...FASTING_TYPES_DB.ayyamul_bidh,
          name: `Puasa Ayyamul Bidh (${hDay} Dzulhijjah)`,
        });
      }

      // C. PUASA RUTIN SENIN & KAMIS
      if (dayOfWeek === 1) {
        fastingTypes.push({
          ...FASTING_TYPES_DB.senin_kamis,
          name: 'Puasa Sunnah Hari Senin',
        });
      } else if (dayOfWeek === 4) {
        fastingTypes.push({
          ...FASTING_TYPES_DB.senin_kamis,
          name: 'Puasa Sunnah Hari Kamis',
        });
      }
    }
  }

  const isFastingDay = fastingTypes.length > 0 && !isHaram;
  const primaryFasting = isHaram
    ? fastingTypes[0]
    : isFastingDay
    ? fastingTypes[0]
    : FASTING_TYPES_DB.none;

  return {
    hijri,
    fastingTypes,
    primaryFasting,
    isFastingDay,
    isHaramFasting: isHaram,
    islamicEvents,
    isOddNightRamadan,
  };
}

/**
 * Known Indonesian Holidays Check (National & Islamic)
 */
export function getIndonesianHoliday(date: Date, hijri: HijriDateInfo): { isHoliday: boolean; holidayName?: string } {
  const m = date.getMonth() + 1;
  const d = date.getDate();

  // Fixed Solar Holidays
  if (m === 1 && d === 1) return { isHoliday: true, holidayName: 'Tahun Baru Masehi' };
  if (m === 5 && d === 1) return { isHoliday: true, holidayName: 'Hari Buruh Internasional' };
  if (m === 8 && d === 17) return { isHoliday: true, holidayName: 'Hari Kemerdekaan RI (HUT RI)' };
  if (m === 12 && d === 25) return { isHoliday: true, holidayName: 'Hari Raya Natal' };

  // Hijri Holidays
  if (hijri.month === 1 && hijri.day === 1) return { isHoliday: true, holidayName: 'Tahun Baru Islam (1 Muharram)' };
  if (hijri.month === 1 && hijri.day === 10) return { isHoliday: false, holidayName: 'Hari Asyura (10 Muharram)' };
  if (hijri.month === 3 && hijri.day === 12) return { isHoliday: true, holidayName: 'Maulid Nabi Muhammad SAW' };
  if (hijri.month === 7 && hijri.day === 27) return { isHoliday: true, holidayName: "Isra' Mi'raj Nabi Muhammad SAW" };
  if (hijri.month === 9 && hijri.day === 17) return { isHoliday: false, holidayName: "Nuzulul Qur'an" };
  if (hijri.month === 10 && (hijri.day === 1 || hijri.day === 2)) return { isHoliday: true, holidayName: 'Hari Raya Idul Fitri' };
  if (hijri.month === 12 && hijri.day === 10) return { isHoliday: true, holidayName: 'Hari Raya Idul Adha' };

  return { isHoliday: false };
}

/**
 * Generates full calendar grid matrix for a given month and year (42 cells: 6 weeks x 7 days)
 */
export function generateMonthCalendarDays(
  year: number,
  monthIndex: number, // 0 = Jan, 1 = Feb, ..., 11 = Dec
  hijriOffsetDays = 0
): CalendarDayData[] {
  const result: CalendarDayData[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon ...
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Helper builder
  const buildDayData = (date: Date, isCurrent: boolean): CalendarDayData => {
    const dateStr = formatDateToIso(date);
    const analysis = analyzeDayFastingAndEvents(date, hijriOffsetDays);
    const pasaran = getPasaranJawa(date);
    const holidayInfo = getIndonesianHoliday(date, analysis.hijri);
    const isSunday = date.getDay() === 0;

    return {
      date,
      dateStr,
      dayOfMonth: date.getDate(),
      dayOfWeek: date.getDay(),
      dayName: DAY_NAMES_ID[date.getDay()],
      pasaran,
      hijriDayArabic: toArabicNumerals(analysis.hijri.day),
      isCurrentMonth: isCurrent,
      isToday: dateStr === todayStr,
      isFriday: date.getDay() === 5,
      isSunday,
      isHoliday: holidayInfo.isHoliday || isSunday,
      holidayName: holidayInfo.holidayName,
      ...analysis,
    };
  };

  // Days from previous month
  const prevMonthLastDate = new Date(year, monthIndex, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDate - i;
    const date = new Date(year, monthIndex - 1, dayNum);
    result.push(buildDayData(date, false));
  }

  // Days of current month
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const date = new Date(year, monthIndex, dayNum);
    result.push(buildDayData(date, true));
  }

  // Days from next month to complete 35 or 42 grid cells
  const remainingCells = (7 - (result.length % 7)) % 7;
  const targetTotal = result.length + remainingCells <= 35 ? 35 : 42;
  const totalToAdd = targetTotal - result.length;

  for (let nextDay = 1; nextDay <= totalToAdd; nextDay++) {
    const date = new Date(year, monthIndex + 1, nextDay);
    result.push(buildDayData(date, false));
  }

  return result;
}

/**
 * ISO Date formatter YYYY-MM-DD using local time
 */
export function formatDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Predefined Sample School Events for SRT 1 Kediri
 */
export interface SchoolCalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'ramadhan' | 'tarbiyah' | 'kajian' | 'sosial' | 'ujian' | 'umum';
  description?: string;
  time?: string;
  location?: string;
  isImportant?: boolean;
}

export const DEFAULT_SCHOOL_EVENTS: SchoolCalendarEvent[] = [
  {
    id: 'evt-1',
    date: '2026-03-01',
    title: "Pondok Ramadhan & Khutbah Iftitah",
    category: 'ramadhan',
    description: 'Pembukaan agenda intensif kegiatan keagamaan dan pembinaan karakter Ramadhan 1447 H.',
    time: '07:30 - 11:30 WIB',
    location: 'Aula Utama & Masjid SRT 1 Kediri',
    isImportant: true,
  },
  {
    id: 'evt-2',
    date: '2026-03-05',
    title: "Kajian Fiqih Ibadah & Praktik Wudhu Sempurna",
    category: 'tarbiyah',
    description: 'Pembekalan tata cara sholat khusyuk dan fiqih puasa bagi seluruh santri/siswa.',
    time: '08:00 - 10:00 WIB',
    location: 'Masjid Sekolah',
  },
  {
    id: 'evt-3',
    date: '2026-03-12',
    title: "Buka Puasa Bersama & Santunan Anak Yatim",
    category: 'sosial',
    description: 'Buka puasa bersama guru, siswa, dan warga sekitar disertai pembagian paket sembako berkah.',
    time: '16:30 - 18:30 WIB',
    location: 'Halaman Gedung Utama',
    isImportant: true,
  },
  {
    id: 'evt-4',
    date: '2026-03-17',
    title: "Peringatan Nuzulul Qur'an & Khotmil Al-Qur'an 30 Juz",
    category: 'ramadhan',
    description: 'Tadarus akbar khataman Al-Qur\'an dan tausiyah hikmah turunnya Al-Qur\'an.',
    time: '08:00 - 12:00 WIB',
    location: 'Masjid SRT 1 Kediri',
    isImportant: true,
  },
  {
    id: 'evt-5',
    date: '2026-03-22',
    title: "Penerimaan & Distribusi Zakat Fitrah Siswa",
    category: 'sosial',
    description: 'Panitia Amil Zakat Sekolah menyalurkan zakat fitrah kepada mustahiq di lingkungan Kediri.',
    time: '08:00 - 14:00 WIB',
    location: 'Posko Amil Zakat SRT 1',
    isImportant: true,
  },
];
