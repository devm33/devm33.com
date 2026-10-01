use anyhow::{Context, Result, bail};
use serde::Deserialize;
use std::io::Write;
use std::path::Path;
use std::process::{Command, Stdio};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Processed {
    pub body: String,
    pub has_math: bool,
}

/// Runs the Node/Temml AST pre-pass over `body`, replacing inline and display
/// math with build-time MathML. Hard-fails on any Temml error so a broken
/// formula never ships silently.
pub fn prepass(body: &str, root: &Path) -> Result<Processed> {
    if !body.contains('$') {
        return Ok(Processed {
            body: body.to_string(),
            has_math: false,
        });
    }

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
    serde_json::from_slice(&output.stdout).context("parsing math pre-pass output")
}
