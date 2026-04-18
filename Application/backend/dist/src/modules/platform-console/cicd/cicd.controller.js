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
exports.CICDController = void 0;
const common_1 = require("@nestjs/common");
const cicd_service_1 = require("./cicd.service");
const log_deployment_dto_1 = require("./dto/log-deployment.dto");
const log_pipeline_dto_1 = require("./dto/log-pipeline.dto");
let CICDController = class CICDController {
    constructor(cicdService) {
        this.cicdService = cicdService;
    }
    getStats() {
        return this.cicdService.getStats();
    }
    getLatestDeployments() {
        return this.cicdService.getLatestDeployments();
    }
    getDeployments(environment, status, page, limit) {
        return this.cicdService.getDeployments({
            environment,
            status,
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
        });
    }
    logDeployment(dto) {
        return this.cicdService.logDeployment(dto);
    }
    getDeployment(id) {
        return this.cicdService.getDeployment(id);
    }
    completeDeployment(id, body) {
        return this.cicdService.completeDeployment(id, body);
    }
    getPipelines(status, page, limit) {
        return this.cicdService.getPipelines({
            status,
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
        });
    }
    logPipelineRun(dto) {
        return this.cicdService.logPipelineRun(dto);
    }
    getPipeline(id) {
        return this.cicdService.getPipeline(id);
    }
    completePipelineRun(id, body) {
        return this.cicdService.completePipelineRun(id, body);
    }
    getPipelineLogs(id) {
        return this.cicdService.getPipelineLogs(id);
    }
    addBuildLog(id, body) {
        return this.cicdService.addBuildLog({
            pipelineRunId: id,
            jobName: body.jobName,
            output: body.output,
            exitCode: body.exitCode,
            duration: body.duration,
        });
    }
};
exports.CICDController = CICDController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CICDController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('deployments/latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CICDController.prototype, "getLatestDeployments", null);
__decorate([
    (0, common_1.Get)('deployments'),
    __param(0, (0, common_1.Query)('environment')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], CICDController.prototype, "getDeployments", null);
__decorate([
    (0, common_1.Post)('deployments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_deployment_dto_1.LogDeploymentDto]),
    __metadata("design:returntype", void 0)
], CICDController.prototype, "logDeployment", null);
__decorate([
    (0, common_1.Get)('deployments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CICDController.prototype, "getDeployment", null);
__decorate([
    (0, common_1.Patch)('deployments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CICDController.prototype, "completeDeployment", null);
__decorate([
    (0, common_1.Get)('pipelines'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CICDController.prototype, "getPipelines", null);
__decorate([
    (0, common_1.Post)('pipelines'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_pipeline_dto_1.LogPipelineDto]),
    __metadata("design:returntype", void 0)
], CICDController.prototype, "logPipelineRun", null);
__decorate([
    (0, common_1.Get)('pipelines/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CICDController.prototype, "getPipeline", null);
__decorate([
    (0, common_1.Patch)('pipelines/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CICDController.prototype, "completePipelineRun", null);
__decorate([
    (0, common_1.Get)('pipelines/:id/logs'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CICDController.prototype, "getPipelineLogs", null);
__decorate([
    (0, common_1.Post)('pipelines/:id/logs'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CICDController.prototype, "addBuildLog", null);
exports.CICDController = CICDController = __decorate([
    (0, common_1.Controller)('platform-console/cicd'),
    __metadata("design:paramtypes", [cicd_service_1.CICDService])
], CICDController);
//# sourceMappingURL=cicd.controller.js.map