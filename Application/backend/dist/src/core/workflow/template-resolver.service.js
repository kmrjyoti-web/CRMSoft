"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateResolverService = void 0;
const common_1 = require("@nestjs/common");
let TemplateResolverService = class TemplateResolverService {
    resolve(template, context) {
        if (!template || typeof template !== 'string')
            return template;
        return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
            const value = this.getValue(path.trim(), context);
            return value !== undefined && value !== null ? String(value) : '';
        });
    }
    resolveObject(obj, context) {
        if (obj === null || obj === undefined)
            return obj;
        if (typeof obj === 'string')
            return this.resolve(obj, context);
        if (Array.isArray(obj))
            return obj.map((item) => this.resolveObject(item, context));
        if (typeof obj === 'object') {
            const resolved = {};
            for (const key of Object.keys(obj)) {
                resolved[key] = this.resolveObject(obj[key], context);
            }
            return resolved;
        }
        return obj;
    }
    getValue(path, context) {
        if (path === 'timestamp')
            return context.timestamp.toISOString();
        const parts = path.split('.');
        const root = parts[0];
        const rest = parts.slice(1);
        let target;
        switch (root) {
            case 'entity':
                target = context.entity;
                break;
            case 'performer':
                target = context.performer;
                break;
            case 'currentState':
                target = context.currentState;
                break;
            case 'previousState':
                target = context.previousState;
                break;
            default:
                return undefined;
        }
        return this.getNestedValue(target, rest);
    }
    getNestedValue(obj, parts) {
        let current = obj;
        for (const part of parts) {
            if (current === null || current === undefined)
                return undefined;
            current = current[part];
        }
        return current;
    }
};
exports.TemplateResolverService = TemplateResolverService;
exports.TemplateResolverService = TemplateResolverService = __decorate([
    (0, common_1.Injectable)()
], TemplateResolverService);
//# sourceMappingURL=template-resolver.service.js.map