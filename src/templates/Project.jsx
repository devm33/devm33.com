import { graphql, Link } from "gatsby";
import React from "react";
import styled from "styled-components";

import { GitHubIcon, LinkIcon } from "../components/Icons";
import { Layout } from "../components/Layout";
import Pills from "../components/Pills";
import theme from "../theme";
import { rhythm } from "../typography";

export { Head } from "../components/Head";

const Article = styled.article`
  margin: 0 auto;
  width: 80%;
  max-width: ${theme.contentWidth}px;
`;

const Subtitle = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${rhythm(3 / 4)};
  & > span {
    margin-bottom: ${rhythm(1 / 4)};
  }
  ${theme.font.small}
`;

const Updated = styled.span`
  font-style: italic;
`;

export default function ProjectTemplate({
  data: { markdownRemark: { frontmatter, html } },
  pageContext: { katex, prism },
}) {
  if (katex) {
    import("katex/dist/katex.min.css");
  }
  if (prism) {
    import("prismjs/themes/prism.min.css");
  }
  return (
    <Layout>
      <Article>
        <header>
          <h1>{frontmatter.title}</h1>
          <Subtitle>
            <Updated>Last updated {frontmatter.updated}</Updated>
            <Pills>
              {frontmatter.repo && (
                <a href={frontmatter.repo} aria-label="GitHub repo">
                  Source
                  <GitHubIcon />
                </a>
              )}
              {frontmatter.link && (
                <a href={frontmatter.link} aria-label="Project link">
                  Link
                  <LinkIcon />
                </a>
              )}
            </Pills>
            <Pills>
              {frontmatter.tags.map(tag => (
                <Link key={tag} to={`/tag/${tag}/`}>
                  {tag}
                </Link>
              ))}
            </Pills>
          </Subtitle>
        </header>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </Article>
    </Layout>
  );
}

export const query = graphql`
  query($path: String!) {
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
