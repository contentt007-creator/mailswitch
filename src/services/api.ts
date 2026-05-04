import { Account, Email, EmailDetail } from '../types';

// Production URL — set this to your hosted backend before running `eas build`
const PROD_URL = 'https://mailapi.umbrellacorphq.com';

// Dev URL — your PC's LAN IP while running locally
const DEV_URL = 'http://192.168.0.156:3001';

export const BACKEND_URL = __DEV__ ? DEV_URL : PROD_URL;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const body = await res.json().catch(() => ({ message: 'Unknown error' }));

  if (!res.ok) {
    const msg = (body as { message?: string }).message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return body as T;
}

export interface FetchEmailsParams {
  account: Account;
  page?: number;
  pageSize?: number;
}

export async function fetchEmails(params: FetchEmailsParams): Promise<Email[]> {
  const { account, page = 1, pageSize = 30 } = params;
  return request<Email[]>('/api/emails', {
    method: 'POST',
    body: JSON.stringify({
      imapHost: account.imapHost,
      imapPort: account.imapPort,
      email: account.email,
      password: account.password,
      page,
      pageSize,
    }),
  });
}

export async function fetchEmailDetail(account: Account, uid: string): Promise<EmailDetail> {
  return request<EmailDetail>('/api/emails/detail', {
    method: 'POST',
    body: JSON.stringify({
      imapHost: account.imapHost,
      imapPort: account.imapPort,
      email: account.email,
      password: account.password,
      uid,
    }),
  });
}

export async function markEmailRead(
  account: Account,
  uid: string,
  isRead: boolean,
): Promise<void> {
  await request('/api/emails/mark-read', {
    method: 'POST',
    body: JSON.stringify({
      imapHost: account.imapHost,
      imapPort: account.imapPort,
      email: account.email,
      password: account.password,
      uid,
      isRead,
    }),
  });
}

export async function fetchUnreadCount(account: Account): Promise<number> {
  const result = await request<{ count: number }>('/api/emails/unread-count', {
    method: 'POST',
    body: JSON.stringify({
      imapHost: account.imapHost,
      imapPort: account.imapPort,
      email: account.email,
      password: account.password,
    }),
  });
  return result.count;
}

export interface SendEmailParams {
  account: Account;
  to: string;
  subject: string;
  body: string;
  replyToMessageId?: string;
  inReplyTo?: string;
  references?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  await request('/api/send', {
    method: 'POST',
    body: JSON.stringify({
      smtpHost: params.account.smtpHost,
      smtpPort: params.account.smtpPort,
      email: params.account.email,
      password: params.account.password,
      from: `${params.account.name} <${params.account.email}>`,
      to: params.to,
      subject: params.subject,
      body: params.body,
      inReplyTo: params.inReplyTo,
      references: params.references,
    }),
  });
}

export async function testConnection(account: Account): Promise<void> {
  await request('/api/test-connection', {
    method: 'POST',
    body: JSON.stringify({
      imapHost: account.imapHost,
      imapPort: account.imapPort,
      email: account.email,
      password: account.password,
    }),
  });
}
