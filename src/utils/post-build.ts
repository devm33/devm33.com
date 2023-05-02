import { readFile } from "node:fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import url from "url";

export async function onPostBuild() {
  // Generate PDF of resume page
  const args = ["--font-render-hinting=none"];
  const browser = await puppeteer.launch({ args });
  const page = await browser.newPage();
  const resumePath = path.resolve("public/resume/index.html");
  await page.goto(url.pathToFileURL(resumePath).toString());
  const content = await inlineFontFiles();
  await page.addStyleTag({ content });
  await page.evaluateHandle("document.fonts.ready");
  await page.pdf({ path: "./public/devraj_mehta_resume.pdf" });
  await browser.close();
}

async function inlineFontFiles(): Promise<string> {
  const encoding = "base64";
  const fonts = "./static/fonts";
  const normal = await readFile(`${fonts}/mulish.woff2`, { encoding });
  const italic = await readFile(`${fonts}/mulish-ital.woff2`, { encoding });
  return `
    @font-face {
      font-family: Mulish;
      font-style: normal;
      font-weight: 200 1000;
      src: url("data:font/woff2;base64,${normal}") format("woff2");
    }
    @font-face {
      font-family: Mulish;
      font-style: italic;
      font-weight: 200 1000;
      src: url("data:font/woff2;base64,${italic}") format("woff2");
    }
  `;
}
