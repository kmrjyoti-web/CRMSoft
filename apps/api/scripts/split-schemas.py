#!/usr/bin/env python3
"""
Sprint F — Prisma Schema Folder Split
Splits each monolithic prisma/schemas/*.prisma into prisma/<db>/v1/ folder.

Run:  python3 scripts/split-schemas.py [--apply]
Without --apply: dry-run (print plan).
With --apply:    create folder structure and write files.
"""

import re, sys, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ─── Domain mapping ───────────────────────────────────────────────────────────
# Maps table-name prefix (from @@map) → domain filename (without .prisma)
# Key: exact prefix string that table name starts with
# Value: target file name

IDENTITY_MAP = {
    "gv_usr_":  "users",
    "gv_cfg_":  "config",
    "gv_aud_":  "audit",
    "gv_lic_":  "licensing",
}

PLATFORM_MAP = {
    "gv_cfg_":  "modules",
    "gv_qa_":   "testing",
    "gv_mkt_":  "marketplace",
    "gv_lic_":  "subscriptions",
    "soft_lic_":"subscriptions",
    "gv_pay_":  "subscriptions",
    "gv_ven_":  "vendors",
    "gv_aud_":  "audit",
    "gv_doc_":  "modules",   # help articles live with platform modules
}

WORKING_MAP = {
    "gv_crm_":  "crm",
    "gv_inv_":  "inventory",
    "gv_cmn_":  "communication",
    "gv_sal_":  "sales",
    "gv_acc_":  "accounts",
    "gv_doc_":  "documents",
    "gv_wf_":   "workflow",
    "gv_not_":  "notifications",
    "gv_aud_":  "audit",
    "gv_cfg_":  "config",
    "gv_rpt_":  "reports",
    "gv_pay_":  "payments",
    "gv_tax_":  "tax",
}

MARKETPLACE_MAP = {
    "gv_mkt_":  "marketplace",
}

PLATFORM_CONSOLE_MAP = {
    "pc_error_":        "devops",
    "pc_vertical_":     "devops",
    "pc_brand_":        "devops",
    "pc_menu_":         "devops",
    "pc_alert_":        "devops",
    "pc_version_":      "devops",
    "pc_rollback_":     "devops",
    "pc_pipeline_":     "devops",
    "pc_notification_": "devops",
    "pc_incident_":     "devops",
    "pc_health_":       "devops",
    "pc_dr_":           "devops",
    "pc_deployment_":   "devops",
    "pc_build_":        "devops",
    "pc_test_":         "testing",
}

GLOBAL_MAP = {
    "gl_cfg_":  "reference",
}

# ─── DB configs ───────────────────────────────────────────────────────────────
CONFIGS = [
    {
        "label":      "GlobalReferenceDB",
        "src":        "prisma/schemas/global-reference.prisma",
        "out_folder": "prisma/global/v1",
        "generator":  "prisma-client-js",
        "output":     "../../../node_modules/.prisma/global-reference-client",
        "env_var":    "GLOBAL_REFERENCE_DATABASE_URL",
        "domain_map": GLOBAL_MAP,
        "fallback":   "reference",
    },
    {
        "label":      "MarketplaceDB",
        "src":        "prisma/schemas/marketplace.prisma",
        "out_folder": "prisma/marketplace/v1",
        "generator":  "prisma-client-js",
        "output":     "../../../node_modules/@prisma/marketplace-client",
        "env_var":    "MARKETPLACE_DATABASE_URL",
        "domain_map": MARKETPLACE_MAP,
        "fallback":   "marketplace",
    },
    {
        "label":      "PlatformConsoleDB",
        "src":        "prisma/schemas/platform-console.prisma",
        "out_folder": "prisma/platform-console/v1",
        "generator":  "prisma-client-js",
        "output":     "../../../node_modules/.prisma/platform-console-client",
        "env_var":    "PLATFORM_CONSOLE_DATABASE_URL",
        "domain_map": PLATFORM_CONSOLE_MAP,
        "fallback":   "devops",
    },
    {
        "label":      "IdentityDB",
        "src":        "prisma/schemas/identity.prisma",
        "out_folder": "prisma/identity/v1",
        "generator":  "prisma-client-js",
        "output":     "../../../node_modules/@prisma/identity-client",
        "env_var":    "IDENTITY_DATABASE_URL",
        "domain_map": IDENTITY_MAP,
        "fallback":   "users",
    },
    {
        "label":      "PlatformDB",
        "src":        "prisma/schemas/platform.prisma",
        "out_folder": "prisma/platform/v1",
        "generator":  "prisma-client-js",
        "output":     "../../../node_modules/@prisma/platform-client",
        "env_var":    "PLATFORM_DATABASE_URL",
        "domain_map": PLATFORM_MAP,
        "fallback":   "modules",
    },
    {
        "label":      "WorkingDB",
        "src":        "prisma/schemas/working.prisma",
        "out_folder": "prisma/working/v1",
        "generator":  "prisma-client-js",
        "output":     "../../../node_modules/@prisma/working-client",
        "env_var":    "GLOBAL_WORKING_DATABASE_URL",
        "domain_map": WORKING_MAP,
        "fallback":   "config",
    },
]


# ─── Parser ───────────────────────────────────────────────────────────────────

def parse_schema(content: str):
    """
    Returns:
      generator_block: str   (full 'generator client { ... }')
      datasource_block: str  (full 'datasource db { ... }')
      enums: list[str]       (each full 'enum Xxx { ... }' block as string)
      models: list[(name, table_name, block_str)]
    """
    lines = content.split('\n')
    generator_lines = []
    datasource_lines = []
    enum_blocks = []
    model_blocks = []

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # generator block
        if re.match(r'^generator\s+\w+\s*\{', stripped):
            block, i = _read_block(lines, i)
            generator_lines.append(block)
            continue

        # datasource block
        if re.match(r'^datasource\s+\w+\s*\{', stripped):
            block, i = _read_block(lines, i)
            datasource_lines.append(block)
            continue

        # enum block
        if re.match(r'^enum\s+\w+\s*\{', stripped):
            block, i = _read_block(lines, i)
            enum_blocks.append(block)
            continue

        # model block
        m = re.match(r'^model\s+(\w+)\s*\{', stripped)
        if m:
            model_name = m.group(1)
            block, i = _read_block(lines, i)
            # extract @@map table name
            map_match = re.search(r'@@map\(["\']([^"\']+)["\']\)', block)
            table_name = map_match.group(1) if map_match else None
            model_blocks.append((model_name, table_name, block))
            continue

        i += 1

    generator = '\n'.join(generator_lines)
    datasource = '\n'.join(datasource_lines)
    return generator, datasource, enum_blocks, model_blocks


def _read_block(lines, start):
    """Read a { } block starting at lines[start]. Returns (block_str, next_index)."""
    depth = 0
    block_lines = []
    i = start
    while i < len(lines):
        line = lines[i]
        for ch in line:
            if ch == '{': depth += 1
            if ch == '}': depth -= 1
        block_lines.append(line)
        i += 1
        if depth == 0:
            break
    return '\n'.join(block_lines), i


def get_domain(table_name: str, domain_map: dict, fallback: str) -> str:
    """Map a table name to its domain file name."""
    if table_name is None:
        return fallback
    for prefix, domain in domain_map.items():
        if table_name.startswith(prefix):
            return domain
    return fallback


# ─── Main ─────────────────────────────────────────────────────────────────────

def process_db(cfg: dict, apply: bool):
    label = cfg["label"]
    src_rel = cfg["src"]
    out_folder_rel = cfg["out_folder"]
    domain_map = cfg["domain_map"]
    fallback = cfg["fallback"]

    src_path = os.path.join(BASE, src_rel)
    out_folder = os.path.join(BASE, out_folder_rel)

    if not os.path.exists(src_path):
        print(f"  ⚠ Source not found: {src_path}")
        return {}

    content = open(src_path).read()
    generator, datasource, enums, models = parse_schema(content)

    # Group models by domain
    domain_models: dict[str, list] = {}
    for name, table, block in models:
        domain = get_domain(table, domain_map, fallback)
        if domain not in domain_models:
            domain_models[domain] = []
        domain_models[domain].append((name, table, block))

    # Build _base.prisma content
    base_content = f"""// ─── Generator + Datasource ─────────────────────────────────────────────────
// This file is read by Prisma's prismaSchemaFolder feature.
// It declares the generator, datasource, and all shared enums for {label}.
// Models live in the sibling domain files.

generator client {{
  provider        = "prisma-client-js"
  output          = "{cfg["output"]}"
  previewFeatures = ["prismaSchemaFolder"]
}}

datasource db {{
  provider = "postgresql"
  url      = env("{cfg["env_var"]}")
}}
"""

    if enums:
        base_content += "\n// ─── Enums ─────────────────────────────────────────────────────────────────\n\n"
        base_content += "\n\n".join(enums) + "\n"

    # Plan summary
    print(f"\n[{label}]")
    print(f"  source:        {src_rel}")
    print(f"  output folder: {out_folder_rel}/")
    print(f"  enums:         {len(enums)}")
    print(f"  models:        {len(models)}")
    print(f"  domain files:")
    for domain, mlist in sorted(domain_models.items()):
        print(f"    {domain}.prisma ({len(mlist)} models)")

    if apply:
        os.makedirs(out_folder, exist_ok=True)

        # Write _base.prisma
        base_path = os.path.join(out_folder, "_base.prisma")
        with open(base_path, 'w') as f:
            f.write(base_content)

        # Write each domain file
        for domain, mlist in domain_models.items():
            domain_content = f"// {label} — {domain} domain\n"
            domain_content += f"// Generated by scripts/split-schemas.py\n"
            domain_content += f"// Models: {', '.join(n for n, _, _ in mlist)}\n\n"
            domain_content += "\n\n".join(block for _, _, block in mlist) + "\n"

            domain_path = os.path.join(out_folder, f"{domain}.prisma")
            with open(domain_path, 'w') as f:
                f.write(domain_content)

        print(f"  ✅ Written to {out_folder_rel}/")

    return domain_models


def main():
    apply = "--apply" in sys.argv
    mode = "APPLY" if apply else "DRY-RUN"

    print(f"\n{'='*60}")
    print(f"Sprint F — Prisma Schema Folder Split [{mode}]")
    print(f"prismaSchemaFolder requires Prisma 5.15+ (current: 5.22.0 ✓)")
    print(f"{'='*60}")

    total_models = 0
    total_files = 0

    for cfg in CONFIGS:
        dm = process_db(cfg, apply)
        total_models += sum(len(v) for v in dm.values())
        total_files += len(dm) + 1  # +1 for _base.prisma

    print(f"\n{'─'*60}")
    print(f"Total domain + base files: {total_files}")
    if not apply:
        print("\nRe-run with --apply to create the folder structure.")


if __name__ == "__main__":
    main()
