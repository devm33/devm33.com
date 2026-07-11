use anyhow::{Context, Result, bail};
use std::io::Write;
use std::path::Path;
use std::process::{Command, Stdio};

/// Returns true if the body contains math delimiters (`$$`).
pub fn has_math(body: &str) -> bool {
    body.contains("$$")
}

/// Runs the Node/Temml AST pre-pass over `body`, replacing every `$$…$$`
/// expression with build-time MathML. Hard-fails on any Temml error so a
/// broken formula never ships silently.
pub fn prepass(body: &str, root: &Path) -> Result<String> {
    let mut child = Command::new("node")
        .arg("scripts/math.mjs")
        .current_dir(root)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .context("spawning node for Temml math pre-pass (is node installed?)")?;

    {
        let mut stdin = child.stdin.take().expect("stdin piped");
        stdin
            .write_all(body.as_bytes())
            .context("writing markdown to math pre-pass")?;
    }

    let output = child
        .wait_with_output()
        .context("waiting for math pre-pass")?;
    if !output.status.success() {
        bail!(
            "math pre-pass failed: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        );
    }
    String::from_utf8(output.stdout).context("math pre-pass produced invalid UTF-8")
}
