module.exports = {
  extends: ["prettier", "plugin:react/recommended"],
  plugins: ["react", "jsx-a11y", "import"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "react/prop-types": [2, { ignore: ["data"] }],
  },
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
};
