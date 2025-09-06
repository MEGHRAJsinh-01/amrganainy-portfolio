/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Space Grotesk', 'Noto Sans', 'sans-serif'],
            },
            colors: {
                primary: '#1173d4',
            }
        },
    },
    plugins: [],
}
