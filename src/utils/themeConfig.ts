export type ThemeId = 'emerald' | 'navy' | 'teal' | 'purple' | 'maroon' | 'slate' | 'amber';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  badge: string;
  colors: {
    primary: string; // hex
    primaryDark: string; // hex
    primaryLight: string; // hex
    accent: string; // hex
    headerGradientClass: string;
    headerBorderClass: string;
    headerGlowClass: string;
    bannerGradientClass: string;
    bannerBorderClass: string;
    activeTabClass: string;
    btnPrimaryClass: string;
    badgeClass: string;
    highlightBorderClass: string;
    footerBgClass: string;
    swatches: string[];
  };
  description: string;
}

export const THEME_CONFIGS: Record<ThemeId, ThemeConfig> = {
  emerald: {
    id: 'emerald',
    name: 'Hijau Zamrud',
    tagline: 'Nuansa Islami Klasik & Damai',
    badge: 'Default',
    description: 'Warna hijau zamrud khas pondok pesantren dan madrasah dengan aksen emas yang menenangkan.',
    colors: {
      primary: '#059669',
      primaryDark: '#022319',
      primaryLight: '#34d399',
      accent: '#fbbf24',
      headerGradientClass: 'bg-gradient-to-r from-[#022319] via-[#033627] to-[#011a12]',
      headerBorderClass: 'border-emerald-700/60',
      headerGlowClass: 'bg-emerald-500/10',
      bannerGradientClass: 'bg-gradient-to-r from-emerald-950 via-[#033425] to-emerald-950',
      bannerBorderClass: 'border-emerald-700/60',
      activeTabClass: 'bg-gradient-to-r from-amber-400 to-yellow-400 text-emerald-950 border-amber-300',
      btnPrimaryClass: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      highlightBorderClass: 'border-emerald-500',
      footerBgClass: 'bg-[#011710] border-emerald-900/80',
      swatches: ['#059669', '#022319', '#fbbf24'],
    },
  },
  navy: {
    id: 'navy',
    name: 'Biru Samudera',
    tagline: 'Modern, Akademis & Formal',
    badge: 'Favorit Sekolah',
    description: 'Warna biru laut dalam yang merefleksikan kedalaman ilmu, ketenangan, dan profesionalisme madrasah.',
    colors: {
      primary: '#2563eb',
      primaryDark: '#0a192f',
      primaryLight: '#60a5fa',
      accent: '#38bdf8',
      headerGradientClass: 'bg-gradient-to-r from-[#071526] via-[#0b2444] to-[#040e1b]',
      headerBorderClass: 'border-blue-700/60',
      headerGlowClass: 'bg-blue-500/15',
      bannerGradientClass: 'bg-gradient-to-r from-[#071526] via-[#0b2444] to-[#071526]',
      bannerBorderClass: 'border-blue-700/60',
      activeTabClass: 'bg-gradient-to-r from-sky-400 to-blue-400 text-blue-950 border-sky-300',
      btnPrimaryClass: 'bg-blue-700 hover:bg-blue-800 text-white',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
      highlightBorderClass: 'border-blue-500',
      footerBgClass: 'bg-[#040e1b] border-blue-900/80',
      swatches: ['#2563eb', '#071526', '#38bdf8'],
    },
  },
  teal: {
    id: 'teal',
    name: 'Hijau Tosca Pinus',
    tagline: 'Nuansa Alam, Segar & Sejuk',
    badge: 'Sejuk & Alami',
    description: 'Kombinasi hijau tosca dan nuansa pinus yang memberikan atmosfer teduh, ramah, dan menyejukkan mata.',
    colors: {
      primary: '#0d9488',
      primaryDark: '#042322',
      primaryLight: '#2dd4bf',
      accent: '#facc15',
      headerGradientClass: 'bg-gradient-to-r from-[#042322] via-[#083d3b] to-[#031918]',
      headerBorderClass: 'border-teal-700/60',
      headerGlowClass: 'bg-teal-500/15',
      bannerGradientClass: 'bg-gradient-to-r from-[#042322] via-[#083d3b] to-[#042322]',
      bannerBorderClass: 'border-teal-700/60',
      activeTabClass: 'bg-gradient-to-r from-teal-400 to-emerald-400 text-teal-950 border-teal-300',
      btnPrimaryClass: 'bg-teal-700 hover:bg-teal-800 text-white',
      badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
      highlightBorderClass: 'border-teal-500',
      footerBgClass: 'bg-[#031918] border-teal-900/80',
      swatches: ['#0d9488', '#042322', '#2dd4bf'],
    },
  },
  purple: {
    id: 'purple',
    name: 'Ungu Lembayung',
    tagline: 'Mulia, Karismatik & Agung',
    badge: 'Darul Ulum',
    description: 'Warna ungu lembayung yang melambangkan kemuliaan akhlak, martabat mulia, dan keagungan nilai tarbiyah.',
    colors: {
      primary: '#9333ea',
      primaryDark: '#200830',
      primaryLight: '#c084fc',
      accent: '#fbbf24',
      headerGradientClass: 'bg-gradient-to-r from-[#200830] via-[#350d4f] to-[#14041e]',
      headerBorderClass: 'border-purple-700/60',
      headerGlowClass: 'bg-purple-500/15',
      bannerGradientClass: 'bg-gradient-to-r from-[#200830] via-[#350d4f] to-[#200830]',
      bannerBorderClass: 'border-purple-700/60',
      activeTabClass: 'bg-gradient-to-r from-purple-400 to-amber-300 text-purple-950 border-purple-300',
      btnPrimaryClass: 'bg-purple-700 hover:bg-purple-800 text-white',
      badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
      highlightBorderClass: 'border-purple-500',
      footerBgClass: 'bg-[#14041e] border-purple-900/80',
      swatches: ['#9333ea', '#200830', '#c084fc'],
    },
  },
  maroon: {
    id: 'maroon',
    name: 'Merah Marun',
    tagline: 'Berwibawa, Tegas & Bersejarah',
    badge: 'Al-Azhar',
    description: 'Warna merah marun pekat yang merefleksikan semangat perjuangan, ketegasan visi, dan keberkahan ilmu.',
    colors: {
      primary: '#e11d48',
      primaryDark: '#25050e',
      primaryLight: '#fb7185',
      accent: '#fbbf24',
      headerGradientClass: 'bg-gradient-to-r from-[#25050e] via-[#3f0817] to-[#170308]',
      headerBorderClass: 'border-rose-700/60',
      headerGlowClass: 'bg-rose-500/15',
      bannerGradientClass: 'bg-gradient-to-r from-[#25050e] via-[#3f0817] to-[#25050e]',
      bannerBorderClass: 'border-rose-700/60',
      activeTabClass: 'bg-gradient-to-r from-rose-400 to-amber-300 text-rose-950 border-rose-300',
      btnPrimaryClass: 'bg-rose-700 hover:bg-rose-800 text-white',
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
      highlightBorderClass: 'border-rose-500',
      footerBgClass: 'bg-[#170308] border-rose-900/80',
      swatches: ['#e11d48', '#25050e', '#fbbf24'],
    },
  },
  slate: {
    id: 'slate',
    name: 'Midnight Slate',
    tagline: 'Minimalis, Netral & Kontemporer',
    badge: 'Modern Dark',
    description: 'Warna slate arang gelap yang bersih, profesional, berfokus tinggi pada data dan ramah untuk kerja malam.',
    colors: {
      primary: '#475569',
      primaryDark: '#0f172a',
      primaryLight: '#94a3b8',
      accent: '#38bdf8',
      headerGradientClass: 'bg-gradient-to-r from-[#0b1120] via-[#162238] to-[#070b14]',
      headerBorderClass: 'border-slate-700/60',
      headerGlowClass: 'bg-slate-400/10',
      bannerGradientClass: 'bg-gradient-to-r from-[#0b1120] via-[#162238] to-[#0b1120]',
      bannerBorderClass: 'border-slate-700/60',
      activeTabClass: 'bg-gradient-to-r from-slate-300 to-sky-300 text-slate-950 border-slate-300',
      btnPrimaryClass: 'bg-slate-700 hover:bg-slate-800 text-white',
      badgeClass: 'bg-slate-100 text-slate-900 border-slate-300',
      highlightBorderClass: 'border-slate-500',
      footerBgClass: 'bg-[#070b14] border-slate-900/80',
      swatches: ['#475569', '#0b1120', '#38bdf8'],
    },
  },
  amber: {
    id: 'amber',
    name: 'Kuning Madu & Emas',
    tagline: 'Hangat, Cendekia & Bersemangat',
    badge: 'Cendekia',
    description: 'Nuansa hangat keemasan yang melambangkan kecerdasan, pencerahan akal, dan kehangatan ukhuwah santri.',
    colors: {
      primary: '#d97706',
      primaryDark: '#261302',
      primaryLight: '#fcd34d',
      accent: '#f59e0b',
      headerGradientClass: 'bg-gradient-to-r from-[#261302] via-[#422006] to-[#180c01]',
      headerBorderClass: 'border-amber-700/60',
      headerGlowClass: 'bg-amber-500/15',
      bannerGradientClass: 'bg-gradient-to-r from-[#261302] via-[#422006] to-[#261302]',
      bannerBorderClass: 'border-amber-700/60',
      activeTabClass: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 border-amber-300',
      btnPrimaryClass: 'bg-amber-700 hover:bg-amber-800 text-white',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      highlightBorderClass: 'border-amber-500',
      footerBgClass: 'bg-[#180c01] border-amber-900/80',
      swatches: ['#d97706', '#261302', '#f59e0b'],
    },
  },
};

export const ALL_THEMES: ThemeConfig[] = Object.values(THEME_CONFIGS);

export const DEFAULT_THEME_ID: ThemeId = 'emerald';

export function getTheme(id?: string): ThemeConfig {
  if (id && id in THEME_CONFIGS) {
    return THEME_CONFIGS[id as ThemeId];
  }
  return THEME_CONFIGS[DEFAULT_THEME_ID];
}

export function applyThemeToDocument(themeId?: string): void {
  const theme = getTheme(themeId);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme.id);
    document.documentElement.style.setProperty('--theme-primary', theme.colors.primary);
    document.documentElement.style.setProperty('--theme-primary-dark', theme.colors.primaryDark);
    document.documentElement.style.setProperty('--theme-accent', theme.colors.accent);
  }
}
