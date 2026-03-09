import { Injectable } from '@nestjs/common';
import { CredentialProvider } from '@prisma/client';

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'url' | 'textarea' | 'number';
  required: boolean;
  helpText?: string;
  placeholder?: string;
}

export interface CredentialSchema {
  provider: CredentialProvider;
  displayName: string;
  icon: string;
  category: 'EMAIL' | 'PAYMENT' | 'STORAGE' | 'TELEPHONY' | 'MAPS' | 'MESSAGING' | 'AI' | 'OTHER';
  fields: FieldDefinition[];
  setupGuide?: string;
  verifiable: boolean;
  supportsOAuth: boolean;
}

@Injectable()
export class CredentialSchemaService {
  private readonly schemas: Map<CredentialProvider, CredentialSchema>;

  constructor() {
    this.schemas = new Map();
    this.registerAll();
  }

  getSchema(provider: CredentialProvider): CredentialSchema | null {
    return this.schemas.get(provider) ?? null;
  }

  getAllSchemas(): CredentialSchema[] {
    return Array.from(this.schemas.values());
  }

  validate(provider: CredentialProvider, data: Record<string, any>): { valid: boolean; errors: string[] } {
    const schema = this.schemas.get(provider);
    if (!schema) return { valid: false, errors: [`Unknown provider: ${provider}`] };

    const errors: string[] = [];
    for (const field of schema.fields) {
      if (field.required && (!data[field.key] || String(data[field.key]).trim() === '')) {
        errors.push(`${field.label} is required`);
      }
    }
    return { valid: errors.length === 0, errors };
  }

  private registerAll(): void {
    // ─── EMAIL ───
    this.schemas.set('GMAIL', {
      provider: 'GMAIL',
      displayName: 'Gmail / Google Workspace',
      icon: 'gmail',
      category: 'EMAIL',
      verifiable: true,
      supportsOAuth: true,
      setupGuide: 'Create OAuth credentials in Google Cloud Console → Enable Gmail API → Set redirect URI',
      fields: [
        { key: 'clientId', label: 'Client ID', type: 'text', required: true, helpText: 'OAuth 2.0 client ID from Google Cloud Console' },
        { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
        { key: 'redirectUri', label: 'Redirect URI', type: 'url', required: false, placeholder: 'https://yourapp.com/auth/google/callback' },
      ],
    });

    this.schemas.set('OUTLOOK', {
      provider: 'OUTLOOK',
      displayName: 'Outlook / Microsoft 365',
      icon: 'outlook',
      category: 'EMAIL',
      verifiable: true,
      supportsOAuth: true,
      setupGuide: 'Register app in Azure AD → Add Mail.Send permission → Generate client secret',
      fields: [
        { key: 'clientId', label: 'Application (Client) ID', type: 'text', required: true },
        { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { key: 'tenantId', label: 'Directory (Tenant) ID', type: 'text', required: true },
        { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
        { key: 'redirectUri', label: 'Redirect URI', type: 'url', required: false },
      ],
    });

    this.schemas.set('SMTP', {
      provider: 'SMTP',
      displayName: 'SMTP Server',
      icon: 'mail',
      category: 'EMAIL',
      verifiable: true,
      supportsOAuth: false,
      setupGuide: 'Enter SMTP server details. Common ports: 465 (SSL), 587 (TLS), 25 (unencrypted)',
      fields: [
        { key: 'host', label: 'SMTP Host', type: 'text', required: true, placeholder: 'smtp.example.com' },
        { key: 'port', label: 'Port', type: 'number', required: true, placeholder: '587' },
        { key: 'username', label: 'Username', type: 'text', required: true },
        { key: 'password', label: 'Password', type: 'password', required: true },
        { key: 'fromEmail', label: 'From Email', type: 'email', required: true },
        { key: 'fromName', label: 'From Name', type: 'text', required: false },
        { key: 'secure', label: 'Use TLS/SSL', type: 'text', required: false, helpText: 'true or false' },
      ],
    });

    this.schemas.set('SENDGRID', {
      provider: 'SENDGRID',
      displayName: 'SendGrid',
      icon: 'sendgrid',
      category: 'EMAIL',
      verifiable: true,
      supportsOAuth: false,
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'fromEmail', label: 'From Email', type: 'email', required: true },
        { key: 'fromName', label: 'From Name', type: 'text', required: false },
      ],
    });

    this.schemas.set('MAILGUN', {
      provider: 'MAILGUN',
      displayName: 'Mailgun',
      icon: 'mailgun',
      category: 'EMAIL',
      verifiable: true,
      supportsOAuth: false,
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'mg.example.com' },
        { key: 'fromEmail', label: 'From Email', type: 'email', required: true },
        { key: 'fromName', label: 'From Name', type: 'text', required: false },
        { key: 'region', label: 'Region', type: 'text', required: false, helpText: 'US or EU' },
      ],
    });

    // ─── MESSAGING ───
    this.schemas.set('WHATSAPP_BUSINESS', {
      provider: 'WHATSAPP_BUSINESS',
      displayName: 'WhatsApp Business API',
      icon: 'whatsapp',
      category: 'MESSAGING',
      verifiable: true,
      supportsOAuth: false,
      fields: [
        { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
        { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true },
        { key: 'wabaId', label: 'WABA ID', type: 'text', required: true },
        { key: 'webhookVerifyToken', label: 'Webhook Verify Token', type: 'password', required: false },
        { key: 'apiVersion', label: 'API Version', type: 'text', required: false, placeholder: 'v21.0' },
      ],
    });

    // ─── PAYMENT ───
    this.schemas.set('RAZORPAY', {
      provider: 'RAZORPAY',
      displayName: 'Razorpay',
      icon: 'razorpay',
      category: 'PAYMENT',
      verifiable: true,
      supportsOAuth: false,
      fields: [
        { key: 'keyId', label: 'Key ID', type: 'text', required: true },
        { key: 'keySecret', label: 'Key Secret', type: 'password', required: true },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: false },
      ],
    });

    this.schemas.set('STRIPE', {
      provider: 'STRIPE',
      displayName: 'Stripe',
      icon: 'stripe',
      category: 'PAYMENT',
      verifiable: true,
      supportsOAuth: false,
      fields: [
        { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, placeholder: 'sk_live_...' },
        { key: 'publishableKey', label: 'Publishable Key', type: 'text', required: false, placeholder: 'pk_live_...' },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: false, placeholder: 'whsec_...' },
      ],
    });

    // ─── STORAGE ───
    this.schemas.set('AWS_S3', {
      provider: 'AWS_S3',
      displayName: 'Amazon S3',
      icon: 's3',
      category: 'STORAGE',
      verifiable: true,
      supportsOAuth: false,
      fields: [
        { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
        { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
        { key: 'region', label: 'Region', type: 'text', required: true, placeholder: 'ap-south-1' },
        { key: 'bucket', label: 'Bucket Name', type: 'text', required: true },
      ],
    });

    this.schemas.set('MINIO', {
      provider: 'MINIO',
      displayName: 'MinIO',
      icon: 'minio',
      category: 'STORAGE',
      verifiable: true,
      supportsOAuth: false,
      fields: [
        { key: 'endpoint', label: 'Endpoint', type: 'url', required: true, placeholder: 'https://minio.example.com' },
        { key: 'accessKey', label: 'Access Key', type: 'text', required: true },
        { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
        { key: 'bucket', label: 'Bucket Name', type: 'text', required: true },
        { key: 'useSSL', label: 'Use SSL', type: 'text', required: false, helpText: 'true or false' },
      ],
    });

    this.schemas.set('GOOGLE_DRIVE', {
      provider: 'GOOGLE_DRIVE',
      displayName: 'Google Drive',
      icon: 'google-drive',
      category: 'STORAGE',
      verifiable: true,
      supportsOAuth: true,
      fields: [
        { key: 'clientId', label: 'Client ID', type: 'text', required: true },
        { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
        { key: 'folderId', label: 'Root Folder ID', type: 'text', required: false },
      ],
    });

    this.schemas.set('ONEDRIVE', {
      provider: 'ONEDRIVE',
      displayName: 'OneDrive / SharePoint',
      icon: 'onedrive',
      category: 'STORAGE',
      verifiable: true,
      supportsOAuth: true,
      fields: [
        { key: 'clientId', label: 'Application (Client) ID', type: 'text', required: true },
        { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { key: 'tenantId', label: 'Directory (Tenant) ID', type: 'text', required: true },
        { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
        { key: 'driveId', label: 'Drive ID', type: 'text', required: false },
      ],
    });

    this.schemas.set('DROPBOX', {
      provider: 'DROPBOX',
      displayName: 'Dropbox',
      icon: 'dropbox',
      category: 'STORAGE',
      verifiable: true,
      supportsOAuth: true,
      fields: [
        { key: 'appKey', label: 'App Key', type: 'text', required: true },
        { key: 'appSecret', label: 'App Secret', type: 'password', required: true },
        { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
      ],
    });

    // ─── MAPS ───
    this.schemas.set('GOOGLE_MAPS', {
      provider: 'GOOGLE_MAPS',
      displayName: 'Google Maps',
      icon: 'google-maps',
      category: 'MAPS',
      verifiable: true,
      supportsOAuth: false,
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      ],
    });

    // ─── TELEPHONY ───
    this.schemas.set('EXOTEL', {
      provider: 'EXOTEL',
      displayName: 'Exotel',
      icon: 'exotel',
      category: 'TELEPHONY',
      verifiable: true,
      supportsOAuth: false,
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'text', required: true },
        { key: 'apiToken', label: 'API Token', type: 'password', required: true },
        { key: 'subdomain', label: 'Subdomain', type: 'text', required: true, placeholder: 'your-company' },
        { key: 'callerId', label: 'Caller ID', type: 'text', required: true },
      ],
    });

    this.schemas.set('KNOWLARITY', {
      provider: 'KNOWLARITY',
      displayName: 'Knowlarity',
      icon: 'knowlarity',
      category: 'TELEPHONY',
      verifiable: true,
      supportsOAuth: false,
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'authToken', label: 'Authorization Token', type: 'password', required: true },
        { key: 'srNumber', label: 'SR Number', type: 'text', required: true },
      ],
    });

    this.schemas.set('TWILIO', {
      provider: 'TWILIO',
      displayName: 'Twilio',
      icon: 'twilio',
      category: 'TELEPHONY',
      verifiable: true,
      supportsOAuth: false,
      fields: [
        { key: 'accountSid', label: 'Account SID', type: 'text', required: true },
        { key: 'authToken', label: 'Auth Token', type: 'password', required: true },
        { key: 'phoneNumber', label: 'Phone Number', type: 'text', required: true, placeholder: '+1234567890' },
      ],
    });

    // ─── OTHER ───
    this.schemas.set('FIREBASE', {
      provider: 'FIREBASE',
      displayName: 'Firebase',
      icon: 'firebase',
      category: 'OTHER',
      verifiable: true,
      supportsOAuth: false,
      fields: [
        { key: 'serviceAccountJson', label: 'Service Account JSON', type: 'textarea', required: true, helpText: 'Paste the full JSON key file content' },
        { key: 'projectId', label: 'Project ID', type: 'text', required: false },
      ],
    });

    // ─── AI PROVIDERS ───
    this.schemas.set('ANTHROPIC_CLAUDE', {
      provider: 'ANTHROPIC_CLAUDE',
      displayName: 'Anthropic Claude',
      icon: 'cpu',
      category: 'AI',
      verifiable: true,
      supportsOAuth: false,
      setupGuide: 'Get API key from console.anthropic.com → API Keys',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true, helpText: 'sk-ant-...' },
      ],
    });

    this.schemas.set('OPENAI_GPT', {
      provider: 'OPENAI_GPT',
      displayName: 'OpenAI GPT',
      icon: 'cpu',
      category: 'AI',
      verifiable: true,
      supportsOAuth: false,
      setupGuide: 'Get API key from platform.openai.com → API keys',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'organizationId', label: 'Organization ID', type: 'text', required: false },
      ],
    });

    this.schemas.set('GOOGLE_GEMINI', {
      provider: 'GOOGLE_GEMINI',
      displayName: 'Google Gemini',
      icon: 'cpu',
      category: 'AI',
      verifiable: true,
      supportsOAuth: false,
      setupGuide: 'Get API key from aistudio.google.com → Get API key',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      ],
    });

    this.schemas.set('GROQ', {
      provider: 'GROQ',
      displayName: 'Groq',
      icon: 'zap',
      category: 'AI',
      verifiable: true,
      supportsOAuth: false,
      setupGuide: 'Get API key from console.groq.com → API Keys',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      ],
    });

    this.schemas.set('CUSTOM', {
      provider: 'CUSTOM',
      displayName: 'Custom Provider',
      icon: 'settings',
      category: 'OTHER',
      verifiable: false,
      supportsOAuth: false,
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: false },
        { key: 'apiSecret', label: 'API Secret', type: 'password', required: false },
        { key: 'baseUrl', label: 'Base URL', type: 'url', required: false },
        { key: 'extra', label: 'Additional Config (JSON)', type: 'textarea', required: false },
      ],
    });
  }
}
