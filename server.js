const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8190;
const DATA_DIR = path.join(__dirname, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Ensure data directory exists for lead persistence
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

// In-memory rate limiting map: ip -> Array of timestamps
const rateLimits = new Map();
const MAX_REQUESTS_PER_WINDOW = 12;
const WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = rateLimits.get(ip) || [];
  const validTimestamps = timestamps.filter(t => now - t < WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimits.set(ip, validTimestamps);
    return true;
  }
  validTimestamps.push(now);
  rateLimits.set(ip, validTimestamps);
  return false;
}

/**
 * Dispatch lead notification via external Webhook if configured.
 * @param {object} lead - Validated lead object
 */
function dispatchWebhookNotification(lead) {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const parsedUrl = new URL(webhookUrl);
    const isDiscord = webhookUrl.includes('discord.com');
    const isSlack = webhookUrl.includes('slack.com');

    let bodyPayload = {};
    if (isDiscord) {
      bodyPayload = {
        username: 'bit3labs Systems Intake',
        embeds: [{
          title: `New Architecture Inquiry: ${lead.fullName} (${lead.company || 'Independent'})`,
          color: 0x3b82f6,
          fields: [
            { name: 'Ref ID', value: lead.refId, inline: true },
            { name: 'Work Email', value: lead.workEmail, inline: true },
            { name: 'Scope', value: lead.projectScope || 'Custom Architecture', inline: true },
            { name: 'Consultation Slot', value: lead.selectedDate ? `${lead.selectedDate} at ${lead.selectedTime} (${lead.selectedTimezone})` : 'Async Review Requested', inline: false },
            { name: 'Technical Specs', value: (lead.projectSpecs || 'None provided').substring(0, 1000), inline: false },
            { name: 'Referenced Benchmark', value: lead.referencedProject || 'N/A', inline: true }
          ],
          timestamp: lead.createdAt
        }]
      };
    } else if (isSlack) {
      bodyPayload = {
        text: `*New Architecture Consultation Inquiry [${lead.refId}]*\n*Client:* ${lead.fullName} (${lead.workEmail})\n*Company:* ${lead.company || 'Independent'}\n*Scope:* ${lead.projectScope}\n*Slot:* ${lead.selectedDate || 'Async'} ${lead.selectedTime || ''}\n*Specs:* ${lead.projectSpecs}`
      };
    } else {
      bodyPayload = lead;
    }

    const postData = JSON.stringify(bodyPayload);
    const req = (parsedUrl.protocol === 'https:' ? https : http).request(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    });
    req.on('error', (err) => console.error('[Webhook] Dispatch error:', err.message));
    req.write(postData);
    req.end();
  } catch (err) {
    console.error('[Webhook] Failed to dispatch webhook:', err.message);
  }
}

/**
 * Dispatch confirmation email via Resend if RESEND_API_KEY is configured.
 * @param {object} lead - Validated lead object
 */
function dispatchResendEmail(lead) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const alertEmail = process.env.CONTACT_ALERT_EMAIL || 'hello@bit3labs.com';
  const postData = JSON.stringify({
    from: 'bit3labs Architect <notifications@bit3labs.com>',
    to: [lead.workEmail, alertEmail],
    subject: `Architecture Consultation Confirmed: ${lead.fullName} [${lead.refId}]`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
        <h2 style="color: #2563eb; margin-bottom: 8px;">bit3labs Architecture Consultation</h2>
        <p>Hello ${lead.fullName},</p>
        <p>Your technical consultation inquiry has been locked with our Principal Distributed Systems Architect.</p>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Reference ID:</strong> ${lead.refId}</p>
          <p style="margin: 4px 0;"><strong>Scope:</strong> ${lead.projectScope || 'Custom Architecture'}</p>
          <p style="margin: 4px 0;"><strong>Scheduled Slot:</strong> ${lead.selectedDate ? `${lead.selectedDate} at ${lead.selectedTime} (${lead.selectedTimezone})` : 'Async Review'}</p>
          <p style="margin: 4px 0;"><strong>Meeting Format:</strong> Google Meet (Pre-NDA attached)</p>
        </div>
        <p>We look forward to reviewing your engineering requirements.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;"/>
        <p style="font-size: 12px; color: #64748b;">bit3labs • Systems Engineering Studio • San Francisco, CA</p>
      </div>
    `
  });

  const req = https.request('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  });
  req.on('error', (err) => console.error('[Resend] Dispatch error:', err.message));
  req.write(postData);
  req.end();
}

const server = http.createServer((req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  let reqPath = req.url.split('?')[0];

  try {
    reqPath = decodeURIComponent(reqPath);
  } catch (err) {
    res.writeHead(400, { 
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff' 
    });
    return res.end('Bad Request');
  }

  // ==================== API ROUTING ====================

  // Healthcheck endpoint
  if (reqPath === '/api/health' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    });
    return res.end(JSON.stringify({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      studio: 'bit3labs'
    }));
  }

  // Contact / Lead intake API
  if (reqPath === '/api/contact' && req.method === 'POST') {
    if (isRateLimited(clientIp)) {
      res.writeHead(429, {
        'Content-Type': 'application/json',
        'Retry-After': '60'
      });
      return res.end(JSON.stringify({ 
        success: false, 
        error: 'Too many consultation requests. Please wait a moment before submitting again.' 
      }));
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50000) { // 50KB limit to prevent abuse
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Payload too large.' }));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');

        // Field Normalization & Validation
        const fullName = String(data.fullName || data.name || '').trim();
        const workEmail = String(data.workEmail || data.email || '').trim().toLowerCase();
        const company = String(data.company || '').trim();
        const projectScope = String(data.projectScope || data.scope || '').trim();
        const projectSpecs = String(data.projectSpecs || data.specs || data.projectDetails || '').trim();
        const selectedDate = String(data.selectedDate || '').trim();
        const selectedTime = String(data.selectedTime || '').trim();
        const selectedTimezone = String(data.selectedTimezone || '').trim();
        const isAsyncReview = Boolean(data.isAsyncReview);
        const referencedProject = String(data.referencedProject || '').trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!fullName || fullName.length < 2) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Full name is required (min 2 characters).' }));
        }
        if (!workEmail || !emailRegex.test(workEmail)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'A valid work email address is required.' }));
        }

        // Generate Lead Reference ID
        const refId = 'REF-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const leadRecord = {
          refId,
          fullName,
          workEmail,
          company,
          projectScope,
          projectSpecs,
          selectedDate,
          selectedTime,
          selectedTimezone,
          isAsyncReview,
          referencedProject,
          ip: clientIp,
          createdAt: new Date().toISOString()
        };

        // Persist to leads.json
        try {
          let leads = [];
          if (fs.existsSync(LEADS_FILE)) {
            leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8') || '[]');
          }
          leads.push(leadRecord);
          fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
          console.log(`[Lead Intake] Successfully logged consultation lead: ${refId} (${fullName} <${workEmail}>)`);
        } catch (storageErr) {
          console.error('[Lead Intake] File storage error:', storageErr.message);
        }

        // Dispatch background Webhooks / Email alerts
        dispatchWebhookNotification(leadRecord);
        dispatchResendEmail(leadRecord);

        // Respond with success confirmation and reference ticket
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        });
        return res.end(JSON.stringify({
          success: true,
          refId,
          message: 'Architecture consultation recorded successfully. A confirmation invitation has been prepared.',
          lead: {
            refId,
            fullName,
            workEmail,
            selectedDate,
            selectedTime,
            selectedTimezone
          }
        }));

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Invalid JSON request format.' }));
      }
    });

    return;
  }

  // ==================== STATIC FILE ROUTING ====================

  if (reqPath === '/' || !reqPath) reqPath = '/index.html';

  // Prevent directory traversal attacks (GDPR Art. 32 security standard)
  const safePath = path.resolve(__dirname, '.' + path.normalize('/' + reqPath));
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403, { 
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff'
    });
    return res.end('Access Denied');
  }

  if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
    const ext = path.extname(safePath).toLowerCase();
    const headers = {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), camera=(), microphone=()'
    };

    // Special header for Service Worker scope
    if (reqPath === '/sw.js') {
      headers['Service-Worker-Allowed'] = '/';
      headers['Cache-Control'] = 'no-cache';
    }

    res.writeHead(200, headers);
    fs.createReadStream(safePath).pipe(res);
  } else {
    res.writeHead(404, { 
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end('Not Found: ' + reqPath);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`bit3labs systems server running at http://127.0.0.1:${PORT}`);
});
