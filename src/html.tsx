import React, { HTMLAttributes, HtmlHTMLAttributes, ReactNode } from "react";

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
    <html {...props.htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@devm33" />
        <meta name="fb:app_id" content="477033866176272" />
        <meta name="og:type" content="article" />
        {props.headComponents}
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
