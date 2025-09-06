/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_EMAILJS_PUBLIC_KEY: string;
    readonly VITE_EMAILJS_PRIVATE_KEY: string;
    readonly VITE_EMAILJS_SERVICE_ID: string;
    readonly VITE_EMAILJS_TEMPLATE_ID: string;
    readonly VITE_ADMIN_PASSWORD: string;
    readonly VITE_RAPIDAPI_KEY: string;
    // add more env variables as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
