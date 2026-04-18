"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CrossDbIncludeCheckService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossDbIncludeCheckService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const SCHEMAS = [
    { dbLabel: 'IdentityDB', folderPath: 'prisma/identity/v1' },
    { dbLabel: 'PlatformDB', folderPath: 'prisma/platform/v1' },
    { dbLabel: 'WorkingDB', folderPath: 'prisma/working/v1' },
    { dbLabel: 'MarketplaceDB', folderPath: 'prisma/marketplace/v1' },
    { dbLabel: 'PlatformConsoleDB', folderPath: 'prisma/platform-console/v1' },
    { dbLabel: 'DemoDB', folderPath: 'prisma/demo/v1' },
];
const PRISMA_CALL_RE = /this\.prisma\.(\w+)\.(\w+)\.(find\w+|create|update|upsert|delete)\s*\(\s*\{[^}]*include\s*:/g;
const KNOWN_CROSS_DB_RELATIONS = [
    'user', 'assignedTo', 'createdByUser', 'updatedByUser',
    'role', 'department', 'designation', 'tenant',
    'lookupValue', 'lookupValues',
];
let CrossDbIncludeCheckService = CrossDbIncludeCheckService_1 = class CrossDbIncludeCheckService {
    constructor() {
        this.logger = new common_1.Logger(CrossDbIncludeCheckService_1.name);
    }
    async run() {
        const findings = [];
        const modelToDb = this.buildModelDbMap();
        const srcDir = path.resolve(process.cwd(), 'src');
        const tsFiles = this.findTsFiles(srcDir);
        for (const file of tsFiles) {
            const relPath = path.relative(process.cwd(), file);
            if (relPath.includes('.spec.') || relPath.includes('.test.') || relPath.includes('cross-db-resolver')) {
                continue;
            }
            try {
                const content = fs.readFileSync(file, 'utf-8');
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    for (const relation of KNOWN_CROSS_DB_RELATIONS) {
                        const includeRe = new RegExp(`include\\s*:\\s*\\{[^}]*\\b${relation}\\b\\s*:`, 'g');
                        if (includeRe.test(line)) {
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
            }
            catch {
            }
        }
        return findings;
    }
    buildModelDbMap() {
        const map = new Map();
        for (const schema of SCHEMAS) {
            try {
                const fullFolder = path.resolve(process.cwd(), schema.folderPath);
                if (!fs.existsSync(fullFolder))
                    continue;
                const prismaFiles = fs.readdirSync(fullFolder)
                    .filter((f) => f.endsWith('.prisma'))
                    .map((f) => path.join(fullFolder, f));
                for (const pFile of prismaFiles) {
                    const content = fs.readFileSync(pFile, 'utf-8');
                    const modelRe = /^model\s+(\w+)\s*\{/gm;
                    let match;
                    while ((match = modelRe.exec(content)) !== null) {
                        map.set(match[1], schema.dbLabel);
                    }
                }
            }
            catch {
            }
        }
        return map;
    }
    findTsFiles(dir) {
        const files = [];
        if (!fs.existsSync(dir))
            return files;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                files.push(...this.findTsFiles(fullPath));
            }
            else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
                files.push(fullPath);
            }
        }
        return files;
    }
};
exports.CrossDbIncludeCheckService = CrossDbIncludeCheckService;
exports.CrossDbIncludeCheckService = CrossDbIncludeCheckService = CrossDbIncludeCheckService_1 = __decorate([
    (0, common_1.Injectable)()
], CrossDbIncludeCheckService);
//# sourceMappingURL=cross-db-include-check.service.js.map