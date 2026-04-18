"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AnthropicProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
const common_1 = require("@nestjs/common");
let AnthropicProvider = AnthropicProvider_1 = class AnthropicProvider {
    constructor() {
        this.logger = new common_1.Logger(AnthropicProvider_1.name);
    }
    async generate(model, apiKey, systemPrompt, userPrompt) {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model,
                max_tokens: 4096,
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }],
            }),
        });
        const data = await res.json();
        if (data.error) {
            throw new Error(`Anthropic error: ${data.error.message}`);
        }
        return {
            content: data.content?.[0]?.text || '',
            usage: {
                promptTokens: data.usage?.input_tokens || 0,
                outputTokens: data.usage?.output_tokens || 0,
            },
        };
    }
};
exports.AnthropicProvider = AnthropicProvider;
exports.AnthropicProvider = AnthropicProvider = AnthropicProvider_1 = __decorate([
    (0, common_1.Injectable)()
], AnthropicProvider);
//# sourceMappingURL=anthropic.provider.js.map