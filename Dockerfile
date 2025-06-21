# Path: frontend/Dockerfile
# ไฟล์: Dockerfile

# Stage 1: Build React App with Vite
FROM node:18-alpine AS builder

# Build arguments (รับจาก GitHub Actions)
ARG REACT_APP_API_URL=http://localhost:5555
ARG REACT_APP_ENV=production
ARG REACT_APP_APP_NAME="ระบบ ChatQ&A วิทยาลัยอาชีวศึกษาอุดรธานี"

# Set working directory
WORKDIR /app

# Copy package files ก่อน (เพื่อ Docker layer caching)
COPY package*.json ./

# Install dependencies (รวม devDependencies เพื่อ build)
RUN npm ci --silent

# Copy source code
COPY . .

# Set environment variables for build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_ENV=$REACT_APP_ENV
ENV REACT_APP_APP_NAME=$REACT_APP_APP_NAME
ENV REACT_APP_VERSION=1.0.0

# Build React app ด้วย Vite (จะใช้ .env + build args)
RUN npm run build

# Verify build success
RUN ls -la dist/ && test -f dist/index.html

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Verify files copied correctly
RUN ls -la /usr/share/nginx/html/ && test -f /usr/share/nginx/html/index.html

# Expose port 80 (nginx default)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]