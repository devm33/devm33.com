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
          github
          linkedin
        }
      }
    }
  `);
  const { title, github, linkedin } = site.siteMetadata;
  return (
    <nav className={css.navBar}>
      <Link to="/" className={css.title}>
        {title}
      </Link>
      <div className={css.iconLinks}>
        <a href={github} aria-label="GitHub profile">
          <GitHubIcon />
        </a>
        <a href={linkedin} aria-label="LinkedIn profile">
          <LinkedinIcon />
        </a>
      </div>
    </nav>
  );
}
