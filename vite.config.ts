import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures assets are loaded with relative paths on GitHub Pages
  server: {
    host: true,
    port: 3000,
    open: false
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks: {
          playcanvas: ['playcanvas']
        }
      }
    }
  }
});
