import { Link, PageProps, graphql } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import React from "react";

import { Layout } from "../components/Layout";

export { Head } from "../components/Head";

export default function Index(props: PageProps<Queries.HomepageQuery>) {
  const { github, linkedin } = props.data.site.siteMetadata;
  return (
    <Layout>
      <article>
        <p>Hello! I&apos;m Devraj.</p>
        <StaticImage
          src="../images/me.jpg"
          alt="head shot"
          placeholder="dominantColor"
          loading="eager"
          layout="fixed"
          width={250}
          height={250}
        />
        <p>
          You can find me on <a href={linkedin}>LinkedIn</a> or {}
          <a href={github}>GitHub</a>.
        </p>
        <p>
          This site contains <Link to="/resume/">my resume</Link> and some
          written up <Link to="/projects/">projects</Link>.
        </p>
        <p>
          Here is <a href={`${github}/devm33.com`}>the source for this site</a>.
        </p>
        <p>
          Cheers! <br /> Devraj
        </p>
      </article>
    </Layout>
  );
}

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
