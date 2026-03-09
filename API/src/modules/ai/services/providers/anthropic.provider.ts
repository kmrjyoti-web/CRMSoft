import { Injectable, Logger } from '@nestjs/common';

export interface AiProviderResult {
  content: string;
  usage: { promptTokens: number; outputTokens: number };
}

@Injectable()
export class AnthropicProvider {
  private readonly logger = new Logger(AnthropicProvider.name);

  async generate(
    model: string,
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<AiProviderResult> {
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
}
