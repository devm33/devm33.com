import { Link, PageProps, graphql } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import React from "react";

import { Layout } from "@components/Layout";
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
  }
`;

export default function Index(props: PageProps<Queries.HomepageQuery>) {
  return (
    <Layout>
      <article className={css.article}>
        <Description {...props.data.site.siteMetadata} />
        <Photo />
      </article>
    </Layout>
  );
}

interface DescriptionProps {
  github: string;
  linkedin: string;
}

function Description({ github, linkedin }: DescriptionProps) {
  return (
    <div className={css.description}>
      <p>Hello! I&apos;m Devraj.</p>
      <p>
        You can find me on <a href={linkedin}>LinkedIn</a> or {}
        <a href={github}>GitHub</a>.
      </p>
      <p>
        This site contains my <Link to="/resume/">resume</Link> and some {}
        <Link to="/projects/">projects</Link>.
      </p>
      <p>
        Here is <a href={`${github}/devm33.com`}>the source for this site</a>.
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
