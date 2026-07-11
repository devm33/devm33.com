// Build-time syntax highlighting, byte-compatible with gatsby-remark-prismjs.
//
// Reads a JSON array of { lang, code } fenced code blocks on stdin and writes a
// JSON array of highlighted HTML strings on stdout. Highlighting is produced by
// PrismJS with the same normalization, language loading, escaping, and wrapper
// markup gatsby-remark-prismjs used, so the existing prism.css applies verbatim.
// The only intentional change is the wrapper class: `highlight` (renamed from
// `gatsby-highlight`).
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Prism = require("prismjs");
const prismComponents = require("prismjs/components");

const HTML_ESCAPES = {
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  '"': "&quot;",
  "'": "&#39;",
};
const escapeHTML = (code) => code.replace(/[&><"']/g, (c) => HTML_ESCAPES[c]);

function getBaseLanguageName(nameOrAlias) {
  if (prismComponents.languages[nameOrAlias]) return nameOrAlias;
  return Object.keys(prismComponents.languages).find((language) => {
    const { alias } = prismComponents.languages[language];
    if (!alias) return false;
    return Array.isArray(alias)
      ? alias.includes(nameOrAlias)
      : alias === nameOrAlias;
  });
}

function loadPrismLanguage(language) {
  const baseLanguage = getBaseLanguageName(language);
  if (!baseLanguage) throw new Error(`Prism doesn't support language '${language}'.`);
  if (Prism.languages[baseLanguage]) return;
  const data = prismComponents.languages[baseLanguage];
  if (data.option === "default") return;
  if (data.require) {
    const reqs = Array.isArray(data.require) ? data.require : [data.require];
    reqs.forEach(loadPrismLanguage);
  }
  require(`prismjs/components/prism-${baseLanguage}.js`);
}

function highlight(language, code) {
  if (!Prism.languages[language]) {
    try {
      loadPrismLanguage(language);
    } catch {
      // Unknown language (incl. unlabeled `text` fences): escape, no tokens.
      return language === "none" ? code : escapeHTML(code);
    }
  }
  return Prism.highlight(code, Prism.languages[language], language);
}

function wrap({ lang, code }) {
  const languageName = lang ? String(lang).toLowerCase() : "text";
  const className = `language-${languageName}`;
  const highlighted = highlight(languageName, code);
  return (
    `<div class="highlight" data-language="${languageName}">` +
    `<pre class="${className}"><code class="${className}">${highlighted}</code></pre>` +
    `</div>`
  );
}

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const blocks = JSON.parse(input);
    process.stdout.write(JSON.stringify(blocks.map(wrap)));
  } catch (err) {
    process.stderr.write(`prism highlight failed: ${err.message}\n`);
    process.exit(1);
  }
});
