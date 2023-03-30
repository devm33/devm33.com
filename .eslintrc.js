module.exports = {
  extends: ["google", "prettier", "plugin:react/recommended"],
  plugins: ["react", "jsx-a11y", "import"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
    "react/prop-types": [2, { ignore: ["data"] }],
  },
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
};
