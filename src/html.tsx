import React, {
  HTMLAttributes,
  HtmlHTMLAttributes,
  ReactNode,
  isValidElement,
} from "react";

interface Props {
  body: string;
  bodyAttributes: HTMLAttributes<HTMLBodyElement>;
  headComponents: ReactNode;
  postBodyComponents: ReactNode;
  preBodyComponents: ReactNode;
  htmlAttributes: HtmlHTMLAttributes<HTMLHtmlElement>;
}

export default function HTML(props: Props) {
  return (
    <html lang="en" {...props.htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@devm33" />
        <meta name="fb:app_id" content="477033866176272" />
        <meta name="og:type" content="article" />
        <link
          rel="preload"
          href="/fonts/mulish.woff2"
          as="font"
          crossOrigin="anonymous"
          type="font/woff2"
        />
        {filterHeadComponents(props.headComponents)}
      </head>
      <body {...props.bodyAttributes}>
        {props.preBodyComponents}
        <div
          key={`body`}
          id="___gatsby"
          dangerouslySetInnerHTML={{ __html: props.body }}
        />
        {props.postBodyComponents}
      </body>
    </html>
  );
}

/** Filters the headComponents if array */
function filterHeadComponents(headComponents: ReactNode): ReactNode {
  if (!Array.isArray(headComponents)) return headComponents;
  return headComponents.filter(removeGenerator);
}

/** Returns false for the Gatsby generator tag to filter it. */
function removeGenerator(node: ReactNode): boolean {
  if (!isValidElement(node)) return true;
  if (node.type === "meta" && node.props.name === "generator") return false;
  return true;
}
