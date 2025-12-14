#!/usr/bin/env node
/**
 * Simple static site build script using marked for markdown compilation.
 * Replaces Gatsby with minimal dependencies.
 */

import fs from "fs";
import path from "path";
import url from "url";
import { marked } from "marked";
import Prism from "prismjs";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-yaml.js";
import "prismjs/components/prism-clojure.js";
import katex from "katex";
import yaml from "js-yaml";
import sharp from "sharp";
import puppeteer from "puppeteer";

const SRC_DIR = path.resolve("src");
const STATIC_DIR = path.resolve("static");
const OUTPUT_DIR = path.resolve("public");
const PROJECTS_DIR = path.join(SRC_DIR, "projects");
const MAX_IMAGE_WIDTH = 700; // Max body width from global.css

// Site metadata
const siteMetadata = {
  title: "Devraj Mehta",
  description: "Devraj Mehta's website.",
  siteUrl: "https://devm33.com",
  email: "dev@devm.dev",
  github: "https://github.com/devm33",
  linkedin: "https://www.linkedin.com/in/devrajmehta/",
};

// Parse frontmatter from markdown content
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  if (!match) {
    return { data: {}, content };
  }
  const data = yaml.load(match[1]);
  return { data, content: match[2] };
}

// HTML template helpers
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Configure marked with Prism syntax highlighting
const highlightExtension = {
  name: "highlight",
  renderer: {
    code(token) {
      const lang = token.lang;
      const code = token.text;
      if (lang && Prism.languages[lang]) {
        const highlighted = Prism.highlight(code, Prism.languages[lang], lang);
        return `<pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>\n`;
      }
      return `<pre><code>${escapeHtml(code)}</code></pre>\n`;
    },
  },
};

marked.use(highlightExtension);

// Process KaTeX math in markdown before parsing
function processKatex(markdown) {
  // First, extract code blocks to avoid processing math in them
  const codeBlocks = [];
  let processed = markdown.replace(/(```[\s\S]*?```|`[^`]+`)/g, (match) => {
    codeBlocks.push(match);
    return `\x00CODE${codeBlocks.length - 1}\x00`;
  });

  // Handle display math ($$...$$ on its own lines)
  processed = processed.replace(/^\$\$\n([\s\S]+?)\n\$\$$/gm, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true });
    } catch (e) {
      console.error("KaTeX error:", e.message);
      return `<code>${escapeHtml(math)}</code>`;
    }
  });

  // Handle inline math ($$...$$ within text - not on separate lines)
  processed = processed.replace(/\$\$([^\$\n]+)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false });
    } catch (e) {
      console.error("KaTeX error:", e.message);
      return `<code>${escapeHtml(math)}</code>`;
    }
  });

  // Restore code blocks
  processed = processed.replace(/\x00CODE(\d+)\x00/g, (_, idx) => codeBlocks[parseInt(idx, 10)]);

  return processed;
}

// Read and compile markdown file
function compileMarkdown(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const { data, content: rawMarkdown } = parseFrontmatter(content);
  // Process KaTeX before marked parsing
  const markdown = processKatex(rawMarkdown);
  const html = marked.parse(markdown);
  return { frontmatter: data, html };
}

// Resize image if needed (for images wider than MAX_IMAGE_WIDTH)
async function resizeImageIfNeeded(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const ext = path.extname(src).toLowerCase();
  // Only resize image files, copy others as-is
  if (![".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
    fs.copyFileSync(src, dest);
    return;
  }

  try {
    const image = sharp(src);
    const metadata = await image.metadata();

    // Only resize if wider than max width
    if (metadata.width && metadata.width > MAX_IMAGE_WIDTH) {
      await image.resize(MAX_IMAGE_WIDTH).toFile(dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  } catch (err) {
    // If sharp fails (e.g., for animated GIFs), just copy the file
    console.warn(`Warning: Could not process ${src}, copying as-is:`, err.message);
    fs.copyFileSync(src, dest);
  }
}

// Read all project markdown files
async function getProjects() {
  const projects = [];
  const projectDirs = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
  for (const dir of projectDirs) {
    if (!dir.isDirectory()) continue;
    const mdPath = path.join(PROJECTS_DIR, dir.name, "index.md");
    if (!fs.existsSync(mdPath)) continue;
    const { frontmatter, html } = compileMarkdown(mdPath);
    const slug = dir.name;
    const projectPath = `/projects/${slug}/`;
    
    // Copy and resize project images and assets
    const projectDir = path.join(PROJECTS_DIR, dir.name);
    const projectOutDir = path.join(OUTPUT_DIR, "projects", dir.name);
    const assets = fs.readdirSync(projectDir).filter((f) => f !== "index.md");
    if (assets.length > 0) {
      if (!fs.existsSync(projectOutDir)) {
        fs.mkdirSync(projectOutDir, { recursive: true });
      }
      for (const asset of assets) {
        await resizeImageIfNeeded(
          path.join(projectDir, asset),
          path.join(projectOutDir, asset)
        );
      }
    }

    projects.push({
      slug,
      path: projectPath,
      html,
      ...frontmatter,
    });
  }
  // Sort by updated date descending
  projects.sort((a, b) => new Date(b.updated) - new Date(a.updated));
  return projects;
}

// Read jobs from YAML
function getJobs() {
  const jobsPath = path.join(SRC_DIR, "pages", "resume", "jobs.yml");
  const content = fs.readFileSync(jobsPath, "utf-8");
  const jobs = yaml.load(content);
  return jobs.filter((j) => j.enabled);
}

// Read skills from YAML
function getSkills() {
  const skillsPath = path.join(SRC_DIR, "pages", "resume", "skills.yml");
  const content = fs.readFileSync(skillsPath, "utf-8");
  return yaml.load(content);
}

// Load icon SVG definitions from file
const iconsSvg = fs.readFileSync(path.join(SRC_DIR, "icons.svg"), "utf-8");

// Base HTML template
function baseTemplate({
  title,
  description,
  content,
  bodyClass = "",
  additionalHead = "",
  additionalCss = "",
  canonicalPath = "",
  isResume = false,
}) {
  const pageTitle = title || siteMetadata.title;
  const pageDesc = description || siteMetadata.description;
  const canonicalUrl = canonicalPath
    ? `${siteMetadata.siteUrl}${canonicalPath}`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(pageDesc)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:site" content="@devm33">
  <meta name="fb:app_id" content="477033866176272">
  <meta name="og:type" content="article">
  <meta name="og:description" content="${escapeHtml(pageDesc)}">
  <meta name="og:title" content="${escapeHtml(pageTitle)}">
  <meta name="og:image" content="${siteMetadata.siteUrl}/me.jpg">
  ${canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}">` : ""}
  ${canonicalUrl ? `<meta name="og:url" content="${canonicalUrl}">` : ""}
  <link rel="preload" href="/fonts/mulish.woff2" as="font" crossorigin="anonymous" type="font/woff2">
  <link rel="preload" href="/fonts/mulish-ital.woff2" as="font" crossorigin="anonymous" type="font/woff2">
  <link rel="stylesheet" href="/fonts.css">
  <link rel="stylesheet" href="/global.css">
  <link rel="stylesheet" href="/icons.css">
  ${additionalCss}
  ${additionalHead}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
  ${iconsSvg}
  <nav class="navbar">
    <div class="title-group">
      <a href="/" class="title">${siteMetadata.title}</a>
      ${isResume ? `<a href="/devraj_mehta_resume.pdf" class="icon-link no-print"><svg class="icon-svg"><use href="#icon1"></use></svg></a>` : ""}
    </div>
    <div class="icon-links no-print">
      <button aria-pressed="false" class="theme-toggle icon-link" onclick="toggleTheme()">
        <div class="label label-left"><div class="inner-label"><div class="inner-inner-label">Toggle theme</div></div></div>
        <svg class="icon-svg"><use href="#icon0"></use></svg>
      </button>
      <a href="${siteMetadata.github}" class="icon-link">
        <div class="label label-left"><div class="inner-label"><div class="inner-inner-label">GitHub</div></div></div>
        <svg class="icon-svg"><use href="#icon2"></use></svg>
      </a>
      <a href="${siteMetadata.linkedin}" class="icon-link">
        <div class="label label-left"><div class="inner-label"><div class="inner-inner-label">LinkedIn</div></div></div>
        <svg class="icon-svg"><use href="#icon4"></use></svg>
      </a>
    </div>
    <div class="icon-links only-print">
      <a href="${siteMetadata.linkedin}">linkedin.com/in/devrajmehta</a>
      <a href="mailto:${siteMetadata.email}">${siteMetadata.email}</a>
    </div>
  </nav>
  <main>
    ${content}
  </main>
  <script>
    function getTheme() {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'light';
      return !window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    function setTheme(light) {
      document.documentElement.classList.toggle('light', light);
      document.documentElement.classList.toggle('dark', !light);
      const btn = document.querySelector('.theme-toggle');
      if (btn) btn.setAttribute('aria-pressed', !light);
    }
    function toggleTheme() {
      const light = !document.documentElement.classList.contains('light');
      localStorage.setItem('theme', light ? 'light' : 'dark');
      setTheme(light);
    }
    // Apply theme immediately
    (function() {
      document.documentElement.style.transition = 'none';
      setTheme(getTheme());
      document.documentElement.offsetHeight;
      document.documentElement.style.transition = '';
    })();
  </script>
</body>
</html>`;
}

// Project card component
function projectCard(project) {
  const imagePath = project.image
    ? `/projects/${project.slug}/${project.image}`
    : "";
  return `
    <div class="project">
      ${
        imagePath
          ? `<a aria-label="${escapeHtml(project.title)}" class="thumbnail" href="${project.path}">
              <img src="${imagePath}" alt="" class="thumbnail-image" loading="lazy">
            </a>`
          : ""
      }
      <header class="flex-header">
        <h1>
          <a href="${project.path}">${escapeHtml(project.title)}</a>
          ${project.repo ? `<a href="${project.repo}" class="icon-link"><svg class="icon-svg"><use href="#icon2"></use></svg></a>` : ""}
          ${project.link ? `<a href="${project.link}" class="icon-link"><svg class="icon-svg"><use href="#icon3"></use></svg></a>` : ""}
        </h1>
        <div class="subtitle">
          <i>Updated ${project.updated}</i>
        </div>
        <div class="tagline">${escapeHtml(project.tagline)}</div>
      </header>
    </div>
  `;
}

// Project header component (for project page)
function projectHeader(project) {
  return `
    <header>
      <h1>
        ${escapeHtml(project.title)}
        ${project.repo ? `<a href="${project.repo}" class="icon-link"><svg class="icon-svg"><use href="#icon2"></use></svg></a>` : ""}
        ${project.link ? `<a href="${project.link}" class="icon-link"><svg class="icon-svg"><use href="#icon3"></use></svg></a>` : ""}
      </h1>
      <div class="subtitle">
        <i>Updated ${project.updated}</i>
      </div>
      <div class="tagline">${escapeHtml(project.tagline)}</div>
    </header>
  `;
}

// Generate project pages
function generateProjectPages(projects) {
  for (const project of projects) {
    // Check for specific KaTeX class names to avoid false positives
    const hasKatex =
      project.html.includes('class="katex"') ||
      project.html.includes('class="katex-display"');
    const katexCss = hasKatex
      ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.6/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">'
      : "";
    const html = baseTemplate({
      title: project.title,
      description: project.tagline,
      canonicalPath: project.path,
      additionalCss: `<link rel="stylesheet" href="/prism.css">\n${katexCss}`,
      content: `
        <article>
          ${projectHeader(project)}
          ${project.html}
        </article>
      `,
    });
    const outDir = path.join(OUTPUT_DIR, "projects", project.slug);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(path.join(outDir, "index.html"), html);
  }
}

// Generate index page
function generateIndexPage(projects) {
  const recentProjects = projects.slice(0, 3);
  const projectsHtml = recentProjects.map(projectCard).join("\n");
  const html = baseTemplate({
    title: siteMetadata.title,
    description: siteMetadata.description,
    canonicalPath: "/",
    additionalCss: '<link rel="stylesheet" href="/index.css">',
    content: `
      <section class="hello-section">
        <div class="description">
          <p>Hello! I'm Devraj.</p>
          <p>
            You can find me on <a href="${siteMetadata.linkedin}">LinkedIn</a> or
            <a href="${siteMetadata.github}">GitHub</a>.
          </p>
          <p>
            This site contains my <a href="/resume/">resume</a> and some
            <a href="/projects/">projects</a>.
          </p>
          <p>
            Here is
            <a href="${siteMetadata.github}/devm33.com">the source for this site</a>.
          </p>
          <p>
            See also a new hobby!
            <a href="https://makerworld.com/@devm33">MakerWorld</a>
          </p>
          <p>
            Cheers! <br> Devraj
          </p>
        </div>
        <img src="/me.jpg" alt="head shot" class="photo" width="250" height="250" loading="eager">
      </section>
      <section>
        <div class="recent-title">
          <h3 class="recent-header">Recent Projects</h3>
          <a href="/projects">View all</a>
        </div>
        ${projectsHtml}
        <div>
          Showing 3 of ${projects.length} projects
          <a href="/projects">View all</a>
        </div>
      </section>
    `,
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), html);
}

// Generate projects listing page
function generateProjectsPage(projects) {
  const projectsHtml = projects.map(projectCard).join("\n");
  const html = baseTemplate({
    title: "Projects",
    description: "All projects by Devraj Mehta",
    canonicalPath: "/projects/",
    content: projectsHtml,
  });
  const outDir = path.join(OUTPUT_DIR, "projects");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(path.join(outDir, "index.html"), html);
}

// Generate resume page
function generateResumePage() {
  const jobs = getJobs();
  const skills = getSkills();
  const jobsHtml = jobs
    .map(
      (job) => `
      <div>
        <div class="title-row">
          <h3>
            <a href="${job.uri}">${escapeHtml(job.name)}</a>, ${escapeHtml(job.title)}
            <span class="location nowrap">- ${escapeHtml(job.location)}</span>
          </h3>
          <div class="date-range">
            <span class="nowrap">${job.start}</span> -
            <span class="nowrap">${job.finish}</span>
          </div>
        </div>
        <ul>
          ${job.description.map((d) => `<li>${escapeHtml(d)}</li>`).join("\n")}
        </ul>
      </div>
    `
    )
    .join("\n");
  const html = baseTemplate({
    title: "Devraj Mehta Resume",
    canonicalPath: "/resume/",
    additionalCss: '<link rel="stylesheet" href="/resume.css">',
    isResume: true,
    content: `
      <section class="resume-section">
        <h2>EXPERIENCE</h2>
        ${jobsHtml}
      </section>
      <section class="resume-section">
        <h2>EDUCATION</h2>
        <div class="title-row">
          <h3>
            <a href="https://gatech.edu">Georgia Institute of Technology</a>, BSc Computer Science
            <span class="location nowrap">- Atlanta, GA</span>
          </h3>
          <div class="date-range">
            <span class="nowrap">AUG 2010</span> -
            <span class="nowrap">MAY 2014</span>
          </div>
        </div>
        <div>Highest Honors</div>
      </section>
      <section class="resume-section">
        <h2>SKILLS</h2>
        <div>${skills.Frameworks.join(", ")}</div>
        <div>${skills.Languages.join(", ")}</div>
        <div>${skills.Platforms.join(", ")}</div>
      </section>
    `,
  });
  const outDir = path.join(OUTPUT_DIR, "resume");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(path.join(outDir, "index.html"), html);
}

// Generate 404 page
function generate404Page() {
  const html = baseTemplate({
    title: "404: Not found",
    content: `
      <article>
        <h1>Resource not found</h1>
        <p>Sorry this resource was not found.</p>
      </article>
    `,
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, "404.html"), html);
}

// Generate sitemap
function generateSitemap(projects) {
  const today = new Date().toISOString().split('T')[0];
  const urls = [
    { loc: "/", priority: "1.0", lastmod: today },
    { loc: "/projects/", priority: "0.8", lastmod: today },
    { loc: "/resume/", priority: "0.8", lastmod: today },
  ];
  for (const project of projects) {
    // Format the updated date to YYYY-MM-DD
    let lastmod = today;
    if (project.updated) {
      const date = new Date(project.updated);
      if (!isNaN(date.getTime())) {
        lastmod = date.toISOString().split('T')[0];
      }
    }
    urls.push({ 
      loc: project.path, 
      priority: "0.6",
      lastmod
    });
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${siteMetadata.siteUrl}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
  fs.writeFileSync(path.join(OUTPUT_DIR, "sitemap.xml"), xml);
}

// Copy CSS files
function copyCssFiles() {
  // Copy global.css
  fs.copyFileSync(
    path.join(SRC_DIR, "global.css"),
    path.join(OUTPUT_DIR, "global.css")
  );
  // Copy fonts.css
  fs.copyFileSync(path.join(SRC_DIR, "fonts.css"), path.join(OUTPUT_DIR, "fonts.css"));
  // Copy prism.css
  fs.copyFileSync(path.join(SRC_DIR, "prism.css"), path.join(OUTPUT_DIR, "prism.css"));
  // Copy icons.css (shared icon and component styles)
  fs.copyFileSync(path.join(SRC_DIR, "icons.css"), path.join(OUTPUT_DIR, "icons.css"));
  // Copy index.css (homepage styles)
  fs.copyFileSync(path.join(SRC_DIR, "index.css"), path.join(OUTPUT_DIR, "index.css"));
  // Copy resume.css (resume page styles)
  fs.copyFileSync(
    path.join(SRC_DIR, "resume.css"),
    path.join(OUTPUT_DIR, "resume.css")
  );
}

// Generate PDF of resume page using Puppeteer
async function generateResumePdf() {
  console.log("Generating resume PDF...");
  const args = ["--font-render-hinting=none", "--no-sandbox", "--disable-setuid-sandbox"];
  // Use system chromium if available (for environments without puppeteer download)
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
  const browser = await puppeteer.launch({ args, executablePath });
  const page = await browser.newPage();
  const resumePath = path.join(OUTPUT_DIR, "resume", "index.html");
  
  // Set base URL to allow loading local CSS files
  await page.goto(url.pathToFileURL(resumePath).toString(), { waitUntil: 'networkidle0' });
  
  // Inline all CSS files for PDF rendering
  const cssContent = await inlineCssFiles();
  await page.addStyleTag({ content: cssContent });
  await page.evaluateHandle("document.fonts.ready");
  await page.pdf({ path: path.join(OUTPUT_DIR, "devraj_mehta_resume.pdf") });
  await browser.close();
}

// Read and inline all CSS files needed for PDF
async function inlineCssFiles() {
  const fontsDir = path.join(STATIC_DIR, "fonts");
  const normal = fs.readFileSync(path.join(fontsDir, "mulish.woff2")).toString("base64");
  const italic = fs.readFileSync(path.join(fontsDir, "mulish-ital.woff2")).toString("base64");
  
  // Read CSS files
  const globalCss = fs.readFileSync(path.join(OUTPUT_DIR, "global.css"), "utf-8");
  const iconsCss = fs.readFileSync(path.join(OUTPUT_DIR, "icons.css"), "utf-8");
  const resumeCss = fs.readFileSync(path.join(OUTPUT_DIR, "resume.css"), "utf-8");
  
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
    ${globalCss}
    ${iconsCss}
    ${resumeCss}
  `;
}

// Main build function
async function build() {
  console.log("Building site...");

  // Clean output directory
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Copy static files using fs.cp
  console.log("Copying static files...");
  await fs.promises.cp(STATIC_DIR, OUTPUT_DIR, { recursive: true });

  // Copy CSS files
  console.log("Copying CSS files...");
  copyCssFiles();

  // Copy me.jpg image to output
  fs.copyFileSync(
    path.join(SRC_DIR, "images", "me.jpg"),
    path.join(OUTPUT_DIR, "me.jpg")
  );

  // Get projects
  console.log("Processing markdown files...");
  const projects = await getProjects();
  console.log(`Found ${projects.length} projects`);

  // Generate pages
  console.log("Generating pages...");
  generateProjectPages(projects);
  generateIndexPage(projects);
  generateProjectsPage(projects);
  generateResumePage();
  generate404Page();
  generateSitemap(projects);

  // Generate resume PDF
  await generateResumePdf();

  console.log("Build complete!");
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
