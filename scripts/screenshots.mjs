// Capture a full-page screenshot of every built page into screenshots/.
//
// Pages are auto-discovered from public/ (every index.html plus 404.html), so
// each route is always covered. Captures are made deterministic so the checked-
// in PNGs only change when a page actually changes (avoiding git churn):
//   - fixed 800px viewport, deviceScaleFactor 1, forced light theme
//   - CSS animations/transitions disabled
//   - animated GIFs frozen to their first frame (decoded on the fly)
//   - PNGs losslessly optimized with oxipng, metadata stripped
//
// Screenshots live at the repo root (never under public/), so they are never
// copied into the site and never served. Regenerated in CI, not on Netlify.
import { spawnSync } from "node:child_process";
import { readdirSync, statSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { parseGIF, decompressFrames } from "gifuct-js";
import { PNG } from "pngjs";
import { startServer } from "./serve-public.mjs";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicDir = path.join(root, "public");
const outDir = path.join(root, "screenshots");
const VIEWPORT_WIDTH = 800;

/** Recursively collect route paths from built HTML files under `publicDir`. */
function discoverRoutes(dir = publicDir, routes = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      discoverRoutes(full, routes);
    } else if (entry === "index.html") {
      const rel = path.relative(publicDir, dir).split(path.sep).join("/");
      routes.push(rel ? `/${rel}/` : "/");
    } else if (entry === "404.html") {
      routes.push("/404");
    }
  }
  return routes;
}

/** Filesystem-safe slug for a route path. */
function slug(route) {
  if (route === "/") return "home";
  return route.replace(/^\/|\/$/g, "").replace(/[/ ]/g, "_") || "home";
}

/** Decode the first frame of a GIF buffer into a PNG buffer. */
function gifFirstFrameToPng(buffer) {
  const gif = parseGIF(buffer);
  const [frame] = decompressFrames(gif, true);
  const { width, height } = gif.lsd;
  const png = new PNG({ width, height });
  png.data.fill(0);
  const { dims, patch } = frame;
  for (let y = 0; y < dims.height; y++) {
    for (let x = 0; x < dims.width; x++) {
      const src = (y * dims.width + x) * 4;
      const dst = ((dims.top + y) * width + (dims.left + x)) * 4;
      png.data[dst] = patch[src];
      png.data[dst + 1] = patch[src + 1];
      png.data[dst + 2] = patch[src + 2];
      png.data[dst + 3] = patch[src + 3];
    }
  }
  return PNG.sync.write(png);
}

async function main() {
  const routes = discoverRoutes().sort();
  if (routes.length === 0) {
    console.error("No pages found in public/ — build the site first.");
    process.exit(1);
  }

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const { server, port } = await startServer(publicDir);
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: VIEWPORT_WIDTH, height: 600 },
      deviceScaleFactor: 1,
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    // Freeze animated GIFs to their first frame for deterministic captures.
    await page.route("**/*.gif", async (route) => {
      try {
        const response = await route.fetch();
        const body = await response.body();
        route.fulfill({
          contentType: "image/png",
          body: gifFirstFrameToPng(body),
        });
      } catch {
        route.continue();
      }
    });

    for (const r of routes) {
      const url =
        `http://127.0.0.1:${port}` +
        r.split("/").map(encodeURIComponent).join("/");
      await page.goto(url, { waitUntil: "networkidle" });
      await page.addStyleTag({
        content:
          "*,*::before,*::after{transition:none!important;animation:none!important}",
      });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: path.join(outDir, `${slug(r)}.png`),
        fullPage: true,
        animations: "disabled",
      });
      console.log(`captured ${r} -> screenshots/${slug(r)}.png`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  // Losslessly optimize and strip metadata so bytes only change with pixels.
  const oxipng = path.join(root, "node_modules", ".bin", "oxipng");
  const files = readdirSync(outDir)
    .filter((f) => f.endsWith(".png"))
    .map((f) => path.join(outDir, f));
  const res = spawnSync(
    oxipng,
    ["-o", "max", "--strip", "all", "-q", ...files],
    {
      stdio: "inherit",
    },
  );
  if (res.status !== 0) {
    console.error("oxipng optimization failed");
    process.exit(1);
  }
  console.log(`optimized ${files.length} screenshots`);
}

main().catch((err) => {
  console.error("screenshot capture failed:", err);
  process.exit(1);
});
