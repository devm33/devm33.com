// Minimal static file server for the built `public/` directory.
//
// Serving over real HTTP (rather than file://) is required so that the
// fingerprinted, root-relative asset URLs (/style.<hash>.css, /fonts/…) resolve
// exactly as they will in production. Shared by the resume PDF and screenshot
// build steps.
import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf",
};

function resolvePath(publicDir, urlPath) {
  const root = path.resolve(publicDir);
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  // Normalize the request path in isolation and drop any leading traversal so
  // it can only ever resolve to a location inside `root`.
  const safeSuffix = path.normalize(decoded).replace(/^(\.\.(?:[/\\]|$))+/, "");
  let fsPath = path.resolve(root, `.${path.sep}${safeSuffix}`);
  // Belt-and-suspenders: reject anything that still escapes the root.
  const rel = path.relative(root, fsPath);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  if (existsSync(fsPath) && statSync(fsPath).isDirectory()) {
    fsPath = path.join(fsPath, "index.html");
  }
  return existsSync(fsPath) ? fsPath : null;
}

/** Start a localhost server for `publicDir`; resolves to `{ server, port }`. */
export function startServer(publicDir) {
  const server = http.createServer((req, res) => {
    const fsPath = resolvePath(publicDir, req.url);
    if (!fsPath) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    res.setHeader(
      "Content-Type",
      MIME[path.extname(fsPath)] || "application/octet-stream",
    );
    createReadStream(fsPath).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () =>
      resolve({ server, port: server.address().port }),
    );
  });
}
