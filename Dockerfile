FROM mcr.microsoft.com/playwright:v1.62.0-jammy

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY worker ./worker

ENV PORT=8787
ENV SCRAPER_MODE=live
ENV NODE_ENV=production

EXPOSE 8787

CMD ["npx", "tsx", "worker/server.ts"]
