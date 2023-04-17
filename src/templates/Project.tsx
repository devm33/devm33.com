import { graphql, Link, PageProps } from "gatsby";
import React from "react";

import { GitHubIcon, LinkIcon } from "../components/Icons";
import { Layout } from "../components/Layout";
import { pill, pillGroup } from "../components/Pill.module.css";
import { subtitle } from "./Project.module.css";

export { Head } from "../components/Head";

type Props = PageProps<Queries.ProjectPageQuery>;

export default function ProjectTemplate(props: Props) {
  const { frontmatter, html } = props.data.markdownRemark ?? {};
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
