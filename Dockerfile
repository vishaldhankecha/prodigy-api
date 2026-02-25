# -----------------------------
# 1️⃣ Base Image
# -----------------------------
FROM node:20-alpine AS base

WORKDIR /app

# Install OpenSSL (required for Prisma on Alpine)
RUN apk add --no-cache openssl

# -----------------------------
# 2️⃣ Install Dependencies
# -----------------------------
FROM base AS dependencies

COPY package.json package-lock.json* ./

RUN npm ci

# -----------------------------
# 3️⃣ Build Application
# -----------------------------
FROM base AS build

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# -----------------------------
# 4️⃣ Production Image
# -----------------------------
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]