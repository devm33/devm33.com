// Render public/resume/ to public/devraj_mehta_resume.pdf.
//
// Serves the built site over a temporary localhost HTTP server so that the
// fingerprinted, root-relative asset URLs (/style.<hash>.css, /fonts/…) resolve
// exactly as they will in production — file:// can't. Fonts are still inlined as
// base64 so the PDF is self-contained, the light theme is forced for a
// consistent document, and we await document.fonts.ready before printing.
import { readFile } from "node:fs/promises";
import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicDir = path.join(root, "public");

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

function resolvePath(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0]);
  let fsPath = path.join(publicDir, p);
  if (!fsPath.startsWith(publicDir)) return null; // path traversal guard
  if (existsSync(fsPath) && statSync(fsPath).isDirectory()) {
    fsPath = path.join(fsPath, "index.html");
  }
  return existsSync(fsPath) ? fsPath : null;
}

function startServer() {
  const server = http.createServer((req, res) => {
    const fsPath = resolvePath(req.url);
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

async function inlineFontFiles() {
  const encoding = "base64";
  const fonts = path.join(root, "static", "fonts");
  const normal = await readFile(path.join(fonts, "mulish.woff2"), { encoding });
  const italic = await readFile(path.join(fonts, "mulish-ital.woff2"), {
    encoding,
  });
  return `
    @font-face {
      font-family: Mulish;
      font-style: normal;
      font-weight: 200 1000;
      src: url("data:font/woff2;base64,${normal}") format("woff2");
    }
    @font-face {
      font-family: Mulish;
      font-style: italic;
      font-weight: 200 1000;
      src: url("data:font/woff2;base64,${italic}") format("woff2");
    }
  `;
}

async function main() {
  const { server, port } = await startServer();
  const browser = await puppeteer.launch({
    args: ["--font-render-hinting=none"],
  });
  try {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([
      { name: "prefers-color-scheme", value: "light" },
    ]);
    await page.goto(`http://127.0.0.1:${port}/resume/`, {
      waitUntil: "networkidle0",
    });
    await page.addStyleTag({ content: await inlineFontFiles() });
    await page.evaluateHandle("document.fonts.ready");
    await page.pdf({ path: path.join(publicDir, "devraj_mehta_resume.pdf") });
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error("resume PDF generation failed:", err);
  process.exit(1);
});
