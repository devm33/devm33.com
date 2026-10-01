// Vanilla theme toggle. Mirrors the former React ThemeToggle: an explicit
// choice is stored in localStorage ("light"/"dark"); with no stored choice the
// OS preference applies via the CSS `prefers-color-scheme` media query. The
// no-flash <head> snippet applies any stored class before first paint.
(function () {
  var root = document.documentElement;

  function current() {
    if (root.classList.contains("light")) return "light";
    if (root.classList.contains("dark")) return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function apply(theme) {
    // Suppress the color transition while switching, as the old component did.
    root.style.transition = "none";
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    void root.offsetHeight; // force layout
    root.style.transition = "";
  }

  var button = document.querySelector(".theme-toggle");
  if (!button) return;
  var label = button.querySelector(".inner-inner-label");

  function sync() {
    var light = current() === "light";
    button.setAttribute("aria-pressed", String(!light));
    if (label) label.textContent = light ? " Dark theme " : " Light theme ";
  }

  sync();
  button.addEventListener("click", function () {
    var next = current() === "light" ? "dark" : "light";
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      /* ignore storage failures */
    }
    apply(next);
    sync();
  });
})();
