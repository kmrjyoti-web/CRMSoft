"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleManagerModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../core/prisma/prisma.module");
const module_manager_controller_1 = require("./presentation/module-manager.controller");
const module_manager_service_1 = require("./services/module-manager.service");
const SERVICES = [module_manager_service_1.ModuleManagerService];
const CONTROLLERS = [module_manager_controller_1.ModuleManagerController];
let ModuleManagerModule = class ModuleManagerModule {
};
exports.ModuleManagerModule = ModuleManagerModule;
exports.ModuleManagerModule = ModuleManagerModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: CONTROLLERS,
        providers: SERVICES,
        exports: [module_manager_service_1.ModuleManagerService],
    })
], ModuleManagerModule);
//# sourceMappingURL=module-manager.module.js.map