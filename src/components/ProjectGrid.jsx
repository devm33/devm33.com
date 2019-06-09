import React from "react";
import { graphql, Link } from "gatsby";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import styled from "styled-components";
import Img from "gatsby-image";
import PropTypes from "prop-types";

const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

// Ensure a minimum number of grid cells
const GridFiller = styled.div`
  @media (max-width: 300px) {
    display: none;
  }
`;

const Card = styled.div`
  position: relative;
  &:before {
    content: "";
    display: block;
    padding-top: 100%;
  }
`;

const Content = styled.div`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

const OverlayLink = styled(Link)`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

const TitleLink = styled(Link)`
  font-size: 1.3rem;
  padding: 1.5rem 0 1rem 0;
  text-align: center;
  z-index: 1;
`;

const Subtitle = styled.div`
  flex: 0;
  transition: flex 0.5s ease-in-out;
  overflow: hidden;
  font-size: 0.9rem;
  width: 100%;
  z-index: 1;
  pointer-events: none;
  div {
    padding: 0.5rem 1rem;
  }
`;

const Updated = styled.span`
  font-style: italic;
`;

const Tags = styled.div`
  pointer-events: auto; /* override parent Subtitle */
  a:not(:first-child) {
    margin-left: 0.5rem;
  }
`;

export const Tag = styled(Link)`
  border-radius: 0.5em;
  border: 1px solid ${props => props.theme.link};
  padding: 0.2em 0.5em;
  &.active,
  &:hover {
    border-color: ${props => props.theme.accent};
    background-color: ${props => props.theme.accent};
    color: white !important;
  }
`;

const Links = styled.span`
  pointer-events: auto; /* override parent Subtitle */
  font-size: 1.12rem;
  a {
    margin-left: 1rem;
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
        <Content>
          <Img fluid={node.frontmatter.image.childImageSharp.fluid} />
          <Overlay>
            <OverlayLink to={node.fields.path} />
            <TitleLink to={node.fields.path}>
              {node.frontmatter.title}
            </TitleLink>
            <Subtitle>
              <div>{node.frontmatter.tagline}</div>
              <Tags>
                {node.frontmatter.tags.map(tag => (
                  <Tag key={tag} to={`/tag/${tag}`} activeClassName="active">
                    {tag}
                  </Tag>
                ))}
              </Tags>
              <div>
                <Updated>Last updated: {node.frontmatter.updated}</Updated>
                <Links>
                  <a href={node.frontmatter.repo} aria-label="GitHub repo">
                    <FaGithub />
                  </a>
                  <a href={node.frontmatter.link}>
                    <FaExternalLinkAlt />
                  </a>
                </Links>
              </div>
            </Subtitle>
          </Overlay>
        </Content>
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
        path: PropTypes.string
      }),
      frontmatter: PropTypes.shape({
        title: PropTypes.string,
        updated: PropTypes.string,
        tagline: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string),
        link: PropTypes.string,
        repo: PropTypes.string,
        image: PropTypes.object
      })
    })
  )
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
