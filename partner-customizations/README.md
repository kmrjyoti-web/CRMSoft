# Partner Customizations — Partner's Monitored Domain

Each partner has their own isolated folder for customizations specific
to their customers and vertical.

## Structure

```
partner-customizations/
├── partner-travel-1/
│   ├── modules/
│   ├── ui-overrides/
│   └── config/
├── partner-electronic-1/
└── ...
```

## Access Control

- **Write:** Partner developers can only touch their own folder
- **Read:** Partner can read core/ and verticals/
- **CI Enforcement:** CI blocks cross-partner folder modifications

## Adding a New Partner

1. Copy `../brands/_template/` → `../brands/{partner-name}-brand/`
2. Create `partner-customizations/{partner-name}/`
3. Add subfolders: `modules/`, `ui-overrides/`, `config/`
4. Set CI rule for folder isolation
