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
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react', '@supabase/supabase-js'],
    },
    build: {
      target: 'es2020',
      minify: 'esbuild' as const,
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
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
