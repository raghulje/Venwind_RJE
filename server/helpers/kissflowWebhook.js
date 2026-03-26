/**
 * Sends form submission data to Kissflow webhook via POST with JSON body.
 * Uses a queue so every lead is sent one-by-one; nothing is dropped even when
 * many forms are submitted at once.
 */

const https = require('https');
const { URL } = require('url');

const KISSFLOW_WEBHOOK_URL =
  'https://development-refexgroup.kissflow.com/integration/2/AcCMptp3yqcn/webhook/4e9yNyjAD6uxENJXAhNbtXzEGuOVQbDukBaeyWoG0kkqoeCkhIaxbK8FF4sWPWtcuQema2TcT-gLfVu3ot6g';

/** Delay between each webhook POST (ms) so Kissflow records each separately */
const DELAY_BETWEEN_SENDS_MS = 3500;

const queue = [];
let isProcessing = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Performs a single POST to Kissflow. Returns a Promise.
 */
function postOne(payload) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const bodyBuffer = Buffer.from(body, 'utf8');
    const url = new URL(KISSFLOW_WEBHOOK_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': bodyBuffer.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Kissflow webhook: POST received (success)');
        } else if (res.statusCode === 409) {
          console.warn('⚠️ Kissflow webhook 409 (payload was sent; check Kissflow Output – each submission has unique submissionId)');
        } else {
          console.warn(`⚠️ Kissflow webhook ${res.statusCode}: ${res.statusMessage}`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Kissflow webhook error:', error.message);
      resolve();
    });

    req.setTimeout(20000, () => {
      req.destroy();
      console.error('❌ Kissflow webhook timeout (20s)');
      resolve();
    });

    req.write(bodyBuffer);
    req.end();
  });
}

/**
 * Worker: processes queue one item at a time with a delay between sends.
 */
async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  while (queue.length > 0) {
    const item = queue.shift();
    const submissionId = `venwind-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const websiteName = item.websiteName || 'Venwind Refex';
    const formName = item.formName || 'Form';
    // Build payload with form data first; set website/form last so they are never overwritten
    const payload = {
      ...item.formData,
      submissionId,
      websiteName,
      formName,
      'Website and form': `${websiteName} - ${formName}`,
      Website_and_form: `${websiteName} - ${formName}`,
    };
    console.log(`📤 Kissflow queue: sending ${formName} [${submissionId}] (${queue.length} left in queue)`);
    await postOne(payload);
    if (queue.length > 0) {
      await sleep(DELAY_BETWEEN_SENDS_MS);
    }
  }

  isProcessing = false;
}

/**
 * Queues a webhook payload. It will be sent one-by-one so no lead is missed.
 * @param {string} websiteName - e.g. "Venwind Refex"
 * @param {string} formName - e.g. "Contact form" or "Careers form"
 * @param {object} formData - form fields (sent as JSON in POST body)
 */
function sendToKissflowWebhook(websiteName, formName, formData) {
  queue.push({ websiteName, formName, formData });
  console.log(`📥 Kissflow queue: enqueued ${formName} (queue size: ${queue.length})`);
  processQueue();
}

module.exports = { sendToKissflowWebhook };
