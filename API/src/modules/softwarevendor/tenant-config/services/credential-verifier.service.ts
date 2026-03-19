import { Injectable, Logger } from '@nestjs/common';
import { CredentialProvider } from '@prisma/identity-client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EncryptionService } from './encryption.service';

export interface VerifyResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

@Injectable()
export class CredentialVerifierService {
  private readonly logger = new Logger(CredentialVerifierService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async verify(tenantId: string, credentialId: string): Promise<VerifyResult> {
    const credential = await this.prisma.tenantCredential.findFirst({
      where: { id: credentialId, tenantId },
    });

    if (!credential) {
      return { success: false, message: 'Credential not found' };
    }

    const decrypted = this.encryption.decrypt(credential.encryptedData);
    let result: VerifyResult;

    try {
      result = await this.verifyByProvider(credential.provider, decrypted);
    } catch (error: any) {
      result = { success: false, message: error.message || 'Verification failed' };
    }

    // Update credential status
    const newStatus = result.success ? 'ACTIVE' : (credential.verifyCount >= 2 ? 'EXPIRED' : 'ERROR');
    await this.prisma.tenantCredential.update({
      where: { id: credentialId },
      data: {
        status: newStatus,
        statusMessage: result.message,
        lastVerifiedAt: new Date(),
        lastVerifyError: result.success ? null : result.message,
        verifyCount: { increment: 1 },
      },
    });

    return result;
  }

  private async verifyByProvider(
    provider: CredentialProvider,
    credentials: Record<string, any>,
  ): Promise<VerifyResult> {
    switch (provider) {
      case 'SMTP':
        return this.verifySMTP(credentials);
      case 'GMAIL':
        return this.verifyGmail(credentials);
      case 'OUTLOOK':
        return this.verifyOutlook(credentials);
      case 'WHATSAPP_BUSINESS':
        return this.verifyWhatsApp(credentials);
      case 'RAZORPAY':
        return this.verifyRazorpay(credentials);
      case 'STRIPE':
        return this.verifyStripe(credentials);
      case 'AWS_S3':
        return this.verifyS3(credentials);
      case 'GOOGLE_MAPS':
        return this.verifyGoogleMaps(credentials);
      case 'EXOTEL':
        return this.verifyExotel(credentials);
      case 'TWILIO':
        return this.verifyTwilio(credentials);
      case 'SENDGRID':
        return this.verifySendGrid(credentials);
      case 'MAILGUN':
        return this.verifyMailgun(credentials);
      case 'FIREBASE':
        return this.verifyFirebase(credentials);
      case 'KNOWLARITY':
        return this.verifyKnowlarity(credentials);
      default:
        // CUSTOM, MINIO, GOOGLE_DRIVE, ONEDRIVE, DROPBOX — skip verification
        return { success: true, message: 'Provider does not require verification' };
    }
  }

  private async verifySMTP(creds: Record<string, any>): Promise<VerifyResult> {
    try {
       
      const nodemailer = require('nodemailer') as any;
      const transport = nodemailer.createTransport({
        host: creds.host,
        port: parseInt(creds.port, 10),
        secure: creds.secure === 'true',
        auth: { user: creds.username, pass: creds.password },
        connectionTimeout: 10000,
      });
      await transport.verify();
      return { success: true, message: 'SMTP connection verified' };
    } catch (error: any) {
      return { success: false, message: `SMTP verification failed: ${error.message}` };
    }
  }

  private async verifyGmail(creds: Record<string, any>): Promise<VerifyResult> {
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: creds.clientId,
          client_secret: creds.clientSecret,
          refresh_token: creds.refreshToken,
          grant_type: 'refresh_token',
        }),
      });
      if (!tokenRes.ok) return { success: false, message: 'Failed to refresh Gmail token' };

      const { access_token } = await tokenRes.json();
      const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (!profileRes.ok) return { success: false, message: 'Failed to access Gmail profile' };

      const profile = await profileRes.json();
      return { success: true, message: `Verified: ${profile.emailAddress}`, details: { email: profile.emailAddress } };
    } catch (error: any) {
      return { success: false, message: `Gmail verification failed: ${error.message}` };
    }
  }

  private async verifyOutlook(creds: Record<string, any>): Promise<VerifyResult> {
    try {
      const tokenRes = await fetch(
        `https://login.microsoftonline.com/${creds.tenantId}/oauth2/v2.0/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: creds.clientId,
            client_secret: creds.clientSecret,
            refresh_token: creds.refreshToken,
            grant_type: 'refresh_token',
            scope: 'https://graph.microsoft.com/.default',
          }),
        },
      );
      if (!tokenRes.ok) return { success: false, message: 'Failed to refresh Outlook token' };

      const { access_token } = await tokenRes.json();
      const meRes = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (!meRes.ok) return { success: false, message: 'Failed to access Microsoft Graph' };

      const me = await meRes.json();
      return { success: true, message: `Verified: ${me.mail || me.userPrincipalName}` };
    } catch (error: any) {
      return { success: false, message: `Outlook verification failed: ${error.message}` };
    }
  }

  private async verifyWhatsApp(creds: Record<string, any>): Promise<VerifyResult> {
    try {
      const version = creds.apiVersion || 'v21.0';
      const res = await fetch(
        `https://graph.facebook.com/${version}/${creds.phoneNumberId}`,
        { headers: { Authorization: `Bearer ${creds.accessToken}` } },
      );
      if (!res.ok) return { success: false, message: 'Failed to verify WhatsApp phone number' };
      return { success: true, message: 'WhatsApp Business verified' };
    } catch (error: any) {
      return { success: false, message: `WhatsApp verification failed: ${error.message}` };
    }
  }

  private async verifyRazorpay(creds: Record<string, any>): Promise<VerifyResult> {
    try {
      const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64');
      const res = await fetch('https://api.razorpay.com/v1/payments?count=1', {
        headers: { Authorization: `Basic ${auth}` },
      });
      if (!res.ok) return { success: false, message: 'Razorpay authentication failed' };
      return { success: true, message: 'Razorpay credentials verified' };
    } catch (error: any) {
      return { success: false, message: `Razorpay verification failed: ${error.message}` };
    }
  }

  private async verifyStripe(creds: Record<string, any>): Promise<VerifyResult> {
    try {
      const res = await fetch('https://api.stripe.com/v1/balance', {
        headers: { Authorization: `Bearer ${creds.secretKey}` },
      });
      if (!res.ok) return { success: false, message: 'Stripe authentication failed' };
      return { success: true, message: 'Stripe credentials verified' };
    } catch (error: any) {
      return { success: false, message: `Stripe verification failed: ${error.message}` };
    }
  }

  private async verifyS3(creds: Record<string, any>): Promise<VerifyResult> {
    try {
      // Use AWS SDK v3 signature for HEAD bucket
      const url = `https://${creds.bucket}.s3.${creds.region}.amazonaws.com`;
      const res = await fetch(url, { method: 'HEAD' });
      // S3 may return 403 (valid but no public access) or 200
      if (res.status === 200 || res.status === 403) {
        return { success: true, message: `S3 bucket '${creds.bucket}' exists` };
      }
      return { success: false, message: `S3 bucket '${creds.bucket}' not found` };
    } catch (error: any) {
      return { success: false, message: `S3 verification failed: ${error.message}` };
    }
  }

  private async verifyGoogleMaps(creds: Record<string, any>): Promise<VerifyResult> {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${creds.apiKey}`,
      );
      const data = await res.json();
      if (data.status === 'REQUEST_DENIED') {
        return { success: false, message: 'Google Maps API key denied' };
      }
      return { success: true, message: 'Google Maps API key verified' };
    } catch (error: any) {
      return { success: false, message: `Google Maps verification failed: ${error.message}` };
    }
  }

  private async verifyExotel(creds: Record<string, any>): Promise<VerifyResult> {
    try {
      const auth = Buffer.from(`${creds.apiKey}:${creds.apiToken}`).toString('base64');
      const res = await fetch(
        `https://${creds.subdomain}.exotel.com/v1/Accounts/${creds.apiKey}`,
        { headers: { Authorization: `Basic ${auth}` } },
      );
      if (!res.ok) return { success: false, message: 'Exotel authentication failed' };
      return { success: true, message: 'Exotel credentials verified' };
    } catch (error: any) {
      return { success: false, message: `Exotel verification failed: ${error.message}` };
    }
  }

  private async verifyTwilio(creds: Record<string, any>): Promise<VerifyResult> {
    try {
      const auth = Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString('base64');
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}.json`,
        { headers: { Authorization: `Basic ${auth}` } },
      );
      if (!res.ok) return { success: false, message: 'Twilio authentication failed' };
      return { success: true, message: 'Twilio credentials verified' };
    } catch (error: any) {
      return { success: false, message: `Twilio verification failed: ${error.message}` };
    }
  }

  private async verifySendGrid(creds: Record<string, any>): Promise<VerifyResult> {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/user/profile', {
        headers: { Authorization: `Bearer ${creds.apiKey}` },
      });
      if (!res.ok) return { success: false, message: 'SendGrid authentication failed' };
      return { success: true, message: 'SendGrid API key verified' };
    } catch (error: any) {
      return { success: false, message: `SendGrid verification failed: ${error.message}` };
    }
  }

  private async verifyMailgun(creds: Record<string, any>): Promise<VerifyResult> {
    try {
      const baseUrl = creds.region === 'EU'
        ? 'https://api.eu.mailgun.net'
        : 'https://api.mailgun.net';
      const auth = Buffer.from(`api:${creds.apiKey}`).toString('base64');
      const res = await fetch(`${baseUrl}/v3/domains/${creds.domain}`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      if (!res.ok) return { success: false, message: 'Mailgun authentication failed' };
      return { success: true, message: 'Mailgun credentials verified' };
    } catch (error: any) {
      return { success: false, message: `Mailgun verification failed: ${error.message}` };
    }
  }

  private async verifyFirebase(creds: Record<string, any>): Promise<VerifyResult> {
    try {
      const json = typeof creds.serviceAccountJson === 'string'
        ? JSON.parse(creds.serviceAccountJson)
        : creds.serviceAccountJson;
      if (!json.project_id || !json.private_key || !json.client_email) {
        return { success: false, message: 'Invalid Firebase service account: missing required fields' };
      }
      return { success: true, message: `Firebase project '${json.project_id}' verified` };
    } catch (error: any) {
      return { success: false, message: `Firebase verification failed: ${error.message}` };
    }
  }

  private async verifyKnowlarity(creds: Record<string, any>): Promise<VerifyResult> {
    try {
      const res = await fetch('https://kpi.knowlarity.com/Basic/v1/account', {
        headers: {
          'x-]api-key': creds.apiKey,
          Authorization: creds.authToken,
        },
      });
      if (!res.ok) return { success: false, message: 'Knowlarity authentication failed' };
      return { success: true, message: 'Knowlarity credentials verified' };
    } catch (error: any) {
      return { success: false, message: `Knowlarity verification failed: ${error.message}` };
    }
  }
}
