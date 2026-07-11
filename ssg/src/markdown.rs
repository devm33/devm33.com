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

    for ev in parser {
        match ev {
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
}
