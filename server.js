const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

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

const readEnvironment = () => {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return {};

  return fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((environment, line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || line.trim().startsWith('#')) return environment;
    const value = match[2].replace(/^(["'])(.*)\1$/, '$2');
    environment[match[1]] = value;
    return environment;
  }, {});
};

const environment = { ...readEnvironment(), ...process.env };
const supabaseUrl = environment.VITE_SUPABASE_URL;
const supabaseKey = environment.SUPABASE_PUBLISHABLE_KEY;
const portfolioTables = ['projects', 'experience', 'certificates', 'skills', 'education', 'contact_info'];

const sendJson = (response, statusCode, body, headOnly = false) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(headOnly ? undefined : JSON.stringify(body));
};

const getPortfolio = async () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase is not configured.');
  }

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`
  };
  const results = await Promise.all(portfolioTables.map(async (table) => {
    const endpoint = new URL(`/rest/v1/${table}?select=*&order=created_at.desc`, supabaseUrl);
    const result = await fetch(endpoint, { headers, signal: AbortSignal.timeout(6000) });
    if (!result.ok) throw new Error(`Supabase request failed for ${table}.`);
    const rows = await result.json();
    if (table === 'contact_info' && Array.isArray(rows)) {
      return [table, rows.map(({ phone, ...publicContact }) => publicContact)];
    }
    return [table, rows];
  }));

  return Object.fromEntries(results);
};

http.createServer(async (request, response) => {
  const method = request.method || 'GET';
  const rawPath = (request.url || '/').split('?')[0];
  const requested = rawPath === '/' ? '/index.html' : rawPath;

  if (requested === '/api/portfolio') {
    if (method !== 'GET' && method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }

    try {
      sendJson(response, 200, await getPortfolio(), method === 'HEAD');
    } catch (error) {
      console.error('Portfolio API:', error.message);
      sendJson(response, 502, { error: 'Portfolio data is currently unavailable.' }, method === 'HEAD');
    }
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
}).listen(port, () => {
  console.log(`Portfolio foundation running at http://localhost:${port}`);
});
