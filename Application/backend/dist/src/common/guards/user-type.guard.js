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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTypeGuard = exports.USER_TYPES_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
exports.USER_TYPES_KEY = 'userTypes';
let UserTypeGuard = class UserTypeGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredTypes = this.reflector.getAllAndOverride(exports.USER_TYPES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredTypes)
            return true;
        const { user } = context.switchToHttp().getRequest();
        if (!user)
            throw new common_1.ForbiddenException('Access denied');
        if (!requiredTypes.includes(user.userType)) {
            throw new common_1.ForbiddenException(`This endpoint requires userType: ${requiredTypes.join(' or ')}`);
        }
        return true;
    }
};
exports.UserTypeGuard = UserTypeGuard;
exports.UserTypeGuard = UserTypeGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], UserTypeGuard);
//# sourceMappingURL=user-type.guard.js.map