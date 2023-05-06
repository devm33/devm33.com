import { graphql, PageProps } from "gatsby";
import React from "react";

import "../prism.css";

import { Layout } from "@components/Layout";
import { ProjectHeader } from "@components/Project";

export { Head } from "@components/Head";

interface PageContext {
  katex: boolean;
}

type Props = PageProps<Queries.ProjectPageQuery, PageContext>;

export default function ProjectTemplate({ data, pageContext }: Props) {
  if (pageContext.katex) {
    import("katex/dist/katex.min.css");
  }
  return (
    <Layout>
      <article>
        <ProjectHeader project={data.markdownRemark} />
        {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
        <div dangerouslySetInnerHTML={{ __html: data.markdownRemark.html! }} />
      </article>
    </Layout>
  );
}

export const query = graphql`
  query ProjectPage($path: String!) {
    markdownRemark(fields: { path: { eq: $path } }) {
      html
      ...ProjectFields
    }
  }
`;
