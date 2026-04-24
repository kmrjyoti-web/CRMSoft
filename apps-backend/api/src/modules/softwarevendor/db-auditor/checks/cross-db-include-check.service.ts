import { Injectable, Logger } from '@nestjs/common';
import { AuditFinding } from '../dto/audit-finding.dto';
import * as fs from 'fs';
import * as path from 'path';
// Uses regex-based model extraction instead of prisma-ast (Jest compat)

/**
 * Check 2: Cross-DB Prisma Include Detection
 *
 * Builds a model→DB map from all .prisma files, then scans TypeScript source
 * for Prisma include patterns that cross DB boundaries.
 *
 * Uses regex-based detection (not full AST) to avoid ts-morph dependency.
 * Catches patterns like: include: { user: true } where user is in IdentityDB
 * but the query is against WorkingDB.
 */

interface SchemaInfo {
  dbLabel: string;
  /** Sprint F: folder path for prismaSchemaFolder structure. */
  folderPath: string;
}

const SCHEMAS: SchemaInfo[] = [
  { dbLabel: 'IdentityDB',        folderPath: 'prisma/identity/v1' },
  { dbLabel: 'PlatformDB',        folderPath: 'prisma/platform/v1' },
  { dbLabel: 'WorkingDB',         folderPath: 'prisma/working/v1' },
  { dbLabel: 'MarketplaceDB',     folderPath: 'prisma/marketplace/v1' },
  { dbLabel: 'PlatformConsoleDB', folderPath: 'prisma/platform-console/v1' },
  { dbLabel: 'DemoDB',            folderPath: 'prisma/demo/v1' },
];

// Regex to find Prisma include patterns in TS code
// Matches: prisma.identity.user.findMany({ include: { ... } })
// or: this.prisma.platform.xxx.findFirst({ include: ... })
const PRISMA_CALL_RE = /this\.prisma\.(\w+)\.(\w+)\.(find\w+|create|update|upsert|delete)\s*\(\s*\{[^}]*include\s*:/g;

// Known cross-DB relations that should use CrossDbResolverService
const KNOWN_CROSS_DB_RELATIONS = [
  'user', 'assignedTo', 'createdByUser', 'updatedByUser',
  'role', 'department', 'designation', 'tenant',
  'lookupValue', 'lookupValues',
];

@Injectable()
export class CrossDbIncludeCheckService {
  private readonly logger = new Logger(CrossDbIncludeCheckService.name);

  async run(): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = [];

    // Build model→DB map
    const modelToDb = this.buildModelDbMap();

    // Scan TypeScript source files
    const srcDir = path.resolve(process.cwd(), 'src');
    const tsFiles = this.findTsFiles(srcDir);

    for (const file of tsFiles) {
      // Skip test files and the resolver itself
      const relPath = path.relative(process.cwd(), file);
      if (relPath.includes('.spec.') || relPath.includes('.test.') || relPath.includes('cross-db-resolver')) {
        continue;
      }

      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Check for cross-DB include patterns
          for (const relation of KNOWN_CROSS_DB_RELATIONS) {
            // Pattern: include: { relationName: true }
            const includeRe = new RegExp(`include\\s*:\\s*\\{[^}]*\\b${relation}\\b\\s*:`, 'g');
            if (includeRe.test(line)) {
              // Determine which prisma client accessor is being used in nearby lines
              const contextLines = lines.slice(Math.max(0, i - 10), i + 1).join('\n');
              const clientMatch = /this\.prisma\.(working|globalWorking)/.exec(contextLines);

              if (clientMatch) {
                findings.push({
                  severity: 'error',
                  check: 'crossDbInclude',
                  db: 'WorkingDB',
                  model: relation,
                  rule: 'cross-db-include',
                  message: `Cross-DB include detected: '${relation}' is in IdentityDB/PlatformDB but included via WorkingDB client. Use CrossDbResolverService.resolveUsers() instead.`,
                  file: relPath,
                  line: i + 1,
                });
              }
            }
          }
        }
      } catch {
        // Skip unreadable files
      }
    }

    return findings;
  }

  private buildModelDbMap(): Map<string, string> {
    const map = new Map<string, string>();

    for (const schema of SCHEMAS) {
      try {
        // Sprint F: read all *.prisma files in folder (prismaSchemaFolder)
        const fullFolder = path.resolve(process.cwd(), schema.folderPath);
        if (!fs.existsSync(fullFolder)) continue;
        const prismaFiles = fs.readdirSync(fullFolder)
          .filter((f) => f.endsWith('.prisma'))
          .map((f) => path.join(fullFolder, f));

        for (const pFile of prismaFiles) {
          const content = fs.readFileSync(pFile, 'utf-8');
          const modelRe = /^model\s+(\w+)\s*\{/gm;
          let match: RegExpExecArray | null;
          while ((match = modelRe.exec(content)) !== null) {
            map.set(match[1], schema.dbLabel);
          }
        }
      } catch {
        // Skip unparseable schemas
      }
    }

    return map;
  }

  private findTsFiles(dir: string): string[] {
    const files: string[] = [];
    if (!fs.existsSync(dir)) return files;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...this.findTsFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
    return files;
  }
}
