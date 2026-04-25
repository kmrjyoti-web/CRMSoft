# Production Deployment Architecture

## Vision

One brand = one domain = one deployment.

```
travvellis.com         → Travvellis   (TRAVEL vertical)
techbrand.com          → Tech brand   (ELECTRONIC vertical)
softbrand.com          → Software brand (SOFTWARE vertical)
retailbrand.com        → Retail brand  (RETAIL vertical)
```

Same `crm-admin` codebase, deployed N times — once per brand. The active brand is determined by hostname or `NEXT_PUBLIC_DEFAULT_BRAND` env var at runtime.

---

## Brand Resolution Priority

See `src/lib/brand/resolver.ts`.

```
1. Hostname match  (travvellis.com → travvellis)
2. NEXT_PUBLIC_DEFAULT_BRAND env var
3. URL ?brand= param  (dev only — multi-brand testing)
4. null  (generic mode — shows brand picker)
```

In development, all brands are tested via `?brand=<code>` params. In production, the hostname resolves the brand automatically and no URL params are needed.

---

## Per-Brand Environment Files

Create one `.env` file per deployment (do NOT commit secrets):

**`.env.travvellis`**
```env
NEXT_PUBLIC_DEFAULT_BRAND=travvellis
NEXT_PUBLIC_API_URL=https://api.travvellis.com
NEXT_PUBLIC_APP_URL=https://travvellis.com
```

**`.env.techbrand`** (when ready)
```env
NEXT_PUBLIC_DEFAULT_BRAND=techbrand
NEXT_PUBLIC_API_URL=https://api.techbrand.com
NEXT_PUBLIC_APP_URL=https://techbrand.com
```

**`.env.local`** (development)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
PORT=3005
```

---

## Vercel Deployment Strategy

Create one Vercel project per brand. Each project builds the same codebase but with different env vars.

**`vercel-travvellis.json`**
```json
{
  "name": "travvellis",
  "buildCommand": "pnpm build",
  "env": {
    "NEXT_PUBLIC_DEFAULT_BRAND": "travvellis",
    "NEXT_PUBLIC_API_URL": "@api_url_travvellis"
  },
  "domains": [
    "travvellis.com",
    "www.travvellis.com",
    "app.travvellis.com"
  ]
}
```

**`vercel-techbrand.json`** (template)
```json
{
  "name": "techbrand",
  "buildCommand": "pnpm build",
  "env": {
    "NEXT_PUBLIC_DEFAULT_BRAND": "techbrand",
    "NEXT_PUBLIC_API_URL": "@api_url_techbrand"
  },
  "domains": [
    "techbrand.com",
    "www.techbrand.com"
  ]
}
```

---

## Build Scripts

Add to `crm-admin/package.json` when deploying per-brand:

```json
{
  "scripts": {
    "dev": "next dev -p 3005",
    "build": "next build",
    "build:travvellis": "NEXT_PUBLIC_DEFAULT_BRAND=travvellis next build",
    "deploy:travvellis": "vercel --prod --env-file .env.travvellis"
  }
}
```

---

## Hostname Registration

When going live with a brand, add its domains to `HOSTNAME_BRAND_MAP` in `src/lib/brand/resolver.ts`:

```typescript
const HOSTNAME_BRAND_MAP: Record<string, string> = {
  'travvellis.com':     'travvellis',
  'app.travvellis.com': 'travvellis',
  // add new brand domains here
};
```

---

## Post-Launch Checklist (per brand)

- [ ] Domain purchased and DNS configured
- [ ] Vercel project created with brand env vars
- [ ] Domain added to Vercel project
- [ ] Brand added to `HOSTNAME_BRAND_MAP` in `resolver.ts`
- [ ] Brand added to `BRAND_REGISTRY` in `registry.tsx` (if not already)
- [ ] API backend deployed and health-checked
- [ ] SSL certificate active
- [ ] End-to-end login/register flow tested on production domain

---

## Apr 28 Demo Strategy

For the demo, use development mode — all brands tested via `?brand=<code>` params:

```
localhost:3005/login?brand=travvellis     → Travvellis login
localhost:3005/register?brand=travvellis  → Travvellis register
```

**Demo talking point:**
> "Today you're seeing development mode where we can test all brands from one URL. In production, each brand gets its own clean domain — travvellis.com goes directly to Travvellis, no parameters needed. Same codebase, multiple deployments, multiple brands."
