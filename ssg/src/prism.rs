use anyhow::{Context, Result, bail};
use serde::Serialize;
use std::io::Write;
use std::path::Path;
use std::process::{Command, Stdio};

#[derive(Serialize)]
struct Block<'a> {
    lang: &'a str,
    code: &'a str,
}

/// Highlight fenced code `blocks` (`(lang, code)`) via the PrismJS Node helper,
/// returning ready-to-embed `<div class="highlight">…</div>` HTML for each block
/// in order. Batches every block of a page into a single Node process. Hard-fails
/// on any error so a broken block never ships unhighlighted.
pub fn highlight(blocks: &[(String, String)], root: &Path) -> Result<Vec<String>> {
    if blocks.is_empty() {
        return Ok(Vec::new());
    }
    let payload: Vec<Block> = blocks
        .iter()
        .map(|(lang, code)| Block { lang, code })
        .collect();
    let input = serde_json::to_string(&payload).context("serializing code blocks")?;

    let mut child = Command::new("node")
        .arg("scripts/prism.mjs")
        .current_dir(root)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .context("spawning node for PrismJS highlighting (is node installed?)")?;

    {
        let mut stdin = child.stdin.take().expect("stdin piped");
        stdin
            .write_all(input.as_bytes())
            .context("writing code blocks to prism helper")?;
    }

    let output = child
        .wait_with_output()
        .context("waiting for prism helper")?;
    if !output.status.success() {
        bail!(
            "syntax highlighting failed: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        );
    }
    let html: Vec<String> =
        serde_json::from_slice(&output.stdout).context("parsing prism helper output")?;
    if html.len() != blocks.len() {
        bail!(
            "prism helper returned {} blocks, expected {}",
            html.len(),
            blocks.len()
        );
    }
    Ok(html)
}
