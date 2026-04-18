"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityVerificationModule = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_module_1 = require("../../customer/whatsapp/whatsapp.module");
const entity_verification_service_1 = require("./services/entity-verification.service");
const entity_verification_controller_1 = require("./presentation/entity-verification.controller");
const public_entity_verification_controller_1 = require("./presentation/public-entity-verification.controller");
let EntityVerificationModule = class EntityVerificationModule {
};
exports.EntityVerificationModule = EntityVerificationModule;
exports.EntityVerificationModule = EntityVerificationModule = __decorate([
    (0, common_1.Module)({
        imports: [whatsapp_module_1.WhatsAppModule],
        controllers: [entity_verification_controller_1.EntityVerificationController, public_entity_verification_controller_1.PublicEntityVerificationController],
        providers: [entity_verification_service_1.EntityVerificationService],
        exports: [entity_verification_service_1.EntityVerificationService],
    })
], EntityVerificationModule);
//# sourceMappingURL=entity-verification.module.js.map