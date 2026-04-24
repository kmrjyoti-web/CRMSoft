# Verticals — Kumar Builds, Partners Use

Industry-specific base code. Kumar develops the base, partners deploy
customized versions.

## Subfolders

- **travel/** — Travel industry base (from Travel project merge)
- **electronic/** — Electronic industry base (from Electronic project merge)
- **software/** — Software industry base
- **restaurant/** — Restaurant industry base
- **tourism/** — Tourism industry base
- **retail/** — Retail industry base

## Folder Structure (each vertical)

```
verticals/{vertical}/
├── modules/          ← NestJS modules specific to this vertical
├── ai-customization/ ← Vertical-specific AI prompts and tuning
└── data-models/      ← Prisma schema extensions for this vertical
```

## Access Control

- **Write:** Kumar + vertical specialists
- **Read:** All developers
- **Usage:** Partners reference these in their customizations

## 70-30 Inheritance Pattern

Core provides 70% — verticals add the remaining 30% that is
industry-specific. Partners then customize within their folder.
