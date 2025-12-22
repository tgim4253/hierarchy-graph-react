import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

const chessTreeSrc = fileURLToPath(new URL('../../packages/chess-tree-react/src', import.meta.url));
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
      'chess-tree-react': chessTreeSrc,
      'hierarchy-graph-react': hierarchySrc,
    },
  },
});
