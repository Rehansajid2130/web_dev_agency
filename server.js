const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8190;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
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
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), camera=(), microphone=()'
    });
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
  console.log(`bit3labs server running at http://127.0.0.1:${PORT}`);
});
