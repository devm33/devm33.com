use serde::Serialize;

/// Site-wide metadata, mirrors the old Gatsby `siteMetadata`.
#[derive(Debug, Clone, Serialize)]
pub struct SiteMetadata {
    pub title: String,
    pub description: String,
    pub site_url: String,
    pub email: String,
    pub github: String,
    pub linkedin: String,
}

impl Default for SiteMetadata {
    fn default() -> Self {
        SiteMetadata {
            title: "Devraj Mehta".into(),
            description: "Devraj Mehta's website.".into(),
            site_url: "https://devm33.com".into(),
            email: "dev@devm.dev".into(),
            github: "https://github.com/devm33".into(),
            linkedin: "https://www.linkedin.com/in/devrajmehta/".into(),
        }
    }
}

/// Build configuration: where content/templates live and where output goes.
#[derive(Debug, Clone)]
pub struct Config {
    pub root: std::path::PathBuf,
    pub content_dir: std::path::PathBuf,
    pub templates_glob: String,
    pub static_dir: std::path::PathBuf,
    pub out_dir: std::path::PathBuf,
    pub metadata: SiteMetadata,
}

impl Config {
    pub fn new(root: impl Into<std::path::PathBuf>) -> Self {
        let root = root.into();
        Config {
            content_dir: root.join("content"),
            templates_glob: format!("{}/templates/**/*.html", root.display()),
            static_dir: root.join("static"),
            out_dir: root.join("public"),
            root,
            metadata: SiteMetadata::default(),
        }
    }
}
