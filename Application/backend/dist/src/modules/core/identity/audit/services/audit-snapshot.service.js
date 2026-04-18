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
exports.AuditSnapshotService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let AuditSnapshotService = class AuditSnapshotService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async captureSnapshot(entityType, entityId) {
        try {
            let entity = null;
            switch (entityType) {
                case 'LEAD':
                    entity = await this.prisma.lead.findUnique({
                        where: { id: entityId },
                        include: {
                            contact: { select: { firstName: true, lastName: true } },
                            organization: { select: { name: true } },
                            allocatedTo: { select: { firstName: true, lastName: true } },
                        },
                    });
                    break;
                case 'CONTACT':
                    entity = await this.prisma.contact.findUnique({
                        where: { id: entityId },
                        include: { organization: { select: { name: true } } },
                    });
                    break;
                case 'ORGANIZATION':
                    entity = await this.prisma.organization.findUnique({ where: { id: entityId } });
                    break;
                case 'QUOTATION':
                    entity = await this.prisma.quotation.findUnique({
                        where: { id: entityId },
                        include: { lead: { select: { leadNumber: true } } },
                    });
                    break;
                case 'ACTIVITY':
                    entity = await this.prisma.activity.findUnique({ where: { id: entityId } });
                    break;
                case 'DEMO':
                    entity = await this.prisma.working.demo.findUnique({
                        where: { id: entityId },
                        include: { lead: { select: { leadNumber: true } } },
                    });
                    break;
                case 'TOUR_PLAN':
                    entity = await this.prisma.tourPlan.findUnique({ where: { id: entityId } });
                    break;
                case 'FOLLOW_UP':
                    entity = await this.prisma.followUp.findUnique({ where: { id: entityId } });
                    break;
                case 'USER':
                    entity = await this.prisma.identity.user.findUnique({
                        where: { id: entityId },
                        select: {
                            id: true, email: true, firstName: true, lastName: true, phone: true,
                            avatar: true, status: true, userType: true, roleId: true,
                            departmentId: true, designationId: true, employeeCode: true,
                            createdAt: true, updatedAt: true,
                        },
                    });
                    break;
                case 'ROLE':
                    entity = await this.prisma.identity.role.findUnique({ where: { id: entityId } });
                    break;
                case 'LOOKUP_VALUE':
                    entity = await this.prisma.platform.lookupValue.findUnique({ where: { id: entityId } });
                    break;
                case 'SALES_TARGET':
                    entity = await this.prisma.salesTarget.findUnique({ where: { id: entityId } });
                    break;
                case 'PRODUCT':
                    entity = await this.prisma.product.findUnique({ where: { id: entityId } });
                    break;
                case 'INVOICE':
                    entity = await this.prisma.invoice.findUnique({
                        where: { id: entityId },
                        include: { contact: { select: { firstName: true, lastName: true } } },
                    });
                    break;
                case 'PAYMENT':
                    entity = await this.prisma.payment.findUnique({ where: { id: entityId } });
                    break;
                case 'WORKFLOW':
                    entity = await this.prisma.workflow.findUnique({ where: { id: entityId } });
                    break;
                case 'COMMUNICATION':
                    entity = await this.prisma.communication.findUnique({ where: { id: entityId } });
                    break;
                default:
                    return null;
            }
            if (!entity)
                return null;
            return this.serializeSnapshot(entity);
        }
        catch {
            return null;
        }
    }
    getEntityLabel(entityType, entityId, snapshot) {
        if (!snapshot)
            return `${entityType} ${entityId.substring(0, 8)}`;
        switch (entityType) {
            case 'LEAD':
                return `Lead #${snapshot.leadNumber || entityId.substring(0, 8)}`;
            case 'CONTACT':
                return snapshot.firstName ? `${snapshot.firstName} ${snapshot.lastName}` : `Contact ${entityId.substring(0, 8)}`;
            case 'ORGANIZATION':
                return snapshot.name || `Organization ${entityId.substring(0, 8)}`;
            case 'QUOTATION':
                return `Quotation ${snapshot.quotationNo || entityId.substring(0, 8)}`;
            case 'ACTIVITY':
                return snapshot.subject ? `${snapshot.type || 'Activity'}: ${snapshot.subject}` : `Activity ${entityId.substring(0, 8)}`;
            case 'DEMO':
                return snapshot.lead?.leadNumber ? `Demo for Lead #${snapshot.lead.leadNumber}` : `Demo ${entityId.substring(0, 8)}`;
            case 'TOUR_PLAN':
                return snapshot.title || `Tour Plan ${entityId.substring(0, 8)}`;
            case 'USER':
                return snapshot.firstName ? `${snapshot.firstName} ${snapshot.lastName}` : `User ${entityId.substring(0, 8)}`;
            case 'ROLE':
                return snapshot.name || `Role ${entityId.substring(0, 8)}`;
            case 'FOLLOW_UP':
                return snapshot.title || `Follow-Up ${entityId.substring(0, 8)}`;
            case 'SALES_TARGET':
                return snapshot.name || `Target ${snapshot.metric || entityId.substring(0, 8)}`;
            case 'PRODUCT':
                return snapshot.name || `Product ${entityId.substring(0, 8)}`;
            case 'INVOICE':
                return snapshot.invoiceNo || `Invoice ${entityId.substring(0, 8)}`;
            case 'PAYMENT':
                return snapshot.referenceNumber || `Payment ${entityId.substring(0, 8)}`;
            case 'WORKFLOW':
                return snapshot.name || `Workflow ${entityId.substring(0, 8)}`;
            case 'COMMUNICATION':
                return snapshot.subject || `Communication ${entityId.substring(0, 8)}`;
            default:
                return `${entityType} ${entityId.substring(0, 8)}`;
        }
    }
    serializeSnapshot(entity) {
        const result = {};
        for (const [key, value] of Object.entries(entity)) {
            if (key === 'password' || key === 'refreshToken')
                continue;
            if (value instanceof Date) {
                result[key] = value.toISOString();
            }
            else if (typeof value === 'bigint') {
                result[key] = value.toString();
            }
            else if (value !== undefined && value !== null && typeof value === 'object' && 'toNumber' in value) {
                result[key] = String(value);
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
};
exports.AuditSnapshotService = AuditSnapshotService;
exports.AuditSnapshotService = AuditSnapshotService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditSnapshotService);
//# sourceMappingURL=audit-snapshot.service.js.map