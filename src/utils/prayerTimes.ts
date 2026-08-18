export interface PrayerSchedule {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  dateStr: string;
  hijriDateStr: string;
  locationName: string;
}

export interface PrayerItemInfo {
  key: 'imsak' | 'subuh' | 'terbit' | 'dhuha' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';
  name: string;
  arabic: string;
  time: string; // "04:15"
  isNext: boolean;
  isActive: boolean;
  iconName: string;
  description: string;
}

export interface NextPrayerInfo {
  name: string;
  arabic: string;
  key: string;
  time: string;
  remainingMinutes: number;
  remainingSeconds: number;
  formattedCountdown: string; // e.g. "01:25:40"
  isImsakOrMaghrib: boolean; // special for fasting
}

export interface CityLocation {
  name: string;
  lat: number;
  lng: number;
  timezone: number; // e.g. 7 for WIB
}

export const INDONESIA_CITIES: CityLocation[] = [
  { name: 'Kediri (SRT 1)', lat: -7.8167, lng: 112.0167, timezone: 7 },
  { name: 'Surabaya', lat: -7.2575, lng: 112.7521, timezone: 7 },
  { name: 'Malang', lat: -7.9797, lng: 112.6304, timezone: 7 },
  { name: 'Yogyakarta', lat: -7.7956, lng: 110.3695, timezone: 7 },
  { name: 'Semarang', lat: -6.9667, lng: 110.4167, timezone: 7 },
  { name: 'Bandung', lat: -6.9175, lng: 107.6191, timezone: 7 },
  { name: 'Jakarta (WIB)', lat: -6.2088, lng: 106.8456, timezone: 7 },
  { name: 'Makassar (WITA)', lat: -5.1477, lng: 119.4327, timezone: 8 },
  { name: 'Jayapura (WIT)', lat: -2.5337, lng: 140.7181, timezone: 9 },
];

/**
 * Standard Solar Ephemeris & Prayertimes Calculation (Standard Kemenag RI / MABIMS)
 * Fajr: 20 deg, Isha: 18 deg, Imsak: 10 mins before Fajr, Ihtiyat: +2 minutes.
 */
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180.0;
}

function radToDeg(rad: number): number {
  return (rad * 180.0) / Math.PI;
}

function normalizeHours(h: number): number {
  let res = h - 24.0 * Math.floor(h / 24.0);
  if (res < 0) res += 24.0;
  return res;
}

function formatTwoDigits(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function calculateDayPrayerTimes(
  date: Date,
  lat = -7.8167,
  lng = 112.0167,
  tz = 7
): {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
} {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Fractional year in radians
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);

  // Equation of time in minutes
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar declination in radians
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const phi = degToRad(lat);

  // Solar transit (Solar Noon) in decimal hours
  const noon = normalizeHours(12 + tz - lng / 15 - eqtime / 60);

  // Helper to compute hour angle for a given solar altitude angle (alpha in degrees)
  const hourAngle = (alphaDeg: number) => {
    const alpha = degToRad(alphaDeg);
    const cosHA = (Math.sin(alpha) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return Math.PI;
    return Math.acos(cosHA);
  };

  // Sun angles for Indonesia (Kemenag standard)
  const fajrAngle = -20; // Subuh: -20°
  const sunriseAngle = -0.833; // Terbit: -50 arcminutes
  const dhuhaAngle = 4.5; // Dhuha: ~4.5° above horizon
  const ishaAngle = -18; // Isya: -18°

  // Asr hour angle (Shafi'i: shadow length factor = 1)
  const asrAltRad = Math.atan(1 / (1 + Math.tan(Math.abs(phi - decl))));
  const asrHA = Math.acos(
    (Math.sin(asrAltRad) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl))
  );

  const haFajr = hourAngle(fajrAngle);
  const haSunrise = hourAngle(sunriseAngle);
  const haDhuha = hourAngle(dhuhaAngle);
  const haIsha = hourAngle(ishaAngle);

  // Times in decimal hours (with 2-minute safety ihtiyat)
  const ihtiyatHours = 2 / 60; // +2 minutes standard Kemenag safety buffer

  const subuhH = noon - radToDeg(haFajr) / 15 + ihtiyatHours;
  const imsakH = subuhH - 10 / 60; // 10 minutes before Subuh
  const terbitH = noon - radToDeg(haSunrise) / 15 - ihtiyatHours;
  const dhuhaH = noon - radToDeg(haDhuha) / 15 + ihtiyatHours;
  const dzuhurH = noon + ihtiyatHours;
  const asharH = noon + radToDeg(asrHA) / 15 + ihtiyatHours;
  const maghribH = noon + radToDeg(haSunrise) / 15 + ihtiyatHours;
  const isyaH = noon + radToDeg(haIsha) / 15 + ihtiyatHours;

  const toTimeString = (decHours: number): string => {
    const norm = normalizeHours(decHours);
    const h = Math.floor(norm);
    const m = Math.floor((norm - h) * 60);
    return `${formatTwoDigits(h)}:${formatTwoDigits(m)}`;
  };

  return {
    imsak: toTimeString(imsakH),
    subuh: toTimeString(subuhH),
    terbit: toTimeString(terbitH),
    dhuha: toTimeString(dhuhaH),
    dzuhur: toTimeString(dzuhurH),
    ashar: toTimeString(asharH),
    maghrib: toTimeString(maghribH),
    isya: toTimeString(isyaH),
  };
}

/**
 * Calculates countdown and active/next prayer based on current time
 */
export function getPrayerLiveStatus(
  currentDate = new Date(),
  city: CityLocation = INDONESIA_CITIES[0]
): {
  schedule: PrayerSchedule;
  items: PrayerItemInfo[];
  nextPrayer: NextPrayerInfo;
  activePrayer: PrayerItemInfo;
} {
  const times = calculateDayPrayerTimes(currentDate, city.lat, city.lng, city.timezone);

  const formattedDate = currentDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Hijri estimation
  const hijriDateStr = getHijriDateApprox(currentDate);

  const schedule: PrayerSchedule = {
    ...times,
    dateStr: formattedDate,
    hijriDateStr,
    locationName: city.name,
  };

  // Convert current time to seconds of the day
  const currentSec =
    currentDate.getHours() * 3600 +
    currentDate.getMinutes() * 60 +
    currentDate.getSeconds();

  const parseTimeToSeconds = (tStr: string) => {
    const [hh, mm] = tStr.split(':').map(Number);
    return hh * 3600 + mm * 60;
  };

  const rawPrayers: {
    key: PrayerItemInfo['key'];
    name: string;
    arabic: string;
    time: string;
    icon: string;
    desc: string;
  }[] = [
    {
      key: 'imsak',
      name: 'Imsak',
      arabic: 'الإمساك',
      time: times.imsak,
      icon: 'Moon',
      desc: 'Batas akhir makan sahur sebelum fajar',
    },
    {
      key: 'subuh',
      name: 'Subuh',
      arabic: 'الفجر',
      time: times.subuh,
      icon: 'Sunrise',
      desc: 'Mulai terbit fajar shadiq & awal puasa',
    },
    {
      key: 'terbit',
      name: 'Terbit (Syuruq)',
      arabic: 'الشروق',
      time: times.terbit,
      icon: 'Sun',
      desc: 'Batas akhir waktu shalat Subuh',
    },
    {
      key: 'dhuha',
      name: 'Dhuha',
      arabic: 'الضحى',
      time: times.dhuha,
      icon: 'SunDim',
      desc: 'Waktu shalat sunnah Dhuha',
    },
    {
      key: 'dzuhur',
      name: 'Dzuhur',
      arabic: 'الظهر',
      time: times.dzuhur,
      icon: 'SunMedium',
      desc: 'Matahari tergelincir dari tengah langit',
    },
    {
      key: 'ashar',
      name: 'Ashar',
      arabic: 'العصر',
      time: times.ashar,
      icon: 'Sunset',
      desc: 'Bayangan benda sama panjang dengan aslinya',
    },
    {
      key: 'maghrib',
      name: 'Maghrib (Buka)',
      arabic: 'المغرب',
      time: times.maghrib,
      icon: 'MoonStar',
      desc: 'Matahari terbenam & waktu berbuka puasa',
    },
    {
      key: 'isya',
      name: 'Isya & Tarawih',
      arabic: 'العشاء',
      time: times.isya,
      icon: 'Sparkles',
      desc: 'Hilangnya mega merah & shalat Tarawih',
    },
  ];

  // Find next and active prayer
  let nextIdx = -1;
  for (let i = 0; i < rawPrayers.length; i++) {
    const prayerSec = parseTimeToSeconds(rawPrayers[i].time);
    if (prayerSec > currentSec) {
      nextIdx = i;
      break;
    }
  }

  let nextPrayerTargetSec = 0;
  let nextPrayerRaw = rawPrayers[0];

  if (nextIdx === -1) {
    // Past Isya, next is tomorrow's Imsak
    nextPrayerRaw = rawPrayers[0];
    nextPrayerTargetSec = 24 * 3600 + parseTimeToSeconds(rawPrayers[0].time);
  } else {
    nextPrayerRaw = rawPrayers[nextIdx];
    nextPrayerTargetSec = parseTimeToSeconds(rawPrayers[nextIdx].time);
  }

  const diffSec = Math.max(0, nextPrayerTargetSec - currentSec);
  const remH = Math.floor(diffSec / 3600);
  const remM = Math.floor((diffSec % 3600) / 60);
  const remS = diffSec % 60;

  const formattedCountdown = `${formatTwoDigits(remH)}:${formatTwoDigits(remM)}:${formatTwoDigits(remS)}`;

  const activeIdx = nextIdx === -1 ? rawPrayers.length - 1 : (nextIdx - 1 + rawPrayers.length) % rawPrayers.length;

  const items: PrayerItemInfo[] = rawPrayers.map((p, idx) => ({
    key: p.key,
    name: p.name,
    arabic: p.arabic,
    time: p.time,
    isNext: idx === nextIdx || (nextIdx === -1 && idx === 0),
    isActive: idx === activeIdx,
    iconName: p.icon,
    description: p.desc,
  }));

  const nextPrayer: NextPrayerInfo = {
    name: nextPrayerRaw.name,
    arabic: nextPrayerRaw.arabic,
    key: nextPrayerRaw.key,
    time: nextPrayerRaw.time,
    remainingMinutes: Math.floor(diffSec / 60),
    remainingSeconds: diffSec,
    formattedCountdown,
    isImsakOrMaghrib: nextPrayerRaw.key === 'imsak' || nextPrayerRaw.key === 'maghrib' || nextPrayerRaw.key === 'subuh',
  };

  return {
    schedule,
    items,
    nextPrayer,
    activePrayer: items[activeIdx],
  };
}

/**
 * Approximate Hijri date converter for display
 */
export function getHijriDateApprox(date: Date): string {
  try {
    const intlHijri = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
    return intlHijri;
  } catch {
    return '1447 H';
  }
}
