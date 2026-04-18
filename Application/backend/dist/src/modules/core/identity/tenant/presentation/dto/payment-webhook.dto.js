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
exports.PaymentWebhookDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class PaymentWebhookDto {
}
exports.PaymentWebhookDto = PaymentWebhookDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Webhook event type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "event", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Webhook payload', type: Object }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PaymentWebhookDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Webhook signature for verification' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "signature", void 0);
//# sourceMappingURL=payment-webhook.dto.js.map