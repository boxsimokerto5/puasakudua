export interface AppBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl?: string;
  tagline?: string;
  bgGradient: string;
  accentColor: string;
  borderColor: string;
  actionText?: string;
  actionType?: 'prayer' | 'calendar' | 'surah' | 'wisdom';
}

export const DEFAULT_APP_BANNERS: AppBanner[] = [
  {
    id: 'banner-1',
    title: 'Marhaban Ya Ramadhan',
    subtitle: 'Bulan Penuh Berkah, Maghfirah & Peningkatan Ketaqwaan Santri',
    tagline: 'SMP-SMA TAHFIDZ AL-QUR\'AN',
    badge: '✨ Ramadhan Kareem',
    bgGradient: 'from-[#022c20] via-[#044431] to-[#011c14]',
    accentColor: '#fbbf24',
    borderColor: 'border-amber-400/40',
    actionText: 'Buka Kalender',
    actionType: 'calendar',
  },
  {
    id: 'banner-2',
    title: 'Puasa Menjernihkan Jiwa & Fikiran',
    subtitle: 'Siapa yang berpuasa Ramadhan karena iman dan mengharap pahala, diampuni dosa yang telah lalu.',
    tagline: 'HR. Bukhari & Muslim',
    badge: '📖 Hadits Shahih',
    bgGradient: 'from-[#071930] via-[#0d2f5a] to-[#051326]',
    accentColor: '#38bdf8',
    borderColor: 'border-sky-400/40',
    actionText: 'Baca Mutiara Puasa',
    actionType: 'wisdom',
  },
  {
    id: 'banner-3',
    title: 'Disiplin Waktu Imsak & Buka Puasa',
    subtitle: 'Pantau ketepatan jadwal sholat 5 waktu dan tadarus Al-Qur\'an setiap hari.',
    tagline: 'Taqwa, Disiplin & Istiqomah',
    badge: '⏰ Jadwal Imsakiyah',
    bgGradient: 'from-[#1c0828] via-[#35124c] to-[#12041b]',
    accentColor: '#c084fc',
    borderColor: 'border-purple-400/40',
    actionText: 'Jadwal Sholat',
    actionType: 'prayer',
  },
  {
    id: 'banner-4',
    title: 'Tilawah & Murottal Al-Qur\'an',
    subtitle: 'Tingkatkan hafalan Juz \'Amma, Surat Yasin, Tahlil dan Dzikir ba\'da sholat.',
    tagline: 'Generasi Qur\'ani Berakhlak Mulia',
    badge: '🌿 Juz \'Amma & Yasin',
    bgGradient: 'from-[#042322] via-[#0a4846] to-[#021817]',
    accentColor: '#2dd4bf',
    borderColor: 'border-teal-400/40',
    actionText: 'Buka Al-Qur\'an',
    actionType: 'surah',
  },
];
