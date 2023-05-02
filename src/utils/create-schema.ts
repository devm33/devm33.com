import { CreateSchemaCustomizationArgs } from "gatsby";

const types = /* GraphQL */ `
  type Site {
    siteMetadata: SiteMetadata!
  }

  type SiteMetadata {
    title: String!
    description: String!
    siteUrl: String!
    email: String!
    github: String!
    linkedin: String!
  }

  type MarkdownRemark implements Node {
    fields: MarkdownRemarkFields!
    frontmatter: MarkdownRemarkFrontmatter!
    html: String!
  }

  type MarkdownRemarkFrontmatter {
    link: String
    repo: String
    tagline: String!
    tags: [String!]!
    title: String!
  }

  type MarkdownRemarkFields {
    path: String!
  }
`;

export function createSchemaCustomization(args: CreateSchemaCustomizationArgs) {
  args.actions.createTypes(types);
}
