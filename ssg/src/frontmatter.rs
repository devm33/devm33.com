use anyhow::{Result, anyhow};

/// Split a markdown document into its YAML frontmatter and body.
///
/// Expects the file to start with a `---` fenced YAML block. Returns
/// `(yaml_str, body_str)`.
pub fn split(raw: &str) -> Result<(&str, &str)> {
    let raw = raw.strip_prefix('\u{feff}').unwrap_or(raw);
    let rest = raw
        .strip_prefix("---\n")
        .or_else(|| raw.strip_prefix("---\r\n"))
        .ok_or_else(|| anyhow!("missing frontmatter opening `---`"))?;
    // Find the closing delimiter at the start of a line.
    for line_start in LineStarts::new(rest) {
        let line = &rest[line_start..];
        if line.starts_with("---\n") || line.starts_with("---\r\n") || line == "---" {
            let after = line
                .strip_prefix("---\n")
                .or_else(|| line.strip_prefix("---\r\n"))
                .unwrap_or("");
            return Ok((&rest[..line_start], after));
        }
    }
    Err(anyhow!("missing frontmatter closing `---`"))
}

struct LineStarts<'a> {
    s: &'a str,
    pos: usize,
    done: bool,
}

impl<'a> LineStarts<'a> {
    fn new(s: &'a str) -> Self {
        LineStarts {
            s,
            pos: 0,
            done: false,
        }
    }
}

impl<'a> Iterator for LineStarts<'a> {
    type Item = usize;
    fn next(&mut self) -> Option<usize> {
        if self.done {
            return None;
        }
        if self.pos == 0 {
            // First line starts at 0 (unless empty string).
            if self.s.is_empty() {
                self.done = true;
                return None;
            }
            // Advance pos to after first newline for subsequent calls.
            self.pos = match self.s.find('\n') {
                Some(i) => i + 1,
                None => {
                    self.done = true;
                    self.s.len()
                }
            };
            return Some(0);
        }
        if self.pos >= self.s.len() {
            self.done = true;
            return None;
        }
        let start = self.pos;
        self.pos = match self.s[start..].find('\n') {
            Some(i) => start + i + 1,
            None => {
                self.done = true;
                self.s.len()
            }
        };
        Some(start)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn splits_basic() {
        let raw = "---\ntitle: Hi\n---\nBody here\n";
        let (fm, body) = split(raw).unwrap();
        assert_eq!(fm, "title: Hi\n");
        assert_eq!(body, "Body here\n");
    }

    #[test]
    fn errors_without_frontmatter() {
        assert!(split("no frontmatter").is_err());
    }
}
