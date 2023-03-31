/**
 * Called after every page Gatsby server renders while building HTML so you can
 * set head and body components to be rendered in your html.js
 * See https://www.gatsbyjs.org/docs/ssr-apis/#onRenderBody
 */
exports.onRenderBody = ({ setHtmlAttributes }) => {
  setHtmlAttributes({ lang: 'en' });
};

/**
 * Called after every page Gatsby server renders while building HTML so you can
 * replace head components to be rendered in your html.js
 * See https://www.gatsbyjs.org/docs/ssr-apis/#onPreRenderHTML
 */
exports.onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
  const headComponents = getHeadComponents().filter(removeGeneratorTag);
  replaceHeadComponents(headComponents);
};

/** Returns false for the Gatbsy generator tag to remove it. */
function removeGeneratorTag({ type, props }) {
  return type !== 'meta' || props?.name !== 'generator';
}