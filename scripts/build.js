#!/usr/bin/env node
/**
 * Simple static site build script using marked for markdown compilation.
 * Replaces Gatsby with minimal dependencies.
 */

import fs from "fs";
import path from "path";
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

const SRC_DIR = path.resolve("src");
const STATIC_DIR = path.resolve("static");
const OUTPUT_DIR = path.resolve("public");
const PROJECTS_DIR = path.join(SRC_DIR, "projects");

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
    .replace(/"/g, "&quot;");
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
  let processed = markdown.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
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

// Copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy file
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

// Read all project markdown files
function getProjects() {
  const projects = [];
  const projectDirs = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
  for (const dir of projectDirs) {
    if (!dir.isDirectory()) continue;
    const mdPath = path.join(PROJECTS_DIR, dir.name, "index.md");
    if (!fs.existsSync(mdPath)) continue;
    const { frontmatter, html } = compileMarkdown(mdPath);
    const slug = dir.name;
    const projectPath = `/projects/${slug}/`;
    
    // Copy project images and assets
    const projectDir = path.join(PROJECTS_DIR, dir.name);
    const projectOutDir = path.join(OUTPUT_DIR, "projects", dir.name);
    const assets = fs.readdirSync(projectDir).filter((f) => f !== "index.md");
    if (assets.length > 0) {
      if (!fs.existsSync(projectOutDir)) {
        fs.mkdirSync(projectOutDir, { recursive: true });
      }
      for (const asset of assets) {
        fs.copyFileSync(
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

// Icon SVG definitions
const iconsSvg = `<svg style="display: none">
  <symbol class="stroked" id="icon3" viewBox="0 0 24 24">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </symbol>
  <symbol id="icon0" viewBox="0 0 24 24">
    <path class="path" d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-.89 0-1.74-.2-2.5-.55C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.45C10.26 6.2 11.11 6 12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6z"></path>
  </symbol>
  <symbol id="icon1" viewBox="0 0 384 512">
    <path class="path" d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48zm250.2-143.7c-12.2-12-47-8.7-64.4-6.5-17.2-10.5-28.7-25-36.8-46.3 3.9-16.1 10.1-40.6 5.4-56-4.2-26.2-37.8-23.6-42.6-5.9-4.4 16.1-.4 38.5 7 67.1-10 23.9-24.9 56-35.4 74.4-20 10.3-47 26.2-51 46.2-3.3 15.8 26 55.2 76.1-31.2 22.4-7.4 46.8-16.5 68.4-20.1 18.9 10.2 41 17 55.8 17 25.5 0 28-28.2 17.5-38.7zm-198.1 77.8c5.1-13.7 24.5-29.5 30.4-35-19 30.3-30.4 35.7-30.4 35zm81.6-190.6c7.4 0 6.7 32.1 1.8 40.8-4.4-13.9-4.3-40.8-1.8-40.8zm-24.4 136.6c9.7-16.9 18-37 24.7-54.7 8.3 15.1 18.9 27.2 30.1 35.5-20.8 4.3-38.9 13.1-54.8 19.2zm131.6-5s-5 6-37.3-7.8c35.1-2.6 40.9 5.4 37.3 7.8z"></path>
  </symbol>
  <symbol id="icon2" viewBox="0 0 496 512">
    <path class="path" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
  </symbol>
  <symbol id="icon4" viewBox="0 0 448 512">
    <path class="path" d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path>
  </symbol>
</svg>`;

// Base HTML template
function baseTemplate({
  title,
  description,
  content,
  bodyClass = "",
  additionalHead = "",
  additionalCss = "",
  canonicalPath = "",
}) {
  const pageTitle = title ? `${title}` : siteMetadata.title;
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
  const tagsHtml = (project.tags || [])
    .map((tag) => `<a class="pill" href="/tag/${tag}/">${escapeHtml(tag)}</a>`)
    .join(" ");
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
          <div class="pill-group">${tagsHtml}</div>
        </div>
        <div class="tagline">${escapeHtml(project.tagline)}</div>
      </header>
    </div>
  `;
}

// Project header component (for project page)
function projectHeader(project) {
  const tagsHtml = (project.tags || [])
    .map((tag) => `<a class="pill" href="/tag/${tag}/">${escapeHtml(tag)}</a>`)
    .join(" ");
  return `
    <header>
      <h1>
        ${escapeHtml(project.title)}
        ${project.repo ? `<a href="${project.repo}" class="icon-link"><svg class="icon-svg"><use href="#icon2"></use></svg></a>` : ""}
        ${project.link ? `<a href="${project.link}" class="icon-link"><svg class="icon-svg"><use href="#icon3"></use></svg></a>` : ""}
      </h1>
      <div class="subtitle">
        <i>Updated ${project.updated}</i>
        <div class="pill-group">${tagsHtml}</div>
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

// Generate tag pages
function generateTagPages(projects) {
  const tags = new Map();
  for (const project of projects) {
    for (const tag of project.tags || []) {
      if (!tags.has(tag)) {
        tags.set(tag, []);
      }
      tags.get(tag).push(project);
    }
  }
  for (const [tag, tagProjects] of tags) {
    const projectsHtml = tagProjects.map(projectCard).join("\n");
    const html = baseTemplate({
      title: `Projects tagged ${tag}`,
      canonicalPath: `/tag/${tag}/`,
      content: `
        <div class="tag-title">
          <h3 class="tag-header">
            Projects tagged <span class="pill title-pill">${escapeHtml(tag)}</span>
          </h3>
          <a href="/projects">View all</a>
        </div>
        ${projectsHtml}
      `,
    });
    const outDir = path.join(OUTPUT_DIR, "tag", tag);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(path.join(outDir, "index.html"), html);
  }
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

// Generate redirects file for Netlify
function generateRedirects() {
  const redirects = [
    "/2015-06-07 /projects/4clojure/ 301",
    "/2014-12-04 /projects/motivation/ 301",
    "/2014-09-22 /projects/jekyll-nfs/ 301",
    "/sitemap.xml /sitemap-index.xml 301",
    "/about / 301",
    "/resume.pdf /devraj_mehta_resume.pdf 301",
    "/3d https://makerworld.com/@devm33 301",
  ];
  fs.writeFileSync(path.join(OUTPUT_DIR, "_redirects"), redirects.join("\n"));
}

// Generate sitemap
function generateSitemap(projects) {
  const urls = [
    { loc: "/", priority: "1.0" },
    { loc: "/projects/", priority: "0.8" },
    { loc: "/resume/", priority: "0.8" },
  ];
  for (const project of projects) {
    urls.push({ loc: project.path, priority: "0.6" });
  }
  // Get unique tags
  const tags = new Set();
  for (const project of projects) {
    for (const tag of project.tags || []) {
      tags.add(tag);
    }
  }
  for (const tag of tags) {
    urls.push({ loc: `/tag/${tag}/`, priority: "0.5" });
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${siteMetadata.siteUrl}${u.loc}</loc>
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
  copyFile(
    path.join(SRC_DIR, "global.css"),
    path.join(OUTPUT_DIR, "global.css")
  );
  // Copy fonts.css
  copyFile(path.join(SRC_DIR, "fonts.css"), path.join(OUTPUT_DIR, "fonts.css"));
  // Copy prism.css
  copyFile(path.join(SRC_DIR, "prism.css"), path.join(OUTPUT_DIR, "prism.css"));
  // Copy icons.css (shared icon and component styles)
  copyFile(path.join(SRC_DIR, "icons.css"), path.join(OUTPUT_DIR, "icons.css"));
  // Copy index.css (homepage styles)
  copyFile(path.join(SRC_DIR, "index.css"), path.join(OUTPUT_DIR, "index.css"));
  // Copy resume.css (resume page styles)
  copyFile(
    path.join(SRC_DIR, "resume.css"),
    path.join(OUTPUT_DIR, "resume.css")
  );
}

// Main build function
async function build() {
  console.log("Building site...");

  // Clean output directory
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Copy static files
  console.log("Copying static files...");
  copyDir(STATIC_DIR, OUTPUT_DIR);

  // Copy CSS files
  console.log("Copying CSS files...");
  copyCssFiles();

  // Copy me.jpg image to output
  copyFile(
    path.join(SRC_DIR, "images", "me.jpg"),
    path.join(OUTPUT_DIR, "me.jpg")
  );

  // Get projects
  console.log("Processing markdown files...");
  const projects = getProjects();
  console.log(`Found ${projects.length} projects`);

  // Generate pages
  console.log("Generating pages...");
  generateProjectPages(projects);
  generateIndexPage(projects);
  generateProjectsPage(projects);
  generateTagPages(projects);
  generateResumePage();
  generate404Page();
  generateRedirects();
  generateSitemap(projects);

  console.log("Build complete!");
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
