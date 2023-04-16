import { GatsbySSR } from "gatsby";
import React, { ReactNode, isValidElement } from "react";

/** See https://www.gatsbyjs.org/docs/ssr-apis/#onRenderBody */
export const onRenderBody: GatsbySSR["onRenderBody"] = (args) => {
  // Set html lang attribute
  args.setHtmlAttributes({ lang: "en" });
  // Set static head components present on all pages
  args.setHeadComponents([
    <meta key="charSet" charSet="utf-8" />,
    <meta key="twitter:card" name="twitter:card" content="summary" />,
    <meta key="twitter:site" name="twitter:site" content="@devm33" />,
    <meta key="fb:app_id" name="fb:app_id" content="477033866176272" />,
    <meta key="og:type" name="og:type" content="article" />,
  ]);
};

/** See https://www.gatsbyjs.org/docs/ssr-apis/#onPreRenderHTML */
export const onPreRenderHTML: GatsbySSR["onPreRenderHTML"] = (args) => {
  args.replaceHeadComponents(args.getHeadComponents().filter(removeTags));
};

/** Returns false to remove unwanted tags from <head>. */
function removeTags(node: ReactNode): boolean {
  if (!isValidElement(node)) return true;
  if (node.type !== "meta") return true; // Only removing meta tags
  if (node.props.name === "generator") return false; // Gatsby generator tag
  if (node.props.name === "x-ua-compatible") return false; // IE tag
  return true;
}
