import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';

export default defineConfig(({ mode }) => {
  // Load environment variables from the correct file based on mode
  const envFile = mode === 'production' ? '.env.production.frontend' : '.env.local';

  // Make sure the env file exists, fallback to .env.local if not
  const env = fs.existsSync(envFile)
    ? loadEnv(mode, '.', ['VITE_', 'API_', 'GEMINI_'])
    : loadEnv(mode, '.', ['VITE_', 'API_', 'GEMINI_']);

  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
