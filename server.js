'use strict';

const http = require('node:http');
const { readFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 3000);
const indexPath = path.join(__dirname, 'index.html');

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  let pathname;
  try {
    pathname = new URL(req.url || '/', 'http://localhost').pathname;
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }

  if (pathname !== '/' && pathname !== '/index.html') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  try {
    const html = await readFile(indexPath);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': html.length,
      'Cache-Control': 'no-cache'
    });
    res.end(req.method === 'HEAD' ? undefined : html);
  } catch (error) {
    console.error('Could not read index.html:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server Error');
  }
});

server.listen(port, host, () => {
  console.log(`Todo list server is running on port ${port} (${host})`);
  const addresses = Object.values(os.networkInterfaces())
    .flatMap(interfaces => interfaces || [])
    .filter(info => info.family === 'IPv4' && !info.internal)
    .map(info => info.address);
  for (const address of addresses) console.log(`http://${address}:${port}`);
});
