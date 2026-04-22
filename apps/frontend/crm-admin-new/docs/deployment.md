# Deployment

## Docker Deployment

### Dockerfile (multi-stage build)

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:18-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Submodule must be initialized before build
RUN git submodule update --init --recursive || true
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_NAME=CRMSoft
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
RUN pnpm build

# Stage 3: Runtime
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3005
ENV PORT=3005
CMD ["node", "server.js"]
```

Add `output: "standalone"` to `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};
module.exports = nextConfig;
```

### Build and Run

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://your-api:3001/api/v1 \
  -t crmsoft-admin .

docker run -p 3005:3005 crmsoft-admin
```

## Docker Compose (Full Stack)

```yaml
# docker-compose.yml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: crmsoft
      POSTGRES_USER: crmsoft
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U crmsoft"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  api:
    build:
      context: ./API
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://crmsoft:${POSTGRES_PASSWORD}@postgres:5432/crmsoft
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 15s
      timeout: 5s
      retries: 3

  admin:
    build:
      context: ./UI/crm-admin
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: http://api:3001/api/v1
        NEXT_PUBLIC_APP_NAME: CRMSoft
    ports:
      - "3005:3005"
    depends_on:
      api:
        condition: service_healthy
    environment:
      NEXT_PUBLIC_API_URL: http://api:3001/api/v1

volumes:
  pgdata:
  redisdata:
```

```bash
# Start full stack
docker compose up -d

# View logs
docker compose logs -f admin

# Stop
docker compose down
```

## Environment Variables for Production

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Full URL to NestJS API (including `/api/v1`) |
| `NEXT_PUBLIC_APP_NAME` | No | Display name shown in UI (default: CRMSoft) |
| `NEXT_PUBLIC_ENABLE_SSE` | No | Enable Server-Sent Events for real-time updates |

`NEXT_PUBLIC_*` variables are baked into the client bundle at build time. Set them as build args in Docker or as environment variables in your CI pipeline before `pnpm build`.

## Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in Vercel dashboard under Project Settings > Environment Variables:

- `NEXT_PUBLIC_API_URL` — your production API URL
- `NEXT_PUBLIC_APP_NAME` — `CRMSoft`

**Note:** The CoreUI submodule must be available during build. Configure Vercel to use `git clone --recurse-submodules` or add a `vercel-build` script that initializes submodules:

```json
// package.json
{
  "scripts": {
    "vercel-build": "git submodule update --init --recursive && pnpm build"
  }
}
```

## GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - uses: pnpm/action-setup@v3
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: pnpm
          cache-dependency-path: UI/crm-admin/pnpm-lock.yaml

      - name: Install dependencies
        working-directory: UI/crm-admin
        run: pnpm install --frozen-lockfile

      - name: Type check
        working-directory: UI/crm-admin
        run: pnpm tsc --noEmit

      - name: Lint
        working-directory: UI/crm-admin
        run: pnpm lint

      - name: Test
        working-directory: UI/crm-admin
        run: pnpm test --ci

      - name: Build
        working-directory: UI/crm-admin
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
        run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Build Docker image
        run: |
          docker build \
            --build-arg NEXT_PUBLIC_API_URL=${{ secrets.NEXT_PUBLIC_API_URL }} \
            -t crmsoft-admin:${{ github.sha }} \
            UI/crm-admin/

      - name: Push to registry
        run: |
          echo ${{ secrets.REGISTRY_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker tag crmsoft-admin:${{ github.sha }} ghcr.io/${{ github.repository }}/admin:${{ github.sha }}
          docker tag crmsoft-admin:${{ github.sha }} ghcr.io/${{ github.repository }}/admin:latest
          docker push ghcr.io/${{ github.repository }}/admin:${{ github.sha }}
          docker push ghcr.io/${{ github.repository }}/admin:latest

      - name: Deploy
        run: |
          # Add your deployment step here (SSH, kubectl, etc.)
          echo "Deploy ${{ github.sha }} to production"
```

## Health Checks

The Next.js app does not expose a built-in health endpoint. Add one via a route handler:

```ts
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

Use `http://localhost:3005/api/health` as the Docker health check URL:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3005/api/health || exit 1
```

## Monitoring Recommendations

| Concern | Tool |
|---|---|
| Error tracking | Sentry (`@sentry/nextjs`) |
| Performance (Web Vitals) | Vercel Analytics or custom reporting |
| Uptime | UptimeRobot / Better Uptime (ping `/api/health`) |
| Logs | Datadog, Grafana Loki, or CloudWatch |
| Container metrics | Prometheus + Grafana (scrape Node.js metrics) |

To add Sentry:

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Set `SENTRY_DSN` in your environment and it will capture unhandled errors and performance traces automatically.
