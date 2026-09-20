# Multi-stage Dockerfile for SmartBinX React Frontend
# Stage 1: Build production static distribution
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Clean dependency installation
RUN npm ci

# Copy frontend source code and compile production bundle
COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:1.25-alpine AS runtime

# Replace default Nginx configuration with SPA & reverse proxy setup
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled frontend assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose web server port
EXPOSE 80

# Healthcheck probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
