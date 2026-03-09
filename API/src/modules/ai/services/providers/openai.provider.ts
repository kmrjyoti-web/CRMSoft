import { Injectable, Logger } from '@nestjs/common';
import type { AiProviderResult } from './anthropic.provider';

@Injectable()
export class OpenaiProvider {
  private readonly logger = new Logger(OpenaiProvider.name);

  async generate(
    model: string,
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
    organizationId?: string,
  ): Promise<AiProviderResult> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };
    if (organizationId) headers['OpenAI-Organization'] = organizationId;

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
}
