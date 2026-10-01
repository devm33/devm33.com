mod assets;
mod config;
mod content;
mod frontmatter;
mod fsutil;
mod images;
mod markdown;
mod math;
mod prism;
mod site;
mod slug;

use anyhow::Result;
use config::Config;
use site::Site;

fn main() -> Result<()> {
    let root = std::env::var("SSG_ROOT")
        .map(std::path::PathBuf::from)
        .unwrap_or_else(|_| std::env::current_dir().expect("cwd"));

    let config = Config::new(root);
    eprintln!("Building site from {}", config.root.display());
    let site = Site::load(config)?;
    site.build()?;
    eprintln!(
        "Built {} projects -> {}",
        site.projects.len(),
        site.config.out_dir.display()
    );
    Ok(())
}
