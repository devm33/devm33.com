use anyhow::{Context, Result};
use std::collections::HashMap;
use std::hash::{Hash, Hasher};
use std::path::Path;

/// Content-hash → 16 hex chars (matches the image pipeline's scheme).
fn hash16(bytes: &[u8]) -> String {
    let mut h = std::collections::hash_map::DefaultHasher::new();
    bytes.hash(&mut h);
    format!("{:016x}", h.finish())
}

/// Insert `hash` before the file extension: `/style.css` → `/style.<hash>.css`.
fn fingerprint_name(logical: &str, hash: &str) -> String {
    match logical.rfind('.') {
        Some(i) => format!("{}.{}{}", &logical[..i], hash, &logical[i..]),
        None => format!("{logical}.{hash}"),
    }
}

fn basename(path: &str) -> &str {
    path.rsplit('/').next().unwrap_or(path)
}

fn write_out(out_dir: &Path, logical: &str, bytes: &[u8]) -> Result<()> {
    let dest = out_dir.join(logical.trim_start_matches('/'));
    if let Some(parent) = dest.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(&dest, bytes).with_context(|| format!("writing {}", dest.display()))?;
    Ok(())
}

/// Remove the verbatim copy `copy_tree` made, so only the hashed asset ships.
fn remove_verbatim(out_dir: &Path, logical: &str) -> Result<()> {
    let p = out_dir.join(logical.trim_start_matches('/'));
    if p.exists() {
        std::fs::remove_file(&p).with_context(|| format!("removing {}", p.display()))?;
    }
    Ok(())
}

/// Fingerprint CSS/JS/font assets: write content-hashed copies to `out_dir`,
/// rewrite font references inside the CSS, and return a manifest mapping each
/// logical path (e.g. `/style.css`) to its hashed path. Enables `immutable`
/// caching without stale-asset bugs.
pub fn fingerprint(static_dir: &Path, out_dir: &Path) -> Result<HashMap<String, String>> {
    let mut map = HashMap::new();

    // Fonts first — the CSS references them, so they must be hashed up front.
    let fonts = [
        "/fonts/mulish.woff2",
        "/fonts/mulish-ital.woff2",
        "/Temml.woff2",
    ];
    for logical in fonts {
        let src = static_dir.join(logical.trim_start_matches('/'));
        let bytes = std::fs::read(&src).with_context(|| format!("reading {}", src.display()))?;
        let hashed = fingerprint_name(logical, &hash16(&bytes));
        remove_verbatim(out_dir, logical)?;
        write_out(out_dir, &hashed, &bytes)?;
        map.insert(logical.to_string(), hashed);
    }

    // Stylesheets: rewrite font URLs (absolute and bare-basename forms) to the
    // hashed names, then hash the rewritten contents.
    let styles = ["/style.css", "/prism.css", "/temml.css"];
    for logical in styles {
        let src = static_dir.join(logical.trim_start_matches('/'));
        let mut text =
            std::fs::read_to_string(&src).with_context(|| format!("reading {}", src.display()))?;
        for font in fonts {
            let hashed = &map[font];
            text = text.replace(font, hashed);
            text = text.replace(basename(font), basename(hashed));
        }
        let hashed = fingerprint_name(logical, &hash16(text.as_bytes()));
        remove_verbatim(out_dir, logical)?;
        write_out(out_dir, &hashed, text.as_bytes())?;
        map.insert(logical.to_string(), hashed);
    }

    // Scripts (no internal asset references).
    let scripts = ["/theme.js"];
    for logical in scripts {
        let src = static_dir.join(logical.trim_start_matches('/'));
        let bytes = std::fs::read(&src).with_context(|| format!("reading {}", src.display()))?;
        let hashed = fingerprint_name(logical, &hash16(&bytes));
        remove_verbatim(out_dir, logical)?;
        write_out(out_dir, &hashed, &bytes)?;
        map.insert(logical.to_string(), hashed);
    }

    Ok(map)
}

#[cfg(test)]
mod tests {
    use super::{basename, fingerprint_name};

    #[test]
    fn inserts_hash_before_extension() {
        assert_eq!(fingerprint_name("/style.css", "abcd"), "/style.abcd.css");
        assert_eq!(
            fingerprint_name("/fonts/mulish.woff2", "beef"),
            "/fonts/mulish.beef.woff2"
        );
        assert_eq!(fingerprint_name("/noext", "beef"), "/noext.beef");
    }

    #[test]
    fn basename_strips_dirs() {
        assert_eq!(basename("/fonts/mulish.woff2"), "mulish.woff2");
        assert_eq!(basename("Temml.woff2"), "Temml.woff2");
    }
}
