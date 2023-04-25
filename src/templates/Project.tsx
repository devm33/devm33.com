import { graphql, Link, PageProps } from "gatsby";
import React from "react";

import "prismjs/themes/prism.min.css";

import { Icon, Icons } from "@components/Icons";
import { Layout } from "@components/Layout";
import { pill, pillGroup } from "@components/Pill.module.css";
import { subtitle } from "./Project.module.css";

export { Head } from "@components/Head";

interface PageContext {
  katex: boolean;
}

type Props = PageProps<Queries.ProjectPageQuery, PageContext>;

export default function ProjectTemplate(props: Props) {
  if (props.pageContext.katex) {
    import("katex/dist/katex.min.css");
  }
  const { frontmatter, html } = props.data.markdownRemark;
  return (
    <Layout>
      <article>
        <header>
          <h1>{frontmatter.title}</h1>
          <div className={subtitle}>
            <i>Last updated {frontmatter.updated}</i>
            <div className={pillGroup}>
              {frontmatter.repo && (
                <a
                  aria-label="GitHub repo"
                  className={pill}
                  href={frontmatter.repo}
                >
                  Source
                  <Icon icon={Icons.GitHub} />
                </a>
              )}
              {frontmatter.link && (
                <a
                  aria-label="Project link"
                  className={pill}
                  href={frontmatter.link}
                >
                  Link
                  <Icon icon={Icons.Link} />
                </a>
              )}
            </div>
            <div className={pillGroup}>
              {frontmatter.tags.map((tag) => (
                <Link key={tag} className={pill} to={`/tag/${tag}/`}>
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </header>
        {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
        <div dangerouslySetInnerHTML={{ __html: html! }} />
      </article>
    </Layout>
  );
}

export const query = graphql`
  query ProjectPage($path: String!) {
    markdownRemark(fields: { path: { eq: $path } }) {
      html
      frontmatter {
        title
        updated(formatString: "YYYY-MM-DD")
        tagline
        tags
        link
        repo
        image {
          childImageSharp {
            gatsbyImageData(width: 1000)
          }
        }
      }
    }
  }
`;
