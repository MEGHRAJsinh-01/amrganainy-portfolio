import path from 'path';
import { defineConfig } from 'vite';
import vitePluginSpa from './src/vite-spa-plugin';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vitePluginSpa()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    server: {
      port: 5173
    }
  };
});
