use pulldown_cmark::{Event, Options, Parser, html};

/// Result of rendering markdown to HTML.
pub struct Rendered {
    pub html: String,
    pub has_math: bool,
}

/// Render markdown body to HTML.
///
/// This is the Phase 1 baseline: standard CommonMark + common extensions.
/// Image processing, syntax highlighting, and math (Temml) hooks are layered
/// on in later phases.
pub fn render(body: &str) -> Rendered {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_SMART_PUNCTUATION);
    options.insert(Options::ENABLE_HEADING_ATTRIBUTES);

    let parser = Parser::new_ext(body, options);

    // Detect math delimiters (`$$`) in text events so pages can conditionally
    // load math CSS. Actual rendering happens in the Temml phase.
    let mut has_math = false;
    let events: Vec<Event> = parser
        .inspect(|ev| {
            if let Event::Text(t) = ev
                && t.contains("$$")
            {
                has_math = true;
            }
        })
        .collect();

    let mut out = String::new();
    html::push_html(&mut out, events.into_iter());
    Rendered {
        html: out,
        has_math,
    }
}
