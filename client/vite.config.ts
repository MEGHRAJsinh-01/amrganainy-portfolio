import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';

export default defineConfig(({ mode }) => {
  // Load environment variables from the correct file based on mode
  const envFile = mode === 'production' ? '.env.production.frontend' : '.env.local';

  // Load environment variables from the client directory
  const clientEnvPath = '.';

  // Check if env file exists in client directory
  let env: Record<string, string> = { GEMINI_API_KEY: '' };
  if (fs.existsSync(envFile)) {
    env = loadEnv(mode, clientEnvPath, ['VITE_', 'API_', 'GEMINI_']);
  } else {
    // Fallback to checking .env.local
    const fallbackFile = '.env.local';
    if (fs.existsSync(fallbackFile)) {
      env = loadEnv(mode, clientEnvPath, ['VITE_', 'API_', 'GEMINI_']);
    }
  }

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
