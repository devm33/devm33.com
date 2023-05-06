import { PageProps, graphql } from "gatsby";
import React from "react";

import { Layout } from "@components/Layout";
import { pill } from "@components/Pill.module.css";
import { ProjectList } from "@components/Project";
import * as css from "./Tag.module.css";

export { Head } from "@components/Head";

interface PageContext {
  tag: string;
}

type Props = PageProps<Queries.TagPageQuery, PageContext>;

export default function TagTemplate({ data, pageContext }: Props) {
  return (
    <Layout>
      <h3 className={css.title}>
        Projects tagged {}
        <span className={`${pill} ${css.titlePill}`}>{pageContext.tag}</span>
      </h3>
      <ProjectList {...data.allMarkdownRemark} />
    </Layout>
  );
}

export const query = graphql`
  query TagPage($tag: String!) {
    allMarkdownRemark(
      filter: { frontmatter: { tags: { eq: $tag } } }
      sort: { frontmatter: { updated: DESC } }
    ) {
      nodes {
        ...ProjectFields
      }
    }
  }
`;
