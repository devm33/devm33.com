use anyhow::Result;
use pulldown_cmark::{CowStr, Event, Options, Parser, Tag, TagEnd, html};

use crate::images::ImageProcessor;

/// Result of rendering markdown to HTML.
pub struct Rendered {
    pub html: String,
}

/// Render markdown body to HTML, processing body images through `images`.
///
/// Math is resolved to MathML by the Temml pre-pass before this runs, so any
/// `<math>` elements arrive here as raw inline HTML and pass through untouched.
/// Syntax highlighting (Phase 7) is layered on later.
pub fn render(body: &str, images: &ImageProcessor) -> Result<Rendered> {
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
            Event::Text(t) => {
                if let Some(a) = alt.as_mut() {
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
    Ok(Rendered { html: out })
}
