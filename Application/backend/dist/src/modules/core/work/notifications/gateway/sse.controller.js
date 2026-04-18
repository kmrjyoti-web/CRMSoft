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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SseController = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const realtime_service_1 = require("../services/realtime.service");
let SseController = class SseController {
    constructor(realtimeService) {
        this.realtimeService = realtimeService;
    }
    stream(userId) {
        const heartbeat$ = (0, rxjs_1.interval)(30000).pipe((0, operators_1.map)(() => ({
            data: JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() }),
        })));
        const notifications$ = this.realtimeService.getUserStream(userId).pipe((0, operators_1.map)(event => ({
            data: JSON.stringify(event),
            type: event.type,
        })));
        return (0, rxjs_1.merge)(heartbeat$, notifications$);
    }
};
exports.SseController = SseController;
__decorate([
    (0, common_1.Sse)('stream'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], SseController.prototype, "stream", null);
exports.SseController = SseController = __decorate([
    (0, common_1.Controller)('notifications/sse'),
    __metadata("design:paramtypes", [realtime_service_1.RealtimeService])
], SseController);
//# sourceMappingURL=sse.controller.js.map