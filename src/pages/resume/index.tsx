import { graphql, PageProps } from "gatsby";
import React from "react";

import { createHeadWithTitle } from "@components/Head";
import { Layout } from "@components/Layout";
import * as css from "./index.module.css";

export const Head = createHeadWithTitle("Devraj Mehta Resume");

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

export default function Resume({ data }: PageProps<Queries.ResumeQuery>) {
  return (
    <Layout mainClass={css.main} resume>
      <Experience data={data} />
      <Education />
      <Skills data={data} />
    </Layout>
  );
}

function Experience({ data }: { data: Queries.ResumeQuery }) {
  return (
    <section className={css.section}>
      <h2>EXPERIENCE</h2>
      {data.allJobsYaml.nodes.map((job) => (
        <div key={job.id}>
          <div className={css.titleRow}>
            <Title {...job} />
            <DateRange {...job} />
          </div>
          <ul>
            {job.description.map((desc) => (
              <li key={desc}>{desc}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function Education() {
  return (
    <section className={css.section}>
      <h2>EDUCATION</h2>
      <div className={css.titleRow}>
        <Title
          uri="https://gatech.edu"
          name="Georgia Institute of Technology"
          title="BSc Computer Science"
          location="Atlanta, GA"
        />
        <DateRange start="AUG 2010" finish="MAY 2014" />
      </div>
      <div>Highest Honors</div>
    </section>
  );
}

function Skills({ data }: { data: Queries.ResumeQuery }) {
  return (
    <section className={css.section}>
      <h2>SKILLS</h2>
      {Object.entries(data.resumeYaml ?? {}).map(([category, list]) => (
        <div key={category}>{list?.join(", ")}</div>
      ))}
    </section>
  );
}

interface TitleProps {
  uri: string;
  name: string;
  title: string;
  location: string;
}

function Title({ uri, name, title, location }: TitleProps) {
  return (
    <h3>
      <a href={uri}>{name}</a>, {title} {}
      <span className={`${css.location} ${css.nowrap}`}>- {location}</span>
    </h3>
  );
}

function DateRange({ start, finish }: { start: string; finish: string }) {
  return (
    <div className={css.dateRange}>
      <span className={css.nowrap}>{start}</span> - {}
      <span className={css.nowrap}>{finish}</span>
    </div>
  );
}
