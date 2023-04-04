import { darken, lighten } from "polished";
import { scale } from "./typography";

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
    body: scale(0),
    icon: scale(1 / 6),
    subtitle: scale(1 / 5),
    title: scale(1 / 2),
  },
};

export default theme;
