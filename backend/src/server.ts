import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {
  listEmails,
  getEmailDetail,
  setReadFlag,
  getUnreadCount,
  testConnection,
} from './imap';
import { sendEmail } from './smtp';
import {
  FetchEmailsRequest,
  EmailDetailRequest,
  MarkReadRequest,
  SendEmailRequest,
} from './types';

const app = express();
const PORT = process.env.PORT ?? 3001;

// Allowed origins: your app domain + local dev
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, Expo Go)
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.length === 0) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST'],
  }),
);

app.use(express.json({ limit: '10mb' }));

// ─── Health ──────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// ─── Test connection ──────────────────────────────────────────────────────────

app.post('/api/test-connection', async (req: Request, res: Response) => {
  const { imapHost, imapPort, email, password } = req.body as FetchEmailsRequest;
  try {
    await testConnection({ imapHost, imapPort, email, password });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: errorMessage(err) });
  }
});

// ─── List emails ──────────────────────────────────────────────────────────────

app.post('/api/emails', async (req: Request, res: Response) => {
  const { imapHost, imapPort, email, password, page = 1, pageSize = 30 } =
    req.body as FetchEmailsRequest;
  try {
    const emails = await listEmails({ imapHost, imapPort, email, password }, page, pageSize);
    res.json(emails);
  } catch (err) {
    res.status(400).json({ message: errorMessage(err) });
  }
});

// ─── Email detail ─────────────────────────────────────────────────────────────

app.post('/api/emails/detail', async (req: Request, res: Response) => {
  const { imapHost, imapPort, email, password, uid } = req.body as EmailDetailRequest;
  try {
    const detail = await getEmailDetail({ imapHost, imapPort, email, password }, uid);
    res.json(detail);
  } catch (err) {
    res.status(400).json({ message: errorMessage(err) });
  }
});

// ─── Mark read/unread ─────────────────────────────────────────────────────────

app.post('/api/emails/mark-read', async (req: Request, res: Response) => {
  const { imapHost, imapPort, email, password, uid, isRead } = req.body as MarkReadRequest;
  try {
    await setReadFlag({ imapHost, imapPort, email, password }, uid, isRead);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: errorMessage(err) });
  }
});

// ─── Unread count ─────────────────────────────────────────────────────────────

app.post('/api/emails/unread-count', async (req: Request, res: Response) => {
  const { imapHost, imapPort, email, password } = req.body as FetchEmailsRequest;
  try {
    const count = await getUnreadCount({ imapHost, imapPort, email, password });
    res.json({ count });
  } catch (err) {
    // Return 0 rather than erroring — shown as no badge on the card
    res.json({ count: 0, error: errorMessage(err) });
  }
});

// ─── Send email ───────────────────────────────────────────────────────────────

app.post('/api/send', async (req: Request, res: Response) => {
  const payload = req.body as SendEmailRequest;
  try {
    await sendEmail(payload);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: errorMessage(err) });
  }
});

// ─── Error handler ────────────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message ?? 'Internal server error' });
});

// cPanel Passenger passes a Unix socket path in PORT (e.g. /tmp/passenger.12345)
// Regular deployments use a numeric port
const isSocket = typeof PORT === 'string' && PORT.startsWith('/');

app.listen(PORT as number, () => {
  if (isSocket) {
    console.log(`MailSwitch backend listening on socket ${PORT}`);
  } else {
    console.log(`MailSwitch backend running on http://localhost:${PORT}`);
  }
});

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
