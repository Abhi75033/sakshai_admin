/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['"Playfair Display"', 'serif'],
            },
            colors: {
                gold: '#C9A84C',
            },
        },
    },
    plugins: [],
};
