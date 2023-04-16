import { GatsbySSR } from "gatsby";
import React, { ReactNode, isValidElement } from "react";

/** See https://www.gatsbyjs.org/docs/ssr-apis/#onRenderBody */
export const onRenderBody: GatsbySSR["onRenderBody"] = (args) => {
  // Set html lang attribute
  args.setHtmlAttributes({ lang: "en" });
  // Set static head components present on all pages
  args.setHeadComponents([
    <meta key="twitter:card" name="twitter:card" content="summary" />,
    <meta key="twitter:site" name="twitter:site" content="@devm33" />,
    <meta key="fb:app_id" name="fb:app_id" content="477033866176272" />,
    <meta key="og:type" name="og:type" content="article" />,
  ]);
};

/** See https://www.gatsbyjs.org/docs/ssr-apis/#onPreRenderHTML */
export const onPreRenderHTML: GatsbySSR["onPreRenderHTML"] = (args) => {
  const head = args.getHeadComponents();
  args.replaceHeadComponents(head.filter(removeTags).map(modifyTags));
};

/** Returns false to remove unwanted tags from <head>. */
function removeTags(node: ReactNode): boolean {
  if (!isValidElement(node)) return true;
  if (node.type !== "meta") return true; // Only removing meta tags
  if (node.props.name === "generator") return false; // Gatsby generator tag
  if (node.props.httpEquiv === "x-ua-compatible") return false; // IE tag
  return true;
}

/** Returns modified <head> tags. */
function modifyTags(node: ReactNode): ReactNode {
  if (!isValidElement(node)) return node;
  if (node.type === "meta" && node.props.name === "viewport") {
    return (
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    );
  }
  return node;
}
