import React from "react";
import { Link, graphql } from "gatsby";
import styled from "styled-components";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

import "katex/dist/katex.min.css";
import "prismjs/themes/prism.css";

import theme from "../theme";
import { rhythm } from "../typography";
import Layout from "../components/Layout";
import Pills from "../components/Pills";

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

const ProjectTemplate = ({
  data: {
    markdownRemark: { frontmatter, html },
  },
}) => (
  <Layout title={frontmatter.title}>
    <Article>
      <header>
        <h1>{frontmatter.title}</h1>
        <Subtitle>
          <Updated>Last updated {frontmatter.updated}</Updated>
          <Pills>
            <a href={frontmatter.repo} aria-label="GitHub repo">
              Source
              <FaGithub />
            </a>
            <a href={frontmatter.link} aria-label="Project link">
              Link
              <FaExternalLinkAlt />
            </a>
          </Pills>
          <Pills>
            {frontmatter.tags.map(tag => (
              <Link key={tag} to={`/tag/${tag}`}>
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

export const query = graphql`
  query($path: String!) {
    markdownRemark(fields: { path: { eq: $path } }) {
      html
      frontmatter {
        title
        updated(formatString: "YYYY-MM-DD")
        tags
        link
        repo
      }
    }
  }
`;

export default ProjectTemplate;
