# Brands — White Label Configuration

Each brand (white-label customer) has their own configuration,
theming, and overrides.

## Structure

```
brands/
├── crmsoft/           (default brand — Kumar's)
├── _template/         (copy this for new brands)
└── partner-travel-1-brand/  (example partner brand)
```

## Subfolders (per brand)

```
brands/{brand-name}/
├── theme/    ← colors, fonts, logos, CSS variables
├── config/   ← brand-specific feature flags and config
└── overrides/ ← component-level overrides
```

## Brand Inheritance Pattern (70-30)

- **70% common:** Inherited from core/ and verticals/
- **30% custom:** Overridden in brands/{brand-name}/

## Theme Injection

Themes applied at build time via environment variable:

```bash
BRAND=crmsoft pnpm build
BRAND=partner-travel-1-brand pnpm build
```

## Adding a New Brand

1. `cp -r brands/_template brands/{new-brand-name}`
2. Edit `brands/{new-brand-name}/theme/variables.css`
3. Edit `brands/{new-brand-name}/config/brand.config.ts`
4. Set `BRAND={new-brand-name}` in deployment env
