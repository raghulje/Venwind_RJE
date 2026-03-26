# Cursor prompt: Add Kissflow integration for another website’s form

Use this prompt when you add the same Kissflow contact/lead integration to **another website** (Refex Group, RIL, 3imedtech, etc.) that has a form. Paste it into Cursor and then point to the new site’s form/code.

---

## Prompt (copy from below)

```
I have another website in our group that has a contact/form page. I need the same Kissflow integration we use on Venwind.

**What to do**

1. **Analyze this project’s form**
   - Find the contact (or similar) form component(s) and the API route that receives the form submission.
   - List all form fields (e.g. name, email, phone, company, message, or whatever this form has).

2. **Implement the same Kissflow integration as Venwind**
   - When the form is submitted, in addition to any existing behavior (e.g. sending email), also POST the form data as JSON to the Kissflow webhook.
   - Use the **same** webhook URL and pattern as in the Venwind server (see Venwind repo: `server/helpers/kissflowWebhook.js`, `server/routes/contact.js`). If this codebase doesn’t have that yet, add equivalent logic:
     - A queue so submissions are sent one-by-one (no dropped leads).
     - Build a payload that includes:
       - **websiteName**: must be **this website’s name** (e.g. "Refex Group", "RIL", "3imedtech", "adonis", "refex mobility", "Refex Airports") — not "Venwind". This is critical so Kissflow can filter by site.
       - **formName**: e.g. "Contact form" or "Careers form" (whatever fits this form).
       - All form fields (matching the names from step 1).
       - **Phone_Number**: digits only (strip spaces, +, etc.) so Kissflow validation passes.
       - Request metadata for dashboard: timestamp, dateTime, date, time, ipAddress, userAgent, deviceType, browser, countryCode (if available), referer, source.
       - **submissionId**: unique per submission (e.g. `websiteSlug-${Date.now()}-${random}`).
       - **"Website and form"** (and optionally **Website_and_form**): combined string `"${websiteName} - ${formName}"` so Kissflow’s "Website and form" field is filled.
   - POST that JSON to the same Kissflow webhook endpoint (same URL as Venwind). Do not block the main form response on the webhook; run it in the background/queue.

3. **Configuration**
   - **websiteName** must come from this application (e.g. constant or env like `WEBSITE_NAME`), not from Venwind. Each site should send its own name so Kissflow shows the correct website.
   - If the form is submitted from the frontend, the backend that receives the submit must add websiteName (and metadata); do not rely on the client to send a trusted websiteName unless it’s only for display and the server overwrites it from server-side config.

**Reference (Venwind)**
- Webhook helper with queue: `server/helpers/kissflowWebhook.js`
- Request metadata (device, browser, date/time, IP): `server/helpers/requestMeta.js`
- Contact route that builds payload and calls webhook: `server/routes/contact.js`
- Phone digits-only: `server/helpers/requestMeta.js` → `phoneToDigitsOnly()`

**Deliverables**
- List of form fields you found.
- Where you added/changed code (files and brief description).
- The exact **websiteName** value you used for this website in the JSON.
```

---

## Quick checklist for the implementer

- [ ] Form fields listed (name, email, phone, …).
- [ ] Backend sends one POST per submission to the same Kissflow webhook URL.
- [ ] Payload includes **websiteName** = this website’s name (not Venwind).
- [ ] Payload includes **formName** (e.g. "Contact form").
- [ ] **Phone_Number** (and phone) are digits-only.
- [ ] **"Website and form"** = `"${websiteName} - ${formName}"`.
- [ ] Request metadata (timestamp, dateTime, userAgent, deviceType, browser, ipAddress, etc.) included.
- [ ] **submissionId** unique per request.
- [ ] Queue or fire-and-forget so form response isn’t blocked and leads aren’t dropped.

---

## Example websiteName values (use the correct one per site)

- Venwind  
- Refex Group  
- RIL  
- RLS  
- RRIl  
- 3imedtech  
- adonis  
- refex mobility  
- Refex Airports  

Use the exact name that should appear in Kissflow for that website.
