import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(import.meta.dirname, 'client'),
  publicDir: path.resolve(import.meta.dirname, 'client', 'public'),
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'client', 'src') } },
  build: { outDir: path.resolve(import.meta.dirname, 'dist'), emptyOutDir: true },
  server: { host: '0.0.0.0', port: 4321, strictPort: true },
  preview: { host: '0.0.0.0', port: 4321, strictPort: true },
});
