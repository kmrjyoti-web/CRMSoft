"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const result_type_1 = require("../types/result.type");
let ResultResponseInterceptor = class ResultResponseInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (data !== null &&
                typeof data === 'object' &&
                'success' in data) {
                const result = data;
                if ((0, result_type_1.isErr)(result)) {
                    throw new common_1.HttpException({ success: false, error: result.error }, result.error.statusCode ?? 400);
                }
                const okResult = result;
                return { success: true, data: okResult.data };
            }
            return { success: true, data };
        }));
    }
};
exports.ResultResponseInterceptor = ResultResponseInterceptor;
exports.ResultResponseInterceptor = ResultResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResultResponseInterceptor);
//# sourceMappingURL=result-response.interceptor.js.map