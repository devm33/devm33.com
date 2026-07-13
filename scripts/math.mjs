// AST-based math pre-pass: reads markdown on stdin, renders every `$$...$$`
// span to MathML via Temml, and writes the transformed markdown to stdout.
//
// It parses to mdast first so that `$$` inside code spans / fenced code blocks
// is never touched (only `text` nodes are scanned). Display vs. inline mode is
// decided by whether the delimited content spans multiple lines, matching the
// site's `gatsby-remark-katex` convention where `$$...$$` is used inline too.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fromMarkdown = require("mdast-util-from-markdown");
const temml = require("temml");

function collectTextNodes(node, out) {
  if (node.type === "text" && node.position) out.push(node);
  if (node.children) for (const c of node.children) collectTextNodes(c, out);
}

function render(latex, displayMode) {
  return temml
    .renderToString(latex.trim(), { displayMode, throwOnError: true })
    .replace(/\s+$/, "");
}

function transform(source) {
  const tree = fromMarkdown(source);
  const texts = [];
  collectTextNodes(tree, texts);

  const edits = [];
  const re = /\$\$([\s\S]*?)\$\$/g;
  for (const node of texts) {
    const start = node.position.start.offset;
    const end = node.position.end.offset;
    const slice = source.slice(start, end);
    let m;
    while ((m = re.exec(slice)) !== null) {
      const content = m[1];
      const displayMode = /\n/.test(content);
      const mathml = render(content, displayMode);
      edits.push({
        start: start + m.index,
        end: start + m.index + m[0].length,
        replacement: mathml,
      });
    }
    re.lastIndex = 0;
  }

  edits.sort((a, b) => b.start - a.start);
  let out = source;
  for (const e of edits) {
    out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  }
  return out;
}

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    process.stdout.write(transform(input));
  } catch (err) {
    process.stderr.write(`math pre-pass failed: ${err.message}\n`);
    process.exit(1);
  }
});
