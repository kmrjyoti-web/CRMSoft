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
var ModuleDefinitionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleDefinitionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const module_seed_data_1 = require("./module-seed-data");
let ModuleDefinitionService = ModuleDefinitionService_1 = class ModuleDefinitionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ModuleDefinitionService_1.name);
    }
    async seed() {
        const results = await Promise.all(module_seed_data_1.MODULE_SEED_DATA.map((mod) => this.prisma.platform.moduleDefinition.upsert({
            where: { code: mod.code },
            update: {
                name: mod.name,
                category: mod.category,
                isCore: mod.isCore,
                iconName: mod.iconName,
                sortOrder: mod.sortOrder,
                dependsOn: mod.dependsOn,
                isActive: true,
            },
            create: {
                code: mod.code,
                name: mod.name,
                category: mod.category,
                isCore: mod.isCore,
                iconName: mod.iconName,
                sortOrder: mod.sortOrder,
                dependsOn: mod.dependsOn,
                isActive: true,
            },
        })));
        this.logger.log(`Module definitions seeded: ${results.length} modules`);
        return results;
    }
    async listAll(query) {
        const where = {};
        if (query?.category) {
            where.category = query.category;
        }
        return this.prisma.platform.moduleDefinition.findMany({
            where,
            orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        });
    }
    async getByCode(code) {
        const module = await this.prisma.platform.moduleDefinition.findUnique({
            where: { code },
        });
        if (!module) {
            throw new common_1.NotFoundException(`Module definition with code '${code}' not found`);
        }
        return module;
    }
    async create(data) {
        return this.prisma.platform.moduleDefinition.create({
            data: {
                code: data.code,
                name: data.name,
                description: data.description ?? null,
                category: data.category,
                isCore: data.isCore ?? false,
                iconName: data.iconName ?? null,
                sortOrder: data.sortOrder ?? 0,
                dependsOn: data.dependsOn ?? [],
                isActive: data.isActive ?? true,
            },
        });
    }
    async update(id, data) {
        const module = await this.prisma.platform.moduleDefinition.findUnique({ where: { id } });
        if (!module) {
            throw new common_1.NotFoundException(`Module definition ${id} not found`);
        }
        return this.prisma.platform.moduleDefinition.update({
            where: { id },
            data,
        });
    }
};
exports.ModuleDefinitionService = ModuleDefinitionService;
exports.ModuleDefinitionService = ModuleDefinitionService = ModuleDefinitionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ModuleDefinitionService);
//# sourceMappingURL=module-definition.service.js.map