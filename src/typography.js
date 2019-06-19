import Typography from "typography";

const fonts = [
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Roboto",
  "Helvetica",
  "Arial",
  "sans-serif",
];

const typography = new Typography({
  baseFontSize: "16px",
  baseLineHeight: 1.65,
  headerFontFamily: fonts,
  bodyFontFamily: fonts,
  scaleRatio: 2,
  overrideStyles: ({ rhythm }) => ({
    ".gatsby-highlight": {
      "margin-bottom": rhythm(1),
    },
    code: {
      "font-size": "0.85rem !important" /* Overriding prismjs size */,
    },
  }),
});

export const rhythm = typography.rhythm;
export const scale = typography.scale;

export default typography;
