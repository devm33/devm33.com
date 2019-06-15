import React from "react";
import { graphql, Link } from "gatsby";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import styled from "styled-components";
import Img from "gatsby-image";
import PropTypes from "prop-types";

import { theme, scale, rhythm } from "../style";
import Pills from "./Pills";

const minTileSize = "300px";

const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${minTileSize}, 1fr));
`;

// Ensure a minimum number of grid cells
const GridFiller = styled.div`
  @media (max-width: ${minTileSize}) {
    display: none;
  }
`;

const Card = styled.div`
  position: relative;
  height: 100%;
`;

const OverlayLink = styled(Link)`
  position: absolute;
  height: 100%;
  width: 100%;
`;

const TitleLink = styled(Link)`
  ${scale(1 / 2)}
  padding-top: ${rhythm(1)};
  padding-bottom: ${rhythm(1)};
  text-align: center;
  z-index: 1;
`;

const Subtitle = styled.div`
  ${theme.font.small}
  flex: 0;
  transition: flex 0.5s ease-in-out;
  overflow: hidden;
  width: 100%;
  z-index: 1;
  pointer-events: none;
  a {
    pointer-events: all;
  }
  & > * {
    padding-bottom: ${rhythm(1 / 2)};
    padding-left: ${rhythm(1)};
    padding-right: ${rhythm(1)};
  }
`;

const Updated = styled.span`
  font-style: italic;
`;

const Links = styled.span`
  ${theme.font.icon}
  a {
    margin-left: ${rhythm(1 / 2)};
    /* Sad hack for alignment with text: */
    position: relative;
    top: 3px;
  }
`;

const Overlay = styled.div`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  background: linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(255, 255, 255, 0) 35%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  &:before {
    background-color: rgba(255, 255, 255, 0.92);
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: opacity 0.5s ease-in-out;
    opacity: 0;
  }
  &:hover {
    &:before {
      opacity: 1;
    }
    ${Subtitle} {
      flex: 1;
    }
  }
  @media (any-hover: none) {
    &:before {
      opacity: 1;
    }
    ${Subtitle} {
      flex: 1;
    }
  }
`;

const ProjectGrid = ({ nodes }) => (
  <Grid>
    {nodes.map(node => (
      <Card key={node.fields.path}>
        <Img fluid={node.frontmatter.image.childImageSharp.fluid} />
        <Overlay>
          <OverlayLink
            to={node.fields.path}
            aria-label={node.frontmatter.title}
          />
          <TitleLink to={node.fields.path}>{node.frontmatter.title}</TitleLink>
          <Subtitle>
            <div>{node.frontmatter.tagline}</div>
            <Pills>
              {node.frontmatter.tags.map(tag => (
                <Link key={tag} to={`/tag/${tag}`} activeClassName="active">
                  {tag}
                </Link>
              ))}
            </Pills>
            <div>
              <Updated>Last updated: {node.frontmatter.updated}</Updated>
              <Links>
                <a href={node.frontmatter.repo} aria-label="GitHub repo">
                  <FaGithub />
                </a>
                <a href={node.frontmatter.link} aria-label="Project demo">
                  <FaExternalLinkAlt />
                </a>
              </Links>
            </div>
          </Subtitle>
        </Overlay>
      </Card>
    ))}
    <GridFiller />
    <GridFiller />
    <GridFiller />
  </Grid>
);
ProjectGrid.propTypes = {
  nodes: PropTypes.arrayOf(
    PropTypes.shape({
      fields: PropTypes.shape({
        path: PropTypes.string,
      }),
      frontmatter: PropTypes.shape({
        title: PropTypes.string,
        updated: PropTypes.string,
        tagline: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string),
        link: PropTypes.string,
        repo: PropTypes.string,
        image: PropTypes.object,
      }),
    })
  ),
};

export default ProjectGrid;

export const fragment = graphql`
  fragment ProjectGridFields on MarkdownRemark {
    fields {
      path
    }
    frontmatter {
      title
      updated(formatString: "YYYY-MM-DD")
      tagline
      tags
      link
      repo
      image {
        childImageSharp {
          fluid(maxWidth: 500, maxHeight: 500) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  }
`;
