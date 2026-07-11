use anyhow::{Context, Result};
use serde::Serialize;
use std::path::Path;
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
    pub image: Option<String>,
    pub html: String,
    pub has_math: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct TagRef {
    pub name: String,
    pub href: String,
}

impl ProjectView {
    fn from(p: &Project) -> Self {
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
            image: p.image.clone(),
            html: p.html.clone(),
            has_math: p.has_math,
        }
    }
}

/// The full in-memory site model.
pub struct Site {
    pub config: Config,
    pub tera: Tera,
    pub projects: Vec<Project>,
}

impl Site {
    /// Load templates and all content into memory.
    pub fn load(config: Config) -> Result<Self> {
        let tera = Tera::new(&config.templates_glob)
            .with_context(|| format!("loading templates from {}", config.templates_glob))?;

        let mut projects = Vec::new();
        for dir in content::discover_projects(&config.content_dir)? {
            let loaded = Project::load(&dir)?;
            let rendered = markdown::render(&loaded.body);
            projects.push(Project {
                slug: loaded.slug,
                path: loaded.path,
                title: loaded.front.title,
                updated: loaded.front.updated,
                tagline: loaded.front.tagline,
                tags: loaded.front.tags,
                link: loaded.front.link,
                repo: loaded.front.repo,
                image: loaded.front.image,
                html: rendered.html,
                has_math: rendered.has_math,
                dir,
            });
        }
        // Sort by `updated` descending (dates are YYYY-MM-DD, lexicographic ok).
        projects.sort_by(|a, b| b.updated.cmp(&a.updated).then(a.slug.cmp(&b.slug)));

        Ok(Site {
            config,
            tera,
            projects,
        })
    }

    fn project_views(&self) -> Vec<ProjectView> {
        self.projects.iter().map(ProjectView::from).collect()
    }

    /// Base template context shared by all pages.
    fn base_context(&self) -> tera::Context {
        let mut ctx = tera::Context::new();
        ctx.insert("site", &self.config.metadata);
        ctx
    }

    /// Render every page and write it to the output directory.
    pub fn build(&self) -> Result<()> {
        let out = &self.config.out_dir;
        clean_dir(out)?;

        let views = self.project_views();

        // Homepage: 3 most-recent projects.
        {
            let mut ctx = self.base_context();
            let recent: Vec<&ProjectView> = views.iter().take(3).collect();
            ctx.insert("recent", &recent);
            ctx.insert("total", &views.len());
            self.write_page("index.html", "", &ctx)?;
        }

        // Projects index.
        {
            let mut ctx = self.base_context();
            ctx.insert("projects", &views);
            self.write_page("projects.html", "projects", &ctx)?;
        }

        // Project pages.
        for view in &views {
            let mut ctx = self.base_context();
            ctx.insert("project", view);
            self.write_page("project.html", &format!("projects/{}", view.slug), &ctx)?;
        }

        // Tag pages.
        for (tag, tagged) in self.tags() {
            let mut ctx = self.base_context();
            ctx.insert("tag", &tag);
            ctx.insert("tag_projects", &tagged);
            let dir = format!("tag/{}", slug::tag_dir(&tag));
            self.write_page("tag.html", &dir, &ctx)?;
        }

        // Resume.
        {
            let jobs = self.load_resume_jobs()?;
            let skills = self.load_resume_skills()?;
            let mut ctx = self.base_context();
            ctx.insert("jobs", &jobs);
            ctx.insert("skills", &skills);
            self.write_page("resume.html", "resume", &ctx)?;
        }

        // 404.
        {
            let ctx = self.base_context();
            self.write_named("404.html", "404.html", &ctx)?;
        }

        Ok(())
    }

    /// Group projects by tag, each list sorted by the existing project order
    /// (already updated-desc).
    fn tags(&self) -> Vec<(String, Vec<ProjectView>)> {
        let views = self.project_views();
        let mut names: Vec<String> = Vec::new();
        for v in &views {
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
