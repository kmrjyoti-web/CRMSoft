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
var GetLeaderboardHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLeaderboardHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_leaderboard_query_1 = require("./get-leaderboard.query");
const team_performance_service_1 = require("../../../services/team-performance.service");
let GetLeaderboardHandler = GetLeaderboardHandler_1 = class GetLeaderboardHandler {
    constructor(teamPerformance) {
        this.teamPerformance = teamPerformance;
        this.logger = new common_1.Logger(GetLeaderboardHandler_1.name);
    }
    async execute(query) {
        try {
            return this.teamPerformance.getLeaderboard({
                dateFrom: query.dateFrom, dateTo: query.dateTo,
                metric: query.metric, limit: query.limit, currentUserId: query.currentUserId,
            });
        }
        catch (error) {
            this.logger.error(`GetLeaderboardHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetLeaderboardHandler = GetLeaderboardHandler;
exports.GetLeaderboardHandler = GetLeaderboardHandler = GetLeaderboardHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_leaderboard_query_1.GetLeaderboardQuery),
    __metadata("design:paramtypes", [team_performance_service_1.TeamPerformanceService])
], GetLeaderboardHandler);
//# sourceMappingURL=get-leaderboard.handler.js.map