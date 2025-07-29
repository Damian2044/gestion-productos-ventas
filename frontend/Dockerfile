# Imagen base de Node con Alpine
FROM node:20-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de npm
COPY app-frontend/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY app-frontend/ ./

# Exponer el puerto del dev server de Vite
EXPOSE 5173

# Comando para correr el dev server de Vite en modo host
CMD ["npm", "run", "dev", "--", "--host"]
