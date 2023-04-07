import { graphql, Link, PageProps } from "gatsby";
import React from "react";

import { GitHubIcon, LinkIcon } from "../components/Icons";
import { Layout } from "../components/Layout";
import { pill, pillGroup } from "../components/Pill.module.css";
import { subtitle } from "./Project.module.css";

export { Head } from "../components/Head";

interface PageContext {
  katex: boolean;
  prism: boolean;
}

export default function ProjectTemplate({
  data,
  pageContext,
}: PageProps<Queries.ProjectPageQuery, PageContext>) {
  if (pageContext.katex) {
    import("katex/dist/katex.min.css");
  }
  if (pageContext.prism) {
    import("prismjs/themes/prism.min.css");
  }
  const { frontmatter, html } = data.markdownRemark!;
  if (!frontmatter || !html) throw new Error("Missing required page data");
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
                  <GitHubIcon />
                </a>
              )}
              {frontmatter.link && (
                <a
                  aria-label="Project link"
                  className={pill}
                  href={frontmatter.link}
                >
                  Link
                  <LinkIcon />
                </a>
              )}
            </div>
            <div className={pillGroup}>
              {frontmatter.tags?.map((tag) => (
                <Link key={tag} className={pill} to={`/tag/${tag}/`}>
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </header>
        <div dangerouslySetInnerHTML={{ __html: html }} />
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
