import { PrismaClient } from '@prisma/client';

/**
 * Seed data for PluginRegistry — 12 plugin definitions.
 * Run: npx prisma db seed  (or call seedPluginRegistry(prisma) directly)
 */

const PLUGINS = [
  // ═══ COMMUNICATION ═══
  {
    code: 'whatsapp_cloud',
    name: 'WhatsApp Business Cloud API',
    description: 'Send WhatsApp messages, templates, and manage chatbot flows',
    category: 'COMMUNICATION' as const,
    configSchema: {
      fields: [
        { name: 'phoneNumberId', label: 'Phone Number ID', type: 'string', required: true },
        { name: 'accessToken', label: 'Access Token', type: 'secret', required: true },
        { name: 'businessAccountId', label: 'Business Account ID', type: 'string', required: true },
        { name: 'webhookVerifyToken', label: 'Webhook Verify Token', type: 'secret', required: true },
      ],
    },
    hookPoints: ['lead.created', 'lead.updated', 'quotation.sent', 'quotation.accepted', 'payment.received'],
    menuCodes: ['whatsapp-dashboard', 'whatsapp-templates', 'whatsapp-messages', 'whatsapp-chatbot', 'whatsapp-broadcast'],
    webhookConfig: {
      inbound: '/webhooks/whatsapp/{tenantId}',
      verificationMethod: 'challenge',
    },
    iconUrl: '/icons/whatsapp.svg',
    setupGuideUrl: '/docs/integrations/whatsapp',
    sortOrder: 1,
  },
  {
    code: 'gmail',
    name: 'Gmail Integration',
    description: 'Send emails via Gmail, sync inbox, and track opens',
    category: 'COMMUNICATION' as const,
    configSchema: { fields: [] },
    oauthConfig: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
    },
    hookPoints: ['lead.created', 'quotation.sent', 'invoice.created'],
    menuCodes: ['email-compose', 'email-templates', 'email-inbox'],
    iconUrl: '/icons/gmail.svg',
    setupGuideUrl: '/docs/integrations/gmail',
    sortOrder: 2,
  },
  {
    code: 'smtp',
    name: 'SMTP Email',
    description: 'Send emails via any SMTP server',
    category: 'COMMUNICATION' as const,
    configSchema: {
      fields: [
        { name: 'host', label: 'SMTP Host', type: 'string', required: true },
        { name: 'port', label: 'SMTP Port', type: 'number', required: true, default: 587 },
        { name: 'username', label: 'Username', type: 'string', required: true },
        { name: 'password', label: 'Password', type: 'secret', required: true },
        { name: 'fromEmail', label: 'From Email', type: 'email', required: true },
        { name: 'fromName', label: 'From Name', type: 'string', required: true },
        { name: 'encryption', label: 'Encryption', type: 'select', options: ['none', 'ssl', 'tls'], default: 'tls' },
      ],
    },
    hookPoints: ['lead.created', 'quotation.sent', 'invoice.created'],
    menuCodes: ['email-compose', 'email-templates'],
    iconUrl: '/icons/email.svg',
    setupGuideUrl: '/docs/integrations/smtp',
    sortOrder: 3,
  },
  {
    code: 'sms_twilio',
    name: 'Twilio SMS',
    description: 'Send SMS messages via Twilio',
    category: 'COMMUNICATION' as const,
    configSchema: {
      fields: [
        { name: 'accountSid', label: 'Account SID', type: 'string', required: true },
        { name: 'authToken', label: 'Auth Token', type: 'secret', required: true },
        { name: 'fromNumber', label: 'From Number', type: 'string', required: true },
      ],
    },
    hookPoints: ['lead.created', 'demo.reminder', 'payment.reminder'],
    menuCodes: ['sms-templates', 'sms-history'],
    iconUrl: '/icons/twilio.svg',
    setupGuideUrl: '/docs/integrations/twilio',
    sortOrder: 4,
  },

  // ═══ PAYMENT ═══
  {
    code: 'razorpay',
    name: 'Razorpay',
    description: 'Accept payments via Razorpay (UPI, Cards, NetBanking)',
    category: 'PAYMENT' as const,
    configSchema: {
      fields: [
        { name: 'keyId', label: 'Key ID', type: 'string', required: true },
        { name: 'keySecret', label: 'Key Secret', type: 'secret', required: true },
        { name: 'webhookSecret', label: 'Webhook Secret', type: 'secret', required: true },
        { name: 'environment', label: 'Environment', type: 'select', options: ['test', 'live'], default: 'test' },
      ],
    },
    hookPoints: ['quotation.accepted', 'invoice.created'],
    menuCodes: ['payments', 'payment-links', 'refunds'],
    webhookConfig: {
      inbound: '/webhooks/razorpay/{tenantId}',
      verificationMethod: 'signature',
      signatureHeader: 'X-Razorpay-Signature',
    },
    iconUrl: '/icons/razorpay.svg',
    setupGuideUrl: '/docs/integrations/razorpay',
    sortOrder: 1,
  },
  {
    code: 'stripe',
    name: 'Stripe',
    description: 'Accept international payments via Stripe',
    category: 'PAYMENT' as const,
    configSchema: {
      fields: [
        { name: 'publishableKey', label: 'Publishable Key', type: 'string', required: true },
        { name: 'secretKey', label: 'Secret Key', type: 'secret', required: true },
        { name: 'webhookSecret', label: 'Webhook Secret', type: 'secret', required: true },
        { name: 'environment', label: 'Environment', type: 'select', options: ['test', 'live'], default: 'test' },
      ],
    },
    hookPoints: ['quotation.accepted', 'invoice.created'],
    menuCodes: ['payments', 'payment-links', 'refunds'],
    webhookConfig: {
      inbound: '/webhooks/stripe/{tenantId}',
      verificationMethod: 'signature',
      signatureHeader: 'Stripe-Signature',
    },
    iconUrl: '/icons/stripe.svg',
    setupGuideUrl: '/docs/integrations/stripe',
    sortOrder: 2,
  },

  // ═══ CALENDAR ═══
  {
    code: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync demos, meetings, and follow-ups with Google Calendar',
    category: 'CALENDAR' as const,
    configSchema: { fields: [] },
    oauthConfig: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/calendar'],
    },
    hookPoints: ['demo.created', 'demo.updated', 'followup.created', 'meeting.created'],
    menuCodes: ['calendar-sync'],
    iconUrl: '/icons/google-calendar.svg',
    setupGuideUrl: '/docs/integrations/google-calendar',
    sortOrder: 1,
  },

  // ═══ TELEPHONY ═══
  {
    code: 'exotel',
    name: 'Exotel',
    description: 'Click-to-call, IVR, and call recording',
    category: 'TELEPHONY' as const,
    configSchema: {
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'secret', required: true },
        { name: 'apiToken', label: 'API Token', type: 'secret', required: true },
        { name: 'subdomain', label: 'Subdomain', type: 'string', required: true },
        { name: 'callerId', label: 'Caller ID', type: 'string', required: true },
      ],
    },
    hookPoints: ['lead.created'],
    menuCodes: ['calls', 'call-logs', 'ivr-settings'],
    iconUrl: '/icons/exotel.svg',
    setupGuideUrl: '/docs/integrations/exotel',
    sortOrder: 1,
  },

  // ═══ STORAGE ═══
  {
    code: 'aws_s3',
    name: 'AWS S3',
    description: 'Store documents and files in Amazon S3',
    category: 'STORAGE' as const,
    configSchema: {
      fields: [
        { name: 'accessKeyId', label: 'Access Key ID', type: 'secret', required: true },
        { name: 'secretAccessKey', label: 'Secret Access Key', type: 'secret', required: true },
        { name: 'region', label: 'Region', type: 'string', required: true, default: 'ap-south-1' },
        { name: 'bucketName', label: 'Bucket Name', type: 'string', required: true },
      ],
    },
    hookPoints: [],
    menuCodes: [],
    iconUrl: '/icons/aws-s3.svg',
    setupGuideUrl: '/docs/integrations/aws-s3',
    sortOrder: 1,
  },
  {
    code: 'google_drive',
    name: 'Google Drive',
    description: 'Store and sync documents with Google Drive',
    category: 'STORAGE' as const,
    configSchema: { fields: [] },
    oauthConfig: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    },
    hookPoints: ['document.created'],
    menuCodes: ['drive-sync'],
    iconUrl: '/icons/google-drive.svg',
    setupGuideUrl: '/docs/integrations/google-drive',
    sortOrder: 2,
  },

  // ═══ AI ═══
  {
    code: 'openai',
    name: 'OpenAI / ChatGPT',
    description: 'AI-powered lead scoring, email writing, and chatbot',
    category: 'AI' as const,
    isPremium: true,
    configSchema: {
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'secret', required: true },
        { name: 'model', label: 'Model', type: 'select', options: ['gpt-4', 'gpt-3.5-turbo'], default: 'gpt-3.5-turbo' },
      ],
    },
    hookPoints: ['lead.created', 'email.compose'],
    menuCodes: ['ai-assistant'],
    iconUrl: '/icons/openai.svg',
    setupGuideUrl: '/docs/integrations/openai',
    sortOrder: 1,
  },

  // ═══ MARKETING ═══
  {
    code: 'sendgrid',
    name: 'SendGrid',
    description: 'Transactional & marketing emails via SendGrid',
    category: 'MARKETING' as const,
    configSchema: {
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'secret', required: true },
        { name: 'fromEmail', label: 'From Email', type: 'email', required: true },
        { name: 'fromName', label: 'From Name', type: 'string', required: true },
      ],
    },
    hookPoints: ['lead.created', 'quotation.sent'],
    menuCodes: ['email-campaigns'],
    iconUrl: '/icons/sendgrid.svg',
    setupGuideUrl: '/docs/integrations/sendgrid',
    sortOrder: 1,
  },
];

export async function seedPluginRegistry(prisma: PrismaClient): Promise<number> {
  let count = 0;
  for (const plugin of PLUGINS) {
    await prisma.pluginRegistry.upsert({
      where: { code: plugin.code },
      update: {
        name: plugin.name,
        description: plugin.description,
        category: plugin.category,
        configSchema: plugin.configSchema,
        hookPoints: plugin.hookPoints,
        menuCodes: plugin.menuCodes,
        webhookConfig: (plugin as any).webhookConfig || null,
        oauthConfig: (plugin as any).oauthConfig || null,
        iconUrl: (plugin as any).iconUrl || null,
        setupGuideUrl: (plugin as any).setupGuideUrl || null,
        isPremium: (plugin as any).isPremium || false,
        sortOrder: plugin.sortOrder,
      },
      create: {
        code: plugin.code,
        name: plugin.name,
        description: plugin.description,
        category: plugin.category,
        configSchema: plugin.configSchema,
        hookPoints: plugin.hookPoints,
        menuCodes: plugin.menuCodes,
        webhookConfig: (plugin as any).webhookConfig || null,
        oauthConfig: (plugin as any).oauthConfig || null,
        iconUrl: (plugin as any).iconUrl || null,
        setupGuideUrl: (plugin as any).setupGuideUrl || null,
        isPremium: (plugin as any).isPremium || false,
        sortOrder: plugin.sortOrder,
      },
    });
    count++;
  }
  return count;
}

export const PLUGIN_SEED_DATA = PLUGINS;
