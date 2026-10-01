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
    let mut offset = 0;
    for line in rest.split_inclusive('\n') {
        let without_newline = line.strip_suffix('\n').unwrap_or(line);
        let delimiter = without_newline
            .strip_suffix('\r')
            .unwrap_or(without_newline);
        if delimiter == "---" {
            return Ok((&rest[..offset], &rest[offset + line.len()..]));
        }
        offset += line.len();
    }
    Err(anyhow!("missing frontmatter closing `---`"))
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
    fn splits_crlf_and_closing_delimiter_at_eof() {
        let (fm, body) = split("---\r\ntitle: Hi\r\n---\r\nBody\r\n").unwrap();
        assert_eq!(fm, "title: Hi\r\n");
        assert_eq!(body, "Body\r\n");

        let (fm, body) = split("---\ntitle: Hi\n---").unwrap();
        assert_eq!(fm, "title: Hi\n");
        assert_eq!(body, "");
    }

    #[test]
    fn errors_without_frontmatter() {
        assert!(split("no frontmatter").is_err());
    }
}
