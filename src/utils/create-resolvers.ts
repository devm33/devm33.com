import { CreateResolversArgs } from "gatsby";

export function createResolvers({ createResolvers }: CreateResolversArgs) {
  createResolvers({
    Query: {
      site: { type: "Site!" },
      markdownRemark: { type: "MarkdownRemark!" },
    },
  });
}
