import React, { useState } from 'react';
import { AdminSettings } from '../types';
import { ALL_THEMES, ThemeId, getTheme } from '../utils/themeConfig';
import {
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  School,
  Save,
  CheckCircle2,
  Sliders,
  Layers,
  Moon,
} from 'lucide-react';

interface ThemeSettingsSectionProps {
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (settings: AdminSettings) => void;
  isSupabaseConnected?: boolean;
}

export const ThemeSettingsSection: React.FC<ThemeSettingsSectionProps> = ({
  adminSettings,
  onUpdateAdminSettings,
  isSupabaseConnected = false,
}) => {
  const currentThemeId = (adminSettings.colorTheme as ThemeId) || 'emerald';
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(currentThemeId);
  const [schoolName, setSchoolName] = useState(
    adminSettings.schoolName || "SMP-SMA TAHFIDZ AL-QUR'AN"
  );
  const [schoolSubName, setSchoolSubName] = useState(
    adminSettings.schoolSubName || 'SR 1 KEDIRI'
  );
  const [showTopBanner, setShowTopBanner] = useState<boolean>(
    adminSettings.showTopBanner !== false
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const activePreviewTheme = getTheme(selectedThemeId);
  const hasChanges =
    selectedThemeId !== currentThemeId ||
    schoolName !== (adminSettings.schoolName || "SMP-SMA TAHFIDZ AL-QUR'AN") ||
    schoolSubName !== (adminSettings.schoolSubName || 'SR 1 KEDIRI') ||
    showTopBanner !== (adminSettings.showTopBanner !== false);

  const handleSelectTheme = (id: ThemeId) => {
    setSelectedThemeId(id);
    setSavedSuccess(false);
  };

  const handleSave = () => {
    const updatedSettings: AdminSettings = {
      ...adminSettings,
      colorTheme: selectedThemeId,
      schoolName: schoolName.trim() || "SMP-SMA TAHFIDZ AL-QUR'AN",
      schoolSubName: schoolSubName.trim() || 'SR 1 KEDIRI',
      showTopBanner: showTopBanner,
    };
    onUpdateAdminSettings(updatedSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3500);
  };

  const handleResetDefault = () => {
    setSelectedThemeId('emerald');
    setSchoolName("SMP-SMA TAHFIDZ AL-QUR'AN");
    setSchoolSubName('SR 1 KEDIRI');
    setShowTopBanner(true);
    const resetSettings: AdminSettings = {
      ...adminSettings,
      colorTheme: 'emerald',
      schoolName: "SMP-SMA TAHFIDZ AL-QUR'AN",
      schoolSubName: 'SR 1 KEDIRI',
      showTopBanner: true,
    };
    onUpdateAdminSettings(resetSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3500);
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
            <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                Tema Warna & Identitas Sekolah
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200">
                Kustomisasi Lembaga
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Ubah tema aksen warna aplikasi dan nama instansi sesuai identitas pondok/sekolah.
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 shrink-0">
          {savedSuccess && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-in fade-in zoom-in-95">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tema Berhasil Diterapkan!</span>
            </span>
          )}
          {hasChanges && !savedSuccess && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <span>Ada Perubahan Belum Disimpan</span>
            </span>
          )}
        </div>
      </div>

      <div className="p-3.5 sm:p-4 space-y-4">
        {/* Theme Palettes Grid */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              <span>Pilih Palet Warna Aksen (7 Pilihan Tema)</span>
            </span>
            <span className="text-[11px] font-normal text-gray-500">
              Tema aktif: <strong className="text-gray-900 capitalize">{activePreviewTheme.name}</strong>
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {ALL_THEMES.map((theme) => {
              const isSelected = selectedThemeId === theme.id;
              const isCurrentSaved = currentThemeId === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`text-left p-3 rounded-xl border-2 transition-all relative overflow-hidden cursor-pointer active:scale-[0.98] ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/40 shadow-sm ring-2 ring-purple-400/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/70'
                  }`}
                >
                  {/* Swatches Visual Indicator */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {theme.colors.swatches.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      {isCurrentSaved && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-gray-100 text-gray-700 border border-gray-300">
                          Tersimpan
                        </span>
                      )}
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200">
                        {theme.badge}
                      </span>
                    </div>
                  </div>

                  {/* Theme Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-gray-900 truncate">{theme.name}</p>
                      {isSelected && (
                        <span className="p-0.5 rounded-full bg-purple-600 text-white shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-purple-900/80 font-medium truncate mt-0.5">
                      {theme.tagline}
                    </p>
                    <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 leading-snug">
                      {theme.description}
                    </p>
                  </div>

                  {/* Visual bottom accent bar */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{
                      background: `linear-gradient(to right, ${theme.colors.primaryDark}, ${theme.colors.primary}, ${theme.colors.accent})`,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Interactive Preview Box */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 sm:p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Pratinjau Langsung Komponen UI:</span>
            </span>
            <span className="text-[10px] text-gray-500 font-medium">
              Warna: {activePreviewTheme.name}
            </span>
          </div>

          {/* Mini Header Mockup */}
          <div
            className={`p-3 rounded-lg text-white shadow-xs border ${activePreviewTheme.colors.headerGradientClass} ${activePreviewTheme.colors.headerBorderClass} relative overflow-hidden`}
          >
            <div className="flex items-center justify-between gap-2 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                  <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
                </div>
                <div>
                  <p className="text-xs font-black tracking-tight text-white leading-tight">
                    {schoolName || "SMP-SMA TAHFIDZ AL-QUR'AN"}
                  </p>
                  <p className="text-[10px] text-amber-300 font-bold">
                    {schoolSubName || 'SR 1 KEDIRI'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold shadow-2xs ${activePreviewTheme.colors.activeTabClass}`}
                >
                  ✓ Presensi Puasa
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 border border-white/20 text-white">
                  Raport Santri
                </span>
              </div>
            </div>
          </div>

          {/* Mini Card & Buttons Mockup */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Tombol Aksi Utama</span>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-2xs ${activePreviewTheme.colors.btnPrimaryClass}`}
              >
                Simpan Presensi
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Badge & Pill</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${activePreviewTheme.colors.badgeClass}`}
              >
                101 Santri Berpuasa
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Status Aksen</span>
              <div className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activePreviewTheme.colors.primary }}
                />
                <span className="text-xs font-bold text-gray-800">
                  {activePreviewTheme.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* School Name & Sub-name Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-gray-500" />
              <span>Nama Lembaga / Sekolah</span>
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => {
                setSchoolName(e.target.value);
                setSavedSuccess(false);
              }}
              placeholder="Contoh: SMP-SMA TAHFIDZ AL-QUR'AN"
              className="w-full p-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-gray-500" />
              <span>Cabang / Sub-Judul Header</span>
            </label>
            <input
              type="text"
              value={schoolSubName}
              onChange={(e) => {
                setSchoolSubName(e.target.value);
                setSavedSuccess(false);
              }}
              placeholder="Contoh: SR 1 KEDIRI / PONDOK PESANTREN"
              className="w-full p-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600 font-medium"
            />
          </div>
        </div>

        {/* Banner Carousel Visibility Toggle */}
        <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">
                Tampilkan Banner Slider Slim di Atas
              </p>
              <p className="text-[11px] text-gray-500">
                Menampilkan banner geser bertema Ramadhan, hadits keutamaan puasa, dan kalender kegiatan di halaman utama.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={showTopBanner}
              onChange={(e) => {
                setShowTopBanner(e.target.checked);
                setSavedSuccess(false);
              }}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Kembalikan ke Default (Hijau Zamrud)</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto ${
                savedSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-purple-700 hover:bg-purple-800 active:scale-95'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tema Tersimpan & Aktif</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan & Terapkan Tema</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
