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
exports.ImportExecutorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let ImportExecutorService = class ImportExecutorService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async executeRow(row, targetEntity, createdById) {
        try {
            if (row.userAction === 'SKIP') {
                return { rowNumber: row.rowNumber, success: true, action: 'SKIPPED' };
            }
            const isUpdate = row.userAction === 'ACCEPT' && row.duplicateOfEntityId;
            if (isUpdate) {
                return await this.updateEntity(row, targetEntity);
            }
            return await this.createEntity(row, targetEntity, createdById);
        }
        catch (error) {
            return {
                rowNumber: row.rowNumber,
                success: false,
                action: 'FAILED',
                error: (error instanceof Error ? error.message : String(error)) || 'Unknown error',
            };
        }
    }
    async createEntity(row, targetEntity, createdById) {
        const data = row.mappedData;
        switch (targetEntity) {
            case 'ROW_CONTACT':
            case 'CONTACT': {
                const contact = await this.createContact(data, createdById);
                return { rowNumber: row.rowNumber, success: true, action: 'CREATED', entityId: contact.id };
            }
            case 'ORGANIZATION': {
                const org = await this.createOrganization(data, createdById);
                return { rowNumber: row.rowNumber, success: true, action: 'CREATED', entityId: org.id };
            }
            case 'LEAD': {
                const lead = await this.createLead(data, createdById);
                return { rowNumber: row.rowNumber, success: true, action: 'CREATED', entityId: lead.id };
            }
            case 'PRODUCT': {
                const product = await this.createProduct(data, createdById);
                return { rowNumber: row.rowNumber, success: true, action: 'CREATED', entityId: product.id };
            }
            case 'LEDGER': {
                const ledger = await this.createLedger(data);
                return { rowNumber: row.rowNumber, success: true, action: 'CREATED', entityId: ledger.id };
            }
            default:
                return { rowNumber: row.rowNumber, success: false, action: 'FAILED', error: `Unsupported entity: ${targetEntity}` };
        }
    }
    async updateEntity(row, targetEntity) {
        const entityId = row.duplicateOfEntityId;
        const data = this.filterEmptyValues(row.mappedData);
        try {
            switch (targetEntity) {
                case 'ROW_CONTACT':
                case 'CONTACT':
                    await this.prisma.working.rawContact.update({
                        where: { id: entityId },
                        data: { firstName: data.firstName, lastName: data.lastName, designation: data.designation, notes: data.notes },
                    });
                    break;
                case 'ORGANIZATION':
                    await this.prisma.working.organization.update({
                        where: { id: entityId },
                        data: { name: data['organization']?.name || data.name, city: data.city, state: data.state },
                    });
                    break;
            }
            return { rowNumber: row.rowNumber, success: true, action: 'UPDATED', entityId };
        }
        catch (error) {
            return { rowNumber: row.rowNumber, success: false, action: 'FAILED', error: (error instanceof Error ? error.message : String(error)) };
        }
    }
    async createContact(data, createdById) {
        const rawContact = await this.prisma.working.rawContact.create({
            data: {
                firstName: data.firstName || 'Unknown',
                lastName: data.lastName || '',
                companyName: data.organization?.name || data.companyName || null,
                designation: data.designation || null,
                notes: data.notes || null,
                source: 'BULK_IMPORT',
                status: 'RAW',
                createdById,
            },
        });
        const comms = [];
        if (data.email)
            comms.push({ type: 'EMAIL', value: data.email, priorityType: 'PRIMARY' });
        if (data.mobile)
            comms.push({ type: 'MOBILE', value: data.mobile, priorityType: 'PRIMARY' });
        if (data.phone)
            comms.push({ type: 'PHONE', value: data.phone, priorityType: 'WORK' });
        if (comms.length > 0) {
            await this.prisma.working.communication.createMany({
                data: comms.map(c => ({
                    type: c.type,
                    value: c.value,
                    priorityType: c.priorityType,
                    rawContactId: rawContact.id,
                })),
            });
        }
        return rawContact;
    }
    async createOrganization(data, createdById) {
        return this.prisma.working.organization.create({
            data: {
                name: data.organization?.name || data.name || 'Unknown',
                website: data.website || null,
                gstNumber: data.gstNumber || null,
                address: data.address || null,
                city: data.city || null,
                state: data.state || null,
                country: data.country || 'India',
                pincode: data.pincode || null,
                createdById,
            },
        });
    }
    async createLead(data, createdById) {
        const count = await this.prisma.working.lead.count();
        const leadNumber = `LD-${String(count + 1).padStart(5, '0')}`;
        return this.prisma.working.lead.create({
            data: {
                leadNumber,
                status: 'NEW',
                priority: data.priority || 'MEDIUM',
                expectedValue: data.expectedValue ? Number(data.expectedValue) : null,
                notes: data.notes || null,
                createdById,
                contactId: data.contactId || createdById,
            },
        });
    }
    async createProduct(data, createdById) {
        return this.prisma.working.product.create({
            data: {
                name: data.name || 'Unknown Product',
                code: data.code || null,
                description: data.description || null,
                hsnCode: data.hsnCode || null,
                mrp: data.mrp ? Number(data.mrp) : null,
                sellingPrice: data.sellingPrice ? Number(data.sellingPrice) : null,
                purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : null,
                taxRate: data.taxRate ? Number(data.taxRate) : null,
                unit: data.unit || 'PCS',
                barcode: data.barcode || null,
            },
        });
    }
    async createLedger(data) {
        return this.prisma.working.ledgerMaster.create({
            data: {
                name: data.name || 'Unknown Ledger',
                code: data.code || `LDG${Date.now().toString().slice(-6)}`,
                groupType: data.groupType || 'ASSET',
                openingBalance: data.openingBalance ? Number(data.openingBalance) : 0,
                openingBalanceType: data.balanceType || 'Dr',
                currentBalance: data.openingBalance ? Number(data.openingBalance) : 0,
                gstin: data.gstin || null,
                panNo: data.pan || null,
                mobile1: data.mobile || null,
                email: data.email || null,
                address: data.address || null,
                city: data.city || null,
                state: data.state || null,
                creditLimit: data.creditLimit ? Number(data.creditLimit) : null,
                creditDays: data.creditDays ? Number(data.creditDays) : null,
            },
        });
    }
    filterEmptyValues(data) {
        const filtered = {};
        for (const [key, val] of Object.entries(data)) {
            if (val !== null && val !== undefined && val !== '') {
                filtered[key] = val;
            }
        }
        return filtered;
    }
};
exports.ImportExecutorService = ImportExecutorService;
exports.ImportExecutorService = ImportExecutorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ImportExecutorService);
//# sourceMappingURL=import-executor.service.js.map