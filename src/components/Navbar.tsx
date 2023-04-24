import { graphql, Link, useStaticQuery } from "gatsby";
import React from "react";

import { FileIcon, GitHubIcon, LinkedinIcon } from "./Icons";
import * as css from "./Navbar.module.css";

export function Navbar({ resume = false }) {
  const { site } = useStaticQuery<Queries.HeaderQuery>(graphql`
    query Header {
      site {
        siteMetadata {
          email
          github
          linkedin
          title
        }
      }
    }
  `);
  const { email, github, linkedin, title } = site.siteMetadata;
  return (
    <nav className={css.navBar}>
      <div className={css.titleGroup}>
        <Link to="/" className={css.title}>
          {title}
        </Link>
        {resume && (
          <a
            aria-label="Link to PDF of resume"
            className={`${css.noPrint} ${css.pdfLink}`}
            href="/devraj_mehta_resume.pdf"
          >
            <FileIcon />
          </a>
        )}
      </div>
      <div className={css.iconLinks}>
        <a aria-label="GitHub profile" className={css.noPrint} href={github}>
          <GitHubIcon />
        </a>
        <a
          aria-label="LinkedIn profile"
          className={css.noPrint}
          href={linkedin}
        >
          <LinkedinIcon />
        </a>
        <a className={css.onlyPrint} href={linkedin}>
          linkedin.com/in/devrajmehta
        </a>
        <a className={css.onlyPrint} href={`mailto:${email}`}>
          {email}
        </a>
      </div>
    </nav>
  );
}
