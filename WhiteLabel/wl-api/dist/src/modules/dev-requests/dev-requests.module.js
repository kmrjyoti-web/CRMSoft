"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const dev_requests_service_1 = require("./dev-requests.service");
const dev_requests_controller_1 = require("./dev-requests.controller");
let DevRequestsModule = class DevRequestsModule {
};
exports.DevRequestsModule = DevRequestsModule;
exports.DevRequestsModule = DevRequestsModule = __decorate([
    (0, common_1.Module)({
        providers: [dev_requests_service_1.DevRequestsService],
        controllers: [dev_requests_controller_1.DevRequestsController],
        exports: [dev_requests_service_1.DevRequestsService],
    })
], DevRequestsModule);
//# sourceMappingURL=dev-requests.module.js.map