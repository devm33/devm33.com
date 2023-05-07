import { Link, PageProps, graphql } from "gatsby";
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
      <div className={css.title}>
        <h3 className={css.header}>
          Projects tagged {}
          <span className={`${pill} ${css.titlePill}`}>{pageContext.tag}</span>
        </h3>
        <Link to="/projects">View all</Link>
      </div>
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
