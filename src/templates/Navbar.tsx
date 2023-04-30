import { Link, graphql } from "gatsby";
import React from "react";

import { IconLink, Icons } from "@components/Icons";
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
          <IconLink
            className={css.noPrint}
            href="/devraj_mehta_resume.pdf"
            icon={Icons.File}
            label="View as PDF"
          />
        )}
      </div>
      <div className={css.iconLinks}>
        <IconLink
          aria-label="GitHub profile"
          className={css.noPrint}
          href={github}
          icon={Icons.GitHub}
        />
        <IconLink
          aria-label="LinkedIn profile"
          className={css.noPrint}
          href={linkedin}
          icon={Icons.LinkedIn}
        />
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
