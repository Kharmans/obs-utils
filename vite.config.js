import { svelte } from '@sveltejs/vite-plugin-svelte';

const config = {
  base: '/modules/obs-utils/',
  resolve: { conditions: ['import', 'browser'] },
  esbuild: {
    target: ['es2022', 'chrome100'],
    keepNames: true, // Note: doesn't seem to work.
  },
  server: {
    port: 30001,
    open: true,
    proxy: {
      '^(?!/modules/obs-utils/)': 'http://localhost:30000/',
      '/socket.io': {
        target: 'ws://localhost:30000',
        ws: true,
      },
    },
  },
  plugins: [svelte()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    brotliSize: true,
    minify: 'terser',
    lib: {
      name: 'obs-utils',
      entry: 'src/obs-utils.ts',
      formats: ['es'],
      fileName: 'obs-utils',
    },
  },
};

export default config;
