"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbAuditorController = void 0;
const common_1 = require("@nestjs/common");
const db_auditor_service_1 = require("./db-auditor.service");
let DbAuditorController = class DbAuditorController {
    constructor(service) {
        this.service = service;
    }
    run(db, deep) {
        return this.service.runAll({ db, deep: deep === 'true' });
    }
    runCheck(checkId, db, deep) {
        return this.service.runCheck(checkId, { db, deep: deep === 'true' });
    }
    getFindings() {
        const report = this.service.getLastReport();
        if (!report) {
            return { message: 'No audit has been run yet. Call GET /run first.' };
        }
        return report;
    }
};
exports.DbAuditorController = DbAuditorController;
__decorate([
    (0, common_1.Get)('run'),
    __param(0, (0, common_1.Query)('db')),
    __param(1, (0, common_1.Query)('deep')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DbAuditorController.prototype, "run", null);
__decorate([
    (0, common_1.Get)('run/:checkId'),
    __param(0, (0, common_1.Param)('checkId')),
    __param(1, (0, common_1.Query)('db')),
    __param(2, (0, common_1.Query)('deep')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], DbAuditorController.prototype, "runCheck", null);
__decorate([
    (0, common_1.Get)('findings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DbAuditorController.prototype, "getFindings", null);
exports.DbAuditorController = DbAuditorController = __decorate([
    (0, common_1.Controller)('platform/db-auditor'),
    __metadata("design:paramtypes", [db_auditor_service_1.DbAuditorService])
], DbAuditorController);
//# sourceMappingURL=db-auditor.controller.js.map