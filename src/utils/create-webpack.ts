import { Actions, CreateWebpackConfigArgs } from "gatsby";
import { cloneDeepWith, isString } from "lodash";
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
  config.module.rules = cloneDeepWith(config.module.rules, (value, key) => {
    if (key === "options" && isString(value.modules?.localIdentName)) {
      value.modules.localIdentName = "[hash:hex:5]";
      return value;
    }
  });
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
