import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
    plugins: [react()],
    root: fileURLToPath(new URL('.', import.meta.url)),
    base: '/',
    server: {
        port: 5174,
    },
});
