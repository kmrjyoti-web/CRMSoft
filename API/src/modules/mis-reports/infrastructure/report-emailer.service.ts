import { Injectable, Logger } from '@nestjs/common';

/** Parameters for sending a report via email */
export interface SendReportParams {
  /** List of recipient email addresses */
  recipients: string[];
  /** Human-readable report name for the email subject */
  reportName: string;
  /** File format (e.g., "XLSX", "CSV", "PDF") */
  format: string;
  /** File content buffer to attach */
  fileBuffer: Buffer;
  /** File name with extension */
  fileName: string;
}

/**
 * Stub email sender for report delivery.
 * In production, this would integrate with the existing EmailSenderService
 * or a mail provider (nodemailer, SES, etc.).
 *
 * Currently logs the delivery intent without actually sending emails.
 */
@Injectable()
export class ReportEmailerService {
  private readonly logger = new Logger(ReportEmailerService.name);

  /**
   * Send a report as an email attachment to the specified recipients.
   * This is a stub implementation that logs the delivery parameters.
   *
   * In production, replace the body with actual email sending logic:
   * - Build email subject from reportName
   * - Attach fileBuffer with fileName
   * - Send to each recipient
   *
   * @param params - Email delivery parameters including recipients and file
   */
  async sendReport(params: SendReportParams): Promise<void> {
    this.logger.log(
      `[STUB] Sending report "${params.reportName}" (${params.format}) ` +
      `to ${params.recipients.length} recipient(s): ${params.recipients.join(', ')}`,
    );
    this.logger.log(
      `[STUB] Attachment: ${params.fileName} (${(params.fileBuffer.length / 1024).toFixed(1)} KB)`,
    );

    // TODO: Integrate with EmailSenderService or nodemailer
    // Example production implementation:
    // await this.emailService.send({
    //   to: params.recipients,
    //   subject: `MIS Report: ${params.reportName}`,
    //   body: `Please find attached the ${params.reportName} report.`,
    //   attachments: [{ filename: params.fileName, content: params.fileBuffer }],
    // });
  }

  /**
   * Validate that all recipient email addresses are in a valid format.
   * @param recipients - Array of email addresses to validate
   * @returns True if all addresses are valid, false otherwise
   */
  validateRecipients(recipients: string[]): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return recipients.every(email => emailRegex.test(email));
  }
}
