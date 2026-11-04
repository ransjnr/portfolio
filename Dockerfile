FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY apps/portfolio/package.json apps/portfolio/package.json
COPY apps/cms/package.json apps/cms/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/content/package.json packages/content/package.json
COPY services/content-api/package.json services/content-api/package.json
RUN npm ci
COPY . .
FROM base AS portfolio-build
RUN npm run build -w @portfolio/web
FROM base AS cms-build
ARG NEXT_PUBLIC_PORTFOLIO_URL
ENV NEXT_PUBLIC_PORTFOLIO_URL=$NEXT_PUBLIC_PORTFOLIO_URL
RUN npm run build -w @portfolio/cms
FROM node:24-alpine AS portfolio
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=portfolio-build /app/apps/portfolio/.next/standalone ./
COPY --from=portfolio-build /app/apps/portfolio/.next/static ./apps/portfolio/.next/static
COPY --from=portfolio-build /app/apps/portfolio/public ./apps/portfolio/public
USER node
CMD ["node","apps/portfolio/server.js"]
FROM node:24-alpine AS cms
WORKDIR /app
ENV NODE_ENV=production PORT=3001 HOSTNAME=0.0.0.0
COPY --from=cms-build /app/apps/cms/.next/standalone ./
COPY --from=cms-build /app/apps/cms/.next/static ./apps/cms/.next/static
USER node
CMD ["node","apps/cms/server.js"]
FROM base AS api
ENV NODE_ENV=production PORT=4000 DATA_FILE=/data/content.json
RUN mkdir /data && chown node:node /data
USER node
CMD ["node","services/content-api/src/server.mjs"]
