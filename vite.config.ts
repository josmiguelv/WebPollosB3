import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

const defaultMobileEndpoint = 'https://surprise-kong-stories-brand.trycloudflare.com/api/v1/mobile/config?appId=com.integrab2g.pollosb3';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname, 'client'), 'VITE_B3_');
  const origin = new URL(env.VITE_B3_MOBILE_CONFIG_URL || defaultMobileEndpoint).origin;
  const mobileProxy = {
    '/b3-mobile-config': {
      target: origin, changeOrigin: true, secure: true,
      rewrite: (url: string) => url.replace(/^\/b3-mobile-config/, '/api/v1/mobile/config'),
    },
    '/b3-mobile-images': {
      target: origin, changeOrigin: true, secure: true,
      rewrite: (url: string) => url.replace(/^\/b3-mobile-images/, '/api/v1/mobile/images'),
    },
  };
  return {
    plugins: [react()],
    root: path.resolve(import.meta.dirname, 'client'),
    publicDir: path.resolve(import.meta.dirname, 'client', 'public'),
    resolve: { alias: { '@': path.resolve(import.meta.dirname, 'client', 'src') } },
    build: { outDir: path.resolve(import.meta.dirname, 'dist'), emptyOutDir: true },
    server: { host: '0.0.0.0', port: 4321, strictPort: true, proxy: mobileProxy },
    preview: { host: '0.0.0.0', port: 4321, strictPort: true, proxy: mobileProxy },
  };
});
