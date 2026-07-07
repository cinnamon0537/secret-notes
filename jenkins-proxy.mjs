import http from 'node:http';
import { spawn } from 'node:child_process';

const PORT = 18080;
const UPSTREAM = 'http://127.0.0.1:8080';

function proxyRequest(req, res) {
  const target = new URL(req.url, UPSTREAM).toString();
  const child = spawn('wsl.exe', ['curl', '-sS', '-L', '-i', '--max-time', '30', target], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const chunks = [];
  const errChunks = [];

  child.stdout.on('data', (chunk) => chunks.push(chunk));
  child.stderr.on('data', (chunk) => errChunks.push(chunk));

  child.on('close', (code) => {
    if (code !== 0 || chunks.length === 0) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Proxy error for ${target}\n${Buffer.concat(errChunks).toString('utf8')}`);
      return;
    }

    const buffer = Buffer.concat(chunks);
    const marker = Buffer.from('\r\n\r\n');
    const headerEnd = buffer.indexOf(marker);

    if (headerEnd === -1) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Invalid upstream response');
      return;
    }

    const headerText = buffer.slice(0, headerEnd).toString('latin1');
    const body = buffer.slice(headerEnd + 4);
    const lines = headerText.split('\r\n');
    const statusLine = lines.shift() || 'HTTP/1.1 200 OK';
    const statusCode = Number(statusLine.split(' ')[1]) || 200;

    const headers = {};
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (key.toLowerCase() === 'transfer-encoding') continue;
      if (key.toLowerCase() === 'content-length') continue;
      headers[key] = value;
    }

    res.writeHead(statusCode, headers);
    res.end(body);
  });
}

http.createServer(proxyRequest).listen(PORT, '127.0.0.1', () => {
  console.log(`Jenkins proxy listening on http://127.0.0.1:${PORT}`);
});
