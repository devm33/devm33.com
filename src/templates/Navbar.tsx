import { Link, graphql } from "gatsby";
import React from "react";

import { IconLink, Icons } from "@components/Icons";
import { ThemeToggle } from "@components/ThemeToggle";
import * as css from "./Navbar.module.css";

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

interface Props {
  data: Queries.NavbarQuery;
  resume?: boolean;
}

export default function Navbar({ data, resume }: Props) {
  const { email, github, linkedin, title } = data.site.siteMetadata;
  return (
    <nav className={css.navBar}>
      <Title {...{ title, resume }} />
      <IconLinks {...{ email, github, linkedin }} />
    </nav>
  );
}

interface TitleProps {
  title: string;
  resume?: boolean;
}

function Title({ title, resume }: TitleProps) {
  return (
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
  );
}

interface IconLinksProps {
  github: string;
  linkedin: string;
  email: string;
}

function IconLinks({ email, github, linkedin }: IconLinksProps) {
  return (
    <div className={css.iconLinks}>
      <ThemeToggle className={css.noPrint} />
      <IconLink
        className={css.noPrint}
        href={github}
        icon={Icons.GitHub}
        label="GitHub"
      />
      <IconLink
        className={css.noPrint}
        href={linkedin}
        icon={Icons.LinkedIn}
        label="LinkedIn"
      />
      <a className={css.onlyPrint} href={linkedin}>
        linkedin.com/in/devrajmehta
      </a>
      <a className={css.onlyPrint} href={`mailto:${email}`}>
        {email}
      </a>
    </div>
  );
}
