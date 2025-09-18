# Frontend Dockerfile
FROM node:18-alpine AS build

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

RUN npm install -g @angular/cli

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=build /app/dist/agentes-frontend/browser /usr/share/nginx/html
# Copia template de config para variáveis de runtime
COPY src/assets/app-config.template.js /usr/share/nginx/html/assets/app-config.template.js

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Script de entrada para gerar app-config.js a partir de variáveis de ambiente
RUN printf '#!/bin/sh\n: "${API_URL:=http://localhost:8080}"\n\
envsubst '\''$API_URL'\'' < /usr/share/nginx/html/assets/app-config.template.js > /usr/share/nginx/html/assets/app-config.js\n\
exec nginx -g "daemon off;"\n' > /docker-entrypoint.sh \
  && chmod +x /docker-entrypoint.sh

# Expor porta 80
EXPOSE 80

# Comando padrão
CMD ["/docker-entrypoint.sh"]
