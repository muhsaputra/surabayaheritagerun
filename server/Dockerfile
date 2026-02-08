FROM node:18-bullseye-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Hapus cache dan install dependensi dengan flag --legacy-peer-deps 
# untuk menghindari konflik versi
RUN npm cache clean --force && npm install --legacy-peer-deps

# Copy sisa kode
COPY . .

EXPOSE 5001

CMD ["node", "server.js"]