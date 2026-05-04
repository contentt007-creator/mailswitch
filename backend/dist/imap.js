"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEmails = listEmails;
exports.getEmailDetail = getEmailDetail;
exports.setReadFlag = setReadFlag;
exports.getUnreadCount = getUnreadCount;
exports.testConnection = testConnection;
const imapflow_1 = require("imapflow");
function makeImapClient(creds) {
    return new imapflow_1.ImapFlow({
        host: creds.imapHost,
        port: creds.imapPort,
        secure: creds.imapPort === 993,
        auth: {
            user: creds.email,
            pass: creds.password,
        },
        logger: false,
        tls: {
            rejectUnauthorized: false, // allow self-signed certs common on cPanel servers
        },
    });
}
function parseAddressList(raw) {
    if (!raw || !Array.isArray(raw))
        return [];
    return raw.map((a) => ({
        name: a.name ?? undefined,
        address: a.address ?? '',
    }));
}
function firstAddress(raw) {
    const list = parseAddressList(Array.isArray(raw) ? raw : [raw]);
    return list[0] ?? { address: '' };
}
function extractSnippet(text, html) {
    if (text) {
        return text.replace(/\s+/g, ' ').trim().slice(0, 120);
    }
    if (html) {
        return html
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 120);
    }
    return '';
}
async function listEmails(creds, page = 1, pageSize = 30) {
    const client = makeImapClient(creds);
    await client.connect();
    try {
        const lock = await client.getMailboxLock('INBOX');
        try {
            const status = await client.status('INBOX', { messages: true });
            const total = status.messages ?? 0;
            if (total === 0)
                return [];
            const end = Math.max(total - (page - 1) * pageSize, 1);
            const start = Math.max(end - pageSize + 1, 1);
            const emails = [];
            for await (const msg of client.fetch(`${start}:${end}`, {
                uid: true,
                envelope: true,
                bodyStructure: true,
                flags: true,
                bodyParts: ['1'],
            })) {
                const env = msg.envelope;
                const bodyPart = msg.bodyParts?.get('1')
                    ?.toString('utf8')
                    .slice(0, 300);
                const isRead = msg.flags?.has('\\Seen') ?? false;
                const hasAttachments = msg.bodyStructure?.childNodes?.some((n) => n.disposition?.toLowerCase() === 'attachment') ?? false;
                emails.push({
                    uid: String(msg.uid),
                    messageId: env.messageId ?? '',
                    subject: env.subject ?? '',
                    from: firstAddress(env.from),
                    to: parseAddressList(env.to),
                    cc: env.cc ? parseAddressList(env.cc) : undefined,
                    date: env.date?.toISOString() ?? new Date().toISOString(),
                    snippet: extractSnippet(bodyPart),
                    isRead,
                    hasAttachments,
                });
            }
            return emails.reverse();
        }
        finally {
            lock.release();
        }
    }
    finally {
        await client.logout();
    }
}
async function getEmailDetail(creds, uid) {
    const client = makeImapClient(creds);
    await client.connect();
    try {
        const lock = await client.getMailboxLock('INBOX');
        try {
            let htmlBody;
            let textBody;
            let rawBody = '';
            let summary = null;
            for await (const msg of client.fetch({ uid: Number(uid) }, { uid: true, envelope: true, bodyStructure: true, flags: true, source: true }, { uid: true })) {
                const env = msg.envelope;
                rawBody = msg.source?.toString('utf8') ?? '';
                // Crude body part extraction — good enough for plain/HTML
                const htmlMatch = rawBody.match(/Content-Type: text\/html[^]*?(?:\r?\n){2}([^]*?)(?=\r?\n--|\r?\n\r?\nContent-|$)/i);
                const textMatch = rawBody.match(/Content-Type: text\/plain[^]*?(?:\r?\n){2}([^]*?)(?=\r?\n--|\r?\n\r?\nContent-|$)/i);
                htmlBody = htmlMatch?.[1]?.trim();
                textBody = textMatch?.[1]?.trim();
                if (!htmlBody && !textBody) {
                    // single part message
                    const bodyStart = rawBody.indexOf('\r\n\r\n');
                    if (bodyStart !== -1)
                        textBody = rawBody.slice(bodyStart + 4).trim();
                }
                const isRead = msg.flags?.has('\\Seen') ?? false;
                const hasAttachments = msg.bodyStructure?.childNodes?.some((n) => n.disposition?.toLowerCase() === 'attachment') ?? false;
                summary = {
                    uid,
                    messageId: env.messageId ?? '',
                    subject: env.subject ?? '',
                    from: firstAddress(env.from),
                    to: parseAddressList(env.to),
                    cc: env.cc ? parseAddressList(env.cc) : undefined,
                    date: env.date?.toISOString() ?? new Date().toISOString(),
                    isRead,
                };
                if (!isRead) {
                    await client.messageFlagsAdd({ uid: Number(uid) }, ['\\Seen'], { uid: true });
                }
            }
            if (!summary)
                throw new Error('Email not found');
            return {
                ...summary,
                snippet: extractSnippet(textBody, htmlBody),
                hasAttachments: summary.uid ? true : false,
                htmlBody,
                textBody,
                rawBody,
            };
        }
        finally {
            lock.release();
        }
    }
    finally {
        await client.logout();
    }
}
async function setReadFlag(creds, uid, isRead) {
    const client = makeImapClient(creds);
    await client.connect();
    try {
        const lock = await client.getMailboxLock('INBOX');
        try {
            if (isRead) {
                await client.messageFlagsAdd({ uid: Number(uid) }, ['\\Seen'], { uid: true });
            }
            else {
                await client.messageFlagsRemove({ uid: Number(uid) }, ['\\Seen'], { uid: true });
            }
        }
        finally {
            lock.release();
        }
    }
    finally {
        await client.logout();
    }
}
async function getUnreadCount(creds) {
    const client = makeImapClient(creds);
    await client.connect();
    try {
        const status = await client.status('INBOX', { unseen: true });
        return status.unseen ?? 0;
    }
    finally {
        await client.logout();
    }
}
async function testConnection(creds) {
    const client = makeImapClient(creds);
    await client.connect();
    await client.logout();
}
//# sourceMappingURL=imap.js.map