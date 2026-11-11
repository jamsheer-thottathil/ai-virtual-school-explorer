import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages notes
 * ------------------
 * `base: './'` makes every built asset path relative, so the same build works at
 *   https://<user>.github.io/<repo>/   (project pages)
 *   https://<user>.github.io/           (user/organisation pages)
 *   a custom domain, or any sub-folder.
 * Routing uses a HashRouter (URLs like  /#/campus/library ), so deep links and
 * page refreshes never hit a GitHub Pages 404.
 *
 * You can still force an absolute base with the VITE_BASE environment variable,
 * e.g.  VITE_BASE=/my-repo/ npm run build
 */
export default defineConfig({
  base: process.env.VITE_BASE ?? './',
  plugins: [react()],
  build: {
    target: 'es2019',
    outDir: 'dist',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pannellum')) return 'vendor-pannellum';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react-router') || id.includes('@remix-run')) return 'vendor-router';
            if (id.includes('react')) return 'vendor-react';
          }
          return undefined;
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 4173
  }
});
