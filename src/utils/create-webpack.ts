import { Actions, CreateWebpackConfigArgs } from "gatsby";
import path from "path";
import { Module } from "webpack";

export function onCreateWebpackConfig(args: CreateWebpackConfigArgs) {
  addAliases(args.actions);

  if (!args.stage.includes("build")) return; // Below only runs in build
  modifyCssModulesLocalIdent(args);

  if (args.stage !== "build-javascript") return; // Below only runs in build-js
  modifyStylesChunk(args.actions);
}

/** Add import aliases to resolve. */
function addAliases({ setWebpackConfig }: Actions) {
  setWebpackConfig({
    resolve: { alias: { "@components": path.resolve("src/components") } },
  });
}

/**  Minify css module class names use 5-digit hex hash. */
function modifyCssModulesLocalIdent(args: CreateWebpackConfigArgs) {
  const config = args.getConfig();
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
}

/** Separate katex css from main css build. */
function modifyStylesChunk({ setWebpackConfig }: Actions) {
  setWebpackConfig({
    optimization: {
      runtimeChunk: {
        name: "webpack-runtime",
      },
      splitChunks: {
        name: false,
        cacheGroups: {
          styles: {
            name: "styles",
            test: stylesTest,
            enforce: true,
          },
        },
      },
    },
  });
}

function stylesTest(m: Module): boolean {
  return m.type === "css/mini-extract" && !/katex/.test(m.identifier());
}
