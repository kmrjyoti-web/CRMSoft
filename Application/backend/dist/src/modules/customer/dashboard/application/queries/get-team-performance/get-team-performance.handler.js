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
var GetTeamPerformanceHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTeamPerformanceHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_team_performance_query_1 = require("./get-team-performance.query");
const team_performance_service_1 = require("../../../services/team-performance.service");
let GetTeamPerformanceHandler = GetTeamPerformanceHandler_1 = class GetTeamPerformanceHandler {
    constructor(teamPerformance) {
        this.teamPerformance = teamPerformance;
        this.logger = new common_1.Logger(GetTeamPerformanceHandler_1.name);
    }
    async execute(query) {
        try {
            return this.teamPerformance.getTeamPerformance({
                dateFrom: query.dateFrom, dateTo: query.dateTo, roleId: query.roleId,
            });
        }
        catch (error) {
            this.logger.error(`GetTeamPerformanceHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTeamPerformanceHandler = GetTeamPerformanceHandler;
exports.GetTeamPerformanceHandler = GetTeamPerformanceHandler = GetTeamPerformanceHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_team_performance_query_1.GetTeamPerformanceQuery),
    __metadata("design:paramtypes", [team_performance_service_1.TeamPerformanceService])
], GetTeamPerformanceHandler);
//# sourceMappingURL=get-team-performance.handler.js.map