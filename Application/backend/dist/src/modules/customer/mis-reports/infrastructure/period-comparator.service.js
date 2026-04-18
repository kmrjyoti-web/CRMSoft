"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodComparatorService = void 0;
const common_1 = require("@nestjs/common");
let PeriodComparatorService = class PeriodComparatorService {
    getComparisonPeriod(dateFrom, dateTo) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        const durationMs = to.getTime() - from.getTime();
        const prevTo = new Date(from.getTime() - 1);
        const prevFrom = new Date(prevTo.getTime() - durationMs);
        return { from: prevFrom, to: prevTo };
    }
    compare(current, previous) {
        const previousMap = new Map();
        for (const metric of previous) {
            previousMap.set(metric.key, metric);
        }
        return current.map(metric => {
            const prev = previousMap.get(metric.key);
            if (!prev) {
                return {
                    ...metric,
                    previousValue: 0,
                    changePercent: metric.value > 0 ? 100 : 0,
                    changeDirection: metric.value > 0 ? 'UP' : 'FLAT',
                };
            }
            const changePercent = this.calculateChangePercent(metric.value, prev.value);
            const changeDirection = this.getDirection(metric.value, prev.value);
            return {
                ...metric,
                previousValue: prev.value,
                changePercent,
                changeDirection,
            };
        });
    }
    calculateChangePercent(current, previous) {
        if (previous === 0) {
            return current > 0 ? 100 : 0;
        }
        return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
    }
    getDirection(current, previous) {
        const diff = current - previous;
        if (Math.abs(diff) < 0.001)
            return 'FLAT';
        return diff > 0 ? 'UP' : 'DOWN';
    }
};
exports.PeriodComparatorService = PeriodComparatorService;
exports.PeriodComparatorService = PeriodComparatorService = __decorate([
    (0, common_1.Injectable)()
], PeriodComparatorService);
//# sourceMappingURL=period-comparator.service.js.map