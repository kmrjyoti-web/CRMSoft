"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessLocationsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../core/prisma/prisma.module");
const locations_controller_1 = require("./presentation/locations.controller");
const company_locations_controller_1 = require("./presentation/company-locations.controller");
const company_locations_service_1 = require("./services/company-locations.service");
let BusinessLocationsModule = class BusinessLocationsModule {
};
exports.BusinessLocationsModule = BusinessLocationsModule;
exports.BusinessLocationsModule = BusinessLocationsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [locations_controller_1.LocationsController, company_locations_controller_1.CompanyLocationsController],
        providers: [company_locations_service_1.CompanyLocationsService],
        exports: [company_locations_service_1.CompanyLocationsService],
    })
], BusinessLocationsModule);
//# sourceMappingURL=business-locations.module.js.map