"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaFilterBuilder = void 0;
class PrismaFilterBuilder {
    constructor() {
        this.where = {};
    }
    exact(field, value) {
        if (value !== undefined && value !== null) {
            this.where[field] = value;
        }
        return this;
    }
    textContains(field, value) {
        if (value) {
            this.where[field] = { contains: value, mode: 'insensitive' };
        }
        return this;
    }
    dateRange(field, from, to) {
        if (from || to) {
            this.where[field] = {};
            if (from)
                this.where[field].gte = new Date(from);
            if (to)
                this.where[field].lte = new Date(to);
        }
        return this;
    }
    numberRange(field, min, max) {
        if (min !== undefined || max !== undefined) {
            this.where[field] = {};
            if (min !== undefined)
                this.where[field].gte = min;
            if (max !== undefined)
                this.where[field].lte = max;
        }
        return this;
    }
    inArray(field, values) {
        if (values?.length) {
            this.where[field] = { in: values };
        }
        return this;
    }
    entityFilters(filterValueIds) {
        if (filterValueIds?.length) {
            this.where.filters = {
                some: { lookupValueId: { in: filterValueIds } },
            };
        }
        return this;
    }
    search(term, fields) {
        if (term) {
            this.where.OR = fields.map((field) => {
                if (typeof field === 'string') {
                    return { [field]: { contains: term, mode: 'insensitive' } };
                }
                return field;
            });
        }
        return this;
    }
    raw(conditions) {
        Object.assign(this.where, conditions);
        return this;
    }
    build() {
        return this.where;
    }
}
exports.PrismaFilterBuilder = PrismaFilterBuilder;
//# sourceMappingURL=filter-builder.js.map