"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODEL_SUGGESTIONS = exports.AI_MODELS = void 0;
exports.AI_MODELS = {
    ANTHROPIC_CLAUDE: [
        { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', context: 200000, costTier: 'medium' },
        { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', context: 200000, costTier: 'low' },
    ],
    OPENAI_GPT: [
        { id: 'gpt-4o', label: 'GPT-4o', context: 128000, costTier: 'medium' },
        { id: 'gpt-4-turbo', label: 'GPT-4 Turbo', context: 128000, costTier: 'high' },
        { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', context: 16385, costTier: 'low' },
    ],
    GOOGLE_GEMINI: [
        { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', context: 1000000, costTier: 'medium' },
        { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', context: 1000000, costTier: 'low' },
    ],
    GROQ: [
        { id: 'llama3-70b-8192', label: 'Llama 3 70B', context: 8192, costTier: 'low' },
        { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', context: 32768, costTier: 'low' },
    ],
};
exports.MODEL_SUGGESTIONS = {
    generate: { provider: 'ANTHROPIC_CLAUDE', model: 'claude-sonnet-4-20250514', reason: 'Best for long-form document generation' },
    improve: { provider: 'OPENAI_GPT', model: 'gpt-4o', reason: 'Strong at text refinement' },
    translate: { provider: 'GOOGLE_GEMINI', model: 'gemini-1.5-pro', reason: 'Excellent multilingual support' },
    summarize: { provider: 'GROQ', model: 'llama3-70b-8192', reason: 'Fast summarization at low cost' },
    tone: { provider: 'ANTHROPIC_CLAUDE', model: 'claude-sonnet-4-20250514', reason: 'Precise tone control' },
};
//# sourceMappingURL=ai-models.config.js.map