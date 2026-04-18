"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NamingCheckService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamingCheckService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const fs = require("fs");
const path = require("path");
const SNAKE_CASE_RE = /^[a-z][a-z0-9_]*$/;
const LOCKED_MODULE_CODES = new Set([
    'usr', 'cfg', 'inv', 'crm', 'sal', 'pay', 'acc', 'tax',
    'hr', 'mkt', 'lic', 'ven', 'wf', 'not', 'rpt', 'doc', 'cmn', 'aud',
    'qa',
]);
const SYSTEM_PREFIXES = [
    '_deprecated_',
    '_prisma_',
    'pc_',
    'gl_',
];
const SCHEMA_FILES = [
    { dbLabel: 'IdentityDB', folderPath: 'prisma/identity/v1' },
    { dbLabel: 'PlatformDB', folderPath: 'prisma/platform/v1' },
    { dbLabel: 'WorkingDB', folderPath: 'prisma/working/v1' },
    { dbLabel: 'MarketplaceDB', folderPath: 'prisma/marketplace/v1' },
    { dbLabel: 'PlatformConsoleDB', folderPath: 'prisma/platform-console/v1' },
    { dbLabel: 'GlobalReferenceDB', folderPath: 'prisma/global/v1' },
    { dbLabel: 'DemoDB', folderPath: 'prisma/demo/v1' },
];
function parseModels(content) {
    const models = [];
    const lines = content.split('\n');
    let inModel = false;
    let modelName = '';
    let braceDepth = 0;
    let tableName = null;
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
        for (const ch of trimmed) {
            if (ch === '{')
                braceDepth++;
            if (ch === '}')
                braceDepth--;
        }
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
let NamingCheckService = NamingCheckService_1 = class NamingCheckService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NamingCheckService_1.name);
    }
    async run(targetDb) {
        const findings = [];
        const verticals = await this.prisma.platform.gvCfgVertical.findMany({
            select: { code: true, tablePrefix: true },
        });
        const verticalPrefixes = verticals.map((v) => v.tablePrefix.replace(/_$/, '') + '_');
        const ALLOWED_PREFIXES = [...verticalPrefixes, ...SYSTEM_PREFIXES];
        const schemas = targetDb
            ? SCHEMA_FILES.filter((s) => s.dbLabel.toLowerCase().includes(targetDb.toLowerCase()))
            : SCHEMA_FILES;
        for (const schema of schemas) {
            try {
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
                    const sourceFile = prismaFiles.find((f) => fs.readFileSync(f, 'utf-8').includes(`model ${model.name} {`)) ?? schema.folderPath;
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
                    const isSystem = SYSTEM_PREFIXES.some((p) => tableName.startsWith(p));
                    if (isSystem)
                        continue;
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
                    const matchedPrefix = verticalPrefixes.find((p) => tableName.startsWith(p));
                    if (!matchedPrefix) {
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
            }
            catch (error) {
                this.logger.error(`Failed to parse ${schema.folderPath}`, error);
            }
        }
        return findings;
    }
};
exports.NamingCheckService = NamingCheckService;
exports.NamingCheckService = NamingCheckService = NamingCheckService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NamingCheckService);
//# sourceMappingURL=naming-check.service.js.map