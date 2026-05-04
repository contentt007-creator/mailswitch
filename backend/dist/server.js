"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const imap_1 = require("./imap");
const smtp_1 = require("./smtp");
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3001;
// Allowed origins: your app domain + local dev
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        // Allow requests with no origin (mobile apps, curl, Expo Go)
        if (!origin)
            return cb(null, true);
        if (ALLOWED_ORIGINS.length === 0)
            return cb(null, true);
        if (ALLOWED_ORIGINS.includes(origin))
            return cb(null, true);
        cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() });
});
// ─── Test connection ──────────────────────────────────────────────────────────
app.post('/api/test-connection', async (req, res) => {
    const { imapHost, imapPort, email, password } = req.body;
    try {
        await (0, imap_1.testConnection)({ imapHost, imapPort, email, password });
        res.json({ ok: true });
    }
    catch (err) {
        res.status(400).json({ message: errorMessage(err) });
    }
});
// ─── List emails ──────────────────────────────────────────────────────────────
app.post('/api/emails', async (req, res) => {
    const { imapHost, imapPort, email, password, page = 1, pageSize = 30 } = req.body;
    try {
        const emails = await (0, imap_1.listEmails)({ imapHost, imapPort, email, password }, page, pageSize);
        res.json(emails);
    }
    catch (err) {
        res.status(400).json({ message: errorMessage(err) });
    }
});
// ─── Email detail ─────────────────────────────────────────────────────────────
app.post('/api/emails/detail', async (req, res) => {
    const { imapHost, imapPort, email, password, uid } = req.body;
    try {
        const detail = await (0, imap_1.getEmailDetail)({ imapHost, imapPort, email, password }, uid);
        res.json(detail);
    }
    catch (err) {
        res.status(400).json({ message: errorMessage(err) });
    }
});
// ─── Mark read/unread ─────────────────────────────────────────────────────────
app.post('/api/emails/mark-read', async (req, res) => {
    const { imapHost, imapPort, email, password, uid, isRead } = req.body;
    try {
        await (0, imap_1.setReadFlag)({ imapHost, imapPort, email, password }, uid, isRead);
        res.json({ ok: true });
    }
    catch (err) {
        res.status(400).json({ message: errorMessage(err) });
    }
});
// ─── Unread count ─────────────────────────────────────────────────────────────
app.post('/api/emails/unread-count', async (req, res) => {
    const { imapHost, imapPort, email, password } = req.body;
    try {
        const count = await (0, imap_1.getUnreadCount)({ imapHost, imapPort, email, password });
        res.json({ count });
    }
    catch (err) {
        // Return 0 rather than erroring — shown as no badge on the card
        res.json({ count: 0, error: errorMessage(err) });
    }
});
// ─── Send email ───────────────────────────────────────────────────────────────
app.post('/api/send', async (req, res) => {
    const payload = req.body;
    try {
        await (0, smtp_1.sendEmail)(payload);
        res.json({ ok: true });
    }
    catch (err) {
        res.status(400).json({ message: errorMessage(err) });
    }
});
// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: err.message ?? 'Internal server error' });
});
// cPanel Passenger passes a Unix socket path in PORT (e.g. /tmp/passenger.12345)
// Regular deployments use a numeric port
const isSocket = typeof PORT === 'string' && PORT.startsWith('/');
app.listen(PORT, () => {
    if (isSocket) {
        console.log(`MailSwitch backend listening on socket ${PORT}`);
    }
    else {
        console.log(`MailSwitch backend running on http://localhost:${PORT}`);
    }
});
function errorMessage(err) {
    if (err instanceof Error)
        return err.message;
    return String(err);
}
//# sourceMappingURL=server.js.map