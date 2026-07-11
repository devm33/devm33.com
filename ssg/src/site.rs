use anyhow::{Context, Result};
use serde::Serialize;
use std::collections::HashMap;
use std::path::Path;
use std::sync::{Arc, RwLock};
use tera::Tera;

use crate::config::Config;
use crate::content::{self, Job, Project, Skills};
use crate::markdown;
use crate::slug;

/// A project as exposed to templates (adds the encoded tag hrefs).
#[derive(Debug, Clone, Serialize)]
pub struct ProjectView {
    pub slug: String,
    pub path: String,
    pub title: String,
    pub updated: String,
    pub tagline: String,
    pub tags: Vec<TagRef>,
    pub link: Option<String>,
    pub repo: Option<String>,
    pub thumb: Option<crate::images::Thumb>,
    /// Root-relative Open Graph image path, if the project has a hero image.
    #[serde(skip)]
    pub og_path: Option<String>,
    pub html: String,
    pub has_math: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct TagRef {
    pub name: String,
    pub href: String,
}

/// Per-page SEO/OG metadata exposed to templates as `page`.
#[derive(Debug, Clone, Serialize)]
pub struct PageMeta {
    pub title: String,
    pub description: String,
    pub og_image: String,
    pub canonical: String,
}

/// A single URL entry for the sitemap.
struct SitemapEntry {
    loc: String,
    lastmod: Option<String>,
}

impl ProjectView {
    fn from(
        p: &Project,
        html: String,
        has_math: bool,
        thumb: Option<crate::images::Thumb>,
        og_path: Option<String>,
    ) -> Self {
        ProjectView {
            slug: p.slug.clone(),
            path: p.path.clone(),
            title: p.title.clone(),
            updated: p.updated.clone(),
            tagline: p.tagline.clone(),
            tags: p
                .tags
                .iter()
                .map(|t| TagRef {
                    name: t.clone(),
                    href: slug::tag_href(t),
                })
                .collect(),
            link: p.link.clone(),
            repo: p.repo.clone(),
            thumb,
            og_path,
            html,
            has_math,
        }
    }
}

/// The full in-memory site model.
pub struct Site {
    pub config: Config,
    pub tera: Tera,
    pub projects: Vec<Project>,
    /// Logical → content-hashed asset paths, filled during `build`.
    assets: Arc<RwLock<HashMap<String, String>>>,
    /// Output paths written so far, to hard-fail on duplicate routes.
    routes: std::cell::RefCell<std::collections::HashSet<String>>,
}

impl Site {
    /// Load templates and all content into memory.
    pub fn load(config: Config) -> Result<Self> {
        let mut tera = Tera::new(&config.templates_glob)
            .with_context(|| format!("loading templates from {}", config.templates_glob))?;

        // `asset(path="/style.css")` resolves to the fingerprinted URL (or the
        // input path before/if it isn't fingerprinted).
        let assets: Arc<RwLock<HashMap<String, String>>> = Arc::new(RwLock::new(HashMap::new()));
        let assets_fn = Arc::clone(&assets);
        tera.register_function("asset", move |args: &HashMap<String, tera::Value>| {
            let path = args
                .get("path")
                .and_then(|v| v.as_str())
                .ok_or_else(|| tera::Error::msg("asset() requires a string `path`"))?;
            let map = assets_fn.read().expect("assets lock poisoned");
            let resolved = map.get(path).cloned().unwrap_or_else(|| path.to_string());
            Ok(tera::Value::String(resolved))
        });

        let mut projects = Vec::new();
        for dir in content::discover_projects(&config.content_dir)? {
            let loaded = Project::load(&dir)?;
            projects.push(Project {
                slug: loaded.slug,
                path: loaded.path,
                title: loaded.front.title,
                updated: loaded.front.updated,
                tagline: loaded.front.tagline.trim().to_string(),
                tags: loaded.front.tags,
                link: loaded.front.link,
                repo: loaded.front.repo,
                image: loaded.front.image,
                body: loaded.body,
                dir,
            });
        }
        // Sort by `updated` descending (dates are YYYY-MM-DD, lexicographic ok).
        projects.sort_by(|a, b| b.updated.cmp(&a.updated).then(a.slug.cmp(&b.slug)));

        Ok(Site {
            config,
            tera,
            projects,
            assets,
            routes: std::cell::RefCell::new(std::collections::HashSet::new()),
        })
    }

    fn project_views(&self) -> Result<Vec<ProjectView>> {
        let out = &self.config.out_dir;
        let mut views = Vec::with_capacity(self.projects.len());
        for p in &self.projects {
            let processor = crate::images::ImageProcessor::new(
                p.dir.clone(),
                out.join("projects").join(&p.slug),
                p.path.clone(),
            );
            let has_math = crate::math::has_math(&p.body);
            let body = if has_math {
                crate::math::prepass(&p.body, &self.config.root)
                    .with_context(|| format!("math pre-pass for {}", p.slug))?
            } else {
                p.body.clone()
            };
            let rendered = markdown::render(&body, &processor, &self.config.root)
                .with_context(|| format!("rendering project {}", p.slug))?;
            let (thumb, og_path) = match &p.image {
                Some(img) => {
                    let thumb = processor
                        .thumbnail(img, 150)
                        .with_context(|| format!("thumbnail for {}", p.slug))?;
                    let og = processor
                        .social(img, 1000)
                        .with_context(|| format!("og image for {}", p.slug))?;
                    (Some(thumb), Some(og))
                }
                None => (None, None),
            };
            views.push(ProjectView::from(
                p,
                rendered.html,
                has_math,
                thumb,
                og_path,
            ));
        }
        Ok(views)
    }

    /// Processor for the shared `content/images` directory (headshot, OG).
    fn images_processor(&self) -> crate::images::ImageProcessor {
        crate::images::ImageProcessor::new(
            self.config.content_dir.join("images"),
            self.config.out_dir.join("images"),
            "/images/".to_string(),
        )
    }

    /// Base template context shared by all pages.
    fn base_context(&self) -> tera::Context {
        let mut ctx = tera::Context::new();
        ctx.insert("site", &self.config.metadata);
        ctx
    }

    /// Absolute site URL for a root-relative path.
    fn abs(&self, path: &str) -> String {
        format!("{}{}", self.config.metadata.site_url, path)
    }

    /// Insert per-page SEO/OG metadata under `page`.
    fn insert_page(
        &self,
        ctx: &mut tera::Context,
        title: &str,
        description: &str,
        og_image: &str,
        pathname: &str,
    ) {
        let page = PageMeta {
            title: title.to_string(),
            description: description.to_string(),
            og_image: og_image.to_string(),
            canonical: self.abs(pathname),
        };
        ctx.insert("page", &page);
    }

    /// Render every page and write it to the output directory.
    pub fn build(&self) -> Result<()> {
        let out = &self.config.out_dir;
        clean_dir(out)?;

        // Copy pass-through static assets (favicon, fonts, robots, etc.).
        let copied = crate::fsutil::copy_tree(&self.config.static_dir, out)?;
        eprintln!("Copied {copied} static files");

        // Fingerprint CSS/JS/font assets and expose them to templates via
        // `asset(path=…)`.
        let manifest = crate::assets::fingerprint(&self.config.static_dir, out)
            .context("fingerprinting assets")?;
        *self.assets.write().expect("assets lock poisoned") = manifest;

        let views = self.project_views()?;
        let meta = &self.config.metadata;

        // Headshot + default Open Graph image from the shared images dir.
        let images_proc = self.images_processor();
        let headshot = images_proc
            .thumbnail("me.jpg", 250)
            .context("processing headshot")?;
        let default_og = self.abs(
            &images_proc
                .social("me.jpg", 1000)
                .context("og for me.jpg")?,
        );
        let mut sitemap: Vec<SitemapEntry> = Vec::new();

        // Homepage: 3 most-recent projects.
        {
            let mut ctx = self.base_context();
            let recent: Vec<&ProjectView> = views.iter().take(3).collect();
            ctx.insert("recent", &recent);
            ctx.insert("total", &views.len());
            ctx.insert("headshot", &headshot);
            self.insert_page(&mut ctx, &meta.title, &meta.description, &default_og, "/");
            self.write_page("index.html", "", &ctx)?;
            sitemap.push(SitemapEntry {
                loc: self.abs("/"),
                lastmod: None,
            });
        }

        // Projects index.
        {
            let mut ctx = self.base_context();
            ctx.insert("projects", &views);
            self.insert_page(
                &mut ctx,
                &meta.title,
                &meta.description,
                &default_og,
                "/projects/",
            );
            self.write_page("projects.html", "projects", &ctx)?;
            sitemap.push(SitemapEntry {
                loc: self.abs("/projects/"),
                lastmod: None,
            });
        }

        // Project pages.
        for view in &views {
            let mut ctx = self.base_context();
            let og_image = match &view.og_path {
                Some(path) => self.abs(path),
                None => default_og.clone(),
            };
            self.insert_page(&mut ctx, &view.title, &view.tagline, &og_image, &view.path);
            ctx.insert("project", view);
            self.write_page("project.html", &format!("projects/{}", view.slug), &ctx)?;
            sitemap.push(SitemapEntry {
                loc: self.abs(&view.path),
                lastmod: Some(view.updated.clone()),
            });
        }

        // Tag pages.
        for (tag, tagged) in Self::tags(&views) {
            let mut ctx = self.base_context();
            let pathname = slug::tag_href(&tag);
            self.insert_page(
                &mut ctx,
                &format!("Projects tagged {tag}"),
                &meta.description,
                &default_og,
                &pathname,
            );
            ctx.insert("tag", &tag);
            ctx.insert("tag_projects", &tagged);
            let dir = format!("tag/{}", slug::tag_dir(&tag));
            self.write_page("tag.html", &dir, &ctx)?;
            sitemap.push(SitemapEntry {
                loc: self.abs(&pathname),
                lastmod: None,
            });
        }

        // Resume.
        {
            let jobs = self.load_resume_jobs()?;
            let skills = self.load_resume_skills()?;
            let mut ctx = self.base_context();
            self.insert_page(
                &mut ctx,
                "Devraj Mehta Resume",
                &meta.description,
                &default_og,
                "/resume/",
            );
            ctx.insert("resume_nav", &true);
            ctx.insert("jobs", &jobs);
            ctx.insert("skills", &skills);
            self.write_page("resume.html", "resume", &ctx)?;
            sitemap.push(SitemapEntry {
                loc: self.abs("/resume/"),
                lastmod: None,
            });
        }

        // 404 (excluded from the sitemap).
        {
            let mut ctx = self.base_context();
            self.insert_page(
                &mut ctx,
                "404: Not found",
                &meta.description,
                &default_og,
                "/404/",
            );
            self.write_named("404.html", "404.html", &ctx)?;
        }

        self.write_sitemap(&sitemap)?;

        Ok(())
    }

    /// Emit `/sitemap-index.xml` + `/sitemap-0.xml` (matches gatsby-plugin-sitemap).
    fn write_sitemap(&self, entries: &[SitemapEntry]) -> Result<()> {
        let mut urls = String::new();
        for e in entries {
            urls.push_str("  <url><loc>");
            urls.push_str(&e.loc);
            urls.push_str("</loc>");
            if let Some(lastmod) = &e.lastmod {
                urls.push_str("<lastmod>");
                urls.push_str(lastmod);
                urls.push_str("</lastmod>");
            }
            urls.push_str("</url>\n");
        }
        let urlset = format!(
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n{urls}</urlset>\n"
        );
        std::fs::write(self.config.out_dir.join("sitemap-0.xml"), urlset)?;

        let index = format!(
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <sitemap><loc>{}</loc></sitemap>\n</sitemapindex>\n",
            self.abs("/sitemap-0.xml")
        );
        std::fs::write(self.config.out_dir.join("sitemap-index.xml"), index)?;
        Ok(())
    }

    /// Group projects by tag, each list sorted by the existing project order
    /// (already updated-desc).
    fn tags(views: &[ProjectView]) -> Vec<(String, Vec<ProjectView>)> {
        let mut names: Vec<String> = Vec::new();
        for v in views {
            for t in &v.tags {
                if !names.iter().any(|n| n == &t.name) {
                    names.push(t.name.clone());
                }
            }
        }
        names.sort();
        names
            .into_iter()
            .map(|name| {
                let tagged: Vec<ProjectView> = views
                    .iter()
                    .filter(|v| v.tags.iter().any(|t| t.name == name))
                    .cloned()
                    .collect();
                (name, tagged)
            })
            .collect()
    }

    fn load_resume_jobs(&self) -> Result<Vec<Job>> {
        content::load_jobs(&self.config.content_dir.join("resume/jobs.yml"))
    }

    fn load_resume_skills(&self) -> Result<Skills> {
        content::load_skills(&self.config.content_dir.join("resume/skills.yml"))
    }

    /// Render `template` and write to `<out>/<dir>/index.html`.
    fn write_page(&self, template: &str, dir: &str, ctx: &tera::Context) -> Result<()> {
        let rel = if dir.is_empty() {
            "index.html".to_string()
        } else {
            format!("{dir}/index.html")
        };
        self.write_named(template, &rel, ctx)
    }

    fn write_named(&self, template: &str, rel: &str, ctx: &tera::Context) -> Result<()> {
        if !self.routes.borrow_mut().insert(rel.to_string()) {
            anyhow::bail!("duplicate route: two pages resolve to {rel}");
        }
        let html = self
            .tera
            .render(template, ctx)
            .with_context(|| format!("rendering template {template}"))?;
        let dest = self.config.out_dir.join(rel);
        if let Some(parent) = dest.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(&dest, html).with_context(|| format!("writing {}", dest.display()))?;
        Ok(())
    }
}

/// Remove and recreate a directory so each build starts clean.
fn clean_dir(dir: &Path) -> Result<()> {
    if dir.exists() {
        std::fs::remove_dir_all(dir)?;
    }
    std::fs::create_dir_all(dir)?;
    Ok(())
}
