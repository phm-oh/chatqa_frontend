# Frontend Dockerfile - Hash-based SPA
# Stage 1: Build React App with Vite

FROM node:18-alpine as builder

# Set working directory ใน container
WORKDIR /app

# คัดลอก package files ก่อน (เพื่อ Docker layer caching)
COPY package*.json ./

# ติดตั้ง dependencies (รวม devDependencies เพื่อ build)
RUN npm ci --silent

# คัดลอกโค้ดทั้งหมดจาก local ไป /app ใน container
COPY . .

# Build React app ด้วย Vite (สร้าง dist/ folder)
# ตาม "build" script ใน package.json = "vite build"
RUN npm run build

# ตรวจสอบว่า build สำเร็จ
RUN ls -la dist/ && test -f dist/index.html

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# คัดลอก nginx config ที่เราสร้างสำหรับ Hash-based SPA
COPY nginx.conf /etc/nginx/nginx.conf

# คัดลอก built files จาก stage 1 ไป nginx serving directory
COPY --from=builder /app/dist /usr/share/nginx/html

# ตรวจสอบว่าไฟล์คัดลอกถูกต้อง
RUN ls -la /usr/share/nginx/html/ && test -f /usr/share/nginx/html/index.html

# เปิด port 80 (nginx default)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

# รัน nginx (serve React static files)
CMD ["nginx", "-g", "daemon off;"]