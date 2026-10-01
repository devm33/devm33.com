use anyhow::{Context, Result};
use std::path::Path;
use walkdir::WalkDir;

/// Recursively copy all files from `src` into `dst`, preserving structure.
/// No-op if `src` does not exist.
pub fn copy_tree(src: &Path, dst: &Path) -> Result<usize> {
    if !src.exists() {
        return Ok(0);
    }
    let mut count = 0;
    for entry in WalkDir::new(src) {
        let entry = entry?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        let rel = path
            .strip_prefix(src)
            .with_context(|| format!("stripping {src:?} from {path:?}"))?;
        let dest = dst.join(rel);
        if let Some(parent) = dest.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::copy(path, &dest)
            .with_context(|| format!("copying {} -> {}", path.display(), dest.display()))?;
        count += 1;
    }
    Ok(count)
}
