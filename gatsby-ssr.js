/**
 * Called after every page Gatsby server renders while building HTML.
 * See https://www.gatsbyjs.org/docs/ssr-apis/#onPreRenderHTML
 */
exports.onPreRenderHTML = (
  { getHeadComponents, replaceHeadComponents },
) => {
  const headComponents = getHeadComponents()
    .filter(node => !isGeneratorTag(node)); // Remove gatsby generator tag.

  replaceHeadComponents(headComponents);
};

function isGeneratorTag({ type, props }) {
  return type === 'meta' && props?.name === 'generator';
}