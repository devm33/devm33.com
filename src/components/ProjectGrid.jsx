import React from "react";
import { graphql, Link, navigate } from "gatsby";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import styled from "styled-components";
import PropTypes from "prop-types";
import { GatsbyImage, getImage } from "gatsby-plugin-image";

import theme from "../theme";
import { scale, rhythm } from "../typography";
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
  width: 100%;
  padding-top: ${rhythm(1)};
  padding-bottom: ${rhythm(1)};
  text-align: center;
  background-color: #ffffffec;
  z-index: 1;
`;

const Subtitle = styled.div`
  background-color: #ffffffec;
  ${theme.font.small}
  flex: 0;
  transition: flex 0.3s ease-in-out;
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
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  &:hover {
    ${Subtitle} {
      flex: 1;
    }
  }
  @media (any-hover: none) {
    ${Subtitle} {
      flex: 1;
    }
  }
`;

const ProjectGrid = ({ nodes }) => (
  <Grid>
    {nodes.map(node => (
      <Card key={node.fields.path} onClick={_ => navigate(node.fields.path)}>
        <GatsbyImage image={getImage(node.frontmatter.image)} alt="" />
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
                <Link
                  key={tag}
                  to={`/tag/${tag}/`}
                  activeClassName="active"
                  onClick={e => e.stopPropagation()}
                >
                  {tag}
                </Link>
              ))}
            </Pills>
            <div>
              <Updated>Last updated: {node.frontmatter.updated}</Updated>
              <Links>
                {node.frontmatter.repo && (
                  <a
                    href={node.frontmatter.repo}
                    aria-label="GitHub repo"
                    onClick={e => e.stopPropagation()}
                  >
                    <FaGithub />
                  </a>
                )}
                {node.frontmatter.link && (
                  <a
                    href={node.frontmatter.link}
                    aria-label="Project link"
                    onClick={e => e.stopPropagation()}
                  >
                    <FaExternalLinkAlt />
                  </a>
                )}
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
          gatsbyImageData(
            width: 500,
            height: 500,
            breakpoints: [300, 400],
            placeholder: BLURRED,
            formats: [AUTO, WEBP, AVIF]
          )
        }
      }
    }
  }
`;
