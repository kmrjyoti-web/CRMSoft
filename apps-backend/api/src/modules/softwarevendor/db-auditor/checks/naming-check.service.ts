import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AuditFinding } from '../dto/audit-finding.dto';
import * as fs from 'fs';
import * as path from 'path';

const SNAKE_CASE_RE = /^[a-z][a-z0-9_]*$/;

const LOCKED_MODULE_CODES = new Set([
  'usr', 'cfg', 'inv', 'crm', 'sal', 'pay', 'acc', 'tax',
  'hr', 'mkt', 'lic', 'ven', 'wf', 'not', 'rpt', 'doc', 'cmn', 'aud',
  'qa', // 19th: Test Management (test plans, runs, results, evidences)
]);

/**
 * System prefixes — hard-coded, minimal. Only for tables that genuinely
 * cannot follow the vertical naming convention.
 *
 * DO NOT add trade prefixes here. Those come from gv_cfg_vertical.
 * DO NOT add prefixes "just in case". Each entry must have a comment.
 */
const SYSTEM_PREFIXES = [
  '_deprecated_', // Sprint A artifacts, will be dropped after renames
  '_prisma_',     // Prisma internal migrations table
  'pc_',          // PlatformConsole-internal infrastructure (not vertical-scoped)
  'gl_',          // GlobalReferenceDB — ISO reference data + system lookups (Sprint B)
];

interface SchemaFile {
  dbLabel: string;
  /** Folder path (Sprint F: prismaSchemaFolder) — all *.prisma files in folder are read. */
  folderPath: string;
}

const SCHEMA_FILES: SchemaFile[] = [
  { dbLabel: 'IdentityDB',        folderPath: 'prisma/identity/v1' },
  { dbLabel: 'PlatformDB',        folderPath: 'prisma/platform/v1' },
  { dbLabel: 'WorkingDB',         folderPath: 'prisma/working/v1' },
  { dbLabel: 'MarketplaceDB',     folderPath: 'prisma/marketplace/v1' },
  { dbLabel: 'PlatformConsoleDB', folderPath: 'prisma/platform-console/v1' },
  { dbLabel: 'GlobalReferenceDB', folderPath: 'prisma/global/v1' },
  { dbLabel: 'DemoDB',            folderPath: 'prisma/demo/v1' },
];

interface ParsedModel {
  name: string;
  tableName: string | null;
}

/**
 * Parse Prisma schema to extract model names and @@map values.
 * Uses brace-counting (not regex-only) to handle nested blocks correctly.
 */
function parseModels(content: string): ParsedModel[] {
  const models: ParsedModel[] = [];
  const lines = content.split('\n');
  let inModel = false;
  let modelName = '';
  let braceDepth = 0;
  let tableName: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!inModel) {
      const match = trimmed.match(/^model\s+(\w+)\s*\{/);
      if (match) {
        inModel = true;
        modelName = match[1];
        braceDepth = 1;
        tableName = null;
      }
      continue;
    }

    // Count braces
    for (const ch of trimmed) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
    }

    // Check for @@map
    const mapMatch = trimmed.match(/@@map\(["']([^"']+)["']\)/);
    if (mapMatch) {
      tableName = mapMatch[1];
    }

    if (braceDepth === 0) {
      models.push({ name: modelName, tableName });
      inModel = false;
    }
  }

  return models;
}

@Injectable()
export class NamingCheckService {
  private readonly logger = new Logger(NamingCheckService.name);

  constructor(private readonly prisma: PrismaService) {}

  async run(targetDb?: string): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = [];

    const verticals = await this.prisma.platform.gvCfgVertical.findMany({
      select: { code: true, tablePrefix: true },
    });
    const verticalPrefixes = verticals.map(
      (v: { tablePrefix: string }) => v.tablePrefix.replace(/_$/, '') + '_',
    );

    // Build full allowed-prefix list: vertical prefixes + system prefixes
    const ALLOWED_PREFIXES = [...verticalPrefixes, ...SYSTEM_PREFIXES];

    const schemas = targetDb
      ? SCHEMA_FILES.filter((s) => s.dbLabel.toLowerCase().includes(targetDb.toLowerCase()))
      : SCHEMA_FILES;

    for (const schema of schemas) {
      try {
        // Sprint F: read all *.prisma files in the folder (prismaSchemaFolder)
        const fullFolder = path.resolve(process.cwd(), schema.folderPath);
        if (!fs.existsSync(fullFolder)) {
          this.logger.warn(`Schema folder not found: ${fullFolder}`);
          continue;
        }
        const prismaFiles = fs.readdirSync(fullFolder)
          .filter((f) => f.endsWith('.prisma'))
          .map((f) => path.join(fullFolder, f));

        const combinedContent = prismaFiles
          .map((f) => fs.readFileSync(f, 'utf-8'))
          .join('\n');

        const models = parseModels(combinedContent);

        for (const model of models) {
          const sourceFile = prismaFiles.find((f) =>
            fs.readFileSync(f, 'utf-8').includes(`model ${model.name} {`),
          ) ?? schema.folderPath;
          const relFile = path.relative(process.cwd(), sourceFile);

          if (!model.tableName) {
            findings.push({
              severity: 'error',
              check: 'naming',
              db: schema.dbLabel,
              model: model.name,
              table: model.name,
              rule: 'missing-map',
              message: `Model ${model.name} has no @@map directive`,
              file: relFile,
            });
            continue;
          }

          const tableName = model.tableName;

          // Skip system tables (before any other checks)
          const isSystem = SYSTEM_PREFIXES.some((p) => tableName.startsWith(p));
          if (isSystem) continue;

          // Snake case check
          if (!SNAKE_CASE_RE.test(tableName)) {
            findings.push({
              severity: 'error',
              check: 'naming',
              db: schema.dbLabel,
              model: model.name,
              table: tableName,
              rule: 'snake-case',
              message: `Table '${tableName}' is not snake_case`,
              file: relFile,
            });
          }

          // Prefix check — table MUST start with an allowed prefix
          const matchedPrefix = verticalPrefixes.find((p: string) => tableName.startsWith(p));

          if (!matchedPrefix) {
            // Table does not start with any allowed vertical prefix
            findings.push({
              severity: 'error',
              check: 'naming',
              db: schema.dbLabel,
              model: model.name,
              table: tableName,
              rule: 'must-start-with-allowed-prefix',
              message: `Table '${tableName}' does not start with any allowed prefix. Allowed: ${ALLOWED_PREFIXES.join(', ')}`,
              file: relFile,
            });
            continue;
          }

          // Second-segment module code check
          const withoutPrefix = tableName.slice(matchedPrefix.length);
          const moduleCode = withoutPrefix.split('_')[0];
          if (!LOCKED_MODULE_CODES.has(moduleCode)) {
            findings.push({
              severity: 'error',
              check: 'naming',
              db: schema.dbLabel,
              model: model.name,
              table: tableName,
              rule: 'second-segment-must-be-locked-module-code',
              message: `Table '${tableName}' second segment '${moduleCode}' is not a locked module code. Allowed: ${[...LOCKED_MODULE_CODES].join(', ')}`,
              file: relFile,
            });
          }
        }
      } catch (error) {
        this.logger.error(`Failed to parse ${schema.folderPath}`, error);
      }
    }

    return findings;
  }
}
