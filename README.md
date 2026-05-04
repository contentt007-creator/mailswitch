# MailSwitch

Manage multiple cPanel webmail accounts and switch between them with one tap.

## Architecture

```
MailSwitch/
├── App.tsx                   # Expo entry point
├── src/
│   ├── navigation/           # React Navigation stack
│   ├── screens/              # All 5 screens
│   ├── components/           # AccountCard, EmailListItem, Skeleton, ErrorState
│   ├── services/             # accountStorage, emailCache, api
│   ├── theme/                # Colors, spacing, typography (dark mode)
│   └── types/                # Shared TypeScript types
└── backend/                  # Express server (IMAP + SMTP proxy)
    └── src/
        ├── server.ts         # Express routes
        ├── imap.ts           # imapflow — fetch, read, flag
        └── smtp.ts           # nodemailer — send
```

## Quick Start

### 1. Start the backend

```bash
cd backend
npm install      # first time only
npm run dev      # starts on http://localhost:3001
```

### 2. Start the Expo app

```bash
# from project root
npm install      # first time only
npm start        # opens Expo CLI
```

Press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with Expo Go.

### 3. Physical device

If testing on a real phone, edit [`src/services/api.ts`](src/services/api.ts):

```ts
// Replace with your machine's LAN IP
export const BACKEND_URL = 'http://192.168.1.xxx:3001';
```

## Backend API

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/emails` | List inbox (paginated) |
| POST | `/api/emails/detail` | Full email + body |
| POST | `/api/emails/mark-read` | Set \\Seen flag |
| POST | `/api/emails/unread-count` | Unread badge count |
| POST | `/api/send` | Send via SMTP |
| POST | `/api/test-connection` | Validate IMAP creds |
| GET  | `/health` | Liveness check |

All IMAP/SMTP credentials are passed per-request — the backend is stateless.

## cPanel Typical Settings

| Setting | Value |
|---------|-------|
| IMAP Host | `mail.yourdomain.com` |
| IMAP Port | `993` (SSL) |
| SMTP Host | `mail.yourdomain.com` |
| SMTP Port | `465` (SSL) |

The app auto-suggests `mail.<domain>` when you blur the email field.

## Security Notes

- Credentials stored with **expo-secure-store** (Keychain/Keystore on device).
- The backend passes creds through to the mail server per-request — nothing stored server-side.
- `rejectUnauthorized: false` is set for TLS to support cPanel self-signed certs. If your server has a valid cert, you can remove this.

## Running Both Together

```bash
# from project root
npm run dev
```

This uses `concurrently` to start both the backend and Expo simultaneously.
