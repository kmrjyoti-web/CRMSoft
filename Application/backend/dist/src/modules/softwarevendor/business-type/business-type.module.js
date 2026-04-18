"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessTypeModule = void 0;
const common_1 = require("@nestjs/common");
const business_type_controller_1 = require("./presentation/business-type.controller");
const business_type_service_1 = require("./services/business-type.service");
const terminology_service_1 = require("./services/terminology.service");
const industry_config_service_1 = require("./services/industry-config.service");
let BusinessTypeModule = class BusinessTypeModule {
};
exports.BusinessTypeModule = BusinessTypeModule;
exports.BusinessTypeModule = BusinessTypeModule = __decorate([
    (0, common_1.Module)({
        controllers: [business_type_controller_1.BusinessTypeController],
        providers: [business_type_service_1.BusinessTypeService, terminology_service_1.TerminologyService, industry_config_service_1.IndustryConfigService],
        exports: [business_type_service_1.BusinessTypeService, terminology_service_1.TerminologyService, industry_config_service_1.IndustryConfigService],
    })
], BusinessTypeModule);
//# sourceMappingURL=business-type.module.js.map