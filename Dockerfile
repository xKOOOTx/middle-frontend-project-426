# ---- frontend build ----
FROM node:26 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- backend build ----
FROM node:26 AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# ---- runtime ----
FROM node:26-alpine
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/drizzle ./drizzle
COPY --from=frontend-builder /app/frontend/dist ../frontend/dist

ENV NODE_ENV=production
CMD ["node", "dist/index.js"]