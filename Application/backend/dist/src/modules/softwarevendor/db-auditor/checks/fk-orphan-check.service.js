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
var FkOrphanCheckService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FkOrphanCheckService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const DBS = [
    { label: 'IdentityDB', client: 'identity' },
    { label: 'PlatformDB', client: 'platform' },
    { label: 'WorkingDB', client: 'globalWorking' },
];
const FK_QUERY = `
  SELECT
    tc.constraint_name,
    kcu.table_name AS child_table,
    kcu.column_name AS child_column,
    ccu.table_name AS parent_table,
    ccu.column_name AS parent_column
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
  WHERE tc.table_schema = 'public' AND tc.constraint_type = 'FOREIGN KEY'
  ORDER BY kcu.table_name, kcu.column_name;
`;
const ROW_COUNT_LIMIT = 10_000_000;
const ORPHAN_SAMPLE_LIMIT = 100;
let FkOrphanCheckService = FkOrphanCheckService_1 = class FkOrphanCheckService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(FkOrphanCheckService_1.name);
    }
    async run(targetDb, deep = false) {
        const findings = [];
        const timeout = deep ? 600_000 : 60_000;
        const start = Date.now();
        const dbs = targetDb
            ? DBS.filter((d) => d.label.toLowerCase().includes(targetDb.toLowerCase()))
            : DBS;
        for (const db of dbs) {
            if (Date.now() - start > timeout) {
                findings.push({
                    severity: 'warn',
                    check: 'fkOrphan',
                    db: db.label,
                    rule: 'timeout',
                    message: `FK orphan check timed out after ${timeout / 1000}s. Partial results reported.`,
                });
                break;
            }
            try {
                const client = this.getClient(db.client);
                const fks = await client.$queryRawUnsafe(FK_QUERY);
                for (const fk of fks) {
                    if (Date.now() - start > timeout)
                        break;
                    if (fk.childTable.startsWith('_deprecated_') || fk.parentTable.startsWith('_deprecated_'))
                        continue;
                    if (!deep) {
                        try {
                            const countResult = await client.$queryRawUnsafe(`SELECT COUNT(*) AS cnt FROM "${fk.childTable}"`);
                            const rowCount = Number(countResult[0]?.cnt ?? 0);
                            if (rowCount > ROW_COUNT_LIMIT) {
                                this.logger.debug(`Skipping ${fk.childTable} (${rowCount} rows) — use --deep to include`);
                                continue;
                            }
                        }
                        catch {
                            continue;
                        }
                    }
                    try {
                        const orphanQuery = `
              SELECT child."${fk.childColumn}" AS fk_value, COUNT(*) AS orphan_count
              FROM "${fk.childTable}" child
              LEFT JOIN "${fk.parentTable}" parent ON child."${fk.childColumn}" = parent."${fk.parentColumn}"
              WHERE child."${fk.childColumn}" IS NOT NULL AND parent."${fk.parentColumn}" IS NULL
              GROUP BY child."${fk.childColumn}"
              LIMIT ${ORPHAN_SAMPLE_LIMIT}
            `;
                        const orphans = await client.$queryRawUnsafe(orphanQuery);
                        if (orphans.length > 0) {
                            const totalOrphans = orphans.reduce((sum, o) => sum + Number(o.orphan_count), 0);
                            findings.push({
                                severity: 'error',
                                check: 'fkOrphan',
                                db: db.label,
                                table: fk.childTable,
                                model: fk.constraintName,
                                rule: 'fk-orphan',
                                message: `${totalOrphans} orphan row(s) in '${fk.childTable}.${fk.childColumn}' → '${fk.parentTable}.${fk.parentColumn}' (${orphans.length} distinct FK values, capped at ${ORPHAN_SAMPLE_LIMIT})`,
                            });
                        }
                    }
                    catch (error) {
                        this.logger.debug(`FK check failed for ${fk.constraintName}: ${error.message}`);
                    }
                }
            }
            catch (error) {
                this.logger.error(`Failed to enumerate FKs for ${db.label}`, error);
            }
        }
        return findings;
    }
    getClient(name) {
        switch (name) {
            case 'identity': return this.prisma.identity;
            case 'platform': return this.prisma.platform;
            case 'globalWorking': return this.prisma.globalWorking;
        }
    }
};
exports.FkOrphanCheckService = FkOrphanCheckService;
exports.FkOrphanCheckService = FkOrphanCheckService = FkOrphanCheckService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FkOrphanCheckService);
//# sourceMappingURL=fk-orphan-check.service.js.map