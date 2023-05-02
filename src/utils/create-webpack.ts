import { GatsbyNode } from "gatsby";
import path from "path";
import { Module } from "webpack";

type OnCreateWebpackConfig = GatsbyNode["onCreateWebpackConfig"];
export const onCreateWebpackConfig: OnCreateWebpackConfig = (args) => {
  // Add import alias for components directory
  args.actions.setWebpackConfig({
    resolve: {
      alias: { "@components": path.resolve(__dirname, "src/components") },
    },
  });

  // Minify css module class names use 5-digit hex hash
  const config = args.getConfig();
  if (!args.stage.includes("build")) return;
  // Note this approach assumes css config is in a oneOf block.
  for (const { oneOf } of config.module.rules) {
    if (!oneOf?.length) continue;
    for (const { use } of oneOf) {
      if (!use) continue;
      for (const { loader, options } of use) {
        if (!loader?.includes(`${path.sep}css-loader${path.sep}`)) continue;
        if (!options?.modules) continue;
        options.modules.localIdentName = "[hash:hex:5]";
      }
    }
  }
  args.actions.replaceWebpackConfig(config);

  // Separate katex css from main css build
  if (args.stage !== "build-javascript") return;
  args.actions.setWebpackConfig({
    optimization: {
      runtimeChunk: {
        name: "webpack-runtime",
      },
      splitChunks: {
        name: false,
        cacheGroups: {
          styles: {
            name: "styles",
            test: (module: Module) =>
              module.type === "css/mini-extract" &&
              !/katex/.test(module.identifier()),
            enforce: true,
          },
        },
      },
    },
  });
};
