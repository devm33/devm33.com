/// Canonical tag → URL-path-segment encoder.
///
/// The old Gatsby site used the raw tag string directly in the path
/// (`/tag/${tag}/`), so a tag like `number theory` produced the directory
/// `tag/number theory/` served at `/tag/number%20theory/`. We keep that exact
/// behavior for URL parity: the on-disk directory uses the raw tag, and links
/// percent-encode it.
pub fn tag_dir(tag: &str) -> String {
    tag.to_string()
}

/// Percent-encode a tag for use in an href, matching browser encoding of the
/// raw path the old site emitted. Only spaces and a small set of characters
/// need encoding for these tags.
pub fn tag_href(tag: &str) -> String {
    let mut out = String::with_capacity(tag.len());
    for b in tag.bytes() {
        match b {
            b' ' => out.push_str("%20"),
            _ => out.push(b as char),
        }
    }
    format!("/tag/{out}/")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encodes_spaces() {
        assert_eq!(tag_href("number theory"), "/tag/number%20theory/");
        assert_eq!(tag_href("react"), "/tag/react/");
    }
}
