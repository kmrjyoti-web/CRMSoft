import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

export interface VariableInfo {
  name: string;
  required: boolean;
  defaultValue?: string;
}

@Injectable()
export class TemplateRendererService {
  constructor(private readonly prisma: PrismaService) {}

  render(template: string, data: Record<string, any>): string {
    let result = template;

    // 1. Handle conditionals: {{#if variable}}...content...{{/if}}
    result = result.replace(
      /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (_, variable, content) => {
        const value = this.resolveValue(variable, data);
        return value ? content : '';
      },
    );

    // 2. Handle fallback: {{fallback:variable:default}}
    result = result.replace(
      /\{\{fallback:(\w+(?:\.\w+)*):([^}]+)\}\}/g,
      (_, variable, defaultValue) => {
        const value = this.resolveValue(variable, data);
        return value || defaultValue;
      },
    );

    // 3. Handle standard variables: {{variable}} and {{nested.variable}}
    result = result.replace(
      /\{\{(\w+(?:\.\w+)*)\}\}/g,
      (_, variable) => {
        const value = this.resolveValue(variable, data);
        return value !== undefined && value !== null ? String(value) : '';
      },
    );

    return result;
  }

  extractVariables(template: string): VariableInfo[] {
    const variables: Map<string, VariableInfo> = new Map();

    // Standard: {{variable}}
    const standardRegex = /\{\{(\w+(?:\.\w+)*)\}\}/g;
    let match;
    while ((match = standardRegex.exec(template)) !== null) {
      if (!match[1].startsWith('#') && !match[1].startsWith('/')) {
        variables.set(match[1], { name: match[1], required: true });
      }
    }

    // Fallback: {{fallback:variable:default}}
    const fallbackRegex = /\{\{fallback:(\w+(?:\.\w+)*):([^}]+)\}\}/g;
    while ((match = fallbackRegex.exec(template)) !== null) {
      variables.set(match[1], { name: match[1], required: false, defaultValue: match[2] });
    }

    // Conditional: {{#if variable}}
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}/g;
    while ((match = conditionalRegex.exec(template)) !== null) {
      if (!variables.has(match[1])) {
        variables.set(match[1], { name: match[1], required: false });
      }
    }

    return Array.from(variables.values());
  }

  async preview(templateId: string, sampleData?: Record<string, any>) {
    const template = await this.prisma.emailTemplate.findUniqueOrThrow({ where: { id: templateId } });
    const vars = template.variables as any[] || [];
    const data = sampleData || {};

    // Fill in defaults for variables not provided
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

  private resolveValue(path: string, data: Record<string, any>): any {
    const parts = path.split('.');
    let current: any = data;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    return current;
  }
}
