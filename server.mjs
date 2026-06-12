import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(__dirname, 'dist');
const port = Number(process.env.PORT || 8080);
const host = '0.0.0.0';

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
  ['.wav', 'audio/wav'],
  ['.mp3', 'audio/mpeg'],
  ['.wasm', 'application/wasm'],
]);

function sendText(res, status, body) {
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'content-length': Buffer.byteLength(body),
  });
  res.end(body);
}

function logRequest(req, status) {
  console.log(`${req.method} ${req.url || '/'} ${status}`);
}

function resolveAsset(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split('?')[0] || '/');
  const normalized = normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
  const candidate = join(root, normalized === '/' ? 'index.html' : normalized);
  const resolved = resolve(candidate);
  if (!resolved.startsWith(root)) return null;

  if (existsSync(resolved) && statSync(resolved).isFile()) return resolved;

  const index = join(root, 'index.html');
  if (existsSync(index)) return index;
  return null;
}

const server = createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendText(res, 404, 'Not found');
    logRequest(req, 404);
    return;
  }

  const asset = resolveAsset(req.url || '/');
  if (!asset) {
    sendText(res, 404, 'Not found');
    logRequest(req, 404);
    return;
  }

  const stat = statSync(asset);
  res.writeHead(200, {
    'content-type': contentTypes.get(extname(asset)) || 'application/octet-stream',
    'content-length': stat.size,
    'cache-control': asset.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
  });

  if (req.method === 'HEAD') {
    res.end();
    logRequest(req, 200);
    return;
  }

  createReadStream(asset).pipe(res);
  res.on('finish', () => logRequest(req, 200));
});

server.listen(port, host, () => {
  console.log(`Serving ${root} on http://${host}:${port}`);
});
