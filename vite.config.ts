import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function versionGeneratorPlugin(): Plugin {
  return {
    name: 'version-generator',
    buildStart() {
      const buildInfo = {
        version: '1.0.1',
        buildTime: Date.now(),
        builtAt: new Date().toISOString(),
      };
      try {
        const publicDir = path.resolve(__dirname, 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(
          path.resolve(publicDir, 'version.json'),
          JSON.stringify(buildInfo, null, 2),
          'utf-8'
        );
      } catch (e) {
        console.warn('Failed to write public/version.json', e);
      }
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify(
          {
            version: '1.0.1',
            buildTime: Date.now(),
            builtAt: new Date().toISOString(),
          },
          null,
          2
        ),
      });
    },
  };
}

const currentBuildTime = Date.now();

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), versionGeneratorPlugin()],
    define: {
      __APP_BUILD_TIME__: JSON.stringify(currentBuildTime),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'es2020',
      minify: 'esbuild',
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vendor libraries splitting
            if (id.includes('node_modules')) {
              if (
                id.includes('react') ||
                id.includes('react-dom') ||
                id.includes('scheduler') ||
                id.includes('motion') ||
                id.includes('lucide-react')
              ) {
                return 'vendor-core';
              }
              if (
                id.includes('jspdf') ||
                id.includes('html2canvas') ||
                id.includes('canvg') ||
                id.includes('dompurify')
              ) {
                return 'vendor-pdf';
              }
              if (
                id.includes('html5-qrcode') ||
                id.includes('qrcode') ||
                id.includes('jsbarcode')
              ) {
                return 'vendor-scanner';
              }
              if (id.includes('@supabase') || id.includes('canvas-confetti')) {
                return 'vendor-utils';
              }
              return 'vendor-libs';
            }
            // Split huge static Islamic texts and data
            if (id.includes('/src/data/shortSurahsData') || id.includes('/src/data/yasinData') || id.includes('/src/data/tahlilData')) {
              return 'data-quran-tahlil';
            }
            if (id.includes('/src/data/sholatGuideData') || id.includes('/src/data/dzikirSholatData') || id.includes('/src/data/dailyPrayersData') || id.includes('/src/data/mahalulQiyamData')) {
              return 'data-ibadah-guide';
            }
            if (id.includes('/src/data/students') || id.includes('/src/data/studentPhotos')) {
              return 'data-students';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
