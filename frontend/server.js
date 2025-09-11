const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const ROOT = path.resolve(__dirname);

const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=UTF-8'
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
  res.end('404 Not Found');
}

function safePath(urlPath) {
  try {
    const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
    const cleaned = path.normalize(decoded).replace(/^([/\\])+/, '');
    return path.join(ROOT, cleaned);
  } catch {
    return ROOT;
  }
}

const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  let filePath = safePath(urlPath);

  // Prevent path traversal outside ROOT
  if (!filePath.startsWith(ROOT)) {
    return notFound(res);
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      // If requesting a path without extension and a matching .html exists, serve it
      if (!path.extname(filePath)) {
        const htmlCandidate = filePath + '.html';
        fs.stat(htmlCandidate, (e2, s2) => {
          if (!e2 && s2.isFile()) return sendFile(res, htmlCandidate);
          return notFound(res);
        });
        return;
      }
      return notFound(res);
    }

    if (stats.isDirectory()) {
      const indexFile = path.join(filePath, 'index.html');
      fs.stat(indexFile, (e2, s2) => {
        if (!e2 && s2.isFile()) return sendFile(res, indexFile);
        return notFound(res);
      });
    } else if (stats.isFile()) {
      sendFile(res, filePath);
    } else {
      notFound(res);
    }
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Static server running at http://localhost:${PORT}/`);
});
