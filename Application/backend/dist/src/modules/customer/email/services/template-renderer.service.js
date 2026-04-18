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
exports.TemplateRendererService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let TemplateRendererService = class TemplateRendererService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    render(template, data) {
        let result = template;
        result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, variable, content) => {
            const value = this.resolveValue(variable, data);
            return value ? content : '';
        });
        result = result.replace(/\{\{fallback:(\w+(?:\.\w+)*):([^}]+)\}\}/g, (_, variable, defaultValue) => {
            const value = this.resolveValue(variable, data);
            return value || defaultValue;
        });
        result = result.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, variable) => {
            const value = this.resolveValue(variable, data);
            return value !== undefined && value !== null ? String(value) : '';
        });
        return result;
    }
    extractVariables(template) {
        const variables = new Map();
        const standardRegex = /\{\{(\w+(?:\.\w+)*)\}\}/g;
        let match;
        while ((match = standardRegex.exec(template)) !== null) {
            if (!match[1].startsWith('#') && !match[1].startsWith('/')) {
                variables.set(match[1], { name: match[1], required: true });
            }
        }
        const fallbackRegex = /\{\{fallback:(\w+(?:\.\w+)*):([^}]+)\}\}/g;
        while ((match = fallbackRegex.exec(template)) !== null) {
            variables.set(match[1], { name: match[1], required: false, defaultValue: match[2] });
        }
        const conditionalRegex = /\{\{#if\s+(\w+)\}\}/g;
        while ((match = conditionalRegex.exec(template)) !== null) {
            if (!variables.has(match[1])) {
                variables.set(match[1], { name: match[1], required: false });
            }
        }
        return Array.from(variables.values());
    }
    async preview(templateId, sampleData) {
        const template = await this.prisma.working.emailTemplate.findUniqueOrThrow({ where: { id: templateId } });
        const vars = template.variables || [];
        const data = sampleData || {};
        for (const v of vars) {
            if (!(v.name in data) && v.default) {
                data[v.name] = v.default;
            }
        }
        return {
            subject: this.render(template.subject, data),
            bodyHtml: this.render(template.bodyHtml, data),
            bodyText: template.bodyText ? this.render(template.bodyText, data) : null,
            usedVariables: this.extractVariables(template.bodyHtml + ' ' + template.subject),
        };
    }
    resolveValue(path, data) {
        const parts = path.split('.');
        let current = data;
        for (const part of parts) {
            if (current === null || current === undefined)
                return undefined;
            current = current[part];
        }
        return current;
    }
};
exports.TemplateRendererService = TemplateRendererService;
exports.TemplateRendererService = TemplateRendererService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplateRendererService);
//# sourceMappingURL=template-renderer.service.js.map