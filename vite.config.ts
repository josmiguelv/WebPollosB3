import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

const defaultApiBase = 'https://surprise-kong-stories-brand.trycloudflare.com';

export default defineConfig(({ mode }) => {
  // El .env está en la raíz del proyecto, no dentro de /client.
  const envRoot = path.resolve(import.meta.dirname);
  const env = loadEnv(mode, envRoot, 'VITE_B3_');
  const configured = env.VITE_B3_API_BASE_URL?.trim()
    || env.VITE_B3_MOBILE_CONFIG_URL?.trim()
    || defaultApiBase;
  const apiUrl = new URL(configured);
  if (apiUrl.protocol !== 'https:' || apiUrl.username || apiUrl.password) {
    throw new Error('VITE_B3_API_BASE_URL debe ser un enlace HTTPS sin credenciales.');
  }
  const origin = apiUrl.origin;
  // Autorizar únicamente el túnel público actual de la Carta, no todos los hosts.
  // Al cambiar el túnel, Vite también permite añadir el nuevo dominio mediante
  // __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS (definido antes de arrancar Vite).
  const allowedHosts = ['earthquake-represents-hiv-valentine.trycloudflare.com'];
  const mobileProxy = {
    '/b3-mobile-config': {
      target: origin, changeOrigin: true, secure: true,
      rewrite: (url: string) => url.replace(/^\/b3-mobile-config/, '/api/v1/mobile/config'),
    },
    '/b3-mobile-api': {
      target: origin, changeOrigin: true, secure: true,
      rewrite: (url: string) => url.replace(/^\/b3-mobile-api/, '/api/v1/mobile'),
    },
    '/b3-mobile-images': {
      target: origin, changeOrigin: true, secure: true,
      rewrite: (url: string) => url.replace(/^\/b3-mobile-images/, '/api/v1/mobile/images'),
    },
  };
  return {
    plugins: [react()],
    root: path.resolve(import.meta.dirname, 'client'),
    envDir: envRoot,
    publicDir: path.resolve(import.meta.dirname, 'client', 'public'),
    resolve: { alias: { '@': path.resolve(import.meta.dirname, 'client', 'src') } },
    build: { outDir: path.resolve(import.meta.dirname, 'dist'), emptyOutDir: true },
    server: { host: '0.0.0.0', port: 4321, strictPort: true, allowedHosts, proxy: mobileProxy },
    preview: { host: '0.0.0.0', port: 4321, strictPort: true, allowedHosts, proxy: mobileProxy },
  };
});
