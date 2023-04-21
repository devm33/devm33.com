import { graphql, Link, navigate } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import React from "react";

import { pill, pillGroup } from "../components/Pill.module.css";
import { GitHubIcon, LinkIcon } from "./Icons";
import * as css from "./ProjectGrid.module.css";

interface Props {
  nodes: readonly Queries.ProjectGridFieldsFragment[];
}

function getFrontmatterImage(node: Queries.ProjectGridFieldsFragment) {
  const image = getImage(node.frontmatter?.image?.childImageSharp ?? null);
  if (!image) throw new Error("Missing project grid image");
  return image;
}

export function ProjectGrid({ nodes }: Props) {
  return (
    <div className={css.grid}>
      {nodes.map((node) => (
        <div
          key={node.fields?.path}
          className={css.card}
          onClick={() => navigate(node.fields?.path ?? "")}
          onKeyDown={() => navigate(node.fields?.path ?? "")}
          role="link"
          tabIndex={0}
        >
          <GatsbyImage
            className={css.image}
            image={getFrontmatterImage(node)}
            alt=""
          />
          <div className={css.overlay}>
            <Link
              className={css.overlayLink}
              to={node.fields?.path ?? ""}
              aria-label={node.frontmatter?.title ?? ""}
            />
            <Link className={css.titleLink} to={node.fields?.path ?? ""}>
              {node.frontmatter?.title}
            </Link>
            <div className={css.subtitle}>
              <div>{node.frontmatter?.tagline}</div>
              <div className={pillGroup}>
                {node.frontmatter?.tags?.map((tag) => (
                  <Link
                    key={tag}
                    className={pill}
                    to={`/tag/${tag}/`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
              <div>
                <i>Last updated: {node.frontmatter?.updated}</i>
                <span className={css.iconLinks}>
                  {node.frontmatter?.repo && (
                    <a
                      href={node.frontmatter?.repo}
                      aria-label="GitHub repo"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GitHubIcon />
                    </a>
                  )}
                  {node.frontmatter?.link && (
                    <a
                      href={node.frontmatter?.link}
                      aria-label="Project link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <LinkIcon />
                    </a>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className={css.gridFiller} />
      <div className={css.gridFiller} />
      <div className={css.gridFiller} />
    </div>
  );
}

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
            width: 500
            height: 500
            breakpoints: [300, 400]
            placeholder: DOMINANT_COLOR
            formats: [AUTO, WEBP]
          )
        }
      }
    }
  }
`;
