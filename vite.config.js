// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

// Path: vite.config.js (สร้างไฟล์นี้ใน root ของ frontend)

// Path: vite.config.js - แก้ไขใหม่ใช้ plugin เดิม

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'  // ใช้ SWC plugin ที่มีอยู่แล้ว

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5555',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})