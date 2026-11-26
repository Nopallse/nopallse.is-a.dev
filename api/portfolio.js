const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const portfolioTables = ['projects', 'experience', 'certificates', 'skills', 'education', 'contact_info'];

const readEnvironment = () => {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return {};

  return fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((environment, line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || line.trim().startsWith('#')) return environment;
    environment[match[1]] = match[2].replace(/^(["'])(.*)\1$/, '$2');
    return environment;
  }, {});
};

const sendJson = (response, statusCode, body, headOnly = false) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(headOnly ? undefined : JSON.stringify(body));
};

const getPortfolio = async () => {
  const environment = { ...readEnvironment(), ...process.env };
  const supabaseUrl = environment.VITE_SUPABASE_URL;
  const supabaseKey = environment.SUPABASE_PUBLISHABLE_KEY;

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

const handler = async (request, response) => {
  const method = request.method || 'GET';
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
};

module.exports = handler;
module.exports.getPortfolio = getPortfolio;
module.exports.sendJson = sendJson;
