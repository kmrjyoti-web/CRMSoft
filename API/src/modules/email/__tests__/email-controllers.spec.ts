import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EmailController } from '../presentation/email.controller';
import { EmailAccountController } from '../presentation/email-account.controller';
import { EmailTemplateController } from '../presentation/email-template.controller';
import { EmailSignatureController } from '../presentation/email-signature.controller';
import { EmailCampaignController } from '../presentation/email-campaign.controller';
import { ComposeEmailCommand } from '../application/commands/compose-email/compose-email.command';
import { ConnectAccountCommand } from '../application/commands/connect-account/connect-account.command';
import { CreateTemplateCommand } from '../application/commands/create-template/create-template.command';
import { CreateSignatureCommand } from '../application/commands/create-signature/create-signature.command';
import { CreateCampaignCommand } from '../application/commands/create-campaign/create-campaign.command';
import { ImapSmtpService } from '../services/imap-smtp.service';
import { GmailService } from '../services/gmail.service';
import { OutlookService } from '../services/outlook.service';

describe('Email Controllers', () => {
  let commandBus: any;
  let queryBus: any;

  let emailController: EmailController;
  let emailAccountController: EmailAccountController;
  let emailTemplateController: EmailTemplateController;
  let emailSignatureController: EmailSignatureController;
  let emailCampaignController: EmailCampaignController;

  beforeEach(async () => {
    commandBus = {
      execute: jest.fn().mockResolvedValue({ id: 'result-1' }),
    };

    queryBus = {
      execute: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        EmailController,
        EmailAccountController,
        EmailTemplateController,
        EmailSignatureController,
        EmailCampaignController,
      ],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
        { provide: ImapSmtpService, useValue: { testConnection: jest.fn() } },
        { provide: GmailService, useValue: { getAuthUrl: jest.fn(), handleOAuthCallback: jest.fn() } },
        { provide: OutlookService, useValue: { getAuthUrl: jest.fn(), handleOAuthCallback: jest.fn() } },
      ],
    }).compile();

    emailController = module.get<EmailController>(EmailController);
    emailAccountController = module.get<EmailAccountController>(EmailAccountController);
    emailTemplateController = module.get<EmailTemplateController>(EmailTemplateController);
    emailSignatureController = module.get<EmailSignatureController>(EmailSignatureController);
    emailCampaignController = module.get<EmailCampaignController>(EmailCampaignController);
  });

  it('should dispatch ComposeEmailCommand when composing an email', async () => {
    const dto = {
      accountId: 'acc-1',
      to: [{ email: 'recipient@example.com', name: 'Recipient' }],
      subject: 'Test Subject',
      bodyHtml: '<p>Hello</p>',
      sendNow: true,
    };

    await emailController.compose(dto as any, 'user-1');

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(ComposeEmailCommand),
    );
    const command = commandBus.execute.mock.calls[0][0];
    expect(command).toBeInstanceOf(ComposeEmailCommand);
    expect(command.accountId).toBe('acc-1');
    expect(command.userId).toBe('user-1');
    expect(command.subject).toBe('Test Subject');
  });

  it('should dispatch ConnectAccountCommand when connecting an account', async () => {
    const dto = {
      provider: 'GMAIL',
      emailAddress: 'user@gmail.com',
      displayName: 'My Gmail',
      accessToken: 'token-abc',
      refreshToken: 'refresh-xyz',
    };

    await emailAccountController.connect(dto as any, 'user-1');

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(ConnectAccountCommand),
    );
    const command = commandBus.execute.mock.calls[0][0];
    expect(command).toBeInstanceOf(ConnectAccountCommand);
    expect(command.provider).toBe('GMAIL');
    expect(command.userId).toBe('user-1');
    expect(command.emailAddress).toBe('user@gmail.com');
  });

  it('should dispatch CreateTemplateCommand when creating a template', async () => {
    const dto = {
      name: 'Welcome Email',
      category: 'ONBOARDING',
      subject: 'Welcome {{name}}',
      bodyHtml: '<p>Welcome {{name}}!</p>',
      isShared: true,
      bodyText: 'Welcome {{name}}!',
      description: 'Onboarding welcome email',
    };
    const user = { id: 'user-1', name: 'Admin', email: 'admin@example.com' };

    await emailTemplateController.create(dto as any, user);

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(CreateTemplateCommand),
    );
    const command = commandBus.execute.mock.calls[0][0];
    expect(command).toBeInstanceOf(CreateTemplateCommand);
    expect(command.name).toBe('Welcome Email');
    expect(command.category).toBe('ONBOARDING');
    expect(command.userId).toBe('user-1');
    expect(command.userName).toBe('Admin');
  });

  it('should dispatch CreateSignatureCommand when creating a signature', async () => {
    const dto = {
      name: 'Default Signature',
      bodyHtml: '<p>Best regards,<br/>John</p>',
      isDefault: true,
    };

    await emailSignatureController.create(dto as any, 'user-1');

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(CreateSignatureCommand),
    );
    const command = commandBus.execute.mock.calls[0][0];
    expect(command).toBeInstanceOf(CreateSignatureCommand);
    expect(command.name).toBe('Default Signature');
    expect(command.bodyHtml).toBe('<p>Best regards,<br/>John</p>');
    expect(command.isDefault).toBe(true);
    expect(command.userId).toBe('user-1');
  });

  it('should dispatch CreateCampaignCommand when creating a campaign', async () => {
    const dto = {
      name: 'Q1 Outreach',
      subject: 'Special Offer for {{firstName}}',
      bodyHtml: '<p>Hi {{firstName}}, check out our offers!</p>',
      accountId: 'acc-1',
      description: 'Q1 marketing campaign',
      trackOpens: true,
      trackClicks: true,
    };
    const user = { id: 'user-1', name: 'Marketing Manager', email: 'marketing@example.com' };

    await emailCampaignController.create(dto as any, user);

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(CreateCampaignCommand),
    );
    const command = commandBus.execute.mock.calls[0][0];
    expect(command).toBeInstanceOf(CreateCampaignCommand);
    expect(command.name).toBe('Q1 Outreach');
    expect(command.accountId).toBe('acc-1');
    expect(command.userId).toBe('user-1');
    expect(command.userName).toBe('Marketing Manager');
    expect(command.trackOpens).toBe(true);
    expect(command.trackClicks).toBe(true);
  });
});
