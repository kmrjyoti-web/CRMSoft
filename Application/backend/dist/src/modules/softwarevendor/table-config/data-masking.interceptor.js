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
var DataMaskingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataMaskingInterceptor = exports.MaskTable = exports.MASK_TABLE_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const data_masking_service_1 = require("./services/data-masking.service");
const error_utils_1 = require("../../../common/utils/error.utils");
exports.MASK_TABLE_KEY = 'mask_table_key';
const MaskTable = (tableKey) => (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(exports.MASK_TABLE_KEY, tableKey, descriptor.value);
    return descriptor;
};
exports.MaskTable = MaskTable;
let DataMaskingInterceptor = DataMaskingInterceptor_1 = class DataMaskingInterceptor {
    constructor(maskingService, reflector) {
        this.maskingService = maskingService;
        this.reflector = reflector;
        this.logger = new common_1.Logger(DataMaskingInterceptor_1.name);
    }
    intercept(context, next) {
        const tableKey = Reflect.getMetadata(exports.MASK_TABLE_KEY, context.getHandler());
        if (!tableKey) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user?.id || !user?.tenantId) {
            return next.handle();
        }
        return next.handle().pipe((0, operators_1.switchMap)((response) => (0, rxjs_1.from)((async () => {
            try {
                const rules = await this.maskingService.getMaskingRules(tableKey, user.id, user.roleId, user.tenantId);
                if (rules.length === 0)
                    return response;
                if (response?.data && Array.isArray(response.data)) {
                    return {
                        ...response,
                        data: this.maskingService.applyMasking(response.data, rules),
                    };
                }
                if (response?.data?.data && Array.isArray(response.data.data)) {
                    return {
                        ...response,
                        data: {
                            ...response.data,
                            data: this.maskingService.applyMasking(response.data.data, rules),
                        },
                    };
                }
                if (Array.isArray(response)) {
                    return this.maskingService.applyMasking(response, rules);
                }
                return response;
            }
            catch (err) {
                this.logger.warn(`Data masking failed for ${tableKey}: ${(0, error_utils_1.getErrorMessage)(err)}`);
                return response;
            }
        })())));
    }
};
exports.DataMaskingInterceptor = DataMaskingInterceptor;
exports.DataMaskingInterceptor = DataMaskingInterceptor = DataMaskingInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_masking_service_1.DataMaskingService,
        core_1.Reflector])
], DataMaskingInterceptor);
//# sourceMappingURL=data-masking.interceptor.js.map