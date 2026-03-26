/**
 * Sends dummy contact form data to the API so the server forwards
 * to the Kissflow webhook.
 *
 * ✅ All websites included
 * ✅ Each website has 4–7 records
 * ✅ Completely fresh dataset (no old names)
 */

const http = require('http');

const BASE = process.env.API_BASE || 'http://localhost:8080';

function postJson(pathname, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathname, BASE);
    const data = JSON.stringify(body);

    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      ...extraHeaders,
    };

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: 'POST',
        headers,
      },
      (res) => {
        let chunks = '';
        res.on('data', (c) => (chunks += c));
        res.on('end', () => {
          try {
            const out = chunks ? JSON.parse(chunks) : {};
            resolve({ status: res.statusCode, data: out });
          } catch {
            resolve({ status: res.statusCode, data: chunks });
          }
        });
      }
    );

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errMsg(e) {
  return e?.message || e?.code || String(e);
}

// ---------------- NEW DATA SET ----------------

// Completely new names (NO overlap with previous)
const FIRST_NAMES = [
  'Aarav', 'Diya', 'Reyansh', 'Meera', 'Vivaan', 'Anaya',
  'Krish', 'Saanvi', 'Ivaan', 'Myra', 'Ayaan', 'Navya',
  'Advik', 'Riya', 'Shaurya', 'Kiara', 'Kabir', 'Ishaan'
];

const LAST_NAMES = [
  'Kapoor', 'Mehta', 'Bansal', 'Sethi', 'Chopra',
  'Deshmukh', 'Kulkarni', 'Naidu', 'Reddy',
  'Iyer', 'Menon', 'Shetty', 'Patel', 'Shah'
];

const COMPANIES = [
  'Zenith Energy Solutions',
  'BluePeak Renewables',
  'Orbit Infrastructure Ltd',
  'GreenGrid Systems',
  'Apex Wind Corp',
  'Helios Power Tech',
  'EcoWave Energy',
  'TerraVolt Solutions'
];

const MESSAGES = [
  'Interested in collaboration opportunities. Please connect.',
  'Need pricing details for your services.',
  'Looking for long-term partnership.',
  'Requesting technical documentation.',
  'Need consultation for upcoming project.',
  'Exploring renewable integration solutions.',
  'Kindly share your portfolio and case studies.',
  'Looking to onboard vendors for FY26.'
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0)',
  'Mozilla/5.0 (Linux; Android 13)',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
];

// ---------------- HELPERS ----------------

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName() {
  return `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
}

function generateEmail(name, website, index) {
  const clean = name.toLowerCase().replace(/\s/g, '');
  const site = website.replace(/\s/g, '').toLowerCase();
  return `${clean}${index}@${site}.test`;
}

function generatePhone() {
  return '9' + Math.floor(100000000 + Math.random() * 900000000);
}

// ---------------- ALL WEBSITES ----------------

const WEBSITES = [
  'Refex Group',
  'Refex Industries Limited',
  'Venwind Refex',
  '3iMedtech',
  'Refex Life Sciences',
  'Adonis',
  'Refex Renewables',
  'Anamaya',
  'Sparzana',
  'Refex Mobility'
];

// ---------------- BUILD DATA ----------------

const CONTACT_SAMPLES = [];

WEBSITES.forEach((websiteName, wi) => {
  const count = 4 + Math.floor(Math.random() * 4); // 4 to 7

  for (let i = 0; i < count; i++) {
    const name = generateName();

    CONTACT_SAMPLES.push({
      websiteName,
      name,
      email: generateEmail(name, websiteName, wi * 100 + i),
      phone: generatePhone(),
      company: randomItem(COMPANIES),
      message: `[${websiteName}] ${randomItem(MESSAGES)}`,
      recaptchaToken: 'test',
      'User-Agent': randomItem(USER_AGENTS),
    });
  }
});

// ---------------- MAIN ----------------

async function main() {
  console.log('Target:', BASE);
  console.log(`Total Websites: ${WEBSITES.length}`);
  console.log(`Total Records: ${CONTACT_SAMPLES.length}\n`);

  for (let i = 0; i < CONTACT_SAMPLES.length; i++) {
    if (i > 0) {
      await sleep(2000);
    }

    const sample = CONTACT_SAMPLES[i];
    const { 'User-Agent': ua, websiteName, ...rest } = sample;

    const payload = { ...rest, websiteName };
    const headers = ua ? { 'User-Agent': ua } : {};

    console.log(`[${i + 1}] ${websiteName} → ${payload.name}`);

    try {
      const res = await postJson('/api/contact-form', payload, headers);
      console.log('Response:', res.status, res.data?.message || res.data);
    } catch (e) {
      console.error('Error:', errMsg(e));
    }
  }

  console.log('\n✅ Done. Check Kissflow.');
}

main();