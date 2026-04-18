"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartSearchModule = void 0;
const common_1 = require("@nestjs/common");
const smart_search_controller_1 = require("./smart-search.controller");
const smart_search_service_1 = require("./smart-search.service");
const prisma_module_1 = require("../../../../core/prisma/prisma.module");
let SmartSearchModule = class SmartSearchModule {
};
exports.SmartSearchModule = SmartSearchModule;
exports.SmartSearchModule = SmartSearchModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [smart_search_controller_1.SmartSearchController],
        providers: [smart_search_service_1.SmartSearchService],
        exports: [smart_search_service_1.SmartSearchService],
    })
], SmartSearchModule);
//# sourceMappingURL=smart-search.module.js.map