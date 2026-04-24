# CoreUI — Enterprise Component Library

> A product-agnostic design system with layout engine, theme system, form builder, and AI layout generation.

## Packages

| Package | Description |
|---------|-------------|
| `@coreui/ui` | Core component logic (pure TypeScript, zero framework dependencies) |
| `@coreui/ui-react` | React render wrappers, DesignProvider, hooks |
| `@coreui/theme` | Theme engine, CSS custom property presets (light, dark, high-contrast) |
| `@coreui/layout` | Layout engine, density engine, shortcut engine |
| `@coreui/form-builder` | Drag-drop form builder (schema types) |
| `@coreui/ai-engine` | AI layout generation (analysis types) |
| `@coreui/config` | Shared Tailwind, TypeScript, and ESLint configurations |

## Apps

| App | Description |
|-----|-------------|
| `@coreui/playground` | Component demo & testing app (Next.js) |
| `@coreui/docs` | Storybook 8 documentation site |

## Getting Started

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run the playground
pnpm dev --filter=@coreui/playground

# Launch Storybook
pnpm storybook

# Build static Storybook
pnpm build-storybook
```

## Architecture

- **Framework-agnostic core** — All component logic lives in `@coreui/ui` as pure TypeScript with zero framework imports. State machines, style composition, accessibility props, and validation are all framework-independent.
- **Thin React wrappers** — `@coreui/ui-react` provides React components that delegate to the core. Each wrapper uses `forwardRef`, `useReducer`, and maps DOM events to core actions.
- **CSS custom properties** — Theming uses CSS variables (`--color-*`, `--spacing-*`, `--shadow-*`) defined in `@coreui/theme`. Switch themes by toggling `data-theme` attributes.
- **Density system** — Three density levels (compact, comfortable, spacious) controlled via `data-density` attributes with `--density-*` CSS variables.
- **Turborepo** — Monorepo orchestration with pnpm workspaces. All packages build with `tsc --build` for incremental compilation.

## Components (13)

**Primitives:** Button, Input, Select, Checkbox, Radio, Switch, Badge

**Overlays & Feedback:** Avatar, Tooltip, Popover, Modal, Drawer, Toast

## Themes

| Theme | Selector | Description |
|-------|----------|-------------|
| Light | `:root` (default) | Standard light theme |
| Dark | `[data-theme="dark"]` | Dark mode with adjusted contrast |
| High Contrast | `[data-theme="high-contrast"]` | WCAG AAA compliant, maximum contrast |

## License

Private — All rights reserved.
