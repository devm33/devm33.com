import { Link, graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import React from "react";

import { Icon, Icons } from "./Icons";
import { pill, pillGroup } from "./Pill.module.css";
import * as css from "./Project.module.css";

interface ProjectProps {
  project: Queries.ProjectFieldsFragment;
}

export function Project({ project }: ProjectProps) {
  return (
    <div className={css.project}>
      <div className={css.thumbnail}>
        <GatsbyImage
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          image={getImage(project.frontmatter.image?.childImageSharp ?? null)!}
          alt=""
          className={css.thumbnailImage}
        />
      </div>
      <ProjectHeader project={project} className={css.flexHeader} link />
    </div>
  );
}

interface ProjectTitleProps {
  project: Queries.ProjectFieldsFragment;
  className?: string;
  link?: boolean;
}

export function ProjectHeader(props: ProjectTitleProps) {
  const { fields, frontmatter } = props.project;
  return (
    <header className={props.className}>
      <div className={css.titleGroup}>
        <h1>
          {props.link ? (
            <Link to={fields.path}>{frontmatter.title}</Link>
          ) : (
            frontmatter.title
          )}
        </h1>
        <div className={`${pillGroup} ${css.subtitle}`}>
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
      </div>
      <div className={`${css.subtitleGroup} ${css.subtitle}`}>
        <i>Updated {frontmatter.updated}</i>
        <div className={pillGroup}>
          {frontmatter.tags.map((tag) => (
            <Link key={tag} className={pill} to={`/tag/${tag}/`}>
              {tag}
            </Link>
          ))}
        </div>
      </div>
      <div className={css.tagline}>{frontmatter.tagline}</div>
    </header>
  );
}

export const fragment = graphql`
  fragment ProjectFields on MarkdownRemark {
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
            aspectRatio: 1
            width: 150
            layout: CONSTRAINED
            placeholder: DOMINANT_COLOR
            formats: [AUTO, WEBP]
          )
        }
      }
    }
  }
`;
