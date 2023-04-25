import { Link, graphql } from "gatsby";
import React from "react";

import { Icon, Icons } from "@components/Icons";
import * as css from "./Navbar.module.css";

interface Props {
  data: Queries.NavbarQuery;
  resume?: boolean;
}

export default function Navbar({ data, resume }: Props) {
  const { email, github, linkedin, title } = data.site.siteMetadata;
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
            <Icon icon={Icons.File} />
          </a>
        )}
      </div>
      <div className={css.iconLinks}>
        <a aria-label="GitHub profile" className={css.noPrint} href={github}>
          <Icon icon={Icons.GitHub} />
        </a>
        <a
          aria-label="LinkedIn profile"
          className={css.noPrint}
          href={linkedin}
        >
          <Icon icon={Icons.LinkedIn} />
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

export const query = graphql`
  query Navbar {
    site {
      siteMetadata {
        email
        github
        linkedin
        title
      }
    }
  }
`;
