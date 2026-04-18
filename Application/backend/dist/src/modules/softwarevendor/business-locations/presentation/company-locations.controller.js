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
exports.CompanyLocationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_1 = require("../../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const company_locations_service_1 = require("../services/company-locations.service");
const company_locations_dto_1 = require("./dto/company/company-locations.dto");
let CompanyLocationsController = class CompanyLocationsController {
    constructor(svc) {
        this.svc = svc;
    }
    getTenantId(req) {
        return req.user?.tenantId ?? '';
    }
    async getTree(req) {
        const tree = await this.svc.getLocationTree(this.getTenantId(req));
        return api_response_1.ApiResponse.success(tree);
    }
    async getSummary(req) {
        const summary = await this.svc.getSummary(this.getTenantId(req));
        return api_response_1.ApiResponse.success(summary);
    }
    async getAllCountries() {
        return api_response_1.ApiResponse.success(this.svc.getAllCountries());
    }
    async getStates(countryCode) {
        return api_response_1.ApiResponse.success(this.svc.getStatesOfCountry(countryCode));
    }
    async getCities(countryCode, stateCode) {
        return api_response_1.ApiResponse.success(this.svc.getCitiesOfState(countryCode, stateCode));
    }
    async getGstCodes() {
        return api_response_1.ApiResponse.success(this.svc.getGstStateCodes());
    }
    async checkArea(req, dto) {
        const result = await this.svc.checkOperatingArea(this.getTenantId(req), dto);
        return api_response_1.ApiResponse.success(result);
    }
    async getGstType(req, customerStateCode) {
        const result = await this.svc.determineGstType(this.getTenantId(req), customerStateCode);
        return api_response_1.ApiResponse.success(result);
    }
    async addCountry(req, dto) {
        const result = await this.svc.addCountry(this.getTenantId(req), dto);
        return api_response_1.ApiResponse.success(result, 'Country added');
    }
    async removeCountry(req, id) {
        await this.svc.removeCountry(this.getTenantId(req), id);
        return api_response_1.ApiResponse.success(null, 'Country removed');
    }
    async addStates(req, countryId, dto) {
        const result = await this.svc.addStates(this.getTenantId(req), countryId, dto);
        return api_response_1.ApiResponse.success(result, 'States added');
    }
    async updateState(req, id, body) {
        await this.svc.updateState(this.getTenantId(req), id, body);
        return api_response_1.ApiResponse.success(null, 'State updated');
    }
    async removeState(req, id) {
        await this.svc.removeState(this.getTenantId(req), id);
        return api_response_1.ApiResponse.success(null, 'State removed');
    }
    async addCities(req, stateId, dto) {
        const result = await this.svc.addCities(this.getTenantId(req), stateId, dto);
        return api_response_1.ApiResponse.success(result, 'Cities added');
    }
    async updateCity(req, id, body) {
        await this.svc.updateCity(this.getTenantId(req), id, body);
        return api_response_1.ApiResponse.success(null, 'City updated');
    }
    async removeCity(req, id) {
        await this.svc.removeCity(this.getTenantId(req), id);
        return api_response_1.ApiResponse.success(null, 'City removed');
    }
    async addPincodes(req, cityId, dto) {
        const result = await this.svc.addPincodes(this.getTenantId(req), cityId, dto);
        return api_response_1.ApiResponse.success(result, 'Pincodes added');
    }
    async addPincodeRange(req, cityId, dto) {
        const result = await this.svc.addPincodeRange(this.getTenantId(req), cityId, dto);
        return api_response_1.ApiResponse.success(result, 'Pincode range added');
    }
    async removePincode(req, id) {
        await this.svc.removePincode(this.getTenantId(req), id);
        return api_response_1.ApiResponse.success(null, 'Pincode removed');
    }
};
exports.CompanyLocationsController = CompanyLocationsController;
__decorate([
    (0, common_1.Get)('tree'),
    (0, swagger_1.ApiOperation)({ summary: 'Full operating location tree (countries→states→cities→pincodes)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:read'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "getTree", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Location summary counts' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:read'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('package/countries'),
    (0, swagger_1.ApiOperation)({ summary: 'All countries from country-state-city package' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "getAllCountries", null);
__decorate([
    (0, common_1.Get)('package/states/:countryCode'),
    (0, swagger_1.ApiOperation)({ summary: 'States for a country from package' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:read'),
    __param(0, (0, common_1.Param)('countryCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "getStates", null);
__decorate([
    (0, common_1.Get)('package/cities/:countryCode/:stateCode'),
    (0, swagger_1.ApiOperation)({ summary: 'Cities for a state from package' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:read'),
    __param(0, (0, common_1.Param)('countryCode')),
    __param(1, (0, common_1.Param)('stateCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "getCities", null);
__decorate([
    (0, common_1.Get)('package/gst-codes'),
    (0, swagger_1.ApiOperation)({ summary: 'Indian GST state codes' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "getGstCodes", null);
__decorate([
    (0, common_1.Post)('check-area'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check if customer pincode/state is in operating area + GST type' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, company_locations_dto_1.CheckAreaDto]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "checkArea", null);
__decorate([
    (0, common_1.Get)('gst-type/:customerStateCode'),
    (0, swagger_1.ApiOperation)({ summary: 'Determine INTRA or INTER state GST for a customer state' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('customerStateCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "getGstType", null);
__decorate([
    (0, common_1.Post)('countries'),
    (0, swagger_1.ApiOperation)({ summary: 'Add operating country' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:create'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, company_locations_dto_1.AddCountryDto]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "addCountry", null);
__decorate([
    (0, common_1.Delete)('countries/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove operating country (cascades states→cities→pincodes)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "removeCountry", null);
__decorate([
    (0, common_1.Post)('countries/:countryId/states'),
    (0, swagger_1.ApiOperation)({ summary: 'Add states to operating country' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:create'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('countryId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, company_locations_dto_1.AddStatesDto]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "addStates", null);
__decorate([
    (0, common_1.Patch)('states/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update state coverage / HQ / GSTIN' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:update'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "updateState", null);
__decorate([
    (0, common_1.Delete)('states/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove state (cascades cities→pincodes)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "removeState", null);
__decorate([
    (0, common_1.Post)('states/:stateId/cities'),
    (0, swagger_1.ApiOperation)({ summary: 'Add cities to operating state' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:create'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('stateId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, company_locations_dto_1.AddCitiesDto]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "addCities", null);
__decorate([
    (0, common_1.Patch)('cities/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update city coverage' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:update'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "updateCity", null);
__decorate([
    (0, common_1.Delete)('cities/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove city (cascades pincodes)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "removeCity", null);
__decorate([
    (0, common_1.Post)('cities/:cityId/pincodes'),
    (0, swagger_1.ApiOperation)({ summary: 'Add pincodes to city (individual list)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:create'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('cityId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, company_locations_dto_1.AddPincodesDto]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "addPincodes", null);
__decorate([
    (0, common_1.Post)('cities/:cityId/pincodes/range'),
    (0, swagger_1.ApiOperation)({ summary: 'Add pincodes by range (e.g. 411001 to 411050)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:create'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('cityId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, company_locations_dto_1.AddPincodeRangeDto]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "addPincodeRange", null);
__decorate([
    (0, common_1.Delete)('pincodes/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove pincode' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompanyLocationsController.prototype, "removePincode", null);
exports.CompanyLocationsController = CompanyLocationsController = __decorate([
    (0, swagger_1.ApiTags)('Company Operating Locations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('settings/locations'),
    __metadata("design:paramtypes", [company_locations_service_1.CompanyLocationsService])
], CompanyLocationsController);
//# sourceMappingURL=company-locations.controller.js.map