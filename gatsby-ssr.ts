import { GatsbySSR } from "gatsby";
import { ReactNode, isValidElement } from "react";

/**
 * Called after every page Gatsby server renders while building HTML so you can
 * set head and body components to be rendered in your html.js
 * See https://www.gatsbyjs.org/docs/ssr-apis/#onRenderBody
 */
export const onRenderBody: GatsbySSR["onRenderBody"] = ({
  setHtmlAttributes,
}) => {
  setHtmlAttributes({ lang: "en" });
};

/**
 * Called after every page Gatsby server renders while building HTML so you can
 * replace head components to be rendered in your html.js
 * See https://www.gatsbyjs.org/docs/ssr-apis/#onPreRenderHTML
 */
export const onPreRenderHTML: GatsbySSR["onPreRenderHTML"] = ({
  getHeadComponents,
  replaceHeadComponents,
}) => {
  const headComponents = getHeadComponents().filter(removeGeneratorTag);
  replaceHeadComponents(headComponents);
};

/** Returns false for the Gatsby generator tag to remove it. */
function removeGeneratorTag(node: ReactNode): boolean {
  if (!isValidElement(node)) return true;
  return node.type !== "meta" || node.props.name !== "generator";
}
