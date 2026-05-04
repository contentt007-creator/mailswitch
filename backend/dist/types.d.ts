export interface ImapCredentials {
    imapHost: string;
    imapPort: number;
    email: string;
    password: string;
}
export interface SmtpCredentials {
    smtpHost: string;
    smtpPort: number;
    email: string;
    password: string;
}
export interface FetchEmailsRequest extends ImapCredentials {
    page?: number;
    pageSize?: number;
}
export interface EmailDetailRequest extends ImapCredentials {
    uid: string;
}
export interface MarkReadRequest extends ImapCredentials {
    uid: string;
    isRead: boolean;
}
export interface SendEmailRequest extends SmtpCredentials {
    from: string;
    to: string;
    subject: string;
    body: string;
    inReplyTo?: string;
    references?: string;
}
export interface EmailAddress {
    name?: string;
    address: string;
}
export interface EmailSummary {
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
export interface EmailDetail extends EmailSummary {
    htmlBody?: string;
    textBody?: string;
    rawBody: string;
}
//# sourceMappingURL=types.d.ts.map