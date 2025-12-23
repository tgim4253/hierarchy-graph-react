import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

const hierarchySrc = fileURLToPath(
  new URL('../../packages/hierarchy-graph-react/src', import.meta.url),
);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@tgim/hierarchy-graph-react': hierarchySrc,
    },
  },
});
