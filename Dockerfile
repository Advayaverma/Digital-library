# Multi-stage Dockerfile for Digital Library React + Vite application

# Stage 1: Build the React application
FROM node:22-alpine AS build

WORKDIR /app

# Copy package manifests first for efficient layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the production bundle into dist/
RUN npm run build

# Stage 2: Serve the production bundle with Nginx
FROM nginx:alpine

# Copy custom nginx configuration for SPA routing support
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|csv)$ {
        root /usr/share/nginx/html;
        expires 6M;
        access_log off;
        add_header Cache-Control "public, max-age=15552000, immutable";
    }
}
EOF

# Copy compiled assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
