---
title: Gulp Angular Templates
updated: 2019-05-22
image: screenshot.png
tagline: Gulp plugin to inline Angular template strings into js during build.
tags: [gulp, angular]
link: https://www.npmjs.com/package/gulp-ng-template-strings
repo: https://github.com/devm33/gulp-ng-template-strings
---

This gulp plugin takes angular components with templates defined in separate
html files and inlines them into the js component definition. It also minifies
the html with [html-minifier](https://github.com/kangax/html-minifier).

For the following input files:

`tab.js`

```js
function tabDirective() {
  return {
    templateUrl: "tab.html",
  };
}
```

`tab.html`

```html
<ul>
  <li>Tab</li>
</ul>
```

The plugin would output the following js:

```js
function tabDirective() {
  return {
    templateUrl: "<ul><li>Tab</li></ul>",
  };
}
```

I built this plugin because I was over optimizing another side project using
Angular. Building it served as a nice learning experience for the gulp plugin
ecosystem. There were a lot of well maintained and well tested plugins to
emulate.
