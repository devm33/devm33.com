module.exports = {
  // Restore file/directory cached in previous builds.
  // Does not do anything if:
  //  - the file/directory already exists locally
  //  - the file/directory has not been cached yet
  async onPreBuild({ utils }) {
    // for Netlify Puppeteer
    await utils.cache.restore("/opt/buildhome/.cache/puppeteer/");
  },
  // Cache file/directory for future builds.
  // Does not do anything if:
  //  - the file/directory does not exist locally
  async onPostBuild({ utils }) {
    // for Netlify Puppeteer
    await utils.cache.save("/opt/buildhome/.cache/puppeteer/");
  },
};
