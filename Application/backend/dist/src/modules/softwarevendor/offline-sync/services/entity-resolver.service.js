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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityResolverService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const ENTITY_CONFIG_MAP = {
    Contact: {
        delegateName: 'contact',
        ownerFields: ['createdById'],
        softDeleteField: 'isActive',
        terminalStatuses: [],
        syncInclude: { communications: true },
        excludeFields: [],
    },
    Organization: {
        delegateName: 'organization',
        ownerFields: ['createdById'],
        softDeleteField: 'isActive',
        terminalStatuses: [],
        syncInclude: null,
        excludeFields: [],
    },
    Lead: {
        delegateName: 'lead',
        ownerFields: ['allocatedToId', 'createdById'],
        softDeleteField: null,
        terminalStatuses: ['LOST', 'ON_HOLD'],
        syncInclude: { contact: true, organization: true, filters: true },
        excludeFields: [],
    },
    Activity: {
        delegateName: 'activity',
        ownerFields: ['createdById'],
        softDeleteField: null,
        terminalStatuses: [],
        syncInclude: null,
        excludeFields: [],
    },
    Demo: {
        delegateName: 'demo',
        ownerFields: ['conductedById'],
        softDeleteField: null,
        terminalStatuses: ['CANCELLED', 'NO_SHOW'],
        syncInclude: null,
        excludeFields: [],
    },
    TourPlan: {
        delegateName: 'tourPlan',
        ownerFields: ['salesPersonId'],
        softDeleteField: null,
        terminalStatuses: ['CANCELLED'],
        syncInclude: { visits: true },
        excludeFields: [],
    },
    TourPlanVisit: {
        delegateName: 'tourPlanVisit',
        ownerFields: [],
        softDeleteField: null,
        terminalStatuses: [],
        syncInclude: null,
        excludeFields: [],
    },
    Quotation: {
        delegateName: 'quotation',
        ownerFields: ['createdById'],
        softDeleteField: null,
        terminalStatuses: ['CANCELLED', 'EXPIRED', 'REJECTED'],
        syncInclude: { lineItems: true },
        excludeFields: [],
    },
    LookupValue: {
        delegateName: 'lookupValue',
        ownerFields: [],
        softDeleteField: 'isActive',
        terminalStatuses: [],
        syncInclude: { lookup: true },
        excludeFields: [],
    },
    MasterLookup: {
        delegateName: 'masterLookup',
        ownerFields: [],
        softDeleteField: 'isActive',
        terminalStatuses: [],
        syncInclude: null,
        excludeFields: [],
    },
    User: {
        delegateName: 'user',
        ownerFields: [],
        softDeleteField: null,
        terminalStatuses: [],
        syncInclude: null,
        excludeFields: ['password'],
    },
    Role: {
        delegateName: 'role',
        ownerFields: [],
        softDeleteField: null,
        terminalStatuses: [],
        syncInclude: null,
        excludeFields: [],
    },
    Product: {
        delegateName: 'product',
        ownerFields: ['createdById'],
        softDeleteField: 'isActive',
        terminalStatuses: [],
        syncInclude: null,
        excludeFields: [],
    },
};
let EntityResolverService = class EntityResolverService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getEntityConfig(entityName) {
        const config = ENTITY_CONFIG_MAP[entityName];
        if (!config) {
            throw new common_1.BadRequestException(`Unknown sync entity: "${entityName}". Supported: ${Object.keys(ENTITY_CONFIG_MAP).join(', ')}`);
        }
        return config;
    }
    getDelegate(entityName) {
        const config = this.getEntityConfig(entityName);
        return this.prisma[config.delegateName];
    }
    getSupportedEntities() {
        return Object.keys(ENTITY_CONFIG_MAP);
    }
    isSupported(entityName) {
        return entityName in ENTITY_CONFIG_MAP;
    }
};
exports.EntityResolverService = EntityResolverService;
exports.EntityResolverService = EntityResolverService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EntityResolverService);
//# sourceMappingURL=entity-resolver.service.js.map