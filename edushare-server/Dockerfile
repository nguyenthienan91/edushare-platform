# Giai đoạn 1: Biên dịch code TypeScript sang JavaScript
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Giai đoạn 2: Tạo môi trường Production sạch và gọn nhẹ
FROM node:22-alpine AS runner
WORKDIR /app
COPY package*.json ./
# Chỉ cài các thư viện phục vụ chạy app, bỏ qua các thư viện lập trình (devDependencies)
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

# Mở đúng cổng 8888 theo file .env thực tế của bạn
EXPOSE 8888
CMD ["node", "dist/main.js"]