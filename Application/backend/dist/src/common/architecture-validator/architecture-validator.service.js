"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ArchitectureValidatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchitectureValidatorService = void 0;
const common_1 = require("@nestjs/common");
let ArchitectureValidatorService = ArchitectureValidatorService_1 = class ArchitectureValidatorService {
    constructor() {
        this.logger = new common_1.Logger(ArchitectureValidatorService_1.name);
    }
    onModuleInit() {
        this.logger.log('Running architecture validation...');
        this.validateVerticalRegistry();
        this.logger.log('Architecture validation complete');
    }
    validateVerticalRegistry() {
        try {
            const { VERTICAL_SCHEMAS } = require('../vertical-registry/vertical-registry');
            const requiredEntities = ['CONTACT', 'LEAD', 'PRODUCT'];
            const requiredBusinessTypes = ['SOFTWARE_VENDOR', 'PHARMA', 'TOURISM', 'RESTAURANT', 'RETAIL', 'GENERAL'];
            const missing = [];
            for (const entity of requiredEntities) {
                if (!VERTICAL_SCHEMAS[entity]) {
                    missing.push(`${entity} has no schema`);
                    continue;
                }
                for (const bt of requiredBusinessTypes) {
                    if (!VERTICAL_SCHEMAS[entity][bt]) {
                        missing.push(`${entity}.${bt} schema missing`);
                    }
                }
            }
            if (missing.length > 0) {
                this.logger.warn(`  ⚠️  Vertical registry gaps: ${missing.join(', ')}`);
            }
            else {
                this.logger.log('  ✅ Vertical registry: all entities × business types covered');
            }
        }
        catch (err) {
            this.logger.warn('  ⚠️  Vertical registry not found — skipping validation');
        }
    }
};
exports.ArchitectureValidatorService = ArchitectureValidatorService;
exports.ArchitectureValidatorService = ArchitectureValidatorService = ArchitectureValidatorService_1 = __decorate([
    (0, common_1.Injectable)()
], ArchitectureValidatorService);
//# sourceMappingURL=architecture-validator.service.js.map