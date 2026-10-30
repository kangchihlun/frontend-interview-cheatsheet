# ── Stage 1：build ───────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app

# 先只複製 package*.json → 依賴沒變時可重用 npm ci 這層快取
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2：runtime（只留靜態檔 + nginx，映像檔小、攻擊面小）──
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/interview-cheatsheet/browser /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ >/dev/null || exit 1
