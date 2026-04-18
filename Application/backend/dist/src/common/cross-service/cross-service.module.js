"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossServiceModule = void 0;
const common_1 = require("@nestjs/common");
const identity_service_interface_1 = require("./interfaces/identity-service.interface");
const vendor_service_interface_1 = require("./interfaces/vendor-service.interface");
const identity_service_monolith_1 = require("./monolith/identity-service.monolith");
const vendor_service_monolith_1 = require("./monolith/vendor-service.monolith");
let CrossServiceModule = class CrossServiceModule {
};
exports.CrossServiceModule = CrossServiceModule;
exports.CrossServiceModule = CrossServiceModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            { provide: identity_service_interface_1.IDENTITY_SERVICE, useClass: identity_service_monolith_1.IdentityServiceMonolith },
            { provide: vendor_service_interface_1.VENDOR_SERVICE, useClass: vendor_service_monolith_1.VendorServiceMonolith },
        ],
        exports: [identity_service_interface_1.IDENTITY_SERVICE, vendor_service_interface_1.VENDOR_SERVICE],
    })
], CrossServiceModule);
//# sourceMappingURL=cross-service.module.js.map