use anyhow::Result;
use pulldown_cmark::{CodeBlockKind, CowStr, Event, Options, Parser, Tag, TagEnd, html};
use std::path::Path;

use crate::images::ImageProcessor;

/// Result of rendering markdown to HTML.
pub struct Rendered {
    pub html: String,
}

/// Sentinel wrapping a highlighted-code-block index in the intermediate HTML.
/// Uses Unicode private-use characters so it can never collide with content.
fn placeholder(idx: usize) -> String {
    format!("\u{E000}PRISM{idx}\u{E000}")
}

/// Unwrap a footnote body that is a single `<p>…</p>` so its text sits directly
/// in the `<li>`, matching gatsby-transformer-remark's output.
fn strip_single_paragraph(inner: &str) -> &str {
    let t = inner.trim();
    if let Some(body) = t.strip_prefix("<p>").and_then(|s| s.strip_suffix("</p>"))
        && !body.contains("</p>")
    {
        return body;
    }
    t
}

/// Render markdown body to HTML, processing body images through `images` and
/// fenced code blocks through PrismJS (Node helper), rooted at `root`.
///
/// Math is resolved to MathML by the Temml pre-pass before this runs, so any
/// `<math>` elements arrive here as raw inline HTML and pass through untouched.
pub fn render(body: &str, images: &ImageProcessor, root: &Path) -> Result<Rendered> {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_SMART_PUNCTUATION);
    options.insert(Options::ENABLE_HEADING_ATTRIBUTES);

    let parser = Parser::new_ext(body, options);

    let mut events: Vec<Event> = Vec::new();
    // While inside an image tag, `alt` accumulates its text children.
    let mut alt: Option<String> = None;
    let mut img_url: Option<String> = None;
    // While inside a fenced/indented code block, buffer its language and text.
    let mut code_lang: Option<String> = None;
    let mut code_buf: Option<String> = None;
    // Collected `(lang, code)` blocks, highlighted in one batch after the walk.
    let mut blocks: Vec<(String, String)> = Vec::new();
    // Footnote labels in order of first reference, for sequential numbering.
    let mut fn_order: Vec<String> = Vec::new();
    // Collected footnote definitions as `(label, inner_html)`.
    let mut footnotes: Vec<(String, String)> = Vec::new();
    // When capturing a footnote definition: its label + buffered inner events.
    let mut in_fn: Option<(String, Vec<Event>)> = None;

    for ev in parser {
        // Divert everything inside a footnote definition into its own buffer so
        // it can be re-emitted as an ordered list at the end of the document.
        if in_fn.is_some() {
            if matches!(ev, Event::End(TagEnd::FootnoteDefinition)) {
                let (label, inner_events) = in_fn.take().unwrap();
                let mut inner = String::new();
                html::push_html(&mut inner, inner_events.into_iter());
                footnotes.push((label, inner));
            } else {
                in_fn.as_mut().unwrap().1.push(ev);
            }
            continue;
        }
        match ev {
            Event::Start(Tag::FootnoteDefinition(name)) => {
                in_fn = Some((name.to_string(), Vec::new()));
            }
            Event::FootnoteReference(name) => {
                let label = name.to_string();
                if !fn_order.contains(&label) {
                    fn_order.push(label.clone());
                }
                let num = fn_order.iter().position(|l| l == &label).unwrap() + 1;
                let html = format!(
                    "<sup id=\"fnref-{label}\"><a href=\"#fn-{label}\" \
                     class=\"footnote-ref\">{num}</a></sup>"
                );
                events.push(Event::Html(CowStr::Boxed(html.into_boxed_str())));
            }
            Event::Start(Tag::Image { dest_url, .. }) => {
                img_url = Some(dest_url.to_string());
                alt = Some(String::new());
            }
            Event::End(TagEnd::Image) => {
                let url = img_url.take().unwrap_or_default();
                let a = alt.take().unwrap_or_default();
                let rendered = images.process(&url, &a)?;
                events.push(Event::Html(CowStr::Boxed(rendered.into_boxed_str())));
            }
            Event::Start(Tag::CodeBlock(kind)) => {
                let lang = match kind {
                    CodeBlockKind::Fenced(info) => {
                        info.split_whitespace().next().unwrap_or("").to_string()
                    }
                    CodeBlockKind::Indented => String::new(),
                };
                code_lang = Some(lang);
                code_buf = Some(String::new());
            }
            Event::End(TagEnd::CodeBlock) => {
                let lang = code_lang.take().unwrap_or_default();
                let code = code_buf.take().unwrap_or_default();
                let idx = blocks.len();
                blocks.push((lang, code));
                events.push(Event::Html(CowStr::Boxed(
                    placeholder(idx).into_boxed_str(),
                )));
            }
            Event::Text(t) => {
                if let Some(buf) = code_buf.as_mut() {
                    buf.push_str(&t);
                } else if let Some(a) = alt.as_mut() {
                    a.push_str(&t);
                } else {
                    events.push(Event::Text(t));
                }
            }
            Event::Code(t) => {
                if let Some(a) = alt.as_mut() {
                    a.push_str(&t);
                } else {
                    events.push(Event::Code(t));
                }
            }
            other => events.push(other),
        }
    }

    let mut out = String::new();
    html::push_html(&mut out, events.into_iter());

    // Emit collected footnotes as remark's ordered-list structure.
    if !footnotes.is_empty() {
        // Any footnote defined but never referenced still appears, in source order.
        for (label, _) in &footnotes {
            if !fn_order.contains(label) {
                fn_order.push(label.clone());
            }
        }
        let mut section = String::from("<div class=\"footnotes\">\n<hr>\n<ol>\n");
        for label in &fn_order {
            if let Some((_, inner)) = footnotes.iter().find(|(l, _)| l == label) {
                let content = strip_single_paragraph(inner);
                section.push_str(&format!(
                    "<li id=\"fn-{label}\">{content}\
                     <a href=\"#fnref-{label}\" class=\"footnote-backref\">\u{21a9}</a></li>\n"
                ));
            }
        }
        section.push_str("</ol>\n</div>\n");
        out.push_str(&section);
    }

    let highlighted = crate::prism::highlight(&blocks, root)?;
    for (idx, block_html) in highlighted.iter().enumerate() {
        out = out.replace(&placeholder(idx), block_html);
    }

    Ok(Rendered { html: out })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn dummy_processor() -> ImageProcessor {
        ImageProcessor::new(PathBuf::from("."), PathBuf::from("."), "/".to_string())
    }

    #[test]
    fn renders_basic_markdown_without_spawning_node() {
        // No fenced code / images, so no Node subprocess is invoked.
        let out = render(
            "# Title\n\nSome **bold** and `code` text.",
            &dummy_processor(),
            Path::new("."),
        )
        .unwrap()
        .html;
        assert!(out.contains("<h1>Title</h1>"));
        assert!(out.contains("<strong>bold</strong>"));
        assert!(out.contains("<code>code</code>"));
    }

    #[test]
    fn passes_mathml_through_as_raw_html() {
        let out = render(
            "value <math><mi>n</mi></math> here",
            &dummy_processor(),
            Path::new("."),
        )
        .unwrap()
        .html;
        assert!(out.contains("<math><mi>n</mi></math>"));
    }

    #[test]
    fn renders_footnotes_as_remark_ordered_list() {
        let out = render(
            "Body ref [^1] here.\n\n[^1]: The note text.",
            &dummy_processor(),
            Path::new("."),
        )
        .unwrap()
        .html;
        assert!(
            out.contains(
                "<sup id=\"fnref-1\"><a href=\"#fn-1\" class=\"footnote-ref\">1</a></sup>"
            )
        );
        assert!(out.contains("<div class=\"footnotes\">\n<hr>\n<ol>\n"));
        assert!(out.contains(
            "<li id=\"fn-1\">The note text.<a href=\"#fnref-1\" class=\"footnote-backref\">\u{21a9}</a></li>"
        ));
        assert!(!out.contains("footnote-definition"));
    }
}
