export interface ChannelSendParams {
  recipientId: string;
  recipientAddr?: string;
  subject: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface ChannelSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IChannelAdapter {
  readonly channel: string;
  send(params: ChannelSendParams): Promise<ChannelSendResult>;
}
