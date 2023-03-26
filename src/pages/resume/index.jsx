import { graphql, Link } from "gatsby";
import React from "react";
import styled from "styled-components";

import { Head as CommonHead } from "../../components/Head";
import "../../mulish-font.css";
import "../../reset.css";

const Wrapper = styled.div`
  font-family: 'Mulish', sans-serif;
  font-size: 14px;
  margin: 0 auto;
  padding: 2em 0 6em 0;
  max-width: 682px;
  line-height: 1.4;
  @media only screen and (max-width: 700px) {
    margin: 0 1em;
    padding: 1em 0;
  }
  @media print {
    @page {
      margin: 0;
    }
    margin-bottom: 0;
    margin-top: 1.5em;
    padding: 0;
  }
  a,
  a:visited {
    color: #1976d2;
  }
  h1 {
    font-size: 1.5em;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
  h2 {
    font-size: 1em;
    margin: 1em 0 0 0;
  }
  h3 {
    font-size: 1em;
  }
  ul {
    padding-inline-start: 20px;
  }
  li {
    list-style-type: circle;
  }
`;

const Header = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: end;
  & > a + a {
    margin-left: 14px;
  }
`;

const TitleRow = styled.div`
  display: flex;
  margin: 0.3em 0 0.1em 0;
`;

const Location = styled.span`
  color: #666;
  font-style: italic;
  font-weight: normal;
  white-space: nowrap;
`;

const DateRange = styled.div`
  color: #666;
  font-size: 0.85em;
  margin-left: auto;
  text-align: end;
`;

const NoWrapSpan = styled.span`
  white-space: nowrap;
`;

const NoPrint = styled.div`
  @media print {
    display: none;
  }
`;

const TopLeft = styled(NoPrint)`
  left: 30px;
  position: fixed;
  top: 30px;
  @media (max-width: 950px) {
    display: none;
  }
`;

export default function Resume({
  data: {
    allJobsYaml: { nodes: jobs },
    resumeYaml: skills,
    site: {
      siteMetadata: { email },
    },
  },
}) {
  return (
    <Wrapper>
      <Header>
        <h1>
          Devraj Mehta
        </h1>
        <ContactInfo>
          <a href="https://www.linkedin.com/in/devrajmehta">
            linkedin.com/in/devrajmehta
          </a>
          <a href={`mailto:${email}`}>{email}</a>
        </ContactInfo>
      </Header>

      <h2>EXPERIENCE</h2>
      {jobs.filter(job => job.enabled).map(job => (
        <div key={job.id}>
          <TitleRow>
            <h3>
              <a href={job.uri}>{job.name}</a>, {job.title}{' '}
              <Location>- {job.location}</Location>
            </h3>
            <DateRange>
              <NoWrapSpan>{job.start}</NoWrapSpan> -{' '}
              <NoWrapSpan>{job.finish}</NoWrapSpan>
            </DateRange>
          </TitleRow>
          <ul>
            {job.description.map(desc => (
              <li key={desc}>{desc}</li>
            ))}
          </ul>
        </div>
      ))}

      <h2>EDUCATION</h2>
      <TitleRow>
        <h3>
          <a href="https://gatech.edu">Georgia Institute of Technology</a>,{' '}
          <NoWrapSpan>BSc Computer Science</NoWrapSpan>{' '}
          <Location>- Atlanta, GA</Location>
        </h3>
        <DateRange>
          <NoWrapSpan>AUG 2010</NoWrapSpan> - <NoWrapSpan>MAY 2014</NoWrapSpan>
        </DateRange>
      </TitleRow>
      <div>
        Highest Honors
      </div>

      <h2>SKILLS</h2>
      {
        Object.keys(skills).map(category => (
          <div key={category}>
            {skills[category].join(", ")}
          </div>
        ))
      }
      <TopLeft>
        <Link to="/">&larr; Back to site</Link>
        <br />
        <br />
        <a href="/devraj_mehta_resume.pdf">PDF Version</a>
      </TopLeft>
    </Wrapper >
  );
}

export const query = graphql`
  query {
    allJobsYaml {
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
        enabled
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

// eslint-disable-next-line react/prop-types
export function Head({ pageContext, ...rest }) {
  const props = {
    ...rest,
    pageContext: {
      ...pageContext,
      title: 'Devraj Mehta Resume',
      dropTypography: true,
    },
  };
  return (
    <CommonHead {...props}>
      <link
        href="/mulish-font-full.css"
        rel="preload"
        as="style"
        onload="this.onload=null;this.rel='stylesheet'"
      />
      <noscript>
        <link rel="stylesheet" href="/mulish-font-full.css" />
      </noscript>
    </CommonHead>
  );
}