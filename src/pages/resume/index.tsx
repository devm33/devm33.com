import { graphql, Link, PageProps } from "gatsby";
import React from "react";

import { createHeadWithTitle } from "../../components/Head";
import { FileIcon, InstallIcons } from "../../components/Icons";
import * as css from "./index.module.css";
import "./mulish-font.css";

export default function Resume({ data }: PageProps<Queries.ResumeQuery>) {
  const email = data.site!.siteMetadata.email;
  return (
    <main className={css.main}>
      <InstallIcons file={true} />
      <header className={css.header}>
        <div className={css.headerTitle}>
          <h1>
            <span className={css.onlyPrint}>Devraj Mehta</span>
            <Link to="/" className={`${css.noPrint} ${css.headerLink}`}>
              Devraj Mehta
            </Link>
          </h1>
          <a
            aria-label="Link to PDF version"
            className={`${css.noPrint} ${css.pdfLink}`}
            href="/devraj_mehta_resume.pdf"
          >
            <FileIcon />
          </a>
        </div>
        <div className={css.contactInfo}>
          <a
            className={css.contactLink}
            href="https://www.linkedin.com/in/devrajmehta">
            linkedin.com/in/devrajmehta
          </a>
          <a className={css.contactLink} href={`mailto:${email}`}>{email}</a>
        </div>
      </header>

      <h2>EXPERIENCE</h2>
      {data.allJobsYaml.nodes.map(job => (
        <div key={job.id}>
          <div className={css.titleRow}>
            <h3>
              <a href={job.uri || undefined}>{job.name}</a>, {job.title} { }
              <span className={`${css.location} ${css.nowrap}`}>
                - {job.location}
              </span>
            </h3>
            <div className={css.dateRange}>
              <span className={css.nowrap}>{job.start}</span> - { }
              <span className={css.nowrap}>{job.finish}</span>
            </div>
          </div>
          <ul>
            {job.description?.map(desc => (
              <li key={desc}>{desc}</li>
            ))}
          </ul>
        </div>
      ))}

      <h2>EDUCATION</h2>
      <div className={css.titleRow}>
        <h3>
          <a href="https://gatech.edu">Georgia Institute of Technology</a>, { }
          <span className={css.nowrap}>BSc Computer Science</span> { }
          <span className={`${css.location} ${css.nowrap}`}>- Atlanta, GA</span>
        </h3>
        <div className={css.dateRange}>
          <span className={css.nowrap}>AUG 2010</span> - { }
          <span className={css.nowrap}>MAY 2014</span>
        </div>
      </div>
      <div>
        Highest Honors
      </div>

      <h2>SKILLS</h2>
      {
        Object.entries(data.resumeYaml!).map(([category, list]) => (
          <div key={category}>
            {list!.join(", ")}
          </div>
        ))
      }
    </main>
  );
}

export const query = graphql`
  query Resume {
    allJobsYaml(filter: { enabled: { eq: true } }) {
      nodes {
        id
        uri
        name
        location
        description
        id
        title
        start
        finish
      }
    }
    resumeYaml {
      Languages
      Frameworks
      Platforms
    }
    site {
      siteMetadata {
        email
      }
    }
  }
`;

export const Head = createHeadWithTitle('Devraj Mehta Resume');
