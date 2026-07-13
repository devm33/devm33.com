#!/usr/bin/env bash
# Production build (Netlify): compile the Rust SSG, which runs the Temml math
# pre-pass and PrismJS highlighting via Node internally. This is a pure Rust
# build — no browser is needed. The resume PDF and page screenshots are
# generated and committed by the GitHub Actions "visuals" workflow (see
# .github/workflows/visuals.yml); the resume PDF is served from the checked-in
# static/devraj_mehta_resume.pdf.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export SSG_ROOT="$ROOT"

# Netlify's build image may not ship a Rust toolchain; install on demand.
if ! command -v cargo >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
  # shellcheck disable=SC1091
  source "$HOME/.cargo/env"
fi

cargo run --release --locked --manifest-path "$ROOT/ssg/Cargo.toml"
