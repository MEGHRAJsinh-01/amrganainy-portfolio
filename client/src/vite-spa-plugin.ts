import { Plugin } from 'vite';

// This plugin adds middleware to handle SPA routing
export default function vitePluginSpa(): Plugin {
  return {
    name: 'vite-plugin-spa',
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          // If the request doesn't match a file, serve index.html
          if (req.url?.startsWith('/multi-user') || 
              req.url?.startsWith('/login') || 
              req.url?.startsWith('/register') || 
              req.url?.startsWith('/dashboard') ||
              req.url?.startsWith('/u/') ||
              req.url?.startsWith('/admin') ||
              req.url?.startsWith('/forgot-password')) {
            req.url = '/';
          }
          next();
        });
      };
    },
  };
}
