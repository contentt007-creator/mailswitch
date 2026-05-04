# Deployment Guide

## Part 1 — Host the backend on cPanel

### Step 1: Upload backend files

Upload **only** the `backend/` folder to your server (e.g. via cPanel File Manager or FTP).  
Suggested path: `~/mailswitch-backend/`

Upload these files/folders:
```
backend/
  dist/          ← compiled JS (run `npm run build` locally first)
  node_modules/  ← or run npm install on the server
  package.json
  .env           ← copy from .env.example and fill in values
```

> Tip: run `npm run build` locally first, then upload the whole `backend/` folder.

### Step 2: Set up Node.js App in cPanel

1. Log into cPanel → search **"Setup Node.js App"**
2. Click **"Create Application"**
3. Fill in:
   | Field | Value |
   |---|---|
   | Node.js version | 18.x or 20.x |
   | Application mode | Production |
   | Application root | `mailswitch-backend` |
   | Application URL | choose a subdomain e.g. `mail-api.yourdomain.com` |
   | Application startup file | `dist/server.js` |
4. Click **Save**
5. Open the app's terminal in cPanel and run:
   ```bash
   npm install --omit=dev
   ```
6. Click **Restart**
7. Visit `https://mail-api.yourdomain.com/health` — you should see `{"status":"ok"}`

### Step 3: Set environment variables in cPanel

In the Node.js App settings, add:
```
ALLOWED_ORIGINS=    (leave empty — mobile apps don't send an Origin header)
```
cPanel sets `PORT` automatically. Do not override it.

### Step 4: Enable SSL

In cPanel → **SSL/TLS** → run AutoSSL on `mail-api.yourdomain.com`.  
The app must be served over **HTTPS** or Android will block the requests.

---

## Part 2 — Update the app with your production URL

Open `src/services/api.ts` and replace the placeholder:

```ts
const PROD_URL = 'https://mail-api.yourdomain.com';  // ← your actual URL
```

---

## Part 3 — Build the APK with EAS

### Step 1: Create a free Expo account

Go to https://expo.dev → Sign up (free).

### Step 2: Install EAS CLI and log in

```bash
npm install -g eas-cli
eas login
```

### Step 3: Link the project to your Expo account

```bash
cd D:\Claude\MailSwitch
eas init
```

This fills in `extra.eas.projectId` in `app.json` automatically.

### Step 4: Build the APK

```bash
eas build -p android --profile preview
```

- EAS uploads your code and builds it in the cloud (~10 min)
- You get a download link for the `.apk` when it's done
- Install it on any Android phone (enable "Install from unknown sources" in settings)

### Step 5: Future updates

Bump `version` and `versionCode` in `app.json`, then run `eas build` again.

---

## Quick reference

| What | Command |
|---|---|
| Build backend for upload | `cd backend && npm run build` |
| Build Android APK | `eas build -p android --profile preview` |
| Run locally (dev) | `npm run dev` (from project root) |
| Test backend health | `curl https://mail-api.yourdomain.com/health` |
