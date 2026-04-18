"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronParserService = void 0;
const common_1 = require("@nestjs/common");
const cron_parser_1 = require("cron-parser");
let CronParserService = class CronParserService {
    isValid(expression) {
        try {
            cron_parser_1.CronExpressionParser.parse(expression);
            return true;
        }
        catch {
            return false;
        }
    }
    getNextRun(expression, timezone) {
        const interval = cron_parser_1.CronExpressionParser.parse(expression, {
            tz: timezone || 'Asia/Kolkata',
        });
        return interval.next().toDate();
    }
    getNextRuns(expression, count, timezone) {
        const interval = cron_parser_1.CronExpressionParser.parse(expression, {
            tz: timezone || 'Asia/Kolkata',
        });
        const runs = [];
        for (let i = 0; i < count; i++) {
            runs.push(interval.next().toDate());
        }
        return runs;
    }
    describe(expression) {
        const parts = expression.split(' ');
        if (parts.length < 5)
            return expression;
        const [min, hour, dom, mon, dow] = parts;
        if (min.startsWith('*/') && hour === '*')
            return `Every ${min.slice(2)} minutes`;
        if (min === '0' && hour.startsWith('*/'))
            return `Every ${hour.slice(2)} hours`;
        if (min === '0' && hour !== '*' && dom === '*' && dow === '*')
            return `Daily at ${hour.padStart(2, '0')}:00`;
        if (min !== '*' && hour !== '*' && dom === '*' && dow !== '*')
            return `${this.dowName(dow)} at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
        if (min !== '*' && hour !== '*' && dom !== '*' && mon === '*')
            return `Day ${dom} of month at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
        if (min === '*/1' || (min === '*' && hour === '*'))
            return 'Every minute';
        return expression;
    }
    dowName(dow) {
        const names = {
            '0': 'Sunday', '1': 'Monday', '2': 'Tuesday',
            '3': 'Wednesday', '4': 'Thursday', '5': 'Friday', '6': 'Saturday',
        };
        return names[dow] || `Day ${dow}`;
    }
};
exports.CronParserService = CronParserService;
exports.CronParserService = CronParserService = __decorate([
    (0, common_1.Injectable)()
], CronParserService);
//# sourceMappingURL=cron-parser.service.js.map