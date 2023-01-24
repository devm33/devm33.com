import React, { Fragment } from "react";
import styled from "styled-components";
import { graphql, Link } from "gatsby";

import Meta from "../../components/Meta";
import "../../reset.css";

const Wrapper = styled.div`
  @import url('https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400;0,500;1,400&display=swap');
  font-family: 'Arimo', sans-serif;
  font-size: 14px;
  max-width: 682px;
  margin: 10px auto 100px auto;
  @media print {
    @page {
      margin: 0;
    }
    margin-top: 20px;
    margin-bottom: 0;
  }
  a,
  a:visited {
    color: #00e;
  }
  h1 {
    font-size: 1.2em;
  }
  h4 {
    margin: 10px 0 5px 0;
  }
  table {
    width: 100%;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: baseline;
  justify-content: space-around;
`;

const H1 = styled.h1`
  letter-spacing: 0.5px;
`;

const TrMeta = styled.tr`
  & > td:not(:first-child) {
    padding-left: 5px;
  }
`;
const TrDesc = styled.tr`
  & > td {
    padding-top: 5px;
    padding-bottom: 10px;
    line-height: 1.35em;
  }
`;
const TdRight = styled.td`
  text-align: right;
`;
const TdJustify = styled.td`
  text-align: justify;
  text-align-last: justify;
`;

const NoPrint = styled.div`
  @media print {
    display: none;
  }
`;

const TopLeft = styled(NoPrint)`
  position: fixed;
  top: 30px;
  left: 30px;
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
      <H1>
        <a href="https://www.linkedin.com/in/devrajmehta">Devraj Mehta</a>
      </H1>
      <h4>
        <a href={`mailto:${email}`}>{email}</a>
      </h4>
    </Header>
    <table>
      <tbody>
        <tr>
          <td colSpan="4">
            <h4>Work Experience</h4>
          </td>
        </tr>
        {jobs.map(job => (
          <Fragment key={job.id}>
            <TrMeta>
              <td>
                <a href={job.uri}>{job.name}</a>
              </td>
              <td>{job.title}</td>
              <td>
                <i>{job.location}</i>
              </td>
              <TdRight>
                {job.start} {job.finish && "– " + job.finish}
              </TdRight>
            </TrMeta>
            <TrDesc>
              <td colSpan="4">{job.description}</td>
            </TrDesc>
          </Fragment>
        ))}
        <tr>
          <td colSpan="4">
            <h4>Education</h4>
          </td>
        </tr>
        <TrMeta>
          <td>
            <a href="https://gatech.edu">Georgia Institute of Technology</a>
          </td>
          <td>
            BSc Computer Science
          </td>
          <td>
            <i>Highest Honors</i>
          </td>
          <TdRight>2010 – 2014</TdRight>
        </TrMeta>
      </tbody>
    </table>
    <table>
      <tbody>
        <tr>
          <td colSpan="4">
            <h4>Skills</h4>
          </td>
        </tr>
        {Object.keys(skills).map(category => (
          <tr key={category}>
            <td>
              <i>{category}</i>
            </td>
            <TdJustify>{skills[category].join(", ")}</TdJustify>
          </tr>
        ))}
      </tbody>
    </table>
    <TopLeft>
      <Link to="/about/">&larr; Back to about</Link>
      <br />
      <br />
      <a href="/resume.pdf">PDF Version</a>
    </TopLeft>
  </Wrapper>
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
