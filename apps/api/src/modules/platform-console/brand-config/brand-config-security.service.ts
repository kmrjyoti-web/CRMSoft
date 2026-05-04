import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

const RATE_LIMIT = 12;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const CONFIG_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const ALGO = 'aes-256-gcm';

interface RateEntry { count: number; windowStart: number }

@Injectable()
export class BrandConfigSecurityService implements OnModuleInit {
  private readonly logger = new Logger(BrandConfigSecurityService.name);
  private encKey!: Buffer;
  private rsaPrivateKey!: string;
  private rsaPublicKeyPem!: string;
  private readonly rateLimits = new Map<string, RateEntry>();

  onModuleInit() {
    this.initEncryptionKey();
    this.initRsaKeyPair();
    // Prune stale rate-limit entries every 10 minutes
    setInterval(() => this.pruneRateLimits(), 10 * 60 * 1000).unref();
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  getPublicKey(): string {
    return this.rsaPublicKeyPem;
  }

  /** Returns false if domain has exceeded 12 requests/hour. */
  checkRateLimit(domain: string): boolean {
    const now = Date.now();
    const entry = this.rateLimits.get(domain);
    if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
      this.rateLimits.set(domain, { count: 1, windowStart: now });
      return true;
    }
    if (entry.count >= RATE_LIMIT) return false;
    entry.count++;
    return true;
  }

  /** Returns false only in production when Origin/Referer mismatches the tenant domains. */
  validateOrigin(
    originHeader: string | undefined,
    refererHeader: string | undefined,
    tenantDomain: string | null,
    tenantSubdomain: string | null,
  ): boolean {
    if (process.env.NODE_ENV !== 'production') return true;
    const check = originHeader ?? refererHeader;
    if (!check) return true; // non-browser (SSR / server-to-server)
    try {
      const host = new URL(check).hostname;
      if (host === 'localhost' || host.startsWith('127.') || host.startsWith('192.168.')) return true;
      if (tenantDomain && host === tenantDomain) return true;
      if (tenantSubdomain && host === tenantSubdomain) return true;
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Signs the config with RSA-SHA256, encrypts with AES-256-GCM.
   * Returns encrypted payload + cleartext _meta so clients can verify integrity
   * without decrypting first.
   */
  secureConfig(config: object, tenantId: string): {
    payload: string;
    iv: string;
    tag: string;
    tenantId: string;
    version: string;
    _meta: {
      configHash: string;
      signature: string;
      generatedAt: string;
      expiresAt: string;
      tenantId: string;
    };
  } {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CONFIG_EXPIRY_MS);

    const body = JSON.stringify(config);
    const configHash = crypto.createHash('sha256').update(body).digest('hex');
    const signature = crypto.createSign('RSA-SHA256').update(configHash).sign(this.rsaPrivateKey, 'hex');

    const withMeta = JSON.stringify({
      ...config,
      _meta: {
        configHash,
        signature,
        generatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        tenantId,
      },
    });

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGO, this.encKey, iv);
    const encrypted = Buffer.concat([cipher.update(withMeta, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      payload: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      tag: authTag.toString('hex'),
      tenantId,
      version: '1.0',
      _meta: {
        configHash,
        signature,
        generatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        tenantId,
      },
    };
  }

  // ─── Initialisation helpers ───────────────────────────────────────────────

  private initEncryptionKey() {
    const keyHex = process.env.BRAND_CONFIG_ENCRYPTION_KEY;
    if (keyHex && keyHex.length === 64) {
      this.encKey = Buffer.from(keyHex, 'hex');
    } else {
      // Dev fallback: derive 32 bytes from master key
      const master = process.env.ENCRYPTION_MASTER_KEY ?? 'dev-brand-config-key';
      this.encKey = crypto.scryptSync(master, 'brand-config-enc-salt', 32);
      this.logger.warn(
        'BRAND_CONFIG_ENCRYPTION_KEY not set (or wrong length) — ' +
        'using derived fallback. Set it for production: openssl rand -hex 32',
      );
    }
  }

  private initRsaKeyPair() {
    const privPem = process.env.BRAND_CONFIG_RSA_PRIVATE_KEY;
    if (privPem) {
      // Env vars are single-line with literal \n — normalise
      this.rsaPrivateKey = privPem.replace(/\\n/g, '\n');
      const keyObj = crypto.createPrivateKey(this.rsaPrivateKey);
      this.rsaPublicKeyPem = crypto
        .createPublicKey(keyObj)
        .export({ type: 'spki', format: 'pem' })
        .toString();
      this.logger.log('RSA key pair loaded from BRAND_CONFIG_RSA_PRIVATE_KEY');
    } else {
      // Dev: ephemeral key pair — warn loudly
      this.logger.warn(
        'BRAND_CONFIG_RSA_PRIVATE_KEY not set — generating ephemeral RSA key pair. ' +
        'Signatures will change on each restart. Set it for production.',
      );
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      this.rsaPrivateKey = privateKey;
      this.rsaPublicKeyPem = publicKey;
    }
  }

  private pruneRateLimits() {
    const now = Date.now();
    for (const [domain, entry] of this.rateLimits) {
      if (now - entry.windowStart > RATE_WINDOW_MS) this.rateLimits.delete(domain);
    }
  }
}
