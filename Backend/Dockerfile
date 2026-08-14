FROM node:20-alpine AS production-dependencies
WORKDIR /app
COPY Backend/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS builder
WORKDIR /app
COPY Backend/package*.json ./
RUN npm ci
COPY Backend/prisma ./prisma
RUN npx prisma generate
COPY Backend/tsconfig.json Backend/tsup.config.ts ./
COPY Backend/src ./src
COPY packages/api-contracts /packages/api-contracts
RUN npm run build

FROM builder AS migrator
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY Backend/package*.json ./
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]
