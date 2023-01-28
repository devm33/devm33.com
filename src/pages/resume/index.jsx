import React, { Fragment } from "react";
import styled from "styled-components";
import { graphql, Link } from "gatsby";

import Meta from "../../components/Meta";
import "../../reset.css";

const Wrapper = styled.div`
  @import url('https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400;0,500;1,400&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;1,400&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,400;0,500;1,400&display=swap');
  font-family: 'Mulish', sans-serif;
  font-size: 14px;
  margin: 1em auto 10em auto;
  max-width: 682px;
  line-height: 1.4;
  @media print {
    @page {
      margin: 0;
    }
    margin-bottom: 0;
    margin-top: 2em;
  }
  a,
  a:visited {
    color: #1976d2;
  }
  h1 {
    font-size: 1.5em;
    letter-spacing: 0.5px;
  }
  h2 {
    font-size: 1em;
    margin: 1em 0 0.5em 0;
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
  gap: 1em;
`;

const TitleRow = styled.div`
  display: flex;
  margin: 0.5em 0 0.1em 0;
`;

const Location = styled.span`
  color: #666;
  font-style: italic;
  font-weight: normal;
  white-space: nowrap;
`

const DateRange = styled.div`
  color: #666;
  font-size: 0.85em;
  margin-left: auto;
`;

const DateSpan = styled.span`
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

const Resume = ({
  data: {
    allJobsYaml: { nodes: jobs },
    resumeYaml: skills,
    site: {
      siteMetadata: { email },
    },
    fileName: {
      childImageSharp: {
        fluid: { src },
      },
    },
  },
}) => (
  <Wrapper>
    <Meta title="Devraj Mehta Resume" url="/resume/" image={src} />
    <Header>
      <h1>
        Devraj Mehta
      </h1>
      <ContactInfo>
        <a href="https://www.linkedin.com/in/devrajmehta">linkedin.com/in/devrajmehta</a>
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
            <DateSpan>{job.start}</DateSpan> - <DateSpan>{job.finish}</DateSpan>
          </DateRange>
        </TitleRow>
        <ul>
          {job.description.map(desc => (
            <li>{desc}</li>
          ))}
        </ul>
      </div>
    ))}

    <h2>EDUCATION</h2>
    <TitleRow>
      <h3>
        <a href="https://gatech.edu">Georgia Institute of Technology</a>,{' '}
        BSc Computer Science{' '}
        <Location>- Atlanta, GA</Location>
      </h3>
      <DateRange>
        <DateSpan>AUG 2010</DateSpan> - <DateSpan>MAY 2014</DateSpan>
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
      <a href="/resume.pdf">PDF Version</a>
    </TopLeft>
  </Wrapper >
);

export default Resume;

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
    fileName: file(relativePath: { eq: "images/me.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 1000) {
          src
        }
      }
    }
  }
`;
