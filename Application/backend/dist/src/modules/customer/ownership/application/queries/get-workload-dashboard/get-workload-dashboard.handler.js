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
var GetWorkloadDashboardHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWorkloadDashboardHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_workload_dashboard_query_1 = require("./get-workload-dashboard.query");
const workload_service_1 = require("../../../services/workload.service");
let GetWorkloadDashboardHandler = GetWorkloadDashboardHandler_1 = class GetWorkloadDashboardHandler {
    constructor(workload) {
        this.workload = workload;
        this.logger = new common_1.Logger(GetWorkloadDashboardHandler_1.name);
    }
    async execute(query) {
        try {
            return this.workload.getDashboard({ roleId: query.roleId });
        }
        catch (error) {
            this.logger.error(`GetWorkloadDashboardHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetWorkloadDashboardHandler = GetWorkloadDashboardHandler;
exports.GetWorkloadDashboardHandler = GetWorkloadDashboardHandler = GetWorkloadDashboardHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_workload_dashboard_query_1.GetWorkloadDashboardQuery),
    __metadata("design:paramtypes", [workload_service_1.WorkloadService])
], GetWorkloadDashboardHandler);
//# sourceMappingURL=get-workload-dashboard.handler.js.map