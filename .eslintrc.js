module.exports = {
  extends: ["google", "prettier", "plugin:react/recommended"],
  plugins: ["react", "jsx-a11y", "import"],
  parser: "babel-eslint",
  settings: {
    react: {
      version: "detect"
    }
  },
  env: {
    browser: true
  }
};
