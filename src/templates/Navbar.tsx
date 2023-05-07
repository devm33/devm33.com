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
    <>
      <div className={`${css.iconLinks} ${css.noPrint}`}>
        <ThemeToggle />
        <IconLink href={github} icon={Icons.GitHub} label="GitHub" left />
        <IconLink href={linkedin} icon={Icons.LinkedIn} label="LinkedIn" left />
      </div>
      <div className={`${css.iconLinks} ${css.onlyPrint}`}>
        <a href={linkedin}>linkedin.com/in/devrajmehta</a>
        <a href={`mailto:${email}`}>{email}</a>
      </div>
    </>
  );
}
