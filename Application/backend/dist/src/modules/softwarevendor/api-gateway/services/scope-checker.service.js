"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopeCheckerService = void 0;
const common_1 = require("@nestjs/common");
let ScopeCheckerService = class ScopeCheckerService {
    hasScopes(keyScopes, requiredScopes) {
        return requiredScopes.every(required => keyScopes.includes(required));
    }
    getMissingScopes(keyScopes, requiredScopes) {
        return requiredScopes.filter(required => !keyScopes.includes(required));
    }
};
exports.ScopeCheckerService = ScopeCheckerService;
exports.ScopeCheckerService = ScopeCheckerService = __decorate([
    (0, common_1.Injectable)()
], ScopeCheckerService);
//# sourceMappingURL=scope-checker.service.js.map