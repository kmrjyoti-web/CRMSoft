import { Injectable } from '@nestjs/common';
import { WorkflowActionContext } from './interfaces/action-handler.interface';

@Injectable()
export class TemplateResolverService {
  resolve(template: string, context: WorkflowActionContext): string {
    if (!template || typeof template !== 'string') return template;
    return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const value = this.getValue(path.trim(), context);
      return value !== undefined && value !== null ? String(value) : '';
    });
  }

  resolveObject(obj: any, context: WorkflowActionContext): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return this.resolve(obj, context);
    if (Array.isArray(obj)) return obj.map((item) => this.resolveObject(item, context));
    if (typeof obj === 'object') {
      const resolved: any = {};
      for (const key of Object.keys(obj)) {
        resolved[key] = this.resolveObject(obj[key], context);
      }
      return resolved;
    }
    return obj;
  }

  private getValue(path: string, context: WorkflowActionContext): any {
    if (path === 'timestamp') return context.timestamp.toISOString();

    const parts = path.split('.');
    const root = parts[0];
    const rest = parts.slice(1);

    let target: any;
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

  private getNestedValue(obj: any, parts: string[]): any {
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    return current;
  }
}
