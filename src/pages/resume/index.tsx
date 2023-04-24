import { graphql, PageProps } from "gatsby";
import React from "react";

import { createHeadWithTitle } from "../../components/Head";
import { Layout } from "../../components/Layout";
import * as css from "./index.module.css";

export default function Resume({ data }: PageProps<Queries.ResumeQuery>) {
  return (
    <Layout mainClass={css.main} resume>
      <section className={css.section}>
        <h2>EXPERIENCE</h2>
        {data.allJobsYaml.nodes.map((job) => (
          <div key={job.id}>
            <div className={css.titleRow}>
              <h3>
                <a href={job.uri || undefined}>{job.name}</a>, {job.title} {}
                <span className={`${css.location} ${css.nowrap}`}>
                  - {job.location}
                </span>
              </h3>
              <div className={css.dateRange}>
                <span className={css.nowrap}>{job.start}</span> - {}
                <span className={css.nowrap}>{job.finish}</span>
              </div>
            </div>
            <ul>
              {job.description?.map((desc) => (
                <li key={desc}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <section className={css.section}>
        <h2>EDUCATION</h2>
        <div className={css.titleRow}>
          <h3>
            <a href="https://gatech.edu">Georgia Institute of Technology</a>, {}
            <span className={css.nowrap}>BSc Computer Science</span> {}
            <span className={`${css.location} ${css.nowrap}`}>
              - Atlanta, GA
            </span>
          </h3>
          <div className={css.dateRange}>
            <span className={css.nowrap}>AUG 2010</span> - {}
            <span className={css.nowrap}>MAY 2014</span>
          </div>
        </div>
        <div>Highest Honors</div>
      </section>
      <section className={css.section}>
        <h2>SKILLS</h2>
        {Object.entries(data.resumeYaml ?? {}).map(([category, list]) => (
          <div key={category}>{list?.join(", ")}</div>
        ))}
      </section>
    </Layout>
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
  }
`;

export const Head = createHeadWithTitle("Devraj Mehta Resume");
