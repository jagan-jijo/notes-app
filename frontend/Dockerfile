# ── Stage 1: Build the React app ─────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files first so npm install is cached unless dependencies change
COPY package*.json ./
RUN npm ci

# Copy source and build static files
COPY . .
RUN npm run build

# ── Stage 2: Serve with nginx ─────────────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Custom nginx config — serves the React app and proxies /api to the backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
