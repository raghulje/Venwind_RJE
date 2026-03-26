/**
 * Builds dashboard-ready metadata from the request (no external APIs).
 * Used for Kissflow webhook payload.
 */

/** Kissflow Phone_Number field allows only digits; strip everything else */
function phoneToDigitsOnly(phone) {
  if (phone == null || phone === '') return '';
  return String(phone).replace(/\D/g, '');
}

function parseUserAgent(ua) {
  if (!ua || typeof ua !== 'string') return { deviceType: 'unknown', browser: 'unknown' };

  const u = ua.toLowerCase();

  // Device type
  let deviceType = 'desktop';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(u)) {
    deviceType = /ipad|tablet|playbook|silk/i.test(u) ? 'tablet' : 'mobile';
  } else if (/ipad|tablet|playbook|silk/i.test(u)) {
    deviceType = 'tablet';
  }

  // Browser name (simple detection)
  let browser = 'unknown';
  if (u.includes('edg/')) browser = 'Edge';
  else if (u.includes('chrome/') && !u.includes('edg')) browser = 'Chrome';
  else if (u.includes('firefox/') || u.includes('fxios')) browser = 'Firefox';
  else if (u.includes('safari/') && !u.includes('chrome')) browser = 'Safari';
  else if (u.includes('opr/') || u.includes('opera')) browser = 'Opera';
  else if (u.includes('msie') || u.includes('trident/')) browser = 'Internet Explorer';

  return { deviceType, browser };
}

/**
 * @param {object} req - Express request
 * @returns {object} Dashboard-ready metadata
 */
function getRequestMeta(req) {
  const now = new Date();
  const ipAddress =
    req.ip ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'Unknown';

  const userAgent = req.get('user-agent') || req.headers['user-agent'] || '';
  const { deviceType, browser } = parseUserAgent(userAgent);

  // Country from proxy/CDN headers when available (e.g. Cloudflare CF-IPCountry, Vercel)
  const countryCode =
    req.get('cf-ipcountry') ||
    req.get('x-vercel-ip-country') ||
    req.get('x-country-code') ||
    null;

  return {
    timestamp: now.toISOString(),
    dateTime: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' }),
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 8),
    ipAddress,
    userAgent: userAgent.slice(0, 500),
    deviceType,
    browser,
    countryCode: countryCode && countryCode !== 'XX' ? countryCode : null,
    referer: req.get('referer') || req.get('referrer') || null,
    source: req.get('referer') ? 'referral' : 'direct',
  };
}

module.exports = { getRequestMeta, parseUserAgent, phoneToDigitsOnly };
