import { ImapCredentials, EmailSummary, EmailDetail } from './types';
export declare function listEmails(creds: ImapCredentials, page?: number, pageSize?: number): Promise<EmailSummary[]>;
export declare function getEmailDetail(creds: ImapCredentials, uid: string): Promise<EmailDetail>;
export declare function setReadFlag(creds: ImapCredentials, uid: string, isRead: boolean): Promise<void>;
export declare function getUnreadCount(creds: ImapCredentials): Promise<number>;
export declare function testConnection(creds: ImapCredentials): Promise<void>;
//# sourceMappingURL=imap.d.ts.map