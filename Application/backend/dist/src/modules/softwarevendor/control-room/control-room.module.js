"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlRoomModule = void 0;
const common_1 = require("@nestjs/common");
const rule_resolver_service_1 = require("./services/rule-resolver.service");
const control_room_service_1 = require("./services/control-room.service");
const control_room_controller_1 = require("./presentation/control-room.controller");
let ControlRoomModule = class ControlRoomModule {
};
exports.ControlRoomModule = ControlRoomModule;
exports.ControlRoomModule = ControlRoomModule = __decorate([
    (0, common_1.Module)({
        controllers: [control_room_controller_1.ControlRoomController],
        providers: [rule_resolver_service_1.RuleResolverService, control_room_service_1.ControlRoomService],
        exports: [rule_resolver_service_1.RuleResolverService, control_room_service_1.ControlRoomService],
    })
], ControlRoomModule);
//# sourceMappingURL=control-room.module.js.map