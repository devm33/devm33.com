import { GatsbySSR } from "gatsby";
import React, { ReactNode, isValidElement } from "react";

/**
 * Called after every page Gatsby server renders while building HTML so you can
 * set head and body components to be rendered in your html.js
 * See https://www.gatsbyjs.org/docs/ssr-apis/#onRenderBody
 */
export const onRenderBody: GatsbySSR["onRenderBody"] = ({
  setHeadComponents,
  setHtmlAttributes,
}) => {
  // Set html lang attribute
  setHtmlAttributes({ lang: "en" });
  // Set static head components present on all pages
  setHeadComponents([
    <meta charSet="utf-8" />,
    <meta name="viewport" content="width=device-width, initial-scale=1" />,
    <meta name="twitter:card" content="summary" />,
    <meta name="twitter:site" content="@devm33" />,
    <meta name="fb:app_id" content="477033866176272" />,
    <meta name="og:type" content="article" />,
  ]);
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
  // Remove Gatsby generator meta tag
  const headComponents = getHeadComponents().filter(removeGeneratorTag);
  replaceHeadComponents(headComponents);
};

/** Returns false for the Gatsby generator tag to remove it. */
function removeGeneratorTag(node: ReactNode): boolean {
  if (!isValidElement(node)) return true;
  return node.type !== "meta" || node.props.name !== "generator";
}
