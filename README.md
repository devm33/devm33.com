# [devm33.com](https://devm33.com)

[![Netlify Status](https://api.netlify.com/api/v1/badges/c78b918f-2b19-453b-9db9-492b844a6e6d/deploy-status)](https://app.netlify.com/sites/devm33-com/deploys)
[![Maintainability](https://api.codeclimate.com/v1/badges/105482f3c9c668c64fc9/maintainability)](https://codeclimate.com/github/devm33/devm33.com/maintainability)

Website built with [gatsby](https://www.gatsbyjs.org).

## Setup

Install:

```sh
npm install
```

Run locally:

```sh
npm start
```

## TODO

- [ ] Replace mulish webfont with full webfont, use it everywhere
- [ ] Set cache headers on katex and prism css files, ideally immutable
- [ ] Unify layout across pages
- [ ] Use https://www.gatsbyjs.com/docs/how-to/performance/using-slices/
- [ ] Replace project grid with list (maybe remove thumbnails)
- [ ] Fix variable font-weight on resume
- [ ] Add dark mode
- [ ] Add rss: https://www.gatsbyjs.com/plugins/gatsby-plugin-feed/

### Projects to add:

- [ ] Minichat apps exploration.
- [ ] https://github.com/devm33/sugarscape-cuda
- [ ] https://github.com/devm33/words/
- [ ] https://github.com/devm33/single_monitor

## Done

- [x] Fix katex fonts by leveraging webpack to separate katex css
- [x] Remove css splitting
- [x] Make katex/prism css available on development using bootstrap hook
- [x] Bypass webpack css splitting by loading katex and prism css via link
- [x] Add plugin to sort css properties alphabetically
- [x] Add stylelint
- [x] Add GitHub actions for linting and formatting
- [x] Update linting setup
- [x] Add editorconfig
- [x] Migrate to TypeScript
- [x] Remove typography.js
- [x] Migrate from styled-components to native CSS modules
- [x] Conditionally lazy load prism css on project template
- [x] Limit katex css to pages that use it
- [x] Use html.js to remove unnecessary meta tags.
- [x] Remove html.jsx
- [x] On project page avoid inline SVG duplication
- [x] Load webfont inline on resume page
- [x] Limit katex to project pages
- [x] Switch to
      [gatsby-head](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/)
- [x] Finish cleaning up gatsby-plugin-image migration
- [x] Migrate from Gatsby 2.x to 5.x
- [x] This site :)
- [x] Add image tags to Meta component and use on all pages with fallback.
- [x] Previous site - jekyll-netlify

### Launch checklist:

- [x] Write gulp angular template page.
- [x] Write yearclock page.
- [x] Write countdown page.
- [x] Write tabstopper page.
- [x] Write pong page.
- [x] Write fair coin flip page.
- [x] Write minimal universal exponent.
- [x] Port motivation page and add redirect.
- [x] Port jekyll-nfs post and add redirect.
- [x] Port 4clojure post and add redirect.
- [x] Add tag/category pages.
- [x] Write about page.
- [x] Add resume page (linked from about) (also generate pdf version)
- [x] Check https://devm33.com/sitemap.xml
- [x] Superimpose git history onto devm33 repo.
- [x] Copy static files: google verification, keybase, robots.txt
