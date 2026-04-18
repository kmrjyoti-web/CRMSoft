"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableConfigModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../core/prisma/prisma.module");
const table_config_controller_1 = require("./presentation/table-config.controller");
const data_masking_controller_1 = require("./presentation/data-masking.controller");
const table_config_service_1 = require("./services/table-config.service");
const data_masking_service_1 = require("./services/data-masking.service");
const data_masking_interceptor_1 = require("./data-masking.interceptor");
const SERVICES = [table_config_service_1.TableConfigService, data_masking_service_1.DataMaskingService, data_masking_interceptor_1.DataMaskingInterceptor];
const CONTROLLERS = [table_config_controller_1.TableConfigController, data_masking_controller_1.DataMaskingController];
let TableConfigModule = class TableConfigModule {
};
exports.TableConfigModule = TableConfigModule;
exports.TableConfigModule = TableConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: CONTROLLERS,
        providers: SERVICES,
        exports: [table_config_service_1.TableConfigService, data_masking_service_1.DataMaskingService, data_masking_interceptor_1.DataMaskingInterceptor],
    })
], TableConfigModule);
//# sourceMappingURL=table-config.module.js.map