# Adding a New Brand / Vertical

## Overview

Brands are registered in `apps-frontend/crm-admin/src/lib/brand/registry.tsx`.
No API call, no database query — it's a static TypeScript object.

## Steps

### 1. Create brand components

```
src/components/brand-login/brands/<brand-code>/
  <BrandCode>Login.tsx       ← fullscreen login component
  register/
    <BrandCode>Register.tsx  ← fullscreen register component
```

**Login component** must accept `{ onSuccess?: () => void }`.  
Use `authService.login({ email, password }, 'customer')` for auth — it handles URL, cookie, and Zustand store.

**Register component** accepts `Record<string, never>` (no props).

### 2. Register in `registry.tsx`

```typescript
// src/lib/brand/registry.tsx

const MyBrandLogin = dynamic(
  () => import('@/components/brand-login/brands/mybrand/MyBrandLogin'),
  { ssr: false, loading: () => <div style={{ background: '#000', minHeight: '100dvh' }} /> },
);

const MyBrandRegister = dynamic(
  () => import('@/components/brand-login/brands/mybrand/register/MyBrandRegister'),
  { ssr: false, loading: () => <div style={{ background: '#000', minHeight: '100dvh' }} /> },
);

export const BRAND_REGISTRY: Record<string, BrandConfig> = {
  // ... existing brands

  mybrand: {
    code: 'mybrand',
    name: 'My Brand',
    vertical: 'ELECTRONIC',   // TRAVEL | ELECTRONIC | SOFTWARE | RETAIL | RESTAURANT
    description: 'Short tagline for the brand selector',
    loginComponent: MyBrandLogin,
    registerComponent: MyBrandRegister,
    colors: {
      primary:    '#1a1a2e',
      secondary:  '#e94560',
      background: '#0f0f1a',
      text:       '#ffffff',
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body:    'Inter, sans-serif',
    },
  },
};
```

### 3. Done

`/login?brand=mybrand` and `/register?brand=mybrand` work automatically.  
No layout changes, no middleware changes, no API changes needed.

## How routing works

- `(auth)/login/page.tsx` calls `getBrandConfig(searchParams.get('brand'))`
- If found → renders `brand.loginComponent` fullscreen (no glass card wrapper)
- If not found → renders default `<LoginForm />`
- `(auth)/layout.tsx` detects `?brand=` and strips the glass-card wrapper so brand components get the full viewport

## Supported verticals

| Code | Status |
|------|--------|
| TRAVEL | ✅ Travvellis |
| ELECTRONIC | planned |
| SOFTWARE | planned |
| RETAIL | planned |
| RESTAURANT | planned |
