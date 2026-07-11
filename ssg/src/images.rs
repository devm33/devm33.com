use anyhow::{Context, Result};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::path::{Path, PathBuf};

/// Body content width (matches `body { max-width: 700px }` in the CSS).
const MAX_WIDTH: u32 = 700;
/// Candidate widths for responsive `srcset` (never upscaled past the source).
const CANDIDATE_WIDTHS: [u32; 4] = [175, 350, 525, 700];
const WEBP_QUALITY: f32 = 78.0;
const SIZES: &str = "(max-width: 700px) 100vw, 700px";

/// Processes body images for a single project: resizes, encodes WebP plus a
/// same-format fallback, writes them into the output directory, and returns
/// responsive `<picture>` markup (analogous to `gatsby-remark-images`).
pub struct ImageProcessor {
    /// Directory the markdown lives in (image paths are relative to it).
    src_dir: PathBuf,
    /// Output directory for this project's assets (e.g. `public/projects/pong`).
    out_dir: PathBuf,
    /// URL prefix for emitted assets (e.g. `/projects/pong/`).
    url_prefix: String,
}

impl ImageProcessor {
    pub fn new(src_dir: PathBuf, out_dir: PathBuf, url_prefix: String) -> Self {
        ImageProcessor {
            src_dir,
            out_dir,
            url_prefix,
        }
    }

    /// Render one markdown image reference to responsive HTML.
    pub fn process(&self, dest_url: &str, alt: &str) -> Result<String> {
        // Leave external / absolute references untouched.
        if is_external(dest_url) {
            return Ok(format!(
                "<img src=\"{}\" alt=\"{}\" />",
                dest_url,
                escape(alt)
            ));
        }
        let rel = dest_url.trim_start_matches("./");
        let src = self.src_dir.join(rel);
        let stem = Path::new(rel)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("image");
        let ext = Path::new(rel)
            .extension()
            .and_then(|s| s.to_str())
            .unwrap_or("")
            .to_ascii_lowercase();
        let hash = hash_file(&src).with_context(|| format!("hashing image {}", src.display()))?;

        std::fs::create_dir_all(&self.out_dir)?;

        // Animated GIFs must pass through unchanged (the decoder would flatten
        // them to a single frame).
        if ext == "gif" {
            let (w, h) = image::image_dimensions(&src)
                .with_context(|| format!("reading dimensions of {}", src.display()))?;
            let name = format!("{stem}.{hash}.gif");
            std::fs::copy(&src, self.out_dir.join(&name))
                .with_context(|| format!("copying {}", src.display()))?;
            let url = format!("{}{}", self.url_prefix, name);
            return Ok(wrap(format!(
                "<img src=\"{url}\" alt=\"{}\" width=\"{w}\" height=\"{h}\" loading=\"lazy\" decoding=\"async\" />",
                escape(alt)
            )));
        }

        let img = image::open(&src).with_context(|| format!("decoding {}", src.display()))?;
        let (ow, oh) = (img.width(), img.height());
        let widths = candidate_widths(ow);

        // WebP variants.
        let mut srcset = Vec::new();
        for &w in &widths {
            let resized = resize_to(&img, w, ow, oh);
            let rgba = resized.to_rgba8();
            let encoded =
                webp::Encoder::from_rgba(&rgba, resized.1, resized.2).encode(WEBP_QUALITY);
            let name = format!("{stem}.{hash}.{w}.webp");
            std::fs::write(self.out_dir.join(&name), &*encoded)
                .with_context(|| format!("writing {name}"))?;
            srcset.push(format!("{}{} {}w", self.url_prefix, name, resized.1));
        }

        // Same-format fallback at the largest candidate width.
        let fw = *widths.last().unwrap();
        let fallback = resize_to(&img, fw, ow, oh);
        let fh = fallback.2;
        let fallback_name = format!("{stem}.{hash}.{fw}.{ext}");
        fallback
            .0
            .save(self.out_dir.join(&fallback_name))
            .with_context(|| format!("writing {fallback_name}"))?;
        let fallback_url = format!("{}{}", self.url_prefix, fallback_name);

        Ok(wrap(format!(
            "<picture><source type=\"image/webp\" srcset=\"{srcset}\" sizes=\"{SIZES}\" /><img src=\"{fallback_url}\" alt=\"{alt}\" width=\"{fw}\" height=\"{fh}\" loading=\"lazy\" decoding=\"async\" /></picture>",
            srcset = srcset.join(", "),
            alt = escape(alt),
        )))
    }

    /// Copy a local non-image file linked from markdown (e.g. a PDF).
    #[allow(dead_code)] // No such links exist today; retained as a future guard.
    pub fn copy_linked(&self, dest_url: &str) -> Result<Option<String>> {
        if is_external(dest_url) {
            return Ok(None);
        }
        let rel = dest_url.trim_start_matches("./");
        let src = self.src_dir.join(rel);
        if !src.exists() {
            return Ok(None);
        }
        let name = Path::new(rel)
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("file");
        std::fs::create_dir_all(&self.out_dir)?;
        std::fs::copy(&src, self.out_dir.join(name))?;
        Ok(Some(format!("{}{}", self.url_prefix, name)))
    }

    /// Produce a square thumbnail (center-cropped) at `size` with a 2x variant
    /// when the source allows, plus an average-color placeholder.
    pub fn thumbnail(&self, filename: &str, size: u32) -> Result<Thumb> {
        let src = self.src_dir.join(filename);
        let hash = hash_file(&src).with_context(|| format!("hashing {}", src.display()))?;
        let stem = Path::new(filename)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("thumb");
        let ext = Path::new(filename)
            .extension()
            .and_then(|s| s.to_str())
            .unwrap_or("png")
            .to_ascii_lowercase();
        let img = image::open(&src).with_context(|| format!("decoding {}", src.display()))?;
        let square = crop_square(&img);
        let side = square.width();
        let color = avg_color(&square);
        std::fs::create_dir_all(&self.out_dir)?;

        let base = size.min(side);
        let mut widths = vec![base];
        if side >= size * 2 {
            widths.push(size * 2);
        }

        let mut srcset = Vec::new();
        for &w in &widths {
            let resized = square.resize_exact(w, w, image::imageops::FilterType::Lanczos3);
            let rgba = resized.to_rgba8().into_raw();
            let encoded = webp::Encoder::from_rgba(&rgba, w, w).encode(WEBP_QUALITY);
            let name = format!("{stem}.{hash}.{w}.webp");
            std::fs::write(self.out_dir.join(&name), &*encoded)
                .with_context(|| format!("writing {name}"))?;
            srcset.push(format!("{}{} {}w", self.url_prefix, name, w));
        }

        let fallback_name = format!("{stem}.{hash}.{base}.{ext}");
        square
            .resize_exact(base, base, image::imageops::FilterType::Lanczos3)
            .save(self.out_dir.join(&fallback_name))
            .with_context(|| format!("writing {fallback_name}"))?;

        Ok(Thumb {
            srcset: srcset.join(", "),
            fallback: format!("{}{}", self.url_prefix, fallback_name),
            color,
            size,
        })
    }

    /// Produce an Open Graph image (resized to at most `max`, original format)
    /// and return its absolute-from-root URL path.
    pub fn social(&self, filename: &str, max: u32) -> Result<String> {
        let src = self.src_dir.join(filename);
        let hash = hash_file(&src).with_context(|| format!("hashing {}", src.display()))?;
        let stem = Path::new(filename)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("og");
        let ext = Path::new(filename)
            .extension()
            .and_then(|s| s.to_str())
            .unwrap_or("png")
            .to_ascii_lowercase();
        let img = image::open(&src).with_context(|| format!("decoding {}", src.display()))?;
        let (ow, oh) = (img.width(), img.height());
        let resized = resize_to(&img, max, ow, oh);
        std::fs::create_dir_all(&self.out_dir)?;
        let name = format!("{stem}.{hash}.og.{ext}");
        resized
            .0
            .save(self.out_dir.join(&name))
            .with_context(|| format!("writing {name}"))?;
        Ok(format!("{}{}", self.url_prefix, name))
    }
}

/// A square project/headshot thumbnail exposed to templates.
#[derive(Debug, Clone, serde::Serialize)]
pub struct Thumb {
    /// WebP `srcset` string.
    pub srcset: String,
    /// Same-format fallback URL.
    pub fallback: String,
    /// Average-color placeholder (hex) to avoid layout flash.
    pub color: String,
    /// Display size in CSS pixels.
    pub size: u32,
}

/// Center-crop to the largest square.
fn crop_square(img: &image::DynamicImage) -> image::DynamicImage {
    let (w, h) = (img.width(), img.height());
    let s = w.min(h);
    let x = (w - s) / 2;
    let y = (h - s) / 2;
    img.crop_imm(x, y, s, s)
}

/// Average color of an image as a `#rrggbb` hex string.
fn avg_color(img: &image::DynamicImage) -> String {
    let small = img.resize_exact(1, 1, image::imageops::FilterType::Triangle);
    let px = small.to_rgb8();
    let p = px.get_pixel(0, 0);
    format!("#{:02x}{:02x}{:02x}", p[0], p[1], p[2])
}

/// A resized image bundled with its dimensions.
struct Resized(image::DynamicImage, u32, u32);

impl Resized {
    fn to_rgba8(&self) -> Vec<u8> {
        self.0.to_rgba8().into_raw()
    }
}

fn resize_to(img: &image::DynamicImage, target: u32, ow: u32, oh: u32) -> Resized {
    if target >= ow {
        return Resized(img.clone(), ow, oh);
    }
    let h = ((oh as u64 * target as u64) / ow as u64).max(1) as u32;
    let resized = img.resize_exact(target, h, image::imageops::FilterType::Lanczos3);
    Resized(resized, target, h)
}

/// Candidate widths not exceeding the source width, always including the
/// largest available up to `MAX_WIDTH`.
fn candidate_widths(ow: u32) -> Vec<u32> {
    let cap = ow.min(MAX_WIDTH);
    let mut ws: Vec<u32> = CANDIDATE_WIDTHS
        .iter()
        .copied()
        .filter(|&w| w < cap)
        .collect();
    ws.push(cap);
    ws.dedup();
    ws
}

fn is_external(url: &str) -> bool {
    url.starts_with("http://")
        || url.starts_with("https://")
        || url.starts_with('/')
        || url.starts_with("data:")
}

fn wrap(inner: String) -> String {
    format!("<span class=\"image-wrapper\">{inner}</span>")
}

fn escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

fn hash_file(path: &Path) -> Result<String> {
    let bytes = std::fs::read(path).with_context(|| format!("reading {}", path.display()))?;
    let mut hasher = DefaultHasher::new();
    bytes.hash(&mut hasher);
    Ok(format!("{:016x}", hasher.finish()))
}
