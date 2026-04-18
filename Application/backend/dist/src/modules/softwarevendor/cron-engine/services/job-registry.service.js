"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var JobRegistryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRegistryService = void 0;
const common_1 = require("@nestjs/common");
let JobRegistryService = JobRegistryService_1 = class JobRegistryService {
    constructor() {
        this.logger = new common_1.Logger(JobRegistryService_1.name);
        this.handlers = new Map();
    }
    register(handler) {
        this.handlers.set(handler.jobCode, handler);
        this.logger.log(`Registered handler: ${handler.jobCode}`);
    }
    getHandler(jobCode) {
        return this.handlers.get(jobCode) ?? null;
    }
    listRegistered() {
        return Array.from(this.handlers.keys());
    }
};
exports.JobRegistryService = JobRegistryService;
exports.JobRegistryService = JobRegistryService = JobRegistryService_1 = __decorate([
    (0, common_1.Injectable)()
], JobRegistryService);
//# sourceMappingURL=job-registry.service.js.map