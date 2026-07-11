use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

use crate::frontmatter;

/// Frontmatter for a project markdown file.
#[derive(Debug, Clone, Deserialize)]
pub struct ProjectFront {
    pub title: String,
    /// Date in YYYY-MM-DD form.
    pub updated: String,
    pub tagline: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub link: Option<String>,
    #[serde(default)]
    pub repo: Option<String>,
    /// Filename of the project's hero/thumbnail image, relative to the
    /// project directory.
    #[serde(default)]
    pub image: Option<String>,
}

/// A fully-loaded project page.
#[derive(Debug, Clone, Serialize)]
pub struct Project {
    pub slug: String,
    /// Site path, e.g. `/projects/pong/`.
    pub path: String,
    pub title: String,
    pub updated: String,
    pub tagline: String,
    pub tags: Vec<String>,
    pub link: Option<String>,
    pub repo: Option<String>,
    pub image: Option<String>,
    /// Rendered HTML body.
    pub html: String,
    /// Whether the page contains math (needs math CSS).
    pub has_math: bool,
    /// Absolute path to the project directory on disk.
    #[serde(skip)]
    #[allow(dead_code)] // used in Phase 4 (image processing)
    pub dir: PathBuf,
}

impl Project {
    /// The raw markdown body plus parsed frontmatter (HTML not yet rendered).
    pub fn load(dir: &Path) -> Result<LoadedProject> {
        let md_path = dir.join("index.md");
        let raw = std::fs::read_to_string(&md_path)
            .with_context(|| format!("reading {}", md_path.display()))?;
        let (fm, body) = frontmatter::split(&raw)
            .with_context(|| format!("frontmatter in {}", md_path.display()))?;
        let front: ProjectFront = serde_yaml::from_str(fm)
            .with_context(|| format!("parsing frontmatter in {}", md_path.display()))?;
        let slug = dir
            .file_name()
            .and_then(|s| s.to_str())
            .context("project dir has no name")?
            .to_string();
        Ok(LoadedProject {
            path: format!("/projects/{slug}/"),
            slug,
            front,
            body: body.to_string(),
            dir: dir.to_path_buf(),
        })
    }
}

/// Intermediate: frontmatter parsed, body still raw markdown.
pub struct LoadedProject {
    pub slug: String,
    pub path: String,
    pub front: ProjectFront,
    pub body: String,
    #[allow(dead_code)] // Project carries its own `dir`; retained for symmetry
    pub dir: PathBuf,
}

/// Discover all project directories under `content/projects`.
pub fn discover_projects(content_dir: &Path) -> Result<Vec<PathBuf>> {
    let projects_dir = content_dir.join("projects");
    let mut dirs = Vec::new();
    if !projects_dir.exists() {
        return Ok(dirs);
    }
    for entry in std::fs::read_dir(&projects_dir)
        .with_context(|| format!("reading {}", projects_dir.display()))?
    {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() && path.join("index.md").exists() {
            dirs.push(path);
        }
    }
    dirs.sort();
    Ok(dirs)
}

// ----- Resume -----

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Job {
    pub uri: String,
    pub name: String,
    pub title: String,
    pub location: String,
    pub start: String,
    pub finish: String,
    #[serde(default)]
    pub description: Vec<String>,
    #[serde(default)]
    pub enabled: bool,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Skills {
    #[serde(rename(deserialize = "Languages"), default)]
    pub languages: Vec<String>,
    #[serde(rename(deserialize = "Frameworks"), default)]
    pub frameworks: Vec<String>,
    #[serde(rename(deserialize = "Platforms"), default)]
    pub platforms: Vec<String>,
}

/// Load enabled jobs from a YAML file.
pub fn load_jobs(path: &Path) -> Result<Vec<Job>> {
    let raw =
        std::fs::read_to_string(path).with_context(|| format!("reading {}", path.display()))?;
    let jobs: Vec<Job> =
        serde_yaml::from_str(&raw).with_context(|| format!("parsing {}", path.display()))?;
    Ok(jobs.into_iter().filter(|j| j.enabled).collect())
}

/// Load skills from a YAML file.
pub fn load_skills(path: &Path) -> Result<Skills> {
    let raw =
        std::fs::read_to_string(path).with_context(|| format!("reading {}", path.display()))?;
    serde_yaml::from_str(&raw).with_context(|| format!("parsing {}", path.display()))
}
