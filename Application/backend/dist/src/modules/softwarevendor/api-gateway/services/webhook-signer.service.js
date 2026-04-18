"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookSignerService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let WebhookSignerService = class WebhookSignerService {
    sign(payload, secret) {
        const body = JSON.stringify(payload);
        return (0, crypto_1.createHmac)('sha256', secret).update(body).digest('hex');
    }
    verify(payload, signature, secret) {
        const expected = (0, crypto_1.createHmac)('sha256', secret).update(payload).digest('hex');
        const sig = signature.replace('sha256=', '');
        try {
            return (0, crypto_1.timingSafeEqual)(Buffer.from(expected), Buffer.from(sig));
        }
        catch {
            return false;
        }
    }
};
exports.WebhookSignerService = WebhookSignerService;
exports.WebhookSignerService = WebhookSignerService = __decorate([
    (0, common_1.Injectable)()
], WebhookSignerService);
//# sourceMappingURL=webhook-signer.service.js.map