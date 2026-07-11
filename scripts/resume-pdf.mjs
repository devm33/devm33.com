// Render the built /resume/ page to static/devraj_mehta_resume.pdf.
//
// The PDF is checked into the repo (under static/, so the SSG copies it to the
// site root) and regenerated in CI, not on Netlify. The site is served over a
// temporary localhost HTTP server so the fingerprinted, root-relative asset
// URLs resolve exactly as in production. Fonts are inlined as base64 so the PDF
// is self-contained, the light theme is forced, and we await document.fonts.ready
// before printing.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { startServer } from "./serve-public.mjs";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicDir = path.join(root, "public");
const outPath = path.join(root, "static", "devraj_mehta_resume.pdf");

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
  const { server, port } = await startServer(publicDir);
  const browser = await chromium.launch({
    args: ["--font-render-hinting=none"],
  });
  try {
    const page = await browser.newPage({ colorScheme: "light" });
    await page.goto(`http://127.0.0.1:${port}/resume/`, {
      waitUntil: "networkidle",
    });
    await page.addStyleTag({ content: await inlineFontFiles() });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: outPath, printBackground: true });
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error("resume PDF generation failed:", err);
  process.exit(1);
});
