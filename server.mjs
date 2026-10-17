import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = import.meta.dirname;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
const port = Number(process.env.PORT || 3000);
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + '/') || pathname.includes('/.')) { res.writeHead(403).end(); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch { if (!res.headersSent) res.writeHead(404); res.end('Not found'); }
}).listen(port, '0.0.0.0', () => console.log(`Hamster Workshop listening on port ${port}`));
