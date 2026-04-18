"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmcWarrantyModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../core/prisma/prisma.module");
const warranty_template_controller_1 = require("./presentation/warranty-template.controller");
const warranty_record_controller_1 = require("./presentation/warranty-record.controller");
const warranty_claim_controller_1 = require("./presentation/warranty-claim.controller");
const amc_plan_controller_1 = require("./presentation/amc-plan.controller");
const amc_contract_controller_1 = require("./presentation/amc-contract.controller");
const amc_schedule_controller_1 = require("./presentation/amc-schedule.controller");
const service_visit_controller_1 = require("./presentation/service-visit.controller");
const warranty_template_service_1 = require("./services/warranty-template.service");
const warranty_record_service_1 = require("./services/warranty-record.service");
const warranty_claim_service_1 = require("./services/warranty-claim.service");
const amc_plan_service_1 = require("./services/amc-plan.service");
const amc_contract_service_1 = require("./services/amc-contract.service");
const amc_schedule_service_1 = require("./services/amc-schedule.service");
const service_visit_service_1 = require("./services/service-visit.service");
let AmcWarrantyModule = class AmcWarrantyModule {
};
exports.AmcWarrantyModule = AmcWarrantyModule;
exports.AmcWarrantyModule = AmcWarrantyModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [
            warranty_template_controller_1.WarrantyTemplateController,
            warranty_record_controller_1.WarrantyRecordController,
            warranty_claim_controller_1.WarrantyClaimController,
            amc_plan_controller_1.AMCPlanController,
            amc_contract_controller_1.AMCContractController,
            amc_schedule_controller_1.AMCScheduleController,
            service_visit_controller_1.ServiceVisitController,
        ],
        providers: [
            warranty_template_service_1.WarrantyTemplateService,
            warranty_record_service_1.WarrantyRecordService,
            warranty_claim_service_1.WarrantyClaimService,
            amc_plan_service_1.AMCPlanService,
            amc_contract_service_1.AMCContractService,
            amc_schedule_service_1.AMCScheduleService,
            service_visit_service_1.ServiceVisitService,
        ],
        exports: [warranty_record_service_1.WarrantyRecordService, amc_contract_service_1.AMCContractService],
    })
], AmcWarrantyModule);
//# sourceMappingURL=amc-warranty.module.js.map