import { graphql, Link, useStaticQuery } from "gatsby";
import React from "react";

import { GitHubIcon, LinkedinIcon } from "./Icons";
import * as css from "./Navbar.module.css";

export function Navbar() {
  const { site } = useStaticQuery<Queries.HeaderQuery>(graphql`
    query Header {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);
  return (
    <nav className={css.navBar}>
      <div>
        <Link to="/projects/">Projects</Link>
      </div>
      <div className={css.title}>
        <Link to="/">{site?.siteMetadata.title}</Link>
      </div>
      <div className={css.iconLinks}>
        <a href="https://github.com/devm33" aria-label="GitHub profile">
          <GitHubIcon />
        </a>
        <a
          href="https://www.linkedin.com/in/devrajmehta/"
          aria-label="LinkedIn profile"
        >
          <LinkedinIcon />
        </a>
      </div>
    </nav>
  );
}
