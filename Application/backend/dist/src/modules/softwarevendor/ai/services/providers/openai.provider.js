"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OpenaiProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenaiProvider = void 0;
const common_1 = require("@nestjs/common");
let OpenaiProvider = OpenaiProvider_1 = class OpenaiProvider {
    constructor() {
        this.logger = new common_1.Logger(OpenaiProvider_1.name);
    }
    async generate(model, apiKey, systemPrompt, userPrompt, organizationId) {
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        };
        if (organizationId)
            headers['OpenAI-Organization'] = organizationId;
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model,
                max_tokens: 4096,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
            }),
        });
        const data = await res.json();
        if (data.error) {
            throw new Error(`OpenAI error: ${data.error.message}`);
        }
        return {
            content: data.choices?.[0]?.message?.content || '',
            usage: {
                promptTokens: data.usage?.prompt_tokens || 0,
                outputTokens: data.usage?.completion_tokens || 0,
            },
        };
    }
};
exports.OpenaiProvider = OpenaiProvider;
exports.OpenaiProvider = OpenaiProvider = OpenaiProvider_1 = __decorate([
    (0, common_1.Injectable)()
], OpenaiProvider);
//# sourceMappingURL=openai.provider.js.map