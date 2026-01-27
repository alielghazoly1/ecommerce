import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // يسمح لأي جهاز في الشبكة يدخل
    port: 5174, // البورت اللي عايز تفتح عليه
    strictPort: true, // لو البورت مستخدم هيطلع خطأ بدل ما يغيره
  },
});
