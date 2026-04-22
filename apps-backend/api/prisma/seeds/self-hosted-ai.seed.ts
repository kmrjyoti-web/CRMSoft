import { PrismaClient } from '@prisma/client';

export async function seedSelfHostedAi(prisma: PrismaClient) {
  console.log('  → Seeding Self-Hosted AI models & system prompts...');

  // ── Popular Ollama Models (catalog — NOT_INSTALLED by default) ──

  const models = [
    {
      name: 'Llama 3.2 3B',
      modelId: 'llama3.2:3b',
      source: 'OLLAMA' as const,
      status: 'NOT_INSTALLED' as const,
      parameterCount: '3B',
      contextLength: 131072,
      capabilities: ['chat', 'generation', 'summarization'],
      isEmbedding: false,
    },
    {
      name: 'Llama 3.2 1B',
      modelId: 'llama3.2:1b',
      source: 'OLLAMA' as const,
      status: 'NOT_INSTALLED' as const,
      parameterCount: '1B',
      contextLength: 131072,
      capabilities: ['chat', 'generation'],
      isEmbedding: false,
    },
    {
      name: 'Mistral 7B',
      modelId: 'mistral:7b',
      source: 'OLLAMA' as const,
      status: 'NOT_INSTALLED' as const,
      parameterCount: '7B',
      contextLength: 32768,
      capabilities: ['chat', 'generation', 'code'],
      isEmbedding: false,
    },
    {
      name: 'Gemma 2 2B',
      modelId: 'gemma2:2b',
      source: 'OLLAMA' as const,
      status: 'NOT_INSTALLED' as const,
      parameterCount: '2B',
      contextLength: 8192,
      capabilities: ['chat', 'generation'],
      isEmbedding: false,
    },
    {
      name: 'Phi-3 Mini',
      modelId: 'phi3:mini',
      source: 'OLLAMA' as const,
      status: 'NOT_INSTALLED' as const,
      parameterCount: '3.8B',
      contextLength: 128000,
      capabilities: ['chat', 'generation', 'code'],
      isEmbedding: false,
    },
    {
      name: 'Qwen 2.5 3B',
      modelId: 'qwen2.5:3b',
      source: 'OLLAMA' as const,
      status: 'NOT_INSTALLED' as const,
      parameterCount: '3B',
      contextLength: 32768,
      capabilities: ['chat', 'generation', 'code'],
      isEmbedding: false,
    },
    {
      name: 'Nomic Embed Text',
      modelId: 'nomic-embed-text',
      source: 'OLLAMA' as const,
      status: 'NOT_INSTALLED' as const,
      parameterCount: '137M',
      contextLength: 8192,
      capabilities: ['embedding'],
      isEmbedding: true,
      isDefault: true,
    },
    {
      name: 'MXBai Embed Large',
      modelId: 'mxbai-embed-large',
      source: 'OLLAMA' as const,
      status: 'NOT_INSTALLED' as const,
      parameterCount: '335M',
      contextLength: 512,
      capabilities: ['embedding'],
      isEmbedding: true,
    },
    {
      name: 'All MiniLM',
      modelId: 'all-minilm',
      source: 'OLLAMA' as const,
      status: 'NOT_INSTALLED' as const,
      parameterCount: '23M',
      contextLength: 256,
      capabilities: ['embedding'],
      isEmbedding: true,
    },
  ];

  for (const model of models) {
    await prisma.aiModel.upsert({
      where: { tenantId_modelId: { tenantId: '', modelId: model.modelId } },
      update: {},
      create: {
        tenantId: '',
        name: model.name,
        modelId: model.modelId,
        source: model.source,
        status: model.status,
        parameterCount: model.parameterCount,
        contextLength: model.contextLength,
        capabilities: model.capabilities,
        isEmbedding: model.isEmbedding,
        isDefault: (model as any).isDefault ?? false,
      },
    });
  }

  // ── System Prompts ──

  const prompts = [
    {
      name: 'CRM Sales Assistant',
      description: 'General-purpose CRM assistant for sales teams',
      category: 'sales',
      isDefault: true,
      prompt: `You are an AI sales assistant for a CRM system. You help sales representatives with:
- Finding customer information and contact details
- Summarizing deal history and lead status
- Suggesting follow-up actions based on pipeline data
- Drafting professional emails and messages
- Answering questions about products and pricing

Always be professional, concise, and data-driven. When citing CRM data, mention the source. If you don't have enough information, say so clearly.`,
    },
    {
      name: 'Product Knowledge Expert',
      description: 'Answers questions about products, pricing, and specifications',
      category: 'product',
      prompt: `You are a product knowledge expert for a CRM system. You help users with:
- Product specifications, features, and comparisons
- Pricing information including MRP, sale price, and discounts
- HSN codes and tax information (GST rates)
- Stock availability and inventory details
- Product recommendations based on customer needs

Use the provided context to give accurate answers. Always include relevant product codes and pricing when available.`,
    },
    {
      name: 'Customer Support Agent',
      description: 'Handles customer inquiries and support-related questions',
      category: 'support',
      prompt: `You are a customer support AI agent. You help with:
- Looking up customer accounts and order history
- Answering questions about invoices and payments
- Handling product-related inquiries
- Tracking service requests and tickets
- Providing status updates on deliveries

Be empathetic, helpful, and solution-oriented. Always verify customer details before sharing sensitive information.`,
    },
    {
      name: 'Data Analyst',
      description: 'Provides insights and analysis on CRM data',
      category: 'analytics',
      prompt: `You are a CRM data analyst. You help users understand their business data:
- Analyze sales trends and pipeline health
- Identify top-performing products and customers
- Highlight patterns in lead conversion
- Provide actionable insights from activity data
- Suggest improvements based on data patterns

Present data clearly with key metrics. Use comparative analysis when possible (month-over-month, year-over-year).`,
    },
    {
      name: 'Email Composer',
      description: 'Drafts professional business emails',
      category: 'communication',
      prompt: `You are a professional email composer for business communication. You help draft:
- Follow-up emails after meetings and calls
- Quotation and proposal cover letters
- Payment reminder emails
- Product introduction emails
- Thank you and appreciation emails

Write in a professional yet friendly tone. Keep emails concise (under 200 words). Include clear subject line suggestions. Personalize based on any available context about the recipient.`,
    },
  ];

  for (const prompt of prompts) {
    const existing = await prisma.aiSystemPrompt.findFirst({
      where: { tenantId: '', name: prompt.name, isSystem: true },
    });
    if (!existing) {
      await prisma.aiSystemPrompt.create({
        data: {
          tenantId: '',
          name: prompt.name,
          description: prompt.description,
          prompt: prompt.prompt,
          category: prompt.category,
          isDefault: (prompt as any).isDefault ?? false,
          isSystem: true,
          variables: [],
        },
      });
    }
  }

  console.log(`    ✓ ${models.length} AI models + ${prompts.length} system prompts seeded`);
}
