# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy files before changing user
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh

# Make entrypoint executable and ensure proper permissions
RUN chmod +x /entrypoint.sh && \
    mkdir -p /var/cache/nginx && \
    mkdir -p /run && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /run && \
    chmod -R 755 /usr/share/nginx/html /var/cache/nginx /run

# Set non-root user explicitly
USER nginx

EXPOSE 80

CMD ["/entrypoint.sh"]
