export interface Account {
  id: string;
  name: string;
  email: string;
  password: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  color: string;
  createdAt: string;
}

export interface AccountFormData {
  name: string;
  email: string;
  password: string;
  imapHost: string;
  imapPort: string;
  smtpHost: string;
  smtpPort: string;
}

export interface Email {
  uid: string;
  messageId: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  date: string;
  snippet: string;
  isRead: boolean;
  hasAttachments: boolean;
}

export interface EmailDetail extends Email {
  htmlBody?: string;
  textBody?: string;
  rawBody: string;
}

export interface EmailAddress {
  name?: string;
  address: string;
}

export type RootStackParamList = {
  Main: undefined;
  Inbox: { account: Account };
  EmailDetail: { account: Account; email: Email };
  Compose: { account: Account; replyTo?: Email };
  AddAccount: { account?: Account };
};

export type MainTabParamList = {
  Home: undefined;
};

export interface ApiError {
  message: string;
  code?: string;
}

export interface UnreadCountResult {
  accountId: string;
  count: number;
  error?: string;
}
