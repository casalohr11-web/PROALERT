import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'globalThis.__MAPBOX_TOKEN__': JSON.stringify(env.VITE_MAPBOX_TOKEN || ''),
    },
  };
});
