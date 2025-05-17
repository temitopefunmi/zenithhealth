const http = require('http');
const path = require('path');
const fs = require('fs');
const { createServerHandler } = require('next/dist/server/lib/render-server-standalone');

const dir = path.join(__dirname);

process.env.NODE_ENV = 'production';
process.chdir(__dirname);

// Graceful termination
if (!process.env.NEXT_MANUAL_SIG_HANDLE) {
  process.on('SIGTERM', () => process.exit(0));
  process.on('SIGINT', () => process.exit(0));
}

const currentPort = parseInt(process.env.PORT, 10) || 3000;
const hostname = process.env.HOSTNAME || 'localhost';
const keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10);
const isValidKeepAliveTimeout =
  !Number.isNaN(keepAliveTimeout) &&
  Number.isFinite(keepAliveTimeout) &&
  keepAliveTimeout >= 0;

const nextConfig = { /* existing config stays unchanged */ };
process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig);

// Helper to serve static files
function serveStaticFile(req, res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
    } else {
      // Simple content-type check
      const ext = path.extname(filePath);
      if (ext === '.js') res.setHeader('Content-Type', 'application/javascript');
      if (ext === '.css') res.setHeader('Content-Type', 'text/css');
      if (ext === '.json') res.setHeader('Content-Type', 'application/json');
      if (ext === '.png') res.setHeader('Content-Type', 'image/png');
      if (ext === '.ico') res.setHeader('Content-Type', 'image/x-icon');
      res.statusCode = 200;
      res.end(data);
    }
  });
}

createServerHandler({
  port: currentPort,
  hostname,
  dir,
  conf: nextConfig,
  keepAliveTimeout: isValidKeepAliveTimeout ? keepAliveTimeout : undefined,
}).then((nextHandler) => {
  const server = http.createServer(async (req, res) => {
    const { url } = req;

    // Serve _next/static files
    if (url.startsWith('/_next/static')) {
      const staticPath = path.join(__dirname, '.next', 'static', url.replace('/_next/static', ''));
      return serveStaticFile(req, res, staticPath);
    }

    // Serve static/ folder (e.g., /static/image.png)
    if (url.startsWith('/static/')) {
      const staticAssetPath = path.join(__dirname, 'static', url.replace('/static/', ''));
      return serveStaticFile(req, res, staticAssetPath);
    }

    // Delegate everything else to Next
    try {
      await nextHandler(req, res);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  if (isValidKeepAliveTimeout) {
    server.keepAliveTimeout = keepAliveTimeout;
  }

  server.listen(currentPort, (err) => {
    if (err) {
      console.error('Failed to start server', err);
      process.exit(1);
    }

    console.log(
      'Listening on port',
      currentPort,
      'url: http://' + hostname + ':' + currentPort
    );
  });

}).catch(err => {
  console.error(err);
  process.exit(1);
});