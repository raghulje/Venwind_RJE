# Kissflow Contact Form Integration – Implementation Analysis

This document describes how the Venwind repository sends contact form submissions to the Kissflow webhook so the same flow can be replicated on another website. **No code was modified; this is analysis only.**

---

## 1. Form flow (end-to-end)

```
Frontend Form (ContactFormSection.tsx)
   → POST /api/contact-form (JSON body)
      → Backend route (server/routes/contact.js)
         → Email sent (optional) + sendToKissflowWebhook(websiteName, formName, webhookData)
            → kissflowWebhook.js: queue push + processQueue()
               → postOne(payload) → HTTPS POST to Kissflow webhook URL
```

**Step-by-step:**

1. **Frontend** – User submits the contact form in `ContactFormSection.tsx`. `handleSubmit` sends a `POST` request to `API_BASE_URL + '/api/contact-form'` with JSON: `name`, `email`, `phone`, `company`, `message`, `recaptchaToken`.
2. **API** – Request hits Express route `POST /api/contact-form` in `server/routes/contact.js` (mounted under `/api` in `server/index.js`).
3. **Backend route** – Validates body, sends email (and auto-reply), then builds `webhookData` (form fields + request metadata, phone as digits) and calls `sendToKissflowWebhook(websiteName, 'Contact form', webhookData)`. It does **not** await the webhook; the response is sent after email.
4. **Webhook helper** – `sendToKissflowWebhook` in `server/helpers/kissflowWebhook.js` pushes `{ websiteName, formName, formData }` onto an in-memory queue and calls `processQueue()`.
5. **Queue worker** – `processQueue()` runs in the background: takes one item, builds the final payload (adds `submissionId`, `websiteName`, `formName`, `"Website and form"`), calls `postOne(payload)`, waits 3.5s, then processes the next. Only one POST is in flight at a time.
6. **POST to Kissflow** – `postOne()` sends one HTTPS POST with the JSON payload to the Kissflow webhook URL. Success/409/timeout are logged; the Promise always resolves so the queue continues.

---

## 2. Files involved

| File | Purpose |
|------|--------|
| **client/src/pages/contact/components/ContactFormSection.tsx** | Frontend contact form: fields, validation, `handleSubmit` that POSTs to `/api/contact-form`. |
| **client/src/pages/contact/page.tsx** | Contact page that renders `ContactFormSection`. |
| **server/index.js** | Mounts contact routes: `app.use("/api", require("./routes/contact"))` so `POST /api/contact-form` is the endpoint. |
| **server/routes/contact.js** | Contact API: validation, email send, builds `webhookData`, calls `sendToKissflowWebhook`. |
| **server/helpers/kissflowWebhook.js** | Queue + worker; builds final payload; sends HTTPS POST to Kissflow. |
| **server/helpers/requestMeta.js** | `getRequestMeta(req)` and `phoneToDigitsOnly(phone)` used to build webhook payload. |

**Not used for Kissflow (but used in contact flow):**

- `server/services/email_service.js` – sends contact email and auto-reply.
- `server/models` / CMS – contact route uses CMS for email config; Kissflow payload is built from `req.body` and `getRequestMeta(req)`.

---

## 3. Kissflow integration code (per file)

### server/helpers/kissflowWebhook.js

- **Role:** Only place that talks to Kissflow. Holds the webhook URL, an in-memory queue, and a single worker that sends one item at a time with a delay.
- **Used by:** `server/routes/contact.js` and `server/routes/careers.js` (both call `sendToKissflowWebhook`).
- **Connection to webhook:** `postOne(payload)` does `https.request` to `KISSFLOW_WEBHOOK_URL` with `Content-Type: application/json; charset=utf-8` and the JSON body. No auth headers.

**Exports:** `sendToKissflowWebhook(websiteName, formName, formData)`.

### server/helpers/requestMeta.js

- **Role:** Builds request metadata for the webhook payload and normalizes phone to digits-only.
- **Used by:** `server/routes/contact.js` and `server/routes/careers.js` when building the object passed as `formData` to `sendToKissflowWebhook`.
- **Connection to webhook:** That `formData` is merged into the payload in `kissflowWebhook.js` (then `websiteName`, `formName`, `"Website and form"`, `submissionId` are set at the end).

**Exports:** `getRequestMeta(req)`, `parseUserAgent(ua)`, `phoneToDigitsOnly(phone)`.

### server/routes/contact.js

- **Role:** Defines `POST /contact-form` (exposed as `POST /api/contact-form`). Validates input, sends email, then enqueues the same submission for Kissflow.
- **Used by:** Express app in `server/index.js`; called when the frontend (or any client) POSTs to `/api/contact-form`.
- **Connection to webhook:** After sending email, it builds `webhookData` (form fields + `getRequestMeta(req)`, phone via `phoneToDigitsOnly(phone)`), then calls `sendToKissflowWebhook(websiteName, 'Contact form', webhookData)`. `websiteName` comes from `req.body.websiteName` if present and non-empty, otherwise `'Venwind'`.

---

## 4. Webhook sending logic

**Function that sends the POST:** `postOne(payload)` in `server/helpers/kissflowWebhook.js`.

- **Webhook URL:**  
  `https://development-refexgroup.kissflow.com/integration/2/AcCMptp3yqcn/webhook/4e9yNyjAD6uxENJXAhNbtXzEGuOVQbDukBaeyWoG0kkqoeCkhIaxbK8FF4sWPWtcuQema2TcT-gLfVu3ot6g`  
  (hardcoded in `kissflowWebhook.js`; not in `.env`.)

- **How the POST is made:** Node `https.request()`; method `POST`; body `JSON.stringify(payload)`; no query params.

- **Headers:**
  - `Content-Type: application/json; charset=utf-8`
  - `Content-Length: <body length>`

- **Sync vs queue:** The **route** does not await the webhook; it calls `sendToKissflowWebhook` and returns the HTTP response. The **webhook** runs in the background: each submission is queued and sent one-by-one by `processQueue()` with a 3.5s delay between POSTs. So the request is **asynchronous and queued**.

---

## 5. Payload structure (JSON sent to Kissflow)

The payload is built in two places:

1. **In the route** – `webhookData` = form fields + request metadata (and phone as digits). No `websiteName` / `formName` / `submissionId` / `"Website and form"` here.
2. **In kissflowWebhook.js** – Final payload = `{ ...item.formData, submissionId, websiteName, formName, 'Website and form', Website_and_form }`. So `websiteName` and `formName` are set last and cannot be overwritten by `formData`.

**Fields in the final JSON (in logical order):**

- All keys from `webhookData` (form + metadata), including:
  - **name**
  - **email**
  - **phone** (digits only)
  - **Phone_Number** (same digits-only value)
  - **company**
  - **message**
  - **timestamp** (ISO string)
  - **dateTime** (human-readable, Asia/Kolkata)
  - **date** (YYYY-MM-DD)
  - **time** (HH:MM:SS)
  - **ipAddress**
  - **userAgent** (truncated to 500 chars)
  - **deviceType** (desktop | mobile | tablet)
  - **browser** (Chrome, Firefox, Safari, etc.)
  - **countryCode** (from proxy headers if present, else null)
  - **referer**
  - **source** (referral | direct)
- **submissionId** – set in worker.
- **websiteName** – from queue item (e.g. `'Venwind'` or from `req.body.websiteName`).
- **formName** – from queue item (e.g. `'Contact form'`).
- **"Website and form"** – `"${websiteName} - ${formName}"`.
- **Website_and_form** – same value.

**Phone_Number (digits only):**

- In `server/helpers/requestMeta.js`, `phoneToDigitsOnly(phone)` does:  
  `String(phone).replace(/\D/g, '')`  
  so only digits remain (e.g. `+91 98401 23456` → `919840123456`).
- The contact route sets `phoneDigits = phoneToDigitsOnly(phone)` and puts it in `webhookData` as both `phone` and `Phone_Number`.

**submissionId:**

- Generated in `kissflowWebhook.js` in `processQueue()`:  
  `venwind-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`  
  e.g. `venwind-1739123456789-abc12def`.

**Request metadata:**

- Collected in `getRequestMeta(req)` in `server/helpers/requestMeta.js`:
  - **timestamp** – `new Date().toISOString()`
  - **dateTime** – `toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' })`
  - **date** – `toISOString().slice(0, 10)`
  - **time** – `toTimeString().slice(0, 8)`
  - **ipAddress** – `req.ip` or `x-forwarded-for` / `x-real-ip` or `req.connection.remoteAddress`
  - **userAgent** – `req.get('user-agent')` (trimmed to 500 chars)
  - **deviceType** / **browser** – from `parseUserAgent(userAgent)`
  - **countryCode** – `cf-ipcountry` or `x-vercel-ip-country` or `x-country-code` (or null)
  - **referer** – `req.get('referer')` or `req.get('referrer')`
  - **source** – `'referral'` if referer present, else `'direct'`

---

## 6. Queue / background behavior

- **Queuing:** `sendToKissflowWebhook(websiteName, formName, formData)` pushes `{ websiteName, formName, formData }` onto a module-level array `queue` and then calls `processQueue()`.
- **Worker:** `processQueue()` is async. If it’s already running (`isProcessing === true`) or the queue is empty, it returns. Otherwise it sets `isProcessing = true`, then in a loop: shift one item, build payload, `await postOne(payload)`, then if the queue is not empty `await sleep(3500)`, and repeat. When the queue is empty it sets `isProcessing = false`.
- **If the webhook fails:** `postOne` always resolves (no reject): on HTTP error it logs and resolves; on request error it logs and resolves; on 20s timeout it destroys the request, logs, and resolves. So the queue never stalls; failed sends are not retried (no retry logic in this repo).

---

## 7. Configuration

- **Kissflow webhook URL:** Hardcoded in `server/helpers/kissflowWebhook.js` as `KISSFLOW_WEBHOOK_URL`. Not in `.env` or config.
- **websiteName:** Not in `.env`. For contact, it comes from `req.body.websiteName`; if missing or blank, the route uses `'Venwind'`. So for Venwind’s own contact form the frontend does not send `websiteName` and the backend uses `'Venwind'`.
- **Email-related (used by the same route but not by Kissflow):** In `server/.env`: `RECEIVER_EMAIL`, `SMTP_USER`, `SMTP_PASS`, optionally `SMTP_HOST`, `SMTP_PORT`. See `server/.env.example`.

There is no `WEBSITE_NAME` or `KISSFLOW_WEBHOOK_URL` in `.env`. To replicate on another site, you can either keep the URL in code or move it to `.env` and pass a per-site `websiteName` (e.g. from env or constant).

---

## 8. Contact form fields (sent from frontend and used for webhook)

The frontend sends (JSON) and the backend validates and forwards to Kissflow:

| Field | Required | Notes |
|-------|----------|--------|
| name | Yes | 2–100 chars, letters/spaces/hyphens/apostrophes |
| email | Yes | Must contain `@`, length ≥ 3 |
| phone | No | Optional, max 50 chars (then converted to digits for webhook) |
| company | No | Optional, max 200 chars |
| message | Yes | 10–500 chars |
| recaptchaToken | Yes | Frontend sends `'verified'` after custom captcha |
| websiteName | No | Optional; if present and non-empty, used for Kissflow `websiteName`; else `'Venwind'` |

---

## 9. How the webhook is triggered (concise)

1. User submits the form in `ContactFormSection.tsx` → `POST /api/contact-form` with JSON body.
2. `server/routes/contact.js` validates, sends email (and auto-reply), then:
   - `meta = getRequestMeta(req)`
   - `phoneDigits = phoneToDigitsOnly(phone)`
   - `webhookData = { name, email, phone: phoneDigits, Phone_Number: phoneDigits, company, message, ...meta }`
   - `sendToKissflowWebhook(websiteName || 'Venwind', 'Contact form', webhookData)`
3. `sendToKissflowWebhook` pushes to the queue and calls `processQueue()`.
4. Worker pops one item, builds payload with `submissionId`, `websiteName`, `formName`, `"Website and form"`, `Website_and_form`, then `await postOne(payload)`.
5. `postOne` sends one HTTPS POST to the Kissflow webhook URL with that JSON; 3.5s later the next item is processed.
6. The HTTP response to the client is already sent after step 2; the webhook does not block it.

---

## 10. Key functions

| Function | File | What it does |
|----------|------|----------------|
| `sendToKissflowWebhook(websiteName, formName, formData)` | kissflowWebhook.js | Pushes one job to the queue and kicks the worker. |
| `processQueue()` | kissflowWebhook.js | Async worker: processes queue one item at a time, 3.5s between POSTs; builds final payload and calls `postOne`. |
| `postOne(payload)` | kissflowWebhook.js | Sends one HTTPS POST to the Kissflow webhook URL with the given JSON; always resolves. |
| `getRequestMeta(req)` | requestMeta.js | Returns an object with timestamp, dateTime, date, time, ipAddress, userAgent, deviceType, browser, countryCode, referer, source. |
| `phoneToDigitsOnly(phone)` | requestMeta.js | Returns the string with all non-digits removed. |
| `parseUserAgent(ua)` | requestMeta.js | Returns `{ deviceType, browser }` from the User-Agent string. |

---

## 11. Kissflow webhook URL (for replication)

```
https://development-refexgroup.kissflow.com/integration/2/AcCMptp3yqcn/webhook/4e9yNyjAD6uxENJXAhNbtXzEGuOVQbDukBaeyWoG0kkqoeCkhIaxbK8FF4sWPWtcuQema2TcT-gLfVu3ot6g
```

Use the same URL on the other website so all leads go to the same Kissflow integration; distinguish sites by setting **websiteName** to that site’s name (e.g. Refex Group, RIL, 3imedtech) in the payload.
