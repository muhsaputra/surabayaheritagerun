# Gunakan image Node.js versi 18
FROM node:18-alpine

# Set folder kerja di dalam container
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependensi (termasuk devDependencies agar build tidak error)
RUN npm install

# Copy semua file dari folder server ke dalam container
COPY . .

# Expose port yang digunakan (5001 sesuai .env Anda)
EXPOSE 5001

# Jalankan aplikasi
CMD ["node", "server.js"]