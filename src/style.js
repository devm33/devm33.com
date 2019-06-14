import { lighten, darken } from "polished";
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
});

export const rhythm = typography.rhythm;
export const scale = typography.scale;

export default typography; /* Default for gatsby plugin */

export const theme = {
  bg: "white",
  color: "black",
  secondary: lighten(0.3, "black"),
  accent: "#d6006c",
  link: darken(0.2, "cornflowerblue"),
  break: {
    xs: "(max-width: 300px)",
    s: "(max-width: 500px)",
  },
  font: {
    small: scale(-1 / 6),
    icon: scale(1 / 6),
  },
};
