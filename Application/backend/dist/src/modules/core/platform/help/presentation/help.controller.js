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
exports.HelpController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_1 = require("../../../../../common/utils/api-response");
const help_service_1 = require("../services/help.service");
const help_dto_1 = require("./dto/help.dto");
let HelpController = class HelpController {
    constructor(helpService) {
        this.helpService = helpService;
    }
    async listArticles(query) {
        const result = await this.helpService.listArticles(query);
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getContextual(query) {
        const articles = await this.helpService.getContextual(query.moduleCode, query.screenCode, query.fieldCode);
        return api_response_1.ApiResponse.success(articles);
    }
    async getByCode(code) {
        const article = await this.helpService.getByCode(code);
        return api_response_1.ApiResponse.success(article);
    }
    async create(dto) {
        const article = await this.helpService.create(dto);
        return api_response_1.ApiResponse.success(article, 'Help article created');
    }
    async update(id, dto) {
        const article = await this.helpService.update(id, dto);
        return api_response_1.ApiResponse.success(article, 'Help article updated');
    }
    async markHelpful(id) {
        const article = await this.helpService.markHelpful(id);
        return api_response_1.ApiResponse.success(article, 'Marked as helpful');
    }
    async markNotHelpful(id) {
        const article = await this.helpService.markNotHelpful(id);
        return api_response_1.ApiResponse.success(article, 'Marked as not helpful');
    }
    async seedDefaults() {
        const result = await this.helpService.seedDefaults();
        return api_response_1.ApiResponse.success(result, `Seeded ${result.seeded} help articles`);
    }
};
exports.HelpController = HelpController;
__decorate([
    (0, common_1.Get)('articles'),
    (0, swagger_1.ApiOperation)({ summary: 'List help articles (filtered, paginated)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [help_dto_1.ListHelpArticlesQueryDto]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "listArticles", null);
__decorate([
    (0, common_1.Get)('articles/contextual'),
    (0, swagger_1.ApiOperation)({ summary: 'Get contextual help for a screen/field' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [help_dto_1.ContextualHelpQueryDto]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "getContextual", null);
__decorate([
    (0, common_1.Get)('articles/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a help article by code' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "getByCode", null);
__decorate([
    (0, common_1.Post)('articles'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a help article (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [help_dto_1.CreateHelpArticleDto]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('articles/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a help article (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, help_dto_1.UpdateHelpArticleDto]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('articles/:id/helpful'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark article as helpful' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "markHelpful", null);
__decorate([
    (0, common_1.Post)('articles/:id/not-helpful'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark article as not helpful' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "markNotHelpful", null);
__decorate([
    (0, common_1.Post)('seed'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Seed default help articles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "seedDefaults", null);
exports.HelpController = HelpController = __decorate([
    (0, swagger_1.ApiTags)('Help'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('help'),
    __metadata("design:paramtypes", [help_service_1.HelpService])
], HelpController);
//# sourceMappingURL=help.controller.js.map