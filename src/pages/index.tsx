import { Link } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import React from "react";

import { Layout } from "../components/Layout";

export { Head } from "../components/Head";

export default function Index() {
  return (
    <Layout>
      <article>
        <p>Hello! I&apos;m Devraj.</p>
        <StaticImage
          src="../images/me.jpg"
          alt="head shot"
          placeholder="blurred"
          layout="fixed"
          width={250}
          height={250}
        />
        <p>
          You can find me on { }
          <a href="https://www.linkedin.com/in/devrajmehta">LinkedIn</a> or { }
          <a href="https://github.com/devm33">GitHub</a>. See here for my { }
          <Link to="/resume/">resume</Link>.
        </p>
        <p>
          This { }
          <a href="https://github.com/devm33/devm33.com">site&apos;s source</a> is
          on GitHub.
        </p>
        <p>
          Cheers! <br /> Devraj
        </p>
      </article>
    </Layout>
  );
}