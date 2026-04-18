"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossService = CrossService;
exports.getCrossServiceDeps = getCrossServiceDeps;
require("reflect-metadata");
function CrossService(targetService, reason) {
    return function (target, propertyKey, descriptor) {
        const sourceName = typeof target === 'function'
            ? target.name
            : target.constructor?.name ?? 'Unknown';
        const metadata = {
            targetService,
            reason,
            sourceName,
            method: propertyKey?.toString(),
        };
        const metaKey = 'cross_service_deps';
        const store = typeof target === 'function' ? target : target.constructor;
        const existing = Reflect.getMetadata(metaKey, store) ?? [];
        existing.push(metadata);
        Reflect.defineMetadata(metaKey, existing, store);
        return (descriptor ?? target);
    };
}
function getCrossServiceDeps(target) {
    return Reflect.getMetadata('cross_service_deps', target) ?? [];
}
//# sourceMappingURL=cross-service.decorator.js.map