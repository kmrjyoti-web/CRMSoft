import { Injectable, Logger } from '@nestjs/common';
import type { AiProviderResult } from './anthropic.provider';

@Injectable()
export class GroqProvider {
  private readonly logger = new Logger(GroqProvider.name);

  async generate(
    model: string,
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<AiProviderResult> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
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
      throw new Error(`Groq error: ${data.error.message}`);
    }

    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
      },
    };
  }
}
