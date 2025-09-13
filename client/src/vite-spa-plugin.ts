import { Plugin } from 'vite';

// This plugin adds middleware to handle SPA routing
export default function vitePluginSpa(): Plugin {
    return {
        name: 'vite-plugin-spa',
        configureServer(server) {
            return () => {
                server.middlewares.use((req, res, next) => {
                    // For hash-based routing, we don't need to redirect in the dev server
                    // Just serve the index.html for all SPA routes
                    if (req.url?.startsWith('/multi-user') ||
                        req.url?.startsWith('/login') ||
                        req.url?.startsWith('/register') ||
                        req.url?.startsWith('/dashboard') ||
                        req.url?.startsWith('/u/') ||
                        req.url?.startsWith('/admin') ||
                        req.url?.startsWith('/forgot-password')) {
                        // Serve index.html but don't modify the URL
                        // This allows HashRouter to handle the route properly
                    }
                    next();
                });
            };
        },
    };
}
