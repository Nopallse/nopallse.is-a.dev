const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const portfolioHandler = require('./api/portfolio');

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8'
};

const requestHandler = async (request, response) => {
  const method = request.method || 'GET';
  const rawPath = (request.url || '/').split('?')[0];
  const requested = rawPath === '/' ? '/index.html' : rawPath;

  if (requested === '/api/portfolio') {
    await portfolioHandler(request, response);
    return;
  }

  if (method !== 'GET' && method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requested);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  const filename = path.resolve(root, `.${decodedPath}`);
  const relative = path.relative(root, filename);
  const hasHiddenSegment = relative.split(/[\\/]/).some((segment) => segment.startsWith('.'));

  if (!filename.startsWith(root + path.sep) || hasHiddenSegment) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(filename, (error, content) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': types[path.extname(filename).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(method === 'HEAD' ? undefined : content);
  });
};

if (require.main === module) {
  http.createServer(requestHandler).listen(port, () => {
    console.log(`Portfolio foundation running at http://localhost:${port}`);
  });
}

module.exports = requestHandler;
