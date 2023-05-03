import { Link, PageProps, graphql } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import React from "react";

import { Layout } from "@components/Layout";
import { Project } from "@components/Project";
import * as css from "./index.module.css";

export { Head } from "@components/Head";

export const query = graphql`
  query Homepage {
    site {
      siteMetadata {
        github
        linkedin
      }
    }
    allMarkdownRemark(limit: 3, sort: { frontmatter: { updated: DESC } }) {
      totalCount
      nodes {
        ...ProjectFields
      }
    }
  }
`;

export default function Index(props: PageProps<Queries.HomepageQuery>) {
  return (
    <Layout>
      <HelloSection data={props.data} />
      <RecentProjectsSection data={props.data} />
    </Layout>
  );
}

function HelloSection({ data }: { data: Queries.HomepageQuery }) {
  return (
    <section className={css.helloSection}>
      <Description {...data.site.siteMetadata} />
      <Photo />
    </section>
  );
}

function Description(props: { github: string; linkedin: string }) {
  return (
    <div className={css.description}>
      <p>Hello! I&apos;m Devraj.</p>
      <p>
        You can find me on <a href={props.linkedin}>LinkedIn</a> or {}
        <a href={props.github}>GitHub</a>.
      </p>
      <p>
        This site contains my <Link to="/resume/">resume</Link> and some {}
        <Link to="/projects/">projects</Link>.
      </p>
      <p>
        Here is {}
        <a href={`${props.github}/devm33.com`}>the source for this site</a>.
      </p>
      <p>
        Cheers! <br /> Devraj
      </p>
    </div>
  );
}

function Photo() {
  return (
    <StaticImage
      src="../images/me.jpg"
      alt="head shot"
      placeholder="dominantColor"
      loading="eager"
      layout="fixed"
      width={250}
      height={250}
    />
  );
}

function RecentProjectsSection({ data }: { data: Queries.HomepageQuery }) {
  return (
    <section>
      <div className={css.recentTitle}>
        <h3 className={css.recentHeader}>Recent Projects</h3> {}
        <ProjectsLink />
      </div>
      {data.allMarkdownRemark.nodes.map((node) => (
        <Project key={node.fields.path} project={node} />
      ))}
      <div>
        Showing 3 of {data.allMarkdownRemark.totalCount} projects {}
        <ProjectsLink />
      </div>
    </section>
  );
}

function ProjectsLink() {
  return <Link to="/projects">View all</Link>;
}
